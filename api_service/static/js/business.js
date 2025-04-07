// Функция для загрузки данных о компании и бизнесах
function loadCompanyData() {
    if (!checkAuth()) {
        window.location.href = '/auth/login';
        return;
    }
    
    const companyData = JSON.parse(localStorage.getItem('companyData'));
    
    if (!companyData || companyData.status !== 'success') {
        console.error('Данные компании не найдены или неверный формат');
        window.location.href = '/auth/login';
        return;
    }
    
    const businesses = companyData.businesses || [];
    const sceneContainer = document.getElementById('scene-container');
    const listContainer = document.getElementById('list-container');
    
    // Очищаем контейнеры
    sceneContainer.innerHTML = '';
    listContainer.innerHTML = '';
    
    // Получаем информационную панель
    const infoPanel = document.getElementById('info-panel');
    
    // Сохраняем навигационную панель, если она существует
    const topPanel = document.getElementById('top-panel');
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
    
    // Создаем блоки для каждого бизнеса
    businesses.forEach((business, index) => {
        // Создаем блок в сцене
        const sceneBox = document.createElement('div');
        sceneBox.className = 'scene-box';
        sceneBox.textContent = business.name;
        sceneBox.dataset.businessId = business._id;
        sceneBox.addEventListener('click', () => showBusinessInfo(business));
        sceneContainer.appendChild(sceneBox);
        
        // Создаем элемент в списке
        const listItem = document.createElement('div');
        listItem.className = 'list-box';
        listItem.textContent = business.name;
        listItem.dataset.businessId = business._id;
        
        // Создаем контейнер для продуктов
        const productsContainer = document.createElement('div');
        productsContainer.className = 'products-tree';
        productsContainer.style.display = 'none';
        
        // Добавляем продукты в дерево
        if (business.products && business.products.length > 0) {
            const productsList = document.createElement('ul');
            business.products.forEach(product => {
                const productItem = document.createElement('li');
                productItem.textContent = `${product.name} - ${product.price} руб.`;
                productsList.appendChild(productItem);
            });
            productsContainer.appendChild(productsList);
        } else {
            productsContainer.innerHTML = '<p>Нет продуктов</p>';
        }
        
        // Добавляем обработчик клика для раскрытия дерева продуктов
        listItem.addEventListener('click', () => {
            // Проверяем, открыто ли уже дерево продуктов для этого бизнеса
            const isTreeVisible = productsContainer.style.display === 'block';
            
            // Если дерево было скрыто, показываем его, иначе скрываем
            if (!isTreeVisible) {
                productsContainer.style.display = 'block';
                // Показываем информацию о бизнесе
                showBusinessInfo(business);
            } else {
                productsContainer.style.display = 'none';
            }
        });
        
        // Добавляем элементы в список
        listContainer.appendChild(listItem);
        listContainer.appendChild(productsContainer);
    });
    
    // Добавляем блок-кнопку для создания нового бизнеса
    const addBusinessBox = document.createElement('div');
    addBusinessBox.className = 'scene-box add-business';
    addBusinessBox.innerHTML = '<div class="add-icon">+</div><div class="add-text">Добавить бизнес</div>';
    addBusinessBox.addEventListener('click', () => {
        // Переключаемся на сцену добавления бизнеса
        showAddBusinessScene();
    });
    sceneContainer.appendChild(addBusinessBox);
    
    // Обновляем навигационную полоску
    updateNavigationBar('Главная');
}

// Функция для отображения информации о бизнесе
function showBusinessInfo(business) {
    // Получаем информационную панель
    const infoPanel = document.getElementById('info-panel');
    
    // Сохраняем навигационную панель, если она существует
    const topPanel = document.getElementById('top-panel');
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
    
    // Создаем контейнер для информации о бизнесе
    const businessInfoContainer = document.createElement('div');
    businessInfoContainer.className = 'business-info-container';
    
    // Создаем заголовок с названием бизнеса
    const businessTitle = document.createElement('h2');
    businessTitle.className = 'business-title';
    businessTitle.textContent = business.name;
    
    // Создаем описание бизнеса
    const businessDescription = document.createElement('p');
    businessDescription.className = 'business-description';
    businessDescription.textContent = business.description || 'Описание отсутствует';
    
    // Создаем контейнер для продуктов
    const productsContainer = document.createElement('div');
    productsContainer.className = 'products-container';
    
    // Создаем заголовок для продуктов
    const productsTitle = document.createElement('h3');
    productsTitle.className = 'products-title';
    productsTitle.textContent = 'Продукты:';
    
    // Создаем список продуктов
    const productsList = document.createElement('ul');
    productsList.className = 'products-list';
    
    // Проверяем, есть ли продукты
    if (business.products && business.products.length > 0) {
        // Добавляем каждый продукт в список
        business.products.forEach(product => {
            const productItem = document.createElement('li');
            productItem.className = 'product-item';
            productItem.textContent = `${product.name} - ${product.price} руб.`;
            productsList.appendChild(productItem);
        });
    } else {
        // Если продуктов нет, добавляем сообщение
        const noProductsMessage = document.createElement('p');
        noProductsMessage.className = 'no-products-message';
        noProductsMessage.textContent = 'Нет продуктов';
        productsList.appendChild(noProductsMessage);
    }
    
    // Собираем все элементы
    productsContainer.appendChild(productsTitle);
    productsContainer.appendChild(productsList);
    
    businessInfoContainer.appendChild(businessTitle);
    businessInfoContainer.appendChild(businessDescription);
    businessInfoContainer.appendChild(productsContainer);
    
    // Добавляем информацию о бизнесе в информационную панель
    infoPanel.appendChild(businessInfoContainer);
} 