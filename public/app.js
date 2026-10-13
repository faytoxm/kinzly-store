const tg = window.Telegram.WebApp;
tg.expand();

let currentLang = 'en';
let storeData = { isOpen: true, disabledProducts: {} };

const translations = {
    en: {
        tabShop: "Store",
        tabOrders: "Orders",
        tabReviews: "Reviews",
        tabHelp: "Help",
        bannerTitle: "European Digital Subscriptions",
        bannerSubtitle: "Fast activation & secure payments via Stripe",
        ordersTitle: "My Orders",
        ordersSubtitle: "Track your active and completed purchases",
        reviewsTitle: "Customer Reviews",
        reviewsSubtitle: "Share your experience with Vesly Store",
        leaveReview: "Leave a Review",
        namePlaceholder: "Your Name / Handle",
        reviewPlaceholder: "Write your feedback...",
        sendReviewBtn: "Submit Review",
        helpTitle: "How it works",
        step1Title: "Choose Subscription",
        step1Desc: "Select the desired service from our verified catalog.",
        step2Title: "Secure Payment",
        step2Desc: "Pay securely in Euros (€) via Stripe integration.",
        step3Title: "Instant Delivery",
        step3Desc: "Receive your activation link directly in your Telegram chat.",
        supportText: "Need help or custom requests?",
        supportBtn: "Contact Manager",
        buyBtn: "Buy",
        soldOut: "Sold Out",
        modalTitle: "Important Note",
        modalText: "Please ensure you activate your subscription within 1 hour after receiving the link.",
        modalBtn: "I Understand",
        noOrders: "You haven't made any purchases yet.",
        noReviews: "No reviews yet. Be the first!"
    },
    ru: {
        tabShop: "Магазин",
        tabOrders: "Заказы",
        tabReviews: "Отзывы",
        tabHelp: "Помощь",
        bannerTitle: "Цифровые подписки в Европе",
        bannerSubtitle: "Быстрая активация и безопасная оплата через Stripe",
        ordersTitle: "Мои заказы",
        ordersSubtitle: "История ваших покупок и статусы",
        reviewsTitle: "Отзывы клиентов",
        reviewsSubtitle: "Поделитесь впечатлением о Vesly Store",
        leaveReview: "Оставить отзыв",
        namePlaceholder: "Ваше имя / ник",
        reviewPlaceholder: "Напишите ваш отзыв...",
        sendReviewBtn: "Отправить отзыв",
        helpTitle: "Как это работает",
        step1Title: "Выберите подписку",
        step1Desc: "Выберите нужный сервис из нашего каталога.",
        step2Title: "Безопасная оплата",
        step2Desc: "Оплачивайте в евро (€) через защищенный Stripe.",
        step3Title: "Быстрая доставка",
        step3Desc: "Получите ссылку активации прямо в чат Telegram.",
        supportText: "Нужна помощь или другой сервис?",
        supportBtn: "Написать менеджеру",
        buyBtn: "Купить",
        soldOut: "Нет в наличии",
        modalTitle: "Важное предупреждение",
        modalText: "Пожалуйста, активируйте подписку в течение 1 часа после получения ссылки.",
        modalBtn: "Понятно",
        noOrders: "У вас пока нет покупок.",
        noReviews: "Пока нет отзывов. Станьте первым!"
    }
};

const products = [
    { name: 'Google AI Pro', desc: 'Advanced AI features & storage', price: 1499, oldPrice: 2200, discount: '-32%' },
    { name: 'ChatGPT Plus', desc: 'GPT-4o & priority access', price: 1999, oldPrice: 2500, discount: '-20%' },
    { name: 'Duolingo Super', desc: 'Ad-free language learning', price: 799, oldPrice: 1399, discount: '-43%' },
    { name: 'Spotify Premium', desc: 'Music without limits', price: 599, oldPrice: 1099, discount: '-45%' },
    { name: 'Adobe Express Premium', desc: 'Pro design templates', price: 899, oldPrice: 1499, discount: '-40%' },
    { name: 'CapCut Pro', desc: 'Advanced video editing features', price: 699, oldPrice: 1199, discount: '-42%' },
    { name: 'Canva Pro', desc: 'Unlimited graphic design tools', price: 799, oldPrice: 1299, discount: '-38%' },
    { name: 'Coursera Premium', desc: 'Access to professional certificates', price: 1599, oldPrice: 2999, discount: '-46%' }
];

// Переключение вкладок с плавной анимацией
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    const targetBtn = document.querySelector(`[data-tab="${tabId}"]`);
    const targetContent = document.getElementById(`${tabId}Tab`);

    if (targetBtn) targetBtn.classList.add('active');
    if (targetContent) targetContent.classList.add('active');

    if (tabId === 'orders') loadUserOrders();
    if (tabId === 'reviews') loadReviews();
}

// Смена языка
document.getElementById('langToggleBtn').addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'ru' : 'en';
    document.getElementById('langToggleBtn').innerText = currentLang.toUpperCase();
    updateTexts();
    renderProducts();
});

function updateTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) {
            el.placeholder = translations[currentLang][key];
        }
    });
}

// Загрузка статусов и рендер товаров
async function fetchStoreStatus() {
    try {
        const res = await fetch('/api/store-status');
        const data = await res.json();
        storeData = data;
        renderProducts();
    } catch (e) {
        renderProducts();
    }
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    products.forEach(p => {
        const isDisabled = storeData.disabledProducts[p.name] === false || !storeData.isOpen;
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-info">
                <h3>${p.name}</h3>
                <p class="product-desc">${p.desc}</p>
                <div class="price-box">
                    <span class="old-price">€${(p.oldPrice / 100).toFixed(2)}</span>
                    <span class="current-price">€${(p.price / 100).toFixed(2)}</span>
                    <span class="discount-badge">${p.discount}</span>
                </div>
            </div>
            <button class="buy-btn ${isDisabled ? 'disabled' : ''}" onclick="handleBuy('${p.name}', ${p.price})">
                ${isDisabled ? translations[currentLang].soldOut : translations[currentLang].buyBtn}
            </button>
        `;
        grid.appendChild(card);
    });
}

function handleBuy(productName, amount) {
    if (!storeData.isOpen || storeData.disabledProducts[productName] === false) {
        alert('This product is temporarily unavailable.');
        return;
    }

    if (productName === 'Google AI Pro') {
        document.getElementById('warningModal').style.display = 'flex';
        window.pendingPurchase = { productName, amount };
    } else {
        proceedCheckout(productName, amount);
    }
}

function closeModal() {
    document.getElementById('warningModal').style.display = 'none';
    if (window.pendingPurchase) {
        proceedCheckout(window.pendingPurchase.productName, window.pendingPurchase.amount);
        window.pendingPurchase = null;
    }
}

async function proceedCheckout(productName, amount) {
    const userId = tg.initDataUnsafe?.user?.id || '123456789';
    try {
        const res = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productName, amount, customerTelegramId: String(userId) })
        });
        const data = await res.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            alert(data.error || 'Checkout error');
        }
    } catch (e) {
        alert('Server error during checkout.');
    }
}

// Загрузка заказов пользователя
async function loadUserOrders() {
    const userId = tg.initDataUnsafe?.user?.id || '123456789';
    const list = document.getElementById('ordersList');
    list.innerHTML = '<p style="color:var(--text-muted); font-size:13px;">Loading...</p>';

    try {
        const res = await fetch(`/api/orders/${userId}`);
        const orders = await res.json();

        if (!orders || orders.length === 0) {
            list.innerHTML = `<p style="color:var(--text-muted); font-size:13px;">${translations[currentLang].noOrders}</p>`;
            return;
        }

        list.innerHTML = '';
        orders.forEach(o => {
            const item = document.createElement('div');
            item.className = 'order-item';
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <strong style="font-size:14px;">${o.productName}</strong>
                    <span style="font-size:12px; font-weight:700; color:${o.status === 'paid' ? 'var(--success-color)' : 'var(--text-muted)'};">[${o.status.toUpperCase()}]</span>
                </div>
                <div style="font-size:12px; color:var(--text-muted); margin-bottom:4px;">Amount: €${(o.amount/100).toFixed(2)}</div>
                ${o.link ? `<div style="margin-top:8px;"><a href="${o.link}" target="_blank" style="color:var(--accent-color); font-size:13px; text-decoration:none; font-weight:600;">🔗 Activation Link</a></div>` : ''}
            `;
            list.appendChild(item);
        });
    } catch (e) {
        list.innerHTML = '<p style="color:var(--danger-color); font-size:13px;">Failed to load orders.</p>';
    }
}

// Загрузка отзывов
async function loadReviews() {
    const list = document.getElementById('reviewsList');
    list.innerHTML = '<p style="color:var(--text-muted); font-size:13px;">Loading...</p>';

    try {
        const res = await fetch('/api/reviews');
        const reviews = await res.json();

        if (!reviews || reviews.length === 0) {
            list.innerHTML = `<p style="color:var(--text-muted); font-size:13px;">${translations[currentLang].noReviews}</p>`;
            return;
        }

        list.innerHTML = '';
        reviews.forEach(r => {
            const item = document.createElement('div');
            item.className = 'review-item';
            item.innerHTML = `
                <div class="review-author">${r.userFullName}</div>
                <div class="review-text">"${r.text}"</div>
            `;
            list.appendChild(item);
        });
    } catch (e) {
        list.innerHTML = '<p style="color:var(--danger-color); font-size:13px;">Failed to load reviews.</p>';
    }
}

async function submitReview() {
    const userFullName = document.getElementById('reviewName').value.trim();
    const text = document.getElementById('reviewText').value.trim();

    if (!userFullName || !text) {
        alert('Please fill in all fields.');
        return;
    }

    try {
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userFullName, text })
        });
        const data = await res.json();
        if (data.success) {
            alert('Review submitted for moderation!');
            document.getElementById('reviewName').value = '';
            document.getElementById('reviewText').value = '';
        } else {
            alert('Error submitting review.');
        }
    } catch (e) {
        alert('Server error.');
    }
}

// Инициализация при старте
fetchStoreStatus();