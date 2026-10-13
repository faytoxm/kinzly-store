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

// Создание таблиц (заказы и стоп-лист товаров)
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
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let storeOpen = true;

// Список администраторов из .env (несколько ID через запятую)
const ADMIN_IDS = process.env.ADMIN_IDS 
    ? process.env.ADMIN_IDS.split(',').map(id => Number(id.trim())) 
    : [123456789];

function isAdmin(userId) {
    return ADMIN_IDS.includes(Number(userId));
}

// API: Получить общий статус магазина и статусы конкретных товаров
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

// API: Получение истории заказов пользователя
app.get('/api/orders/:userId', (req, res) => {
    const userId = req.params.userId;
    db.all(`SELECT * FROM orders WHERE customerTelegramId = ? ORDER BY id DESC`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// API: Создание сессии оплаты (с проверкой глобального стопа и стопа конкретного товара)
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        if (!storeOpen) {
            return res.status(400).json({ error: 'Orders are temporarily suspended. / Прием заказов приостановлен.' });
        }

        const { productName, amount, customerTelegramId } = req.body;

        // Проверяем, не на стопе ли этот конкретный товар
        db.get(`SELECT isActive FROM product_status WHERE productName = ?`, [productName], async (err, row) => {
            if (row && row.isActive === 0) {
                return res.status(400).json({ error: 'This subscription is temporarily sold out. / Этот товар временно недоступен.' });
            }

            // Сохраняем заказ в базу
            db.run(
                `INSERT INTO orders (customerTelegramId, productName, amount, status) VALUES (?, ?, ?, ?)`,
                [customerTelegramId, productName, amount, 'pending']
            );

            // Создаем Stripe сессию
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'eur',
                        product_data: { name: productName },
                        unit_amount: amount,
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}?success=true`,
                cancel_url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}?canceled=true`,
                metadata: { customerTelegramId: String(customerTelegramId) }
            });

            // Рассылаем уведомление всем админам
            ADMIN_IDS.forEach(adminId => {
                bot.telegram.sendMessage(adminId, 
                    `🔔 **New Order**\n` +
                    `📦 Product: ${productName}\n` +
                    `💶 Price: €${(amount / 100).toFixed(2)}\n` +
                    `👤 User ID: ${customerTelegramId}\n\n` +
                    `Use /fulfill <order_id> <link> to send.`
                ).catch(() => {});
            });

            res.json({ url: session.url });
        });
    } catch (error) {
        console.error('Stripe error:', error.message);
        res.status(500).json({ error: 'Stripe connection error.' });
    }
});

// ==================== ТЕЛЕГРАМ АДМИН-ПАНЕЛЬ ====================

// Команда /admin — вызов главной панели управления для любого из админов
bot.command('admin', (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.reply('Access denied.');

    ctx.reply(
        `👑 **Vesly Store Admin Panel**\n` +
        `Global status: ${storeOpen ? '🟢 OPEN' : '🔴 CLOSED'}\n\n` +
        `Choose an action below:`,
        Markup.inlineKeyboard([
            [Markup.button.callback(storeOpen ? '🔴 Close Whole Shop' : '🟢 Open Whole Shop', 'toggle_shop')],
            [Markup.button.callback('📦 Manage Products (Stop-list)', 'manage_products')],
            [Markup.button.callback('⏳ View Pending Orders', 'view_pending')]
        ])
    );
});

// Обработка нажатий на инлайн-кнопки админ-панели
bot.action('toggle_shop', (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('Access denied.');
    storeOpen = !storeOpen;
    ctx.editMessageText(
        `👑 **Vesly Store Admin Panel**\n` +
        `Global status: ${storeOpen ? '🟢 OPEN' : '🔴 CLOSED'}\n\n` +
        `Choose an action below:`,
        Markup.inlineKeyboard([
            [Markup.button.callback(storeOpen ? '🔴 Close Whole Shop' : '🟢 Open Whole Shop', 'toggle_shop')],
            [Markup.button.callback('📦 Manage Products (Stop-list)', 'manage_products')],
            [Markup.button.callback('⏳ View Pending Orders', 'view_pending')]
        ])
    );
    ctx.answerCbQuery(`Shop is now ${storeOpen ? 'OPEN' : 'CLOSED'}`);
});

// Управление товарами (показать список для стоп-листа)
bot.action('manage_products', (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('Access denied.');

    const products = [
        'Google AI Pro',
        'ChatGPT Plus',
        'Duolingo Super',
        'Spotify Premium',
        'Adobe Express Premium',
        'CapCut Pro',
        'Canva Pro',
        'Coursera Premium'
    ];

    db.all(`SELECT productName, isActive FROM product_status`, [], (err, rows) => {
        const statusMap = {};
        if (rows) rows.forEach(r => statusMap[r.productName] = r.isActive);

        const buttons = products.map(prod => {
            const active = statusMap[prod] !== undefined ? statusMap[prod] : 1;
            const icon = active === 1 ? '🟢' : '🔴';
            return [Markup.button.callback(`${icon}${prod}`, `toggle_prod_${prod}`)];
        });

        buttons.push([Markup.button.callback('⬅️ Back to Admin Menu', 'back_to_admin')]);

        ctx.editMessageText('📦 **Product Management (Click to toggle availability):**', Markup.inlineKeyboard(buttons));
        ctx.answerCbQuery();
    });
});

// Переключение статуса конкретного продукта
bot.action(/^toggle_prod_(.+)$/, (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('Access denied.');
    const productName = ctx.match[1];

    db.get(`SELECT isActive FROM product_status WHERE productName = ?`, [productName], (err, row) => {
        let newState = 1;
        if (row) {
            newState = row.isActive === 1 ? 0 : 1;
            db.run(`UPDATE product_status SET isActive = ? WHERE productName = ?`, [newState, productName]);
        } else {
            newState = 0; // Если записи не было, значит товар был активен, ставим на стоп (0)
            db.run(`INSERT INTO product_status (productName, isActive) VALUES (?, ?)`, [productName, 0]);
        }

        ctx.answerCbQuery(`${productName} is now${newState === 1 ? 'ACTIVE' : 'ON STOP'}`);
        
        // Обновляем список товаров в админке
        bot.handleUpdate({ ...ctx.update, message: { ...ctx.update.callback_query.message, message_id: ctx.callbackQuery.message.message_id }, chat: ctx.chat }, () => {
            // Эмулируем возврат в меню управления товарами
            ctx.answerCbQuery();
        });
        // Вызываем обновление меню товаров заново
        ctx.deleteMessage().catch(() => {});
        // Вызовем повторно отображение списка товаров
        setTimeout(() => {
            // Простая имитация клика на manage_products
            bot.handleUpdate({
                ...ctx.update,
                callback_query: { ...ctx.callbackQuery, data: 'manage_products' }
            });
        }, 100);
    });
});

bot.action('back_to_admin', (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('Access denied.');
    ctx.editMessageText(
        `👑 **Vesly Store Admin Panel**\n` +
        `Global status: ${storeOpen ? '🟢 OPEN' : '🔴 CLOSED'}\n\n` +
        `Choose an action below:`,
        Markup.inlineKeyboard([
            [Markup.button.callback(storeOpen ? '🔴 Close Whole Shop' : '🟢 Open Whole Shop', 'toggle_shop')],
            [Markup.button.callback('📦 Manage Products (Stop-list)', 'manage_products')],
            [Markup.button.callback('⏳ View Pending Orders', 'view_pending')]
        ])
    );
    ctx.answerCbQuery();
});

// Просмотр ожидающих заказов
bot.action('view_pending', (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('Access denied.');

    db.all(`SELECT * FROM orders WHERE status = 'pending' ORDER BY id DESC LIMIT 10`, [], (err, rows) => {
        if (!rows || rows.length === 0) {
            return ctx.answerCbQuery('No pending orders found.');
        }

        let text = `⏳ **Pending Orders:**\n\n`;
        rows.forEach(o => {
            text += `ID: #${o.id} | ${o.productName} \vert{} €${(o.amount/100).toFixed(2)}\nUser ID: \`${o.customerTelegramId}\`\n---\n`;
        });
        text += `\nUse command: \`/fulfill <id> <link>\``;

        ctx.editMessageText(text, Markup.inlineKeyboard([
            [Markup.button.callback('⬅️ Back to Admin Menu', 'back_to_admin')]
        ]));
        ctx.answerCbQuery();
    });
});

// Команда /fulfill для выдачи подписки
bot.command('fulfill', (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.reply('Access denied.');
    const args = ctx.message.text.split(' ');
    const orderId = Number(args[1]);
    const link = args[2];

    if (!orderId || !link) {
        return ctx.reply('Usage: /fulfill <order_id> <link>');
    }

    db.get(`SELECT * FROM orders WHERE id = ?`, [orderId], (err, order) => {
        if (err || !order) return ctx.reply('Order not found.');

        db.run(`UPDATE orders SET status = 'completed', link = ? WHERE id = ?`, [link, orderId], (err) => {
            if (err) return ctx.reply('Database update error.');

            bot.telegram.sendMessage(order.customerTelegramId,
                `🎉 **Your subscription is ready!**\n` +
                `📦 Product: ${order.productName}\n` +
                `🔗 Link (valid for 1 hour): ${link}\n` +
                `⚠️ Please activate it immediately!`
            ).catch(() => {});

            ctx.reply(`Order #${orderId} successfully fulfilled!`);
        });
    });
});

bot.launch();
console.log('Bot and server running with multi-admin & product stop-list...');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});