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

    updateScene();
    updateList();
}

// Функция для отображения информации о бизнесе
function showBusinessInfo(business) {
    const infoPanel = document.getElementById('info-panel');

    const topPanel = document.getElementById('top-panel');
    if (topPanel) {
        topPanel.parentNode.removeChild(topPanel);
    }

    infoPanel.innerHTML = '';

    if (topPanel) {
        infoPanel.appendChild(topPanel);
    }

    updateNavigationBar(business.name);

    const productsContainer = document.createElement('div');
    productsContainer.className = 'products-container';

    const productsList = document.createElement('ul');
    productsList.className = 'products-list';

    if (business.products && business.products.length > 0) {
        business.products.forEach(product => {
            const productItem = document.createElement('li');
            productItem.className = 'product-item';

            const productName = document.createElement('div');
            productName.className = 'product-name';
            productName.textContent = product.name;

            const productPrice = document.createElement('div');
            productPrice.className = 'product-price';
            productPrice.textContent = `${product.price} руб.`;

            const productDescription = document.createElement('div');
            productDescription.className = 'product-description';
            productDescription.textContent = product.description || 'Описание отсутствует';

            productItem.appendChild(productName);
            productItem.appendChild(productPrice);
            productItem.appendChild(productDescription);

            productsList.appendChild(productItem);
        });
    } else {
        const noProductsMessage = document.createElement('p');
        noProductsMessage.className = 'no-products-message';
        noProductsMessage.textContent = 'Нет продуктов';
        productsList.appendChild(noProductsMessage);
    }

    productsContainer.appendChild(productsList);

    infoPanel.appendChild(productsContainer);
}