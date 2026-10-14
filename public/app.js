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
    { 
        name: 'Google AI Pro', 
        duration: '18 months', 
        desc: 'Advanced AI features and cloud storage integration.', 
        price: 1000, oldPrice: 2500, discount: '-60%',
        icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="#4285F4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
        features: ['18 Months Extended Access', 'Gemini Advanced Integration', 'Priority Processing & Large Storage']
    },
    { 
        name: 'ChatGPT Plus', 
        duration: '1 month', 
        desc: 'GPT-4o access, faster response times, and advanced data analysis features.', 
        price: 1500, oldPrice: 2500, discount: '-40%',
        icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="#10a37f"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.9807 5.9807 0 0 0 .5105 4.9107 6.051 6.051 0 0 0 6.5149 2.9001A5.9847 5.9847 0 0 0 13.25 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9897 5.9897 0 0 0 3.9999-2.9001 6.0557 6.0557 0 0 0-.74-7.073z"/></svg>',
        features: ['1 Month Full Access', 'GPT-4o & Advanced Voice', 'Priority Access During Peak Hours']
    },
    { 
        name: 'Duolingo Super', 
        duration: '12 months', 
        desc: 'Ad-free language learning with unlimited hearts and personalized practice.', 
        price: 1000, oldPrice: 2000, discount: '-50%',
        icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="#58cc02"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
        features: ['12 Months Official Access', 'No Ads & Unlimited Hearts', 'Personalized Practice & Mistakes Review']
    },
    { 
        name: 'Spotify Premium', 
        duration: '3 months', 
        desc: 'Music without limits, offline downloads, and high audio quality.', 
        price: 700, oldPrice: 1400, discount: '-50%',
        icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="#1db954"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.586 14.424c-.18.295-.563.387-.858.207-2.35-1.436-5.304-1.76-8.786-.964-.335.077-.67-.133-.747-.468-.077-.334.133-.67.468-.747 3.805-.87 7.14-.492 9.878 1.183.295.181.387.563.207.858zm1.226-2.729c-.226.367-.706.482-1.073.256-2.69-1.652-6.791-2.132-9.973-1.166-.411.125-.845-.102-.97-.513-.125-.411.102-.845.513-.97 3.653-1.109 8.203-.574 11.35 1.365.367.226.482.706.256 1.028zm.106-2.842c-3.226-1.913-8.547-2.09-11.626-1.154-.495.15-1.023-.122-1.173-.617-.15-.495.122-1.023.617-1.173 3.567-1.083 9.479-.877 13.336 1.411.446.264.594.846.33 1.292-.264.446-.846.594-1.292.33z"/></svg>',
        features: ['3 Months Individual Plan', 'Ad-free Music & Unlimited Skips', 'Offline Downloads & High Quality Audio']
    },
    { 
        name: 'Adobe Express Premium', 
        duration: '12 months', 
        desc: 'Pro design templates, fonts, and quick content creation tools.', 
        price: 1000, oldPrice: 2000, discount: '-50%',
        icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="#ff0000"><path d="M21.5 2h-19C1.67 2 1 2.67 1 3.5v19c0 .83.67 1.5 1.5 1.5h19c.83 0 1.5-.67 1.5-1.5v-19c0-.83-.67-1.5-1.5-1.5zM7.5 18H5.2l-2.4-6.3h2.3l.6 1.8h2.6l.6-1.8h2.3L7.5 18zm4.5 0h-2v-6.3h2V18zm6.3 0h-2.1l-3.3-6.3h2.2l2.2 4.4 2.2-4.4h2.2l-3.4 6.3z"/></svg>',
        features: ['12 Months Premium Plan', 'Access to Premium Templates & Fonts', 'Generative AI Credits Included']
    },
    { 
        name: 'CapCut Pro', 
        duration: '1 month', 
        desc: 'Advanced video editing features, effects, and stock assets.', 
        price: 1000, oldPrice: 1800, discount: '-44%',
        icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="#ffffff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>',
        features: ['1 Month Pro Features', 'Unlocks All Pro Effects & Transitions', 'No Watermark & Cloud Storage']
    },
    { 
        name: 'Canva Pro', 
        duration: '12 months', 
        desc: 'Unlimited graphic design tools, stock photos, and brand kits.', 
        price: 1500, oldPrice: 3000, discount: '-50%',
        icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="#00c4cc"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.61 14.16c-1.39 0-2.58-.64-3.37-1.64l-.94 1.15c.98 1.25 2.5 2.04 4.31 2.04 2.97 0 5.38-2.41 5.38-5.38 0-1.21-.41-2.33-1.1-3.22l-1.05.94c.59.72.95 1.63.95 2.63 0 2.06-1.68 3.74-3.74 3.74-.48 0-.94-.09-1.37-.26l.19-.36z"/></svg>',
        features: ['12 Months Pro Subscription', '100M+ Premium Stock Photos & Videos', 'Background Remover & Brand Kit']
    },
    { 
        name: 'Coursera Premium', 
        duration: '12 months', 
        desc: 'Access to professional certificates and top university courses.', 
        price: 2000, oldPrice: 4000, discount: '-50%',
        icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="#0056D2"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4.02C5 19.5 8.13 21 12 21s7-1.5 7-3.8v-4.02l-7 3.82-7-3.82z"/></svg>',
        features: ['12 Months Unlimited Learning', 'Official Certificates Upon Completion', 'Top Global Universities & Partners']
    }
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
            <div style="display: flex; align-items: center; gap: 12px; flex-grow: 1; cursor: pointer;" onclick="openProductModal('${p.name}')">
                <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${p.icon}
                </div>
                <div class="product-info">
                    <h3>${p.name} <span style="font-size: 12px; color: var(--accent-color); font-weight: 500;">(${p.duration})</span></h3>
                    <p class="product-desc">${p.desc}</p>
                    <div class="price-box">
                        <span class="old-price">€${(p.oldPrice / 100).toFixed(2)}</span>
                        <span class="current-price">€${(p.price / 100).toFixed(2)}</span>
                        <span class="discount-badge">${p.discount}</span>
                    </div>
                </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px; margin-left: 10px;">
                <button class="buy-btn ${isDisabled ? 'disabled' : ''}" onclick="handleBuy('${p.name}', ${p.price})">
                    ${isDisabled ? translations[currentLang].soldOut : translations[currentLang].buyBtn}
                </button>
            </div>
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