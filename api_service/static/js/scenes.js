// Функция для обновления навигационной полоски
function updateNavigationBar(title) {
    const infoPanel = document.getElementById('info-panel');
    
    // Проверяем, существует ли уже верхняя панель
    let topPanel = document.getElementById('top-panel');
    
    if (!topPanel) {
        // Создаем верхнюю панель, если она еще не существует
        topPanel = document.createElement('div');
        topPanel.id = 'top-panel';
        topPanel.className = 'top-panel';
        
        // Добавляем верхнюю панель в информационную панель в самое начало
        if (infoPanel.firstChild) {
            infoPanel.insertBefore(topPanel, infoPanel.firstChild);
        } else {
            infoPanel.appendChild(topPanel);
        }
    }
    
    // Проверяем, существует ли уже навигационная полоска
    let navBar = document.getElementById('nav-bar');
    
    if (!navBar) {
        // Создаем навигационную полоску, если она еще не существует
        navBar = document.createElement('div');
        navBar.id = 'nav-bar';
        navBar.className = 'nav-bar';
        
        // Создаем кнопку "Назад"
        const backButton = document.createElement('div');
        backButton.className = 'nav-back-button';
        backButton.innerHTML = '<div class="nav-back-icon">←</div>';
        backButton.addEventListener('click', () => {
            // Возвращаемся к основной сцене
            showMainScene();
        });
        
        // Создаем заголовок текущей сцены
        const titleElement = document.createElement('div');
        titleElement.className = 'nav-title';
        
        // Добавляем элементы в навигационную полоску
        navBar.appendChild(backButton);
        navBar.appendChild(titleElement);
        
        // Добавляем навигационную полоску в верхнюю панель
        topPanel.appendChild(navBar);
    }
    
    // Обновляем заголовок текущей сцены
    const titleElement = navBar.querySelector('.nav-title');
    titleElement.textContent = title;
    
    // Показываем или скрываем кнопку "Назад" в зависимости от текущей сцены
    const backButton = navBar.querySelector('.nav-back-button');
    if (title === 'Главная') {
        backButton.style.display = 'none';
    } else {
        backButton.style.display = 'flex';
    }
}

// Функция для показа сцены добавления бизнеса
function showAddBusinessScene() {
    // Очищаем текущую сцену, сохраняя навигационную панель
    const infoPanel = document.getElementById('info-panel');
    const topPanel = document.getElementById('top-panel');
    
    // Сохраняем навигационную панель, если она существует
    if (topPanel) {
        topPanel.parentNode.removeChild(topPanel);
    }

    // Очищаем информационную панель
    infoPanel.innerHTML = '';

    // Восстанавливаем навигационную панель
    if (topPanel) {
        infoPanel.appendChild(topPanel);
    }

    // Обновляем навигационную полоску
    updateNavigationBar('Добавление бизнеса');

    // Получаем контейнер сцены
    const sceneContainer = document.getElementById('scene-container');

    // Очищаем контейнер сцены
    sceneContainer.innerHTML = '';

    // Создаем контейнер для формы
    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';

    // Создаем форму
    const form = document.createElement('form');
    form.className = 'business-form';

    // Добавляем поле ввода
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Введите название бизнеса';
    inputField.className = 'form-input';

    // Добавляем кнопку отправки
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Добавить';
    submitButton.className = 'form-submit';

    // Собираем форму
    form.appendChild(inputField);
    form.appendChild(submitButton);
    formContainer.appendChild(form);

    // Добавляем форму в контейнер сцены
    sceneContainer.appendChild(formContainer);

    // Добавляем обработчик события для отправки формы
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Предотвращаем перезагрузку страницы

        const businessName = inputField.value.trim(); // Получаем название бизнеса

        if (businessName) {
            // Получаем текущие данные компании из localStorage
            let companyData = JSON.parse(localStorage.getItem('companyData')) || { status: 'success', businesses: [] };

            // Создаем новый бизнес
            const newBusiness = {
                _id: Date.now().toString(), // Простой способ генерации уникального ID
                name: businessName,
                products: [] // Пока без продуктов
            };

            // Добавляем новый бизнес в массив
            companyData.businesses.push(newBusiness);

            // Сохраняем обновленные данные в localStorage
            localStorage.setItem('companyData', JSON.stringify(companyData));

            // Возвращаемся на главную сцену и обновляем интерфейс
            showMainScene();
        }
    });
}

// Функция для показа главной сцены
function showMainScene() {
    // Очищаем текущую сцену, сохраняя навигационную панель
    const infoPanel = document.getElementById('info-panel');
    const topPanel = document.getElementById('top-panel');

    // Сохраняем навигационную панель, если она существует
    if (topPanel) {
        // Временно удаляем навигационную панель из DOM
        topPanel.parentNode.removeChild(topPanel);
    }

    // Очищаем информационную панель
    infoPanel.innerHTML = '';

    // Восстанавливаем навигационную панель
    if (topPanel) {
        infoPanel.appendChild(topPanel);
    }

    // Обновляем навигационную полоску
    updateNavigationBar('Главная');

    // Загружаем данные компании
    loadCompanyData();
}

// Функция для показа сцены с продуктами бизнеса
function showBusinessProductsScene(business) {
    // Очищаем текущую сцену, сохраняя навигационную панель
    const infoPanel = document.getElementById('info-panel');
    const topPanel = document.getElementById('top-panel');

    // Сохраняем навигационную панель, если она существует
    if (topPanel) {
        // Временно удаляем навигационную панель из DOM
        topPanel.parentNode.removeChild(topPanel);
    }

    // Очищаем информационную панель
    infoPanel.innerHTML = '';

    // Восстанавливаем навигационную панель
    if (topPanel) {
        infoPanel.appendChild(topPanel);
    }

    // Обновляем навигационную полоску
    updateNavigationBar(business.name);

    // Создаем контейнер для продуктов в информационной панели
    const productsContainer = document.createElement('div');
    productsContainer.className = 'products-container';

    // Создаем список продуктов
    const productsList = document.createElement('ul');
    productsList.className = 'products-list';

    // Проверяем, есть ли продукты
    if (business.products && business.products.length > 0) {
        // Добавляем каждый продукт в список
        business.products.forEach(product => {
            const productItem = document.createElement('li');
            productItem.className = 'product-item';
            productItem.innerHTML = `
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price} руб.</div>
                <div class="product-description">${product.description || 'Нет описания'}</div>
            `;
            productsList.appendChild(productItem);
        });
    } else {
        // Если продуктов нет, добавляем сообщение
        const noProductsMessage = document.createElement('p');
        noProductsMessage.className = 'no-products-message';
        noProductsMessage.textContent = 'Нет продуктов';
        productsList.appendChild(noProductsMessage);
    }

    // Добавляем список продуктов в контейнер
    productsContainer.appendChild(productsList);

    // Добавляем контейнер с продуктами в информационную панель
    infoPanel.appendChild(productsContainer);
}