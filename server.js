require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const path = require('path');
const Stripe = require('stripe');
const sqlite3 = require('sqlite3').verbose();

// Инициализация базы данных SQLite
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error('Database connection error:', err.message);
    else console.log('Connected to SQLite database.');
});

// Создание таблиц (заказы, статусы товаров, отзывы)
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerTelegramId TEXT,
        productName TEXT,
        amount INTEGER,
        status TEXT DEFAULT 'pending',
        link TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS product_status (
        productName TEXT PRIMARY KEY,
        isActive INTEGER DEFAULT 1
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userFullName TEXT,
        serviceName TEXT,
        rating INTEGER DEFAULT 5,
        text TEXT,
        status TEXT DEFAULT 'approved',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Автоматическая очистка старых неоплаченных заказов старше 20 минут
setInterval(() => {
    db.run(`DELETE FROM orders WHERE status = 'pending' AND createdAt < DATETIME('now', '-20 minutes')`, (err) => {
        if (err) console.error('Error cleaning old pending orders:', err.message);
    });
}, 60 * 1000);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

const ADMIN_IDS = process.env.ADMIN_IDS 
    ? process.env.ADMIN_IDS.split(',').map(id => Number(id.trim())) 
    : [];

function isAdmin(userId) {
    return ADMIN_IDS.includes(Number(userId));
}

let storeOpen = true;

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

app.use(express.json());

// ==================== REST API ДЛЯ МИНИ-ПРИЛОЖЕНИЯ ====================

app.get('/api/store-status', (req, res) => {
    db.all(`SELECT productName, isActive FROM product_status`, [], (err, rows) => {
        const disabledProducts = {};
        if (!err && rows) {
            rows.forEach(row => {
                if (row.isActive === 0) disabledProducts[row.productName] = false;
            });
        }
        res.json({ isOpen: storeOpen, disabledProducts });
    });
});

app.get('/api/reviews', (req, res) => {
    db.all(`SELECT userFullName, serviceName, rating, text, createdAt FROM reviews WHERE status = 'approved' ORDER BY id DESC LIMIT 20`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.post('/api/reviews', (req, res) => {
    const { username, service, text, rating } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });

    db.run(
        `INSERT INTO reviews (userFullName, serviceName, rating, text, status) VALUES (?, ?, ?, ?, 'approved')`,
        [username || 'Покупатель', service || 'Цифровая подписка', rating || 5, text],
        function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ success: true });
        }
    );
});

app.get('/api/orders/:userId', (req, res) => {
    const userId = req.params.userId;
    db.all(`SELECT * FROM orders WHERE customerTelegramId = ? ORDER BY id DESC`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.post('/api/create-checkout-session', async (req, res) => {
    try {
        if (!storeOpen) {
            return res.status(400).json({ error: 'Магазин временно закрыт.' });
        }

        const { productName, amount, customerTelegramId, existingOrderId } = req.body;

        db.get(`SELECT isActive FROM product_status WHERE productName = ?`, [productName], async (err, row) => {
            if (row && row.isActive === 0) {
                return res.status(400).json({ error: 'Этот товар временно распродан.' });
            }

            const proceedWithOrder = (orderId) => {
                const priceInEurCents = Math.round((amount / 500) * 100);

                stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [{
                        price_data: {
                            currency: 'eur',
                            product_data: { name: productName },
                            unit_amount: priceInEurCents > 50 ? priceInEurCents : 100,
                        },
                        quantity: 1,
                    }],
                    mode: 'payment',
                    success_url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}?success=true`,
                    cancel_url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}?canceled=true`,
                    metadata: { orderId: String(orderId), customerTelegramId: String(customerTelegramId || 'guest'), productName }
                }).then(session => {
                    res.json({ url: session.url });
                }).catch(err => {
                    console.error('Stripe error:', err.message);
                    res.status(500).json({ error: 'Stripe connection error.' });
                });
            };

            // Если передан существующий ID заказа из списка "Мои заказы", используем его строго без создания новой строки
            if (existingOrderId) {
                db.get(`SELECT id FROM orders WHERE id = ?`, [existingOrderId], (err, orderRow) => {
                    if (orderRow) {
                        proceedWithOrder(existingOrderId);
                    } else {
                        createNewOrder();
                    }
                });
            } else {
                createNewOrder();
            }

            function createNewOrder() {
                db.run(
                    `INSERT INTO orders (customerTelegramId, productName, amount, status) VALUES (?, ?, ?, ?)`,
                    [customerTelegramId || 'guest', productName, amount, 'pending'],
                    function(err) {
                        if (err) return res.status(500).json({ error: 'Database error' });
                        proceedWithOrder(this.lastID);
                    }
                );
            }
        });
    } catch (error) {
        console.error('Stripe error:', error.message);
        res.status(500).json({ error: 'Stripe connection error.' });
    }
});

// ==================== STRIPE WEBHOOK ====================
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const event = req.body;

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata.orderId;
        const customerTelegramId = session.metadata.customerTelegramId;
        const productName = session.metadata.productName;

        db.run(`UPDATE orders SET status = 'paid' WHERE id = ?`, [orderId], (err) => {
            if (!err && customerTelegramId !== 'guest') {
                bot.telegram.sendMessage(customerTelegramId,
                    `🎉 Оплата прошла успешно!\nТовар: ${productName}\nЗаказ обрабатывается, администратор скоро пришлет ссылку на доступы.`
                ).catch(() => {});

                ADMIN_IDS.forEach(adminId => {
                    bot.telegram.sendMessage(adminId, 
                        `💰 ОПЛАЧЕН ЗАКАЗ #${orderId}\nТовар: ${productName}\nUser ID: ${customerTelegramId}\n\nИспользуйте /fulfill ${orderId} <ссылка>`
                    ).catch(() => {});
                });
            }
        });
    }

    res.json({ received: true });
});

app.use(express.static(path.join(__dirname, 'public')));

// ==================== ТЕЛЕГРАМ БОТ ====================

bot.start((ctx) => {
    const userName = ctx.from.first_name || 'друг';
    ctx.reply(
        `👋 Привет, ${userName}!\n\n` +
        `🛒 Добро пожаловать в Kinzly Store — твой надежный магазин цифровых подписок.\n` +
        `✨ Быстрая выдача, безопасная оплата и гарантия 24 часа.`,
        Markup.inlineKeyboard([
            [Markup.button.webApp('🛒 Открыть магазин', process.env.WEBAPP_URL || 'http://localhost:3000')]
        ])
    );
});

bot.command('fulfill', (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.reply('Доступ запрещен.');
    const args = ctx.message.text.split(' ');
    const orderId = Number(args[1]);
    const link = args[2];

    if (!orderId || !link) return ctx.reply('Использование: /fulfill <order_id> <ссылка>');

    db.get(`SELECT * FROM orders WHERE id = ?`, [orderId], (err, order) => {
        if (err || !order) return ctx.reply('Заказ не найден.');

        db.run(`UPDATE orders SET status = 'completed', link = ? WHERE id = ?`, [link, orderId], () => {
            bot.telegram.sendMessage(order.customerTelegramId,
                `🎉 Ваша подписка готова!\nТовар: ${order.productName}\nСсылка доступа: ${link}`
            ).catch(() => {});

            ctx.reply(`Заказ #${orderId} успешно выполнен!`);
        });
    });
});

try {
    bot.launch();
    console.log('Telegram bot launched successfully.');
} catch (e) {
    console.error('Failed to launch bot:', e.message);
}

app.get('/api/ping', (req, res) => {
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));