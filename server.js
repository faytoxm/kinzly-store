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
        text TEXT,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

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
    db.all(`SELECT userFullName, text FROM reviews WHERE status = 'approved' ORDER BY id DESC LIMIT 10`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.post('/api/reviews', express.json(), (req, res) => {
    const { userFullName, text } = req.body;
    if (!userFullName || !text) return res.status(400).json({ error: 'Missing fields' });

    db.run(`INSERT INTO reviews (userFullName, text, status) VALUES (?, ?, 'pending')`, [userFullName, text], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        ADMIN_IDS.forEach(adminId => {
            bot.telegram.sendMessage(adminId, 
                `💬 New Review for Moderation!\nFrom: ${userFullName}\nText: "${text}"\n\nUse /admin to approve or delete.`
            ).catch(() => {});
        });

        res.json({ success: true });
    });
});

app.get('/api/orders/:userId', (req, res) => {
    const userId = req.params.userId;
    db.all(`SELECT * FROM orders WHERE customerTelegramId = ? ORDER BY id DESC`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.post('/api/create-checkout-session', express.json(), async (req, res) => {
    try {
        if (!storeOpen) {
            return res.status(400).json({ error: 'Orders are temporarily suspended.' });
        }

        const { productName, amount, customerTelegramId } = req.body;

        db.get(`SELECT isActive FROM product_status WHERE productName = ?`, [productName], async (err, row) => {
            if (row && row.isActive === 0) {
                return res.status(400).json({ error: 'This subscription is temporarily sold out.' });
            }

            db.run(
                `INSERT INTO orders (customerTelegramId, productName, amount, status) VALUES (?, ?, ?, ?)`,
                [customerTelegramId, productName, amount, 'pending'],
                async function(err) {
                    if (err) return res.status(500).json({ error: 'Database error' });
                    const orderId = this.lastID;

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
                        metadata: { orderId: String(orderId), customerTelegramId: String(customerTelegramId), productName }
                    });

                    res.json({ url: session.url });
                }
            );
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
            if (!err) {
                bot.telegram.sendMessage(customerTelegramId,
                    `🎉 Payment Successful!\nProduct: ${productName}\nYour order is being processed. An administrator will send your activation link shortly!`
                ).catch(() => {});

                ADMIN_IDS.forEach(adminId => {
                    bot.telegram.sendMessage(adminId, 
                        `💰 PAID ORDER #${orderId}\nProduct: ${productName}\nUser ID: ${customerTelegramId}\n\nUse /fulfill ${orderId} <link> to send subscription.`
                    ).catch(() => {});
                });
            }
        });
    }

    res.json({ received: true });
});

app.use(express.static(path.join(__dirname, 'public')));

// ==================== ТЕЛЕГРАМ БОТ И ИНТЕРФЕЙС ====================

bot.start((ctx) => {
    const userName = ctx.from.first_name || 'there';
    ctx.reply(
        `👋 Welcome to Vesly Store, ${userName}!\n\n` +
        `🚀 Your premier destination for European digital subscriptions at the best prices.\n` +
        `✨ Fast activation, secure payments via Stripe, and 24/7 support.\n\n` +
        `Choose an action below or open our store:`,
        Markup.inlineKeyboard([
            [Markup.button.webApp('🛒 Open Vesly Store', process.env.WEBAPP_URL || 'https://vesly-store.onrender.com')],
            [Markup.button.callback('💬 FAQ & Help', 'bot_help'), Markup.button.callback('📦 My Orders', 'bot_orders')]
        ])
    );
});

bot.help((ctx) => {
    ctx.reply(
        `📖 Vesly Store Help & FAQ\n\n` +
        `1. How to buy? Click "Open Vesly Store", choose your subscription, and pay securely via Stripe in Euros (€).\n` +
        `2. When do I get my link? After payment, your order goes to processing. Our admin will send your activation link directly to this chat.\n` +
        `3. Need support? Contact our manager at @VeslyStoreSupport.`
    );
});

bot.action('bot_help', (ctx) => {
    ctx.editMessageText(
        `📖 Vesly Store Help & FAQ\n\n` +
        `1. How to buy? Click the store button, select a service, and pay via Stripe (€).\n` +
        `2. Activation: Links are sent directly to your chat within a few minutes after payment.\n` +
        `3. Support: @VeslyStoreSupport`,
        Markup.inlineKeyboard([
            [Markup.button.callback('⬅️ Back to Start', 'bot_back')]
        ])
    );
    ctx.answerCbQuery();
});

bot.action('bot_orders', (ctx) => {
    const userId = ctx.from.id;
    db.all(`SELECT * FROM orders WHERE customerTelegramId = ? ORDER BY id DESC LIMIT 5`, [userId], (err, rows) => {
        if (!rows || rows.length === 0) {
            ctx.editMessageText(
                `📦 Your Orders\n\nYou haven't made any purchases yet. Open the store to check out our deals!`,
                Markup.inlineKeyboard([
                    [Markup.button.webApp('🛒 Open Vesly Store', process.env.WEBAPP_URL || 'https://vesly-store.onrender.com')],
                    [Markup.button.callback('⬅️ Back to Start', 'bot_back')]
                ])
            );
        } else {
            let text = `📦 Your Recent Orders:\n\n`;
            rows.forEach(o => {
                text += `• ${o.productName} — €${(o.amount/100).toFixed(2)} [Status: ${o.status}]\n`;
                if (o.link) text += `  Link: ${o.link}\n`;
                text += `---\n`;
            });
            ctx.editMessageText(text, Markup.inlineKeyboard([
                [Markup.button.callback('⬅️ Back to Start', 'bot_back')]
            ]));
        }
        ctx.answerCbQuery();
    });
});

bot.action('bot_back', (ctx) => {
    const userName = ctx.from.first_name || 'there';
    ctx.editMessageText(
        `👋 Welcome back to Vesly Store, ${userName}!\n\nChoose an action below or open our store:`,
        Markup.inlineKeyboard([
            [Markup.button.webApp('🛒 Open Vesly Store', process.env.WEBAPP_URL || 'https://vesly-store.onrender.com')],
            [Markup.button.callback('💬 FAQ & Help', 'bot_help'), Markup.button.callback('📦 My Orders', 'bot_orders')]
        ])
    );
    ctx.answerCbQuery();
});

// ==================== АДМИН-ПАНЕЛЬ ====================

bot.command('admin', (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.reply('Access denied.');

    ctx.reply(
        `👑 Vesly Store Admin Panel\nGlobal status: ${storeOpen ? 'OPEN' : 'CLOSED'}\n\nChoose an action:`,
        Markup.inlineKeyboard([
            [Markup.button.callback(storeOpen ? '🔴 Close Shop' : '🟢 Open Shop', 'toggle_shop')],
            [Markup.button.callback('📦 Manage Products (Stop-list)', 'manage_products')],
            [Markup.button.callback('⏳ Pending / Paid Orders', 'view_orders')],
            [Markup.button.callback('💬 Moderate Reviews', 'view_reviews')]
        ])
    );
});

bot.action('toggle_shop', (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('Access denied.');
    storeOpen = !storeOpen;
    ctx.editMessageText(
        `👑 Vesly Store Admin Panel\nGlobal status: ${storeOpen ? 'OPEN' : 'CLOSED'}`,
        Markup.inlineKeyboard([
            [Markup.button.callback(storeOpen ? '🔴 Close Shop' : '🟢 Open Shop', 'toggle_shop')],
            [Markup.button.callback('📦 Manage Products (Stop-list)', 'manage_products')],
            [Markup.button.callback('⏳ Pending / Paid Orders', 'view_orders')],
            [Markup.button.callback('💬 Moderate Reviews', 'view_reviews')]
        ])
    );
    ctx.answerCbQuery(`Shop is now ${storeOpen ? 'OPEN' : 'CLOSED'}`);
});

bot.action('manage_products', (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('Access denied.');

    const products = [
        'Google AI Pro', 'ChatGPT Plus', 'Duolingo Super', 'Spotify Premium',
        'Adobe Express Premium', 'CapCut Pro', 'Canva Pro', 'Coursera Premium'
    ];

    db.all(`SELECT productName, isActive FROM product_status`, [], (err, rows) => {
        const statusMap = {};
        if (rows) rows.forEach(r => statusMap[r.productName] = r.isActive);

        const buttons = products.map(prod => {
            const active = statusMap[prod] !== undefined ? statusMap[prod] : 1;
            const icon = active === 1 ? '🟢' : '🔴';
            return [Markup.button.callback(`${icon} ${prod}`, `toggle_prod_${prod}`)];
        });

        buttons.push([Markup.button.callback('⬅️ Back', 'back_to_admin')]);
        ctx.editMessageText('📦 Product Stop-list Management:', Markup.inlineKeyboard(buttons));
        ctx.answerCbQuery();
    });
});

bot.action(/^toggle_prod_(.+)$/, (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('Access denied.');
    const productName = ctx.match[1];

    db.get(`SELECT isActive FROM product_status WHERE productName = ?`, [productName], (err, row) => {
        let newState = row ? (row.isActive === 1 ? 0 : 1) : 0;
        
        if (row) {
            db.run(`UPDATE product_status SET isActive = ? WHERE productName = ?`, [newState, productName]);
        } else {
            db.run(`INSERT INTO product_status (productName, isActive) VALUES (?, ?)`, [productName, 0]);
        }

        ctx.answerCbQuery(`${productName} -> ${newState === 1 ? 'ACTIVE' : 'ON STOP'}`);
        setTimeout(() => {
            ctx.deleteMessage().catch(() => {});
            bot.handleUpdate({ ...ctx.update, callback_query: { ...ctx.callbackQuery, data: 'manage_products' } });
        }, 100);
    });
});

bot.action('view_orders', (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('Access denied.');

    db.all(`SELECT * FROM orders WHERE status != 'completed' ORDER BY id DESC LIMIT 10`, [], (err, rows) => {
        if (!rows || rows.length === 0) {
            return ctx.answerCbQuery('No active orders.');
        }

        let text = `⏳ Active / Paid Orders:\n\n`;
        rows.forEach(o => {
            text += `ID: #${o.id} | [${o.status.toUpperCase()}] ${o.productName} | €${(o.amount/100).toFixed(2)}\nUser ID: ${o.customerTelegramId}\n---\n`;
        });
        text += `\nUse: /fulfill <id> <link>`;

        ctx.editMessageText(text, Markup.inlineKeyboard([
            [Markup.button.callback('⬅️ Back', 'back_to_admin')]
        ]));
        ctx.answerCbQuery();
    });
});

bot.action('view_reviews', (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('Access denied.');

    db.all(`SELECT * FROM reviews WHERE status = 'pending'`, [], (err, rows) => {
        if (!rows || rows.length === 0) {
            return ctx.answerCbQuery('No reviews for moderation.');
        }

        const buttons = rows.map(r => [
            Markup.button.callback(`✅ Approve #${r.id}`, `approve_review_${r.id}`),
            Markup.button.callback(`❌ Delete #${r.id}`, `delete_review_${r.id}`)
        ]);
        buttons.push([Markup.button.callback('⬅️ Back', 'back_to_admin')]);

        let text = `💬 Pending Reviews:\n\n`;
        rows.forEach(r => {
            text += `ID: #${r.id} | ${r.userFullName}\n"${r.text}"\n---\n`;
        });

        ctx.editMessageText(text, Markup.inlineKeyboard(buttons));
        ctx.answerCbQuery();
    });
});

bot.action(/^approve_review_(\d+)$/, (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('Access denied.');
    const reviewId = ctx.match[1];
    db.run(`UPDATE reviews SET status = 'approved' WHERE id = ?`, [reviewId], () => {
        ctx.answerCbQuery('Review approved!');
        ctx.deleteMessage().catch(() => {});
    });
});

bot.action(/^delete_review_(\d+)$/, (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('Access denied.');
    const reviewId = ctx.match[1];
    db.run(`DELETE FROM reviews WHERE id = ?`, [reviewId], () => {
        ctx.answerCbQuery('Review deleted.');
        ctx.deleteMessage().catch(() => {});
    });
});

bot.action('back_to_admin', (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('Access denied.');
    ctx.editMessageText(
        `👑 Vesly Store Admin Panel\nGlobal status: ${storeOpen ? 'OPEN' : 'CLOSED'}`,
        Markup.inlineKeyboard([
            [Markup.button.callback(storeOpen ? '🔴 Close Shop' : '🟢 Open Shop', 'toggle_shop')],
            [Markup.button.callback('📦 Manage Products (Stop-list)', 'manage_products')],
            [Markup.button.callback('⏳ Pending / Paid Orders', 'view_orders')],
            [Markup.button.callback('💬 Moderate Reviews', 'view_reviews')]
        ])
    );
    ctx.answerCbQuery();
});

bot.command('fulfill', (ctx) => {
    if (!isAdmin(ctx.from.id)) return ctx.reply('Access denied.');
    const args = ctx.message.text.split(' ');
    const orderId = Number(args[1]);
    const link = args[2];

    if (!orderId || !link) return ctx.reply('Usage: /fulfill <order_id> <link>');

    db.get(`SELECT * FROM orders WHERE id = ?`, [orderId], (err, order) => {
        if (err || !order) return ctx.reply('Order not found.');

        db.run(`UPDATE orders SET status = 'completed', link = ? WHERE id = ?`, [link, orderId], () => {
            bot.telegram.sendMessage(order.customerTelegramId,
                `🎉 Your subscription is ready!\nProduct: ${order.productName}\nActivation Link: ${link}`
            ).catch(() => {});

            ctx.reply(`Order #${orderId} fulfilled successfully!`);
        });
    });
});

// Безопасный запуск бота с перехватом ошибок
try {
    bot.launch();
    console.log('Vesly Store bot launched successfully.');
} catch (e) {
    console.error('Failed to launch bot:', e.message);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));