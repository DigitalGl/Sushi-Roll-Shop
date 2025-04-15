// Данные о роллах
const rolls = [
    {
        id: '01',
        title: 'Филадельфия хит ролл',
        itemsInBox: 6,
        weight: '180г.',
        price: 300,
        imgSrc: 'img/roll/philadelphia.jpg'
    },
    {
        id: '02',
        title: 'Калифорния темпура',
        itemsInBox: 6,
        weight: '205г.',
        price: 250,
        imgSrc: 'img/roll/california-tempura.jpg'
    },
    {
        id: '03',
        title: 'Запеченый ролл «Калифорния»',
        itemsInBox: 6,
        weight: '182г.',
        price: 230,
        imgSrc: 'img/roll/zapech-california.jpg'
    },
    {
        id: '04',
        title: 'Филадельфия',
        itemsInBox: 6,
        weight: '230г.',
        price: 320,
        imgSrc: 'img/roll/philadelphia.jpg'
    }
];

// Курсы валют
const exchangeRates = {
    RUB: 1,
    USD: 0.010,
    EUR: 0.009
};

const currencySymbols = {
    RUB: '₽',
    USD: '$',
    EUR: '€'
};

let currentCurrency = 'RUB';
let cart = loadCart();

// Загрузка корзины
function loadCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Сохранение корзины
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Рендеринг каталога
function renderCatalog() {
    const catalog = document.querySelector('.row').children[0];
    catalog.innerHTML = '';
    rolls.forEach(roll => {
        const card = document.createElement('div');
        card.className = 'col-md-6';
        card.innerHTML = `
            <div class="card mb-4" data-id="${roll.id}">
                <img class="product-img" src="${roll.imgSrc}" alt="">
                <div class="card-body text-center">
                    <h4 class="item-title">${roll.title}</h4>
                    <p><small data-items-in-box class="text-muted">${roll.itemsInBox} шт.</small></p>
                    <div class="details-wrapper">
                        <div class="items counter-wrapper">
                            <div class="items__control" data-action="minus">-</div>
                            <div class="items__current" data-counter>1</div>
                            <div class="items__control" data-action="plus">+</div>
                        </div>
                        <div class="price">
                            <div class="price__weight">${roll.weight}</div>
                            <div class="price__currency" data-base-price="${roll.price}">${roll.price} ₽</div>
                        </div>
                    </div>
                    <button data-cart type="button" class="btn btn-block btn-outline-warning">+ в корзину</button>
                </div>
            </div>
        `;
        catalog.appendChild(card);
    });

    // Обработчики счетчиков
    document.querySelectorAll('.counter-wrapper').forEach(counter => {
        const minusBtn = counter.querySelector('[data-action="minus"]');
        const plusBtn = counter.querySelector('[data-action="plus"]');
        const countDisplay = counter.querySelector('[data-counter]');

        minusBtn.addEventListener('click', () => {
            let count = parseInt(countDisplay.textContent);
            if (count > 1) {
                count--;
                countDisplay.textContent = count;
            }
        });

        plusBtn.addEventListener('click', () => {
            let count = parseInt(countDisplay.textContent);
            count++;
            countDisplay.textContent = count;
        });
    });

    updatePrices();
}

// Рендеринг корзины
function renderCart() {
    const cartWrapper = document.querySelector('.cart-wrapper');
    const cartEmpty = document.querySelector('[data-cart-empty]');
    cartWrapper.innerHTML = '';

    if (cart.length === 0) {
        cartEmpty.classList.remove('none');
        document.querySelector('.total-price').textContent = 0;
        return;
    }

    cartEmpty.classList.add('none');
    cart.forEach(item => {
        const convertedPrice = (item.price * exchangeRates[currentCurrency]).toFixed(2);
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.setAttribute('data-id', item.id);
        cartItem.innerHTML = `
            <div class="cart-item__top">
                <div class="cart-item__img">
                    <img src="${item.imgSrc}" alt="">
                </div>
                <div class="cart-item__desc">
                    <div class="cart-item__title">${item.title}</div>
                    <div class="cart-item__weight">${item.weight}</div>
                    <div class="cart-item__details">
                        <div class="items items--small counter-wrapper">
                            <div class="items__control" data-action="minus">-</div>
                            <div class="items__current" data-counter>${item.quantity}</div>
                            <div class="items__control" data-action="plus">+</div>
                        </div>
                        <div class="price">
                            <div class="price__currency">${convertedPrice * item.quantity} ${currencySymbols[currentCurrency]}</div>
                        </div>
                        <button class="btn btn-sm btn-danger" data-action="remove">Удалить</button>
                    </div>
                </div>
            </div>
        `;
        cartWrapper.appendChild(cartItem);
        updateCartCounter(cartItem);
    });
    updateTotalPrice();
}

// Обновление цен
function updatePrices() {
    document.querySelectorAll('.card .price__currency').forEach(priceEl => {
        const basePrice = parseInt(priceEl.getAttribute('data-base-price')) || parseInt(priceEl.textContent);
        priceEl.setAttribute('data-base-price', basePrice);
        const convertedPrice = (basePrice * exchangeRates[currentCurrency]).toFixed(2);
        priceEl.textContent = `${convertedPrice} ${currencySymbols[currentCurrency]}`;
    });
}

// Обновление счетчиков в корзине
function updateCartCounter(cartItem) {
    const minusBtn = cartItem.querySelector('[data-action="minus"]');
    const plusBtn = cartItem.querySelector('[data-action="plus"]');
    const removeBtn = cartItem.querySelector('[data-action="remove"]');
    const countDisplay = cartItem.querySelector('[data-counter]');
    const priceDisplay = cartItem.querySelector('.price__currency');
    const id = cartItem.getAttribute('data-id');

    minusBtn.addEventListener('click', () => {
        const item = cart.find(item => item.id === id);
        if (item.quantity > 1) {
            item.quantity--;
            countDisplay.textContent = item.quantity;
            priceDisplay.textContent = `${(item.price * exchangeRates[currentCurrency] * item.quantity).toFixed(2)} ${currencySymbols[currentCurrency]}`;
            saveCart(cart);
            updateTotalPrice();
        }
    });

    plusBtn.addEventListener('click', () => {
        const item = cart.find(item => item.id === id);
        item.quantity++;
        countDisplay.textContent = item.quantity;
        priceDisplay.textContent = `${(item.price * exchangeRates[currentCurrency] * item.quantity).toFixed(2)} ${currencySymbols[currentCurrency]}`;
        saveCart(cart);
        updateTotalPrice();
    });

    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            cart = cart.filter(item => item.id !== id);
            saveCart(cart);
            renderCart();
            showNotification('Товар удален из корзины');
        });
    }
}

// Обновление общей стоимости
function updateTotalPrice() {
    const cartItems = document.querySelectorAll('.cart-item');
    let total = 0;
    cartItems.forEach(item => {
        const price = parseFloat(item.querySelector('.price__currency').textContent);
        total += price;
    });
    document.querySelector('.total-price').textContent = total.toFixed(2);
    document.querySelector('.rouble').textContent = currencySymbols[currentCurrency];
}

// Уведомления
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Добавление в корзину
document.querySelectorAll('[data-cart]').forEach(button => {
    button.addEventListener('click', () => {
        const card = button.closest('.card');
        const id = card.getAttribute('data-id');
        const title = card.querySelector('.item-title').textContent;
        const weight = card.querySelector('.price__weight').textContent;
        const price = parseInt(card.querySelector('.price__currency').getAttribute('data-base-price'));
        const imgSrc = card.querySelector('.product-img').src;
        const quantity = parseInt(card.querySelector('[data-counter]').textContent);

        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id, title, weight, price, imgSrc, quantity });
        }

        saveCart(cart);
        renderCart();
        showNotification(`${title} добавлен в корзину!`);
    });
});

// Поиск
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
        const title = card.querySelector('.item-title').textContent.toLowerCase();
        card.parentElement.style.display = title.includes(query) ? 'block' : 'none';
    });
});

// Очистка корзины
document.querySelector('[data-action="clear-cart"]').addEventListener('click', () => {
    cart = [];
    saveCart(cart);
    renderCart();
    showNotification('Корзина очищена');
});

// Валидация формы
document.getElementById('order-form-submit').addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('phone-input').value;
    const phoneRegex = /^\+?\d{10,15}$/;

    if (!phoneRegex.test(phone)) {
        showNotification('Введите корректный номер телефона', 'danger');
        return;
    }

    if (cart.length === 0) {
        showNotification('Корзина пуста', 'danger');
        return;
    }

    const order = {
        phone,
        items: cart,
        total: parseFloat(document.querySelector('.total-price').textContent)
    };

    showNotification('Заказ успешно отправлен!', 'success');
    cart = [];
    saveCart(cart);
    renderCart();
});

// Смена валюты
document.getElementById('currency-select').addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    updatePrices();
    renderCart();
});

// Инициализация
renderCatalog();
renderCart();