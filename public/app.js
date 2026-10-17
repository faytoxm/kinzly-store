let currentTab = 'catalog';
let userBonuses = 0;
let reviewsData = [];

// Оригинальные 8 сервисов с ценами в тенге и подробными описаниями
const products = [
    { 
        id: 'google',
        name: 'Google AI Pro', 
        duration: '18 месяцев', 
        desc: 'Gemini Advanced и облачное хранилище', 
        fullDesc: 'Официальный доступ к Google AI Pro на 18 месяцев. Интеграция с продвинутыми моделями Gemini и расширенная память.',
        guarantee: '24 часа',
        deliveryType: 'Ссылка с активацией на Ваш аккаунт Google',
        price: 1500, oldPrice: 3000, discount: '-50%',
        badge: 'ХИТ',
        status: 'под заказ · до 60 мин',
        icon: 'icons/google.svg',
        features: ['18 месяцев доступа', 'Gemini Advanced', 'Приоритетная обработка']
    },
    { 
        id: 'chatgpt',
        name: 'ChatGPT Plus', 
        duration: '1 месяц', 
        desc: 'GPT-4o, голосовой режим и анализ данных', 
        fullDesc: 'Месячная подписка на OpenAI ChatGPT Plus. Доступ к GPT-4o, расширенным инструментам генерации и приоритетная скорость ответа.',
        guarantee: '24 часа',
        deliveryType: 'Выдача данных аккаунта / активация',
        price: 6490, oldPrice: 12000, discount: '-38%',
        badge: 'ХИТ',
        status: 'в наличии',
        icon: 'icons/ChatGPT.svg',
        features: ['1 месяц GPT-4o доступа', 'Advanced Voice Mode', 'Приоритет в часы пик']
    },
    { 
        id: 'duolingo',
        name: 'Duolingo Super', 
        duration: '12 месяцев', 
        desc: 'Без рекламы и бесконечные жизни', 
        fullDesc: 'Официальный годовой доступ к Duolingo Super. Полное отсутствие рекламы, безлимитные сердечки и персональные тренировки ошибок.',
        guarantee: '24 часа',
        deliveryType: 'Ссылка-приглашение в семейную подписку',
        price: 1990, oldPrice: 4000, discount: '-50%',
        badge: '',
        status: 'в наличии',
        icon: 'icons/duolingo-1.svg',
        features: ['12 месяцев официального доступа', 'Без рекламы и сердец', 'Продвинутые упражнения']
    },
    { 
        id: 'spotify',
        name: 'Spotify Premium', 
        duration: '3 месяца', 
        desc: 'Музыка без рекламы и офлайн', 
        fullDesc: 'Индивидуальная премиум-подписка Spotify на 3 месяца с возможностью скачивания треков и высоким качеством звука.',
        guarantee: '24 часа',
        deliveryType: 'Готовый аккаунт или инвайт',
        price: 2500, oldPrice: 3000, discount: '-17%',
        badge: '',
        status: 'в наличии',
        icon: 'icons/Spotify.svg',
        features: ['3 месяца подписки', 'Музыка без рекламы', 'Офлайн режим']
    },
    { 
        id: 'adobe',
        name: 'Adobe Express Premium', 
        duration: '12 месяцев', 
        desc: 'Премиум шаблоны и нейросети', 
        fullDesc: 'Годовой премиум-доступ к Adobe Express. Профессиональные шрифты, шаблоны и кредиты генеративного ИИ Firefly.',
        guarantee: '24 часа',
        deliveryType: 'Привязка к вашему Adobe ID',
        price: 1700, oldPrice: 2000, discount: '-15%',
        badge: '',
        status: 'в наличии',
        icon: 'icons/adobe-express-icon.svg',
        features: ['12 месяцев подписки', 'Все премиум шаблоны', 'Нейросети Adobe Firefly']
    },
    { 
        id: 'capcut',
        name: 'CapCut Pro', 
        duration: '1 месяц', 
        desc: 'Все эффекты и без водяного знака', 
        fullDesc: 'Месячный Pro-доступ к видеоредактору CapCut. Разблокировка всех премиум-эффектов, переходов и облачного хранилища.',
        guarantee: '24 часа',
        deliveryType: 'Активация на аккаунт',
        price: 1500, oldPrice: 2500, discount: '-40%',
        badge: '',
        status: 'в наличии',
        icon: 'icons/Capcut-icon.svg',
        features: ['1 месяц Pro функций', 'Без водяных знаков', 'Премиум переходы и эффекты']
    },
    { 
        id: 'canva',
        name: 'Canva Pro', 
        duration: '12 месяцев', 
        desc: '100М+ сток фото и удаление фона', 
        fullDesc: 'Годовой доступ к Canva Pro через командное приглашение (Team). Все инструменты дизайна и брендовые киты без ограничений.',
        guarantee: '24 часа',
        deliveryType: 'Приглашение в рабочую область',
        price: 2000, oldPrice: 5000, discount: '-60%',
        badge: 'NEW',
        status: 'в наличии',
        icon: 'icons/canva.svg',
        features: ['12 месяцев Pro', '100М+ премиум графики', 'Удаление фона в 1 клик']
    },
    { 
        id: 'coursera',
        name: 'Coursera Premium', 
        duration: '12 месяцев', 
        desc: 'Курсы и сертификаты ведущих вузов', 
        fullDesc: 'Неограниченный доступ к тысячам курсов и получению официальных сертификатов от топ-университетов мира на 1 год.',
        guarantee: '24 часа',
        deliveryType: 'Активация на ваш личный аккаунт',
        price: 5500, oldPrice: 8000, discount: '-31%',
        badge: '',
        status: 'в наличии',
        icon: 'icons/Coursera.svg',
        features: ['12 месяцев обучения', 'Официальные сертификаты', 'Доступ к материалам вузов']
    }
];

function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    document.getElementById(`tab-${tabName}`).style.display = 'block';
    const navBtn = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
    if (navBtn) navBtn.classList.add('active');
}

function renderCatalog() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card-modern';
        card.onclick = () => openProductModal(p.id);
        
        card.innerHTML = `
            <div class="card-top-row">
                <div class="card-icon-wrap">
                    <img src="${p.icon}" alt="${p.name}" />
                </div>
                ${p.badge ? `<span class="badge-hit">${p.badge}</span>` : ''}
            </div>
            <div class="card-body">
                <div class="product-name">${p.name}</div>
                <div class="product-duration">${p.duration} · ${p.desc}</div>
                <div class="card-footer-row">
                    <div class="price-block">
                        <span class="old-price-kz">${p.oldPrice.toLocaleString()} ₸</span>
                        <span class="current-price-kz">${p.price.toLocaleString()} ₸</span>
                    </div>
                    <span class="status-badge ${p.status.includes('мало') ? 'warning' : ''}">${p.status}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function openProductModal(productId) {
    const p = products.find(item => item.id === productId);
    if (!p) return;

    const modalDetails = document.getElementById('modalProductDetails');
    let featuresHtml = p.features.map(f => `<li>${f}</li>`).join('');

    modalDetails.innerHTML = `
        <div class="modal-product-header">
            <img src="${p.icon}" class="modal-icon" />
            <div>
                <h2>${p.name}</h2>
                <span class="modal-duration">⏳ ${p.duration} — доступ сразу после проверки</span>
            </div>
        </div>

        <div class="info-section-box">
            <h4>ОПИСАНИЕ И УСЛОВИЯ</h4>
            <p><b>Гарантия:</b> ${p.guarantee}</p>
            <p><b>Выдача:</b> ${p.deliveryType}</p>
            <p style="margin-top: 6px; color: #bbb; font-size: 13px;">${p.fullDesc}</p>
            <ul style="padding-left: 16px; margin-top: 8px; font-size: 13px; color: #d0d0d8;">${featuresHtml}</ul>
        </div>

        <div class="checkout-summary-box" style="margin-top: 16px;">
            <div class="summary-line"><span>Стоимость</span> <span>${p.oldPrice.toLocaleString()} ₸</span></div>
            <div class="summary-line discount"><span>Скидка</span> <span>-${(p.oldPrice - p.price).toLocaleString()} ₸</span></div>
            <div class="summary-total"><span>К ОПЛАТЕ</span> <span>${p.price.toLocaleString()} ₸</span></div>
        </div>

        <button class="stripe-pay-btn" onclick="payWithStripe('${p.id}', ${p.price})">
            💳 Оплатить через Stripe (${p.price.toLocaleString()} ₸)
        </button>
    `;

    document.getElementById('productModal').style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

function payWithStripe(productId, price) {
    fetch('/create-stripe-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, price })
    })
    .then(res => res.json())
    .then(data => {
        if (data.url) {
            window.location.href = data.url;
        } else {
            alert('Ошибка создания платежа через Stripe.');
        }
    })
    .catch(err => {
        console.error(err);
        alert('Ошибка связи с сервером.');
    });
}

// Загрузка реальных отзывов с бэкенда
function loadReviews() {
    fetch('/api/reviews')
        .then(res => res.json())
        .then(data => {
            reviewsData = data;
            const avg = reviewsData.length ? (reviewsData.reduce((acc, r) => acc + r.rating, 0) / reviewsData.length).toFixed(1) : '5.0';
            const ratingEl = document.getElementById('profileRatingText');
            if (ratingEl) ratingEl.innerText = avg;
        })
        .catch(err => console.error('Error loading reviews:', err));
}

function openReviewsModal() {
    const list = document.getElementById('reviewsModalList');
    let html = `<button class="add-review-btn" onclick="openAddReviewForm()">✍️ Оставить отзыв</button>`;

    if (reviewsData.length === 0) {
        html += `<p style="text-align: center; color: #8b8e9b; margin-top: 20px;">Пока нет отзывов. Станьте первым!</p>`;
    } else {
        html += reviewsData.map(r => `
            <div class="review-card-item">
                <div class="review-header">
                    <strong>${r.user}</strong>
                    <span class="review-date">${r.date}</span>
                </div>
                <div class="review-service">${r.service}</div>
                <div class="review-text">"${r.text}"</div>
                <div class="review-stars">${'⭐'.repeat(r.rating)}</div>
            </div>
        `).join('');
    }
    list.innerHTML = html;
    document.getElementById('reviewsModal').style.display = 'flex';
}

function openAddReviewForm() {
    const list = document.getElementById('reviewsModalList');
    list.innerHTML = `
        <div class="add-review-form">
            <h3>Оставить отзыв</h3>
            <label style="font-size: 12px; color: #8b8e9b;">Оценка:</label>
            <select id="newReviewRating" class="review-input">
                <option value="5">⭐⭐⭐⭐⭐ (Отлично)</option>
                <option value="4">⭐⭐⭐⭐ (Хорошо)</option>
            </select>
            <label style="font-size: 12px; color: #8b8e9b; margin-top: 10px; display: block;">Текст отзыва:</label>
            <textarea id="newReviewText" class="review-input" rows="3" placeholder="Всё отлично, выдали быстро..."></textarea>
            <button onclick="submitReview()" class="stripe-pay-btn" style="margin-top: 14px;">Отправить</button>
            <button onclick="openReviewsModal()" class="copy-btn" style="width: 100%; margin-top: 8px; background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px; border-radius: 10px;">Назад</button>
        </div>
    `;
}

function submitReview() {
    const text = document.getElementById('newReviewText').value.trim();
    const rating = document.getElementById('newReviewRating').value;
    const username = window.Telegram?.WebApp?.initDataUnsafe?.user?.username || 'Покупатель';

    if (!text) {
        alert('Заполните текст отзыва.');
        return;
    }

    fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, service: 'Цифровая подписка', text, rating })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Спасибо за отзыв!');
            loadReviews();
            openReviewsModal();
        }
    });
}

function closeReviewsModal() {
    document.getElementById('reviewsModal').style.display = 'none';
}

function copyRefLink() {
    const input = document.getElementById('refLinkInput');
    input.select();
    navigator.clipboard.writeText(input.value);
    alert('Реферальная ссылка скопирована!');
}

window.onload = () => {
    renderCatalog();
    loadReviews();
};