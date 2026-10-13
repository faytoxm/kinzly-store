let tg = window.Telegram.WebApp;
tg.expand();

// Проверка доступности товаров при загрузке страницы
async function checkStoreAvailability() {
    try {
        const res = await fetch('/api/store-status');
        const data = await res.json();

        // Если магазин закрыт глобально
        if (!data.isOpen) {
            document.getElementById('store-status-banner').innerHTML = '🔴 <span>Orders are temporarily closed</span>';
            document.getElementById('store-status-banner').style.background = 'rgba(239, 68, 68, 0.1)';
            document.getElementById('store-status-banner').style.color = '#ef4444';
        }

        // Если какой-то товар на стопе
        if (data.disabledProducts) {
            document.querySelectorAll('.product-card').forEach(card => {
                const titleEl = card.querySelector('h3');
                if (titleEl) {
                    const productName = titleEl.innerText.split(' — ')[0].trim();
                    if (data.disabledProducts[productName] === false) {
                        const btn = card.querySelector('.buy-btn');
                        if (btn) {
                            btn.disabled = true;
                            btn.innerText = 'Sold Out';
                            btn.style.background = '#334155';
                            btn.style.cursor = 'not-allowed';
                        }
                    }
                }
            });
        }
    } catch (e) {
        console.error('Failed to check store status', e);
    }
}

// Запускаем при загрузке
checkStoreAvailability();

const translations = {
    en: {
        banner_title: "Everything you love. On your terms.",
        banner_desc: "Big creativity, music, and discoveries. Choose your service — we handle the activation.",
        status_open: "Orders are open",
        catalog_title: "Subscription Catalog",
        profile_title: "Profile",
        orders_title: "My Orders",
        no_orders: "No active orders yet.",
        help_title: "Help & FAQ",
        nav_store: "Store",
        nav_profile: "Profile",
        nav_orders: "Orders",
        nav_help: "Help",
        btn_get: "Get Subscription",
        faq_q1: "How do I receive my subscription?",
        faq_a1: "After payment, your order goes to processing. Once ready, you will receive an activation link directly in our bot.",
        faq_q2: "Is payment secure?",
        faq_a2: "Yes! All payments are processed securely via Stripe in Euros (€).",
        reviews_title: "Customer Reviews",
        reviews_desc: "Have you made a purchase? Leave your feedback in our support chat or bot!",
        support_btn: "Contact Support & Write Review",
        modal_title: "⚠️ Important Notice",
        modal_text: "The activation link for Google AI Pro is strictly valid for <strong>1 hour</strong> from the moment it is generated and sent to you. Please ensure you are ready to activate it immediately upon receipt!",
        modal_cancel: "Cancel",
        modal_proceed: "I Understand, Proceed"
    },
    ru: {
        banner_title: "Всё, что любишь. На твоих условиях.",
        banner_desc: "Большое творчество, музыка и открытия. Выбирай сервис — подключение берём на себя.",
        status_open: "Приём заказов открыт",
        catalog_title: "Каталог подписок",
        profile_title: "Личный кабинет",
        orders_title: "Мои заказы",
        no_orders: "Пока нет активных заказов.",
        help_title: "Помощь и FAQ",
        nav_store: "Магазин",
        nav_profile: "Профиль",
        nav_orders: "Заказы",
        nav_help: "Помощь",
        btn_get: "Оформить",
        faq_q1: "Как получить подписку?",
        faq_a1: "После оплаты ваш заказ поступает в обработку. Ссылка на активацию придет вам прямо в чат бота.",
        faq_q2: "Безопасна ли оплата?",
        faq_a2: "Да! Все платежи обрабатываются через защищенную систему Stripe в евро (€).",
        reviews_title: "Отзывы клиентов",
        reviews_desc: "Совершили покупку? Оставьте свой отзыв в нашем чате поддержки или боте!",
        support_btn: "Поддержка и написание отзыва",
        modal_title: "⚠️ Важное предупреждение",
        modal_text: "Ссылка на активацию Google AI Pro действует строго <strong>1 час</strong> с момента её генерации и отправки. Пожалуйста, убедитесь, что вы готовы активировать её сразу после получения!",
        modal_cancel: "Отмена",
        modal_proceed: "Понятно, продолжить"
    }
};

let currentLang = 'en';

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ru' : 'en';
    document.getElementById('current-lang').innerText = currentLang.toUpperCase();
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.innerHTML = translations[currentLang][key];
        }
    });

    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.innerText = translations[currentLang].btn_get;
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    document.getElementById(`tab-${tabName}`).classList.add('active');
    event.currentTarget.classList.add('active');

    if (tabName === 'orders') {
        loadUserOrders();
    }
}

// Загрузка реальных данных профиля из Telegram
const tgUser = tg.initDataUnsafe?.user;
const userId = tgUser?.id || 12345;

if (tgUser) {
    document.getElementById('user-name').innerText = `${tgUser.first_name} ${tgUser.last_name || ''}`;
    document.getElementById('user-handle').innerText = tgUser.username ? `@${tgUser.username}` : 'No username';
    document.getElementById('user-id').innerText = `ID: ${tgUser.id}`;
    
    // Первая буква имени на аватарку
    if (tgUser.first_name) {
        document.getElementById('user-avatar').innerText = tgUser.first_name.charAt(0).toUpperCase();
    }
} else {
    document.getElementById('user-name').innerText = 'Demo User';
    document.getElementById('user-handle').innerText = '@demo_mode';
    document.getElementById('user-id').innerText = 'ID: 12345';
}

// Модальное окно для Google AI
let pendingProduct = null;
let pendingAmount = 0;

function openGoogleAiWarning(productName, amount) {
    pendingProduct = productName;
    pendingAmount = amount;
    document.getElementById('modal-warning').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal-warning').style.display = 'none';
    pendingProduct = null;
    pendingAmount = 0;
}

document.getElementById('modal-confirm-btn').onclick = function() {
    if (pendingProduct) {
        buySubscription(pendingProduct, pendingAmount);
        closeModal();
    }
};

async function loadUserOrders() {
    const ordersContainer = document.getElementById('tab-orders');
    try {
        const res = await fetch(`/api/orders/${userId}`);
        const orders = await res.json();

        let html = `<h2 data-i18n="orders_title">${translations[currentLang].orders_title}</h2>`;

        if (orders.length === 0) {
            html += `<p class="empty-text" style="color: #94a3b8; margin-top: 10px;">${translations[currentLang].no_orders}</p>`;
        } else {
            html += `<div class="orders-list" style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">`;
            orders.forEach(order => {
                const statusBadge = order.status === 'completed' 
                    ? '<span style="color: #22c55e;">🟢 Completed</span>' 
                    : '<span style="color: #eab308;">⏳ Pending (Awaiting activation)</span>';
                
                const linkBlock = order.link 
                    ? `<div style="margin-top: 6px;"><a href="${order.link}" target="_blank" style="color: #3b82f6; word-break: break-all;">🔗 Access Link (1 hour): ${order.link}</a></div>` 
                    : '';

                html += `
                    <div style="background: #181b24; padding: 12px; border-radius: 12px; border: 1px solid #262b38; font-size: 13px;">
                        <strong>#${order.id} - ${order.productName}</strong><br>
                        Price: €${(order.amount / 100).toFixed(2)}<br>
                        Status: ${statusBadge}
                        ${linkBlock}
                    </div>
                `;
            });
            html += `</div>`;
        }
        ordersContainer.innerHTML = html;
    } catch (e) {
        console.error('Failed to load orders', e);
    }
}

async function buySubscription(productName, amount) {
    try {
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productName, amount, customerTelegramId: userId })
        });

        const data = await response.json();
        
        if (data.url) {
            window.location.href = data.url;
        } else {
            alert(data.error || 'Payment initialization error');
        }
    } catch (e) {
        alert('Server connection error');
    }
}