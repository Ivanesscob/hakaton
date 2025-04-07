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
        alert('Функция добавления нового бизнеса будет доступна в следующем обновлении');
    });
    sceneContainer.appendChild(addBusinessBox);
}

// Функция для отображения информации о бизнесе
function showBusinessInfo(business) {
    const infoPanel = document.getElementById('info-panel');
    
    let productsHtml = '';
    if (business.products && business.products.length > 0) {
        productsHtml = '<h3>Продукты:</h3><ul>';
        business.products.forEach(product => {
            productsHtml += `<li>${product.name} - ${product.price} руб.</li>`;
        });
        productsHtml += '</ul>';
    }
    
    infoPanel.innerHTML = `
        <h2>${business.name}</h2>
        <p>${business.description}</p>
        ${productsHtml}
    `;
} 