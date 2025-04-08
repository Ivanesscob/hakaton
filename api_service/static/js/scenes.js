// Глобальная переменная для отслеживания текущего бизнеса
let currentBusiness = null;

// Функция для обновления навигационной полоски
function updateNavigationBar(title) {
    const infoPanel = document.getElementById('info-panel');

    let topPanel = document.getElementById('top-panel');

    if (!topPanel) {
        topPanel = document.createElement('div');
        topPanel.id = 'top-panel';
        topPanel.className = 'top-panel';

        if (infoPanel.firstChild) {
            infoPanel.insertBefore(topPanel, infoPanel.firstChild);
        } else {
            infoPanel.appendChild(topPanel);
        }
    }

    let navBar = document.getElementById('nav-bar');

    if (!navBar) {
        navBar = document.createElement('div');
        navBar.id = 'nav-bar';
        navBar.className = 'nav-bar';

        const backButton = document.createElement('div');
        backButton.className = 'nav-back-button';
        backButton.innerHTML = '<div class="nav-back-icon">←</div>';
        backButton.addEventListener('click', () => {
            showMainScene();
        });

        const titleElement = document.createElement('div');
        titleElement.className = 'nav-title';

        navBar.appendChild(backButton);
        navBar.appendChild(titleElement);

        topPanel.appendChild(navBar);
    }

    const titleElement = navBar.querySelector('.nav-title');
    titleElement.textContent = title;

    const backButton = navBar.querySelector('.nav-back-button');
    if (title === 'Главная') {
        backButton.style.display = 'none';
    } else {
        backButton.style.display = 'flex';
    }
}

// Функция для обновления сцены
function updateScene() {
    const sceneContainer = document.getElementById('scene-container');
    sceneContainer.innerHTML = '';

    if (currentBusiness) {
        if (currentBusiness.products && currentBusiness.products.length > 0) {
            currentBusiness.products.forEach(product => {
                const productBox = document.createElement('div');
                productBox.className = 'scene-box';
                productBox.innerHTML = ` 
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">${product.price} руб.</div>
                    <div class="product-description">${product.description || 'Нет описания'}</div>
                `;
                sceneContainer.appendChild(productBox);
            });
        } else {
            const noProductsMessage = document.createElement('div');
            noProductsMessage.className = 'scene-box';
            noProductsMessage.textContent = 'Нет продуктов';
            sceneContainer.appendChild(noProductsMessage);
        }

        const addProductBox = document.createElement('div');
        addProductBox.className = 'scene-box add-business';
        addProductBox.innerHTML = '<div class="add-icon">+</div><div class="add-text">Добавить продукт</div>';
        addProductBox.addEventListener('click', () => {
            showAddProductScene(currentBusiness);
        });
        sceneContainer.appendChild(addProductBox);
    } else {
        const companyData = JSON.parse(localStorage.getItem('companyData'));
        const businesses = companyData?.businesses || [];

        businesses.forEach((business) => {
            const sceneBox = document.createElement('div');
            sceneBox.className = 'scene-box';
            sceneBox.textContent = business.name;
            sceneBox.dataset.businessId = business._id;
            sceneBox.addEventListener('click', () => {
                currentBusiness = business;
                updateScene();
                updateList(); // Обновляем список
                showBusinessProductsScene(business);
            });
            sceneContainer.appendChild(sceneBox);
        });

        const addBusinessBox = document.createElement('div');
        addBusinessBox.className = 'scene-box add-business';
        addBusinessBox.innerHTML = '<div class="add-icon">+</div><div class="add-text">Добавить бизнес</div>';
        addBusinessBox.addEventListener('click', () => {
            showAddBusinessScene();
        });
        sceneContainer.appendChild(addBusinessBox);
    }
}

// Новая функция для обновления списка
function updateList() {
    const listContainer = document.getElementById('list-container');
    listContainer.innerHTML = '';

    const companyData = JSON.parse(localStorage.getItem('companyData'));
    const businesses = companyData?.businesses || [];

    businesses.forEach((business) => {
        const listItem = document.createElement('div');
        listItem.className = 'list-box';
        listItem.textContent = business.name;
        listItem.dataset.businessId = business._id;

        const productsContainer = document.createElement('div');
        productsContainer.className = 'products-tree';
        productsContainer.style.display = currentBusiness && currentBusiness._id === business._id ? 'block' : 'none';

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

        listItem.addEventListener('click', () => {
            const allProductContainers = document.querySelectorAll('.products-tree');
            allProductContainers.forEach(container => {
                if (container !== productsContainer) {
                    container.style.display = 'none';
                }
            });

            const isTreeVisible = productsContainer.style.display === 'block';

            if (!isTreeVisible) {
                productsContainer.style.display = 'block';
                currentBusiness = business;
                showBusinessProductsScene(business);
                updateScene();
            } else {
                productsContainer.style.display = 'none';
                showMainScene();
            }
        });

        listContainer.appendChild(listItem);
        listContainer.appendChild(productsContainer);
    });
}

// Функция для показа сцены добавления бизнеса
function showAddBusinessScene() {
    const infoPanel = document.getElementById('info-panel');
    const topPanel = document.getElementById('top-panel');

    if (topPanel) {
        topPanel.parentNode.removeChild(topPanel);
    }

    infoPanel.innerHTML = '';

    if (topPanel) {
        infoPanel.appendChild(topPanel);
    }

    updateNavigationBar('Добавление бизнеса');

    const sceneContainer = document.getElementById('scene-container');

    sceneContainer.innerHTML = '';

    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';

    const form = document.createElement('form');
    form.className = 'business-form';

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Введите название бизнеса';
    inputField.className = 'form-input';

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Добавить';
    submitButton.className = 'form-submit';

    form.appendChild(inputField);
    form.appendChild(submitButton);
    formContainer.appendChild(form);

    sceneContainer.appendChild(formContainer);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const businessName = inputField.value.trim();

        if (businessName) {
            let companyData = JSON.parse(localStorage.getItem('companyData')) || { status: 'success', businesses: [] };

            const newBusiness = {
                _id: Date.now().toString(),
                name: businessName,
                products: []
            };

            companyData.businesses.push(newBusiness);

            localStorage.setItem('companyData', JSON.stringify(companyData));

            showMainScene();
        }
    });
}

// Функция для показа главной сцены
function showMainScene() {
    const infoPanel = document.getElementById('info-panel');
    const topPanel = document.getElementById('top-panel');

    if (topPanel) {
        topPanel.parentNode.removeChild(topPanel);
    }

    infoPanel.innerHTML = '';

    if (topPanel) {
        infoPanel.appendChild(topPanel);
    }

    updateNavigationBar('Главная');

    currentBusiness = null;
    updateScene();
    updateList();
}

// Функция для показа сцены с продуктами бизнеса
function showBusinessProductsScene(business) {
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
        business.products.forEach((product, productIndex) => {
            const productItem = document.createElement('li');
            productItem.className = 'product-item';
            productItem.innerHTML = `
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price} руб.</div>
                <div class="product-description">${product.description || 'Нет описания'}</div>
            `;

            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.display = 'flex';
            buttonsContainer.style.gap = '10px';
            buttonsContainer.style.marginTop = '10px';

            const editButton = document.createElement('button');
            editButton.textContent = 'Редактировать';
            editButton.className = 'form-submit';
            editButton.style.background = 'linear-gradient(90deg, #0d9cd9 0%, #d90dc0 100%)';
            editButton.addEventListener('click', () => {
                showEditProductScene(business, productIndex);
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Удалить';
            deleteButton.className = 'form-submit';
            deleteButton.style.background = 'linear-gradient(90deg, #ff4444 0%, #cc0000 100%)';
            deleteButton.addEventListener('click', () => {
                deleteProduct(business, productIndex);
            });

            buttonsContainer.appendChild(editButton);
            buttonsContainer.appendChild(deleteButton);
            productItem.appendChild(buttonsContainer);

            productsList.appendChild(productItem);
        });
    } else {
        const noProductsMessage = document.createElement('p');
        noProductsMessage.className = 'no-products-message';
        noProductsMessage.textContent = 'Нет продуктов';
        productsList.appendChild(noProductsMessage);
    }

    const addProductButton = document.createElement('button');
    addProductButton.className = 'form-submit';
    addProductButton.textContent = 'Добавить продукт';
    addProductButton.addEventListener('click', () => {
        showAddProductScene(business);
    });

    productsContainer.appendChild(productsList);
    productsContainer.appendChild(addProductButton);

    infoPanel.appendChild(productsContainer);
}

// Функция для показа сцены добавления продукта
function showAddProductScene(business) {
    const infoPanel = document.getElementById('info-panel');
    const topPanel = document.getElementById('top-panel');

    if (topPanel) {
        topPanel.parentNode.removeChild(topPanel);
    }

    infoPanel.innerHTML = '';

    if (topPanel) {
        infoPanel.appendChild(topPanel);
    }

    updateNavigationBar('Добавление продукта');

    const sceneContainer = document.getElementById('scene-container');

    sceneContainer.innerHTML = '';

    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';

    const form = document.createElement('form');
    form.className = 'business-form';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Название продукта';
    nameInput.className = 'form-input';

    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.placeholder = 'Цена (руб.)';
    priceInput.className = 'form-input';

    const descriptionInput = document.createElement('textarea');
    descriptionInput.placeholder = 'Описание продукта';
    descriptionInput.className = 'form-input';
    descriptionInput.style.height = '100px';

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Добавить продукт';
    submitButton.className = 'form-submit';

    form.appendChild(nameInput);
    form.appendChild(priceInput);
    form.appendChild(descriptionInput);
    form.appendChild(submitButton);
    formContainer.appendChild(form);

    sceneContainer.appendChild(formContainer);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const productName = nameInput.value.trim();
        const productPrice = parseFloat(priceInput.value);
        const productDescription = descriptionInput.value.trim();

        if (productName && !isNaN(productPrice) && productPrice > 0) {
            let companyData = JSON.parse(localStorage.getItem('companyData')) || { status: 'success', businesses: [] };

            const businessIndex = companyData.businesses.findIndex(b => b._id === business._id);
            if (businessIndex === -1) {
                console.error('Бизнес не найден');
                return;
            }

            const newProduct = {
                name: productName,
                price: productPrice,
                description: productDescription || 'Нет описания'
            };

            companyData.businesses[businessIndex].products.push(newProduct);

            localStorage.setItem('companyData', JSON.stringify(companyData));

            currentBusiness = companyData.businesses[businessIndex];
            showBusinessProductsScene(currentBusiness);
            updateScene();
            updateList(); // Обновляем список
        } else {
            alert('Пожалуйста, введите название продукта и корректную цену');
        }
    });
}

// Функция для показа сцены редактирования продукта
function showEditProductScene(business, productIndex) {
    const infoPanel = document.getElementById('info-panel');
    const topPanel = document.getElementById('top-panel');

    if (topPanel) {
        topPanel.parentNode.removeChild(topPanel);
    }

    infoPanel.innerHTML = '';

    if (topPanel) {
        infoPanel.appendChild(topPanel);
    }

    updateNavigationBar('Редактирование продукта');

    const sceneContainer = document.getElementById('scene-container');

    sceneContainer.innerHTML = '';

    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';

    const form = document.createElement('form');
    form.className = 'business-form';

    const product = business.products[productIndex];

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Название продукта';
    nameInput.className = 'form-input';
    nameInput.value = product.name;

    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.placeholder = 'Цена (руб.)';
    priceInput.className = 'form-input';
    priceInput.value = product.price;

    const descriptionInput = document.createElement('textarea');
    descriptionInput.placeholder = 'Описание продукта';
    descriptionInput.className = 'form-input';
    descriptionInput.style.height = '100px';
    descriptionInput.value = product.description || '';

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Сохранить изменения';
    submitButton.className = 'form-submit';

    form.appendChild(nameInput);
    form.appendChild(priceInput);
    form.appendChild(descriptionInput);
    form.appendChild(submitButton);
    formContainer.appendChild(form);

    sceneContainer.appendChild(formContainer);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const productName = nameInput.value.trim();
        const productPrice = parseFloat(priceInput.value);
        const productDescription = descriptionInput.value.trim();

        if (productName && !isNaN(productPrice) && productPrice > 0) {
            let companyData = JSON.parse(localStorage.getItem('companyData')) || { status: 'success', businesses: [] };

            const businessIndex = companyData.businesses.findIndex(b => b._id === business._id);
            if (businessIndex === -1) {
                console.error('Бизнес не найден');
                return;
            }

            companyData.businesses[businessIndex].products[productIndex] = {
                name: productName,
                price: productPrice,
                description: productDescription || 'Нет описания'
            };

            localStorage.setItem('companyData', JSON.stringify(companyData));

            currentBusiness = companyData.businesses[businessIndex];
            showBusinessProductsScene(currentBusiness);
            updateScene();
            updateList(); // Обновляем список
        } else {
            alert('Пожалуйста, введите название продукта и корректную цену');
        }
    });
}

// Функция для удаления продукта
function deleteProduct(business, productIndex) {
    if (confirm('Вы уверены, что хотите удалить этот продукт?')) {
        let companyData = JSON.parse(localStorage.getItem('companyData')) || { status: 'success', businesses: [] };

        const businessIndex = companyData.businesses.findIndex(b => b._id === business._id);
        if (businessIndex === -1) {
            console.error('Бизнес не найден');
            return;
        }

        companyData.businesses[businessIndex].products.splice(productIndex, 1);

        localStorage.setItem('companyData', JSON.stringify(companyData));

        currentBusiness = companyData.businesses[businessIndex];
        showBusinessProductsScene(currentBusiness);
        updateScene();
        updateList(); // Обновляем список
    }
}