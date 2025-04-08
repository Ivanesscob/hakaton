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
                productBox.style.display = 'flex';
                productBox.style.flexDirection = 'column';
                productBox.style.alignItems = 'center';
                productBox.style.justifyContent = 'center';
                productBox.style.padding = '10px';

                // Добавляем изображение, если оно есть
                if (product.image) {
                    const img = document.createElement('img');
                    img.src = product.image;
                    img.style.width = '100%';
                    img.style.height = '100px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '5px';
                    img.style.marginBottom = '10px';
                    productBox.appendChild(img);
                }

                productBox.innerHTML += ` 
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
            sceneBox.style.display = 'flex';
            sceneBox.style.flexDirection = 'column';
            sceneBox.style.alignItems = 'center';
            sceneBox.style.justifyContent = 'center';
            sceneBox.style.padding = '10px';

            if (business.image) {
                const img = document.createElement('img');
                img.src = business.image;
                img.style.width = '100%';
                img.style.height = '100px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '5px';
                img.style.marginBottom = '10px';
                sceneBox.appendChild(img);
            }

            const nameDiv = document.createElement('div');
            nameDiv.textContent = business.name;
            nameDiv.style.textAlign = 'center';
            sceneBox.appendChild(nameDiv);

            sceneBox.dataset.businessId = business._id;
            sceneBox.addEventListener('click', () => {
                currentBusiness = business;
                updateScene();
                updateList();
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

// Функция для обновления списка
function updateList() {
    const listContainer = document.getElementById('list-container');
    listContainer.innerHTML = '';

    const companyData = JSON.parse(localStorage.getItem('companyData'));
    const businesses = companyData?.businesses || [];

    businesses.forEach((business) => {
        const listItem = document.createElement('div');
        listItem.className = 'list-box';
        listItem.style.display = 'flex';
        listItem.style.alignItems = 'center';
        listItem.style.gap = '10px';

        if (business.image) {
            const img = document.createElement('img');
            img.src = business.image;
            img.style.width = '30px';
            img.style.height = '30px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '5px';
            listItem.appendChild(img);
        }

        const nameSpan = document.createElement('span');
        nameSpan.textContent = business.name;
        listItem.appendChild(nameSpan);

        listItem.dataset.businessId = business._id;

        const productsContainer = document.createElement('div');
        productsContainer.className = 'products-tree';
        productsContainer.style.display = currentBusiness && currentBusiness._id === business._id ? 'block' : 'none';

        if (business.products && business.products.length > 0) {
            const productsList = document.createElement('ul');
            business.products.forEach(product => {
                const productItem = document.createElement('li');
                productItem.style.display = 'flex';
                productItem.style.alignItems = 'center';
                productItem.style.gap = '5px';

                if (product.image) {
                    const img = document.createElement('img');
                    img.src = product.image;
                    img.style.width = '20px';
                    img.style.height = '20px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '3px';
                    productItem.appendChild(img);
                }

                const productText = document.createElement('span');
                productText.textContent = `${product.name} - ${product.price} руб.`;
                productItem.appendChild(productText);

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

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Введите название бизнеса';
    nameInput.className = 'form-input';

    const imageInput = document.createElement('input');
    imageInput.type = 'text';
    imageInput.placeholder = 'Введите URL изображения (опционально)';
    imageInput.className = 'form-input';

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Добавить';
    submitButton.className = 'form-submit';

    form.appendChild(nameInput);
    form.appendChild(imageInput);
    form.appendChild(submitButton);
    formContainer.appendChild(form);

    sceneContainer.appendChild(formContainer);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const businessName = nameInput.value.trim();
        const businessImage = imageInput.value.trim();

        if (businessName) {
            let companyData = JSON.parse(localStorage.getItem('companyData')) || { status: 'success', businesses: [] };

            const newBusiness = {
                _id: Date.now().toString(),
                name: businessName,
                image: businessImage || null,
                products: []
            };

            companyData.businesses.push(newBusiness);

            localStorage.setItem('companyData', JSON.stringify(companyData));

            showMainScene();
        } else {
            alert('Пожалуйста, введите название бизнеса');
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

    // Кнопки управления бизнесом
    const businessButtonsContainer = document.createElement('div');
    businessButtonsContainer.style.display = 'flex';
    businessButtonsContainer.style.gap = '10px';
    businessButtonsContainer.style.marginBottom = '20px';

    const editBusinessButton = document.createElement('button');
    editBusinessButton.textContent = 'Редактировать бизнес';
    editBusinessButton.className = 'form-submit';
    editBusinessButton.style.background = 'linear-gradient(90deg, #0d9cd9 0%, #d90dc0 100%)';
    editBusinessButton.addEventListener('click', () => {
        showEditBusinessScene(business);
    });

    const deleteBusinessButton = document.createElement('button');
    deleteBusinessButton.textContent = 'Удалить бизнес';
    deleteBusinessButton.className = 'form-submit';
    deleteBusinessButton.style.background = 'linear-gradient(90deg, #ff4444 0%, #cc0000 100%)';
    deleteBusinessButton.addEventListener('click', () => {
        deleteBusiness(business);
    });

    businessButtonsContainer.appendChild(editBusinessButton);
    businessButtonsContainer.appendChild(deleteBusinessButton);

    // Кнопка удаления изображения бизнеса
    if (business.image) {
        const deleteImageButton = document.createElement('button');
        deleteImageButton.textContent = 'Удалить изображение';
        deleteImageButton.className = 'form-submit';
        deleteImageButton.style.background = 'linear-gradient(90deg, #ff9900 0%, #cc6600 100%)';
        deleteImageButton.addEventListener('click', () => {
            let companyData = JSON.parse(localStorage.getItem('companyData')) || { status: 'success', businesses: [] };
            const businessIndex = companyData.businesses.findIndex(b => b._id === business._id);
            if (businessIndex === -1) {
                console.error('Бизнес не найден');
                return;
            }
            companyData.businesses[businessIndex].image = null;
            localStorage.setItem('companyData', JSON.stringify(companyData));
            currentBusiness = companyData.businesses[businessIndex];
            showBusinessProductsScene(currentBusiness);
            updateScene();
            updateList();
        });
        businessButtonsContainer.appendChild(deleteImageButton);
    }

    productsContainer.appendChild(businessButtonsContainer);

    const productsList = document.createElement('ul');
    productsList.className = 'products-list';

    if (business.products && business.products.length > 0) {
        business.products.forEach((product, productIndex) => {
            const productItem = document.createElement('li');
            productItem.className = 'product-item';
            productItem.style.display = 'flex';
            productItem.style.flexDirection = 'column';
            productItem.style.gap = '5px';

            // Отображаем изображение продукта, если оно есть
            if (product.image) {
                const img = document.createElement('img');
                img.src = product.image;
                img.style.width = '100%';
                img.style.height = '100px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '5px';
                productItem.appendChild(img);
            }

            productItem.innerHTML += `
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

            // Кнопка удаления изображения продукта
            if (product.image) {
                const deleteImageButton = document.createElement('button');
                deleteImageButton.textContent = 'Удалить изображение';
                deleteImageButton.className = 'form-submit';
                deleteImageButton.style.background = 'linear-gradient(90deg, #ff9900 0%, #cc6600 100%)';
                deleteImageButton.addEventListener('click', () => {
                    let companyData = JSON.parse(localStorage.getItem('companyData')) || { status: 'success', businesses: [] };
                    const businessIndex = companyData.businesses.findIndex(b => b._id === business._id);
                    if (businessIndex === -1) {
                        console.error('Бизнес не найден');
                        return;
                    }
                    companyData.businesses[businessIndex].products[productIndex].image = null;
                    localStorage.setItem('companyData', JSON.stringify(companyData));
                    currentBusiness = companyData.businesses[businessIndex];
                    showBusinessProductsScene(currentBusiness);
                    updateScene();
                    updateList();
                });
                buttonsContainer.appendChild(deleteImageButton);
            }

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

    const imageInput = document.createElement('input');
    imageInput.type = 'text';
    imageInput.placeholder = 'Введите URL изображения (опционально)';
    imageInput.className = 'form-input';

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Добавить продукт';
    submitButton.className = 'form-submit';

    form.appendChild(nameInput);
    form.appendChild(priceInput);
    form.appendChild(descriptionInput);
    form.appendChild(imageInput);
    form.appendChild(submitButton);
    formContainer.appendChild(form);

    sceneContainer.appendChild(formContainer);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const productName = nameInput.value.trim();
        const productPrice = parseFloat(priceInput.value);
        const productDescription = descriptionInput.value.trim();
        const productImage = imageInput.value.trim();

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
                description: productDescription || 'Нет описания',
                image: productImage || null
            };

            companyData.businesses[businessIndex].products.push(newProduct);

            localStorage.setItem('companyData', JSON.stringify(companyData));

            currentBusiness = companyData.businesses[businessIndex];
            showBusinessProductsScene(currentBusiness);
            updateScene();
            updateList();
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

    const imageInput = document.createElement('input');
    imageInput.type = 'text';
    imageInput.placeholder = 'Введите URL изображения (опционально)';
    imageInput.className = 'form-input';
    imageInput.value = product.image || '';

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Сохранить изменения';
    submitButton.className = 'form-submit';

    form.appendChild(nameInput);
    form.appendChild(priceInput);
    form.appendChild(descriptionInput);
    form.appendChild(imageInput);
    form.appendChild(submitButton);
    formContainer.appendChild(form);

    sceneContainer.appendChild(formContainer);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const productName = nameInput.value.trim();
        const productPrice = parseFloat(priceInput.value);
        const productDescription = descriptionInput.value.trim();
        const productImage = imageInput.value.trim();

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
                description: productDescription || 'Нет описания',
                image: productImage || null
            };

            localStorage.setItem('companyData', JSON.stringify(companyData));

            currentBusiness = companyData.businesses[businessIndex];
            showBusinessProductsScene(currentBusiness);
            updateScene();
            updateList();
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
        updateList();
    }
}

// Функция для показа сцены редактирования бизнеса
function showEditBusinessScene(business) {
    const infoPanel = document.getElementById('info-panel');
    const topPanel = document.getElementById('top-panel');

    if (topPanel) {
        topPanel.parentNode.removeChild(topPanel);
    }

    infoPanel.innerHTML = '';

    if (topPanel) {
        infoPanel.appendChild(topPanel);
    }

    updateNavigationBar('Редактирование бизнеса');

    const sceneContainer = document.getElementById('scene-container');

    sceneContainer.innerHTML = '';

    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';

    const form = document.createElement('form');
    form.className = 'business-form';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Название бизнеса';
    nameInput.className = 'form-input';
    nameInput.value = business.name;

    const imageInput = document.createElement('input');
    imageInput.type = 'text';
    imageInput.placeholder = 'Введите URL изображения (опционально)';
    imageInput.className = 'form-input';
    imageInput.value = business.image || '';

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Сохранить изменения';
    submitButton.className = 'form-submit';

    form.appendChild(nameInput);
    form.appendChild(imageInput);
    form.appendChild(submitButton);
    formContainer.appendChild(form);

    sceneContainer.appendChild(formContainer);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const businessName = nameInput.value.trim();
        const businessImage = imageInput.value.trim();

        if (businessName) {
            let companyData = JSON.parse(localStorage.getItem('companyData')) || { status: 'success', businesses: [] };

            const businessIndex = companyData.businesses.findIndex(b => b._id === business._id);
            if (businessIndex === -1) {
                console.error('Бизнес не найден');
                return;
            }

            companyData.businesses[businessIndex].name = businessName;
            companyData.businesses[businessIndex].image = businessImage || null;

            localStorage.setItem('companyData', JSON.stringify(companyData));

            currentBusiness = companyData.businesses[businessIndex];
            showBusinessProductsScene(currentBusiness);
            updateScene();
            updateList();
        } else {
            alert('Пожалуйста, введите название бизнеса');
        }
    });
}

// Функция для удаления бизнеса
function deleteBusiness(business) {
    if (confirm('Вы уверены, что хотите удалить этот бизнес? Все продукты внутри него также будут удалены.')) {
        let companyData = JSON.parse(localStorage.getItem('companyData')) || { status: 'success', businesses: [] };

        const businessIndex = companyData.businesses.findIndex(b => b._id === business._id);
        if (businessIndex === -1) {
            console.error('Бизнес не найден');
            return;
        }

        companyData.businesses.splice(businessIndex, 1);

        localStorage.setItem('companyData', JSON.stringify(companyData));

        showMainScene();
    }
}