let currentTab = 'catalog';
let reviewsData = [];

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
        features: ['18 месяцев доступа', 'Gemini Advanced', 'Приоритетная обработка'],
        isGoogle: true // Флаг для предупреждения
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

    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) targetTab.style.display = 'block';

    const navBtn = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
    if (navBtn) navBtn.classList.add('active');

    if (tabName === 'orders') {
        loadOrders();
    }
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
                    <span class="status-badge ${p.status.includes('заказ') ? 'warning-status' : ''}">${p.status}</span>
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
                <h2 style="color: var(--text-main); font-size: 20px; margin-bottom: 2px;">${p.name}</h2>
                <span style="color: var(--accent-color); font-size: 13px; font-weight: 500;">⏳ ${p.duration} — выдача сразу</span>
            </div>
        </div>

        <div class="info-section-box">
            <h4>ОПИСАНИЕ И УСЛОВИЯ</h4>
            <p style="color: var(--text-main); font-size: 14px; margin-bottom: 6px;"><b>Гарантия:</b> ${p.guarantee}</p>
            <p style="color: var(--text-main); font-size: 14px; margin-bottom: 8px;"><b>Выдача:</b> ${p.deliveryType}</p>
            <p style="color: var(--text-muted); font-size: 13px; line-height: 1.5;">${p.fullDesc}</p>
            <ul style="padding-left: 18px; margin-top: 10px; font-size: 13px; color: var(--text-main); display: flex; flex-direction: column; gap: 4px;">${featuresHtml}</ul>
        </div>

        <div class="info-section-box">
            <h4>СТОИМОСТЬ ПОДПИСКИ</h4>
            <div style="display: flex; align-items: baseline; gap: 10px;">
                <span class="old-price-kz" style="font-size: 14px;">${p.oldPrice.toLocaleString()} ₸</span>
                <span class="current-price-kz" style="font-size: 22px;">${p.price.toLocaleString()} ₸</span>
            </div>
        </div>

        <button class="stripe-pay-btn" onclick="initCheckout('${p.id}', '${p.name}', ${p.price})">
            💳 Оплатить (${p.price.toLocaleString()} ₸)
        </button>
    `;

    const overlay = document.getElementById('productModal');
    overlay.style.display = 'block';
    setTimeout(() => overlay.classList.add('active'), 10);
}

function closeProductModal() {
    const overlay = document.getElementById('productModal');
    overlay.classList.remove('active');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 200);
}

function toggleFaq(element) {
    element.classList.toggle('active');
}

function initCheckout(productId, productName, price) {
    if (productId === 'google') {
        const confirmed = confirm('⚠️ Внимание!\n\nСсылка-приглашение для Google AI Pro действует строго 1 час после получения. Убедитесь, что сможете активировать её сразу после оплаты.\n\nПродолжить?');
        if (!confirmed) return;
    }
    payWithStripe(productName, price);
}

function payWithStripe(productName, price) {
    const customerTelegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'guest';

    fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, amount: price, customerTelegramId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.url) {
            window.location.href = data.url;
        } else {
            alert(data.error || 'Ошибка создания платежа.');
        }
    })
    .catch(err => {
        console.error(err);
        alert('Ошибка связи с сервером.');
    });
}

function loadOrders() {
    const customerTelegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'guest';
    const ordersList = document.getElementById('ordersList');
    
    fetch(`/api/orders/${customerTelegramId}`)
        .then(res => res.json())
        .then(orders => {
            if (!orders || orders.length === 0) {
                ordersList.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 30px 0;">У вас пока нет активных заказов</p>`;
                return;
            }

            ordersList.innerHTML = orders.map(o => {
                let statusText = 'Ожидает оплаты';
                let statusColor = '#fbbf24'; // желтый для pending
                if (o.status === 'paid') {
                    statusText = 'Оплачено';
                    statusColor = 'var(--accent-color)';
                } else if (o.status === 'completed') {
                    statusText = 'Выполнено';
                    statusColor = '#4ade80';
                }

                return `
                    <div style="background: var(--card-bg); padding: 14px; border-radius: 12px; margin-bottom: 10px; border: 1px solid var(--card-border); box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <strong style="color: var(--text-main);">${o.productName}</strong>
                            <span style="color: ${statusColor}; font-weight: bold; font-size: 12px;">${statusText}</span>
                        </div>
                        <div style="font-size: 13px; color: var(--text-muted);">Сумма: ${o.amount.toLocaleString()} ₸</div>
                        ${o.status === 'pending' ? `<button onclick="payWithStripe('${o.productName}',${o.amount})" style="margin-top: 10px; width: 100%; padding: 8px; background: var(--accent-color); color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px;">💳 Оплатить заказ</button>` : ''}
                        ${o.link ? `<div style="margin-top: 8px;"><a href="${o.link}" target="_blank" style="color: var(--accent-color); font-weight: bold; text-decoration: none;">🔗 Получить доступ</a></div>` : ''}
                    </div>
                `;
            }).join('');
        })
        .catch(() => {
            ordersList.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 30px 0;">Не удалось загрузить заказы</p>`;
        });
}

function loadReviews() {
    fetch('/api/reviews')
        .then(res => res.json())
        .then(data => {
            reviewsData = data;
            const avg = reviewsData.length ? (reviewsData.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewsData.length).toFixed(1) : '5.0';
            const ratingEl = document.getElementById('profileRatingText');
            if (ratingEl) ratingEl.innerText = avg;
        })
        .catch(err => console.error('Error loading reviews:', err));
}

function openReviewsModal() {
    const list = document.getElementById('reviewsModalList');
    let html = `<button class="stripe-pay-btn" onclick="openAddReviewForm()" style="margin-top: 0; margin-bottom: 14px;">✍️ Оставить отзыв</button>`;

    if (!reviewsData || reviewsData.length === 0) {
        html += `<p style="text-align: center; color: var(--text-muted); margin-top: 20px;">Пока нет отзывов. Станьте первым!</p>`;
    } else {
        html += reviewsData.map(r => `
            <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; margin-bottom: 10px; border: 1px solid var(--card-border);">
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                    <strong style="color: var(--text-main);">${r.userFullName || 'Покупатель'}</strong>
                    <span style="color: var(--text-muted);">${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
                </div>
                <div style="font-size: 12px; color: var(--accent-color); margin-bottom: 6px;">${r.serviceName || 'Цифровая подписка'}</div>
                <div style="font-size: 13px; color: var(--text-main); margin-bottom: 6px;">"${r.text}"</div>
                <div>${'⭐'.repeat(r.rating || 5)}</div>
            </div>
        `).join('');
    }
    list.innerHTML = html;
    document.getElementById('reviewsModal').style.display = 'flex';
}

function openAddReviewForm() {
    const list = document.getElementById('reviewsModalList');
    list.innerHTML = `
        <div>
            <h3 style="margin-bottom: 10px; color: var(--text-main); font-size: 18px;">Оставить отзыв</h3>
            <label style="font-size: 12px; color: var(--text-muted);">Оценка:</label>
            <select id="newReviewRating" style="width:100%; padding:10px; background:var(--card-bg); color:var(--text-main); border:1px solid var(--card-border); border-radius:8px; margin-top:4px; margin-bottom:10px;">
                <option value="5">⭐⭐⭐⭐⭐ (Отлично)</option>
                <option value="4">⭐⭐⭐⭐ (Хорошо)</option>
                <option value="3">⭐⭐⭐ (Нормально)</option>
            </select>
            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-top: 6px;">Текст отзыва:</label>
            <textarea id="newReviewText" rows="3" placeholder="Всё отлично, выдали быстро..." style="width:100%; padding:10px; background:var(--card-bg); color:var(--text-main); border:1px solid var(--card-border); border-radius:8px; margin-top:4px; margin-bottom:14px; outline:none; resize:none;"></textarea>
            <button onclick="submitReview()" class="stripe-pay-btn" style="margin-top:0;">Отправить</button>
            <button onclick="openReviewsModal()" style="width:100%; padding:12px; background:transparent; color:var(--text-muted); border:1px solid var(--card-border); border-radius:10px; margin-top:8px; cursor:pointer;">Назад</button>
        </div>
    `;
}

function submitReview() {
    const text = document.getElementById('newReviewText').value.trim();
    const rating = document.getElementById('newReviewRating').value;
    const username = window.Telegram?.WebApp?.initDataUnsafe?.user?.username || window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Покупатель';

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
            alert('Спасибо за отзыв! Он отправлен на модерацию.');
            loadReviews();
            openReviewsModal();
        } else {
            alert('Ошибка отправки отзыва.');
        }
    })
    .catch(() => {
        alert('Ошибка связи с сервером.');
    });
}

function closeReviewsModal() {
    document.getElementById('reviewsModal').style.display = 'none';
}

window.onload = () => {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (user) {
        const nameEl = document.getElementById('profileNameView');
        const usernameEl = document.getElementById('profileUsernameView');
        const avatarEl = document.getElementById('profileAvatar');

        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Пользователь';
        if (nameEl) nameEl.innerText = fullName;
        if (usernameEl) usernameEl.innerText = user.username ? `@${user.username}` : `ID: ${user.id}`;

        if (user.photo_url && avatarEl) {
            avatarEl.innerHTML = `<img src="${user.photo_url}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else if (avatarEl) {
            avatarEl.innerText = fullName.charAt(0).toUpperCase();
        }
    } else {
        const nameEl = document.getElementById('profileNameView');
        const usernameEl = document.getElementById('profileUsernameView');
        const avatarEl = document.getElementById('profileAvatar');
        if (nameEl) nameEl.innerText = 'Гость';
        if (usernameEl) usernameEl.innerText = '@web_guest';
        if (avatarEl) avatarEl.innerText = 'G';
    }

    renderCatalog();
    loadReviews();
};