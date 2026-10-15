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
        icon: 'https://api.iconify.design/logos:google-icon.svg',
        features: ['18 Months Extended Access', 'Gemini Advanced Integration', 'Priority Processing & Large Storage']
    },
    { 
        name: 'ChatGPT Plus', 
        duration: '1 month', 
        desc: 'GPT-4o access, faster response times, and advanced data analysis features.', 
        price: 1500, oldPrice: 2500, discount: '-40%',
        icon: 'icons/ChatGPT.svg',
        features: ['1 Month Full Access', 'GPT-4o & Advanced Voice', 'Priority Access During Peak Hours']
    },
    { 
        name: 'Duolingo Super', 
        duration: '12 months', 
        desc: 'Ad-free language learning with unlimited hearts and personalized practice.', 
        price: 1000, oldPrice: 2000, discount: '-50%',
        icon: 'icons/duolingo-1.svg',
        features: ['12 Months Official Access', 'No Ads & Unlimited Hearts', 'Personalized Practice & Mistakes Review']
    },
    { 
        name: 'Spotify Premium', 
        duration: '3 months', 
        desc: 'Music without limits, offline downloads, and high audio quality.', 
        price: 700, oldPrice: 1400, discount: '-50%',
        icon: 'https://api.iconify.design/logos:spotify-icon.svg',
        features: ['3 Months Individual Plan', 'Ad-free Music & Unlimited Skips', 'Offline Downloads & High Quality Audio']
    },
    { 
        name: 'Adobe Express Premium', 
        duration: '12 months', 
        desc: 'Pro design templates, fonts, and quick content creation tools.', 
        price: 1000, oldPrice: 2000, discount: '-50%',
        icon: 'icons/adobe-express-icon.svg',
        features: ['12 Months Premium Plan', 'Access to Premium Templates & Fonts', 'Generative AI Credits Included']
    },
    { 
        name: 'CapCut Pro', 
        duration: '1 month', 
        desc: 'Advanced video editing features, effects, and stock assets.', 
        price: 1000, oldPrice: 1800, discount: '-44%',
        icon: 'icons/Capcut-icon.svg',
        features: ['1 Month Pro Features', 'Unlocks All Pro Effects & Transitions', 'No Watermark & Cloud Storage']
    },
    { 
        name: 'Canva Pro', 
        duration: '12 months', 
        desc: 'Unlimited graphic design tools, stock photos, and brand kits.', 
        price: 1500, oldPrice: 3000, discount: '-50%',
        icon: 'icons/canva-seeklogo.svg',
        features: ['12 Months Pro Subscription', '100M+ Premium Stock Photos & Videos', 'Background Remover & Brand Kit']
    },
    { 
        name: 'Coursera Premium', 
        duration: '12 months', 
        desc: 'Access to professional certificates and top university courses.', 
        price: 2000, oldPrice: 4000, discount: '-50%',
        icon: 'icons/Coursera.svg',
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
                <div style="background: rgba(255, 255, 255, 0.08); padding: 8px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 42px; height: 42px;">
                    <img src="${p.icon}" alt="${p.name}" style="width: 24px; height: 24px; object-fit: contain;" />
                </div>
                <div class="product-info">
                    <h3 style="margin-bottom: 2px;">${p.name}</h3>
                    <div style="font-size: 11px; color: var(--accent-color); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">⏳ ${p.duration}</div>
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