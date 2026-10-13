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
        ordersTitle: "My Orders & Profile",
        ordersSubtitle: "Your Telegram details and purchase history",
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
        payNow: "Pay Now 💳",
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
        ordersTitle: "Профиль и Заказы",
        ordersSubtitle: "Ваш Telegram аккаунт и история покупок",
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
        payNow: "Оплатить 💳",
        modalTitle: "Важное предупреждение",
        modalText: "Пожалуйста, активируйте подписку в течение 1 часа после получения ссылки.",
        modalBtn: "Понятно",
        noOrders: "У вас пока нет покупок.",
        noReviews: "Пока нет отзывов. Станьте первым!"
    }
};

// Твои правильные актуальные цены
const products = [
    { name: 'Google AI Pro', desc: 'Advanced AI features & storage', price: 999, oldPrice: 1999, discount: '-50%' },
    { name: 'ChatGPT Plus', desc: 'GPT-4o & priority access', price: 1499, oldPrice: 2499, discount: '-40%' },
    { name: 'Duolingo Super', desc: 'Ad-free language learning', price: 999, oldPrice: 1999, discount: '-50%' },
    { name: 'Spotify Premium', desc: 'Music without limits', price: 699, oldPrice: 999, discount: '-30%' },
    { name: 'Adobe Express Premium', desc: 'Pro design templates', price: 999, oldPrice: 1999, discount: '-50%' },
    { name: 'CapCut Pro', desc: 'Advanced video editing features', price: 999, oldPrice: 1999, discount: '-50%' },
    { name: 'Canva Pro', desc: 'Unlimited graphic design tools', price: 1499, oldPrice: 2399, discount: '-40%' },
    { name: 'Coursera Premium', desc: 'Access to professional certificates', price: 1999, oldPrice: 2999, discount: '-33%' }
];

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    const targetBtn = document.querySelector(`[data-tab="${tabId}"]`);
    const targetContent = document.getElementById(`${tabId}Tab`);

    if (targetBtn) targetBtn.classList.add('active');
    if (targetContent) targetContent.classList.add('active');

    if (tabId === 'orders') loadUserProfileAndOrders();
    if (tabId === 'reviews') loadReviews();
}

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

// Повторная оплата конкретного заказа по его ID (без создания дубликатов)
async function retryCheckout(orderId) {
    try {
        const res = await fetch('/api/retry-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
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

async function loadUserProfileAndOrders() {
    const user = tg.initDataUnsafe?.user || {};
    const userId = user.id || '123456789';
    const firstName = user.first_name || 'Vesly';
    const lastName = user.last_name ? ` ${user.last_name}` : '';
    const username = user.username ? `@${user.username}` : 'No username';
    const photoUrl = user.photo_url || '';

    const profileContainer = document.getElementById('userProfileCard');
    profileContainer.innerHTML = `
        <div class="profile-card">
            <div class="profile-avatar">
                ${photoUrl ? `<img src="${photoUrl}" alt="Avatar">` : `<span>👤</span>`}
            </div>
            <div class="profile-info">
                <h3>${firstName}${lastName}</h3>
                <p class="profile-username">${username}</p>
                <span class="profile-id">ID: ${userId}</span>
            </div>
        </div>
    `;

    const list = document.getElementById('ordersList');
    list.innerHTML = '<p style="color:var(--text-muted); font-size:13px; text-align:center;">Loading orders...</p>';

    try {
        const res = await fetch(`/api/orders/${userId}`);
        const orders = await res.json();

        if (!orders || orders.length === 0) {
            list.innerHTML = `<p style="color:var(--text-muted); font-size:13px; text-align:center; padding: 10px;">${translations[currentLang].noOrders}</p>`;
            return;
        }

        let ordersHtml = '';
        orders.forEach(o => {
            const isPending = o.status === 'pending';
            ordersHtml += `
                <div class="order-item">
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                        <strong style="font-size:14px;">${o.productName}</strong>
                        <span style="font-size:12px; font-weight:700; color:${isPending ? 'var(--text-muted)' : 'var(--success-color)'};">[${o.status.toUpperCase()}]</span>
                    </div>
                    <div style="font-size:12px; color:var(--text-muted); margin-bottom:4px;">Amount: €${(o.amount/100).toFixed(2)}</div>
                    ${isPending ? `<button class="btn-primary" style="margin-top:8px; padding:8px 12px; font-size:13px;" onclick="retryCheckout(${o.id})">${translations[currentLang].payNow}</button>` : ''}
                    ${o.link ? `<div style="margin-top:8px;"><a href="${o.link}" target="_blank" style="color:var(--accent-color); font-size:13px; text-decoration:none; font-weight:600;">🔗 Activation Link</a></div>` : ''}
                </div>
            `;
        });
        list.innerHTML = ordersHtml;
    } catch (e) {
        list.innerHTML = '<p style="color:var(--danger-color); font-size:13px; text-align:center;">Failed to load orders.</p>';
    }
}

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

fetchStoreStatus();