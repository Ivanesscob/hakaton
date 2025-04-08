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
            showMapScene();
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
    if (title === 'Карта бизнесов') {
        backButton.style.display = 'none';
    } else {
        backButton.style.display = 'flex';
    }

    // Добавляем кнопку перехода на главную страницу
    let homeButton = document.getElementById('home-button');
    if (!homeButton) {
        homeButton = document.createElement('a');
        homeButton.id = 'home-button';
        homeButton.href = '/index.html';
        homeButton.className = 'nav-button';
        homeButton.textContent = 'На главную';
        navBar.appendChild(homeButton);
    }
}

// Функция для обновления сцены (карта)
function updateScene() {
    const sceneContainer = document.getElementById('scene-container');
    sceneContainer.innerHTML = '';

    // Создаем контейнер для карты
    const mapContainer = document.createElement('div');
    mapContainer.id = 'map';
    mapContainer.style.height = '100%';
    mapContainer.style.width = '100%';
    sceneContainer.appendChild(mapContainer);

    // Инициализируем карту
    const map = L.map('map').setView([55.7558, 37.6173], 10); // Центр карты (Москва, например)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const companyData = JSON.parse(localStorage.getItem('companyData'));
    const businesses = companyData?.businesses || [];

    // Добавляем метки на карту
    businesses.forEach(business => {
        if (business.latitude && business.longitude) {
            const marker = L.marker([business.latitude, business.longitude]).addTo(map);
            marker.bindPopup(`
                <b>${business.name}</b><br>
                Тип: ${business.type === 'restaurant' ? 'Ресторан' : 
                       business.type === 'real_estate' ? 'Недвижимость' : 
                       business.type === 'hotel' ? 'Отель' : 
                       business.type === 'attraction' ? 'Интересное место' : 
                       business.type === 'service' ? 'Услуга' : 
                       business.type === 'family_time' ? 'Время с детьми' : 
                       business.type === 'sport_recreation' ? 'Спорт и отдых' : 'Историческое место'}<br>
                Адрес: ${business.address || 'Не указан'}
            `);
            marker.on('click', () => {
                currentBusiness = business;
                showBusinessInfo(business);
                updateList();
            });
        }
    });

    // Центрируем карту, если есть хотя бы один бизнес с координатами
    const validBusinesses = businesses.filter(b => b.latitude && b.longitude);
    if (validBusinesses.length > 0) {
        const bounds = validBusinesses.map(b => [b.latitude, b.longitude]);
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// Функция для обновления перечня
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
            img.src = business.image.startsWith('data:') ? business.image : `data:image/png;base64,${business.image}`;
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
                    img.src = product.image.startsWith('data:') ? product.image : `data:image/png;base64,${product.image}`;
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
                showBusinessInfo(business);
            } else {
                productsContainer.style.display = 'none';
                showMapScene();
            }
        });

        listContainer.appendChild(listItem);
        listContainer.appendChild(productsContainer);
    });
}

// Функция для отображения информации о бизнесе в инфо-панели
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

    const businessInfoContainer = document.createElement('div');
    businessInfoContainer.className = 'business-info-container';
    businessInfoContainer.style.marginBottom = '20px';

    if (business.image) {
        const img = document.createElement('img');
        img.src = business.image.startsWith('data:') ? business.image : `data:image/png;base64,${business.image}`;
        img.style.width = '100%';
        img.style.height = '150px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '5px';
        img.style.marginBottom = '10px';
        businessInfoContainer.appendChild(img);
    }

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'business-details';

    if (business.type === 'restaurant') {
        if (business.hours) {
            const hoursP = document.createElement('p');
            hoursP.innerHTML = `<strong>Часы работы:</strong> ${business.hours}`;
            detailsDiv.appendChild(hoursP);
        }
        if (business.address) {
            const addressP = document.createElement('p');
            addressP.innerHTML = `<strong>Адрес:</strong> ${business.address}`;
            detailsDiv.appendChild(addressP);
        }
        if (business.phone) {
            const phoneP = document.createElement('p');
            phoneP.innerHTML = `<strong>Телефон:</strong> ${business.phone}`;
            detailsDiv.appendChild(phoneP);
        }
        if (business.seats) {
            const seatsP = document.createElement('p');
            seatsP.innerHTML = `<strong>Количество мест:</strong> ${business.seats}`;
            detailsDiv.appendChild(seatsP);
        }
    } else if (business.type === 'real_estate') {
        if (business.propertyType) {
            const typeP = document.createElement('p');
            typeP.innerHTML = `<strong>Тип недвижимости:</strong> ${business.propertyType === 'apartment' ? 'Квартира' : business.propertyType === 'house' ? 'Дом' : 'Офис'}`;
            detailsDiv.appendChild(typeP);
        }
        if (business.area) {
            const areaP = document.createElement('p');
            areaP.innerHTML = `<strong>Площадь:</strong> ${business.area} кв.м`;
            detailsDiv.appendChild(areaP);
        }
        if (business.address) {
            const addressP = document.createElement('p');
            addressP.innerHTML = `<strong>Адрес:</strong> ${business.address}`;
            detailsDiv.appendChild(addressP);
        }
        if (business.rooms) {
            const roomsP = document.createElement('p');
            roomsP.innerHTML = `<strong>Количество комнат:</strong> ${business.rooms}`;
            detailsDiv.appendChild(roomsP);
        }
    } else if (business.type === 'hotel') {
        if (business.stars) {
            const starsP = document.createElement('p');
            starsP.innerHTML = `<strong>Количество звезд:</strong> ${business.stars}`;
            detailsDiv.appendChild(starsP);
        }
        if (business.address) {
            const addressP = document.createElement('p');
            addressP.innerHTML = `<strong>Адрес:</strong> ${business.address}`;
            detailsDiv.appendChild(addressP);
        }
        if (business.phone) {
            const phoneP = document.createElement('p');
            phoneP.innerHTML = `<strong>Телефон:</strong> ${business.phone}`;
            detailsDiv.appendChild(phoneP);
        }
        if (business.roomsAvailable) {
            const roomsP = document.createElement('p');
            roomsP.innerHTML = `<strong>Доступных номеров:</strong> ${business.roomsAvailable}`;
            detailsDiv.appendChild(roomsP);
        }
    } else if (business.type === 'attraction') {
        if (business.attractionType) {
            const typeP = document.createElement('p');
            typeP.innerHTML = `<strong>Тип места:</strong> ${business.attractionType === 'park' ? 'Парк' : business.attractionType === 'museum' ? 'Музей' : 'Достопримечательность'}`;
            detailsDiv.appendChild(typeP);
        }
        if (business.address) {
            const addressP = document.createElement('p');
            addressP.innerHTML = `<strong>Адрес:</strong> ${business.address}`;
            detailsDiv.appendChild(addressP);
        }
        if (business.hours) {
            const hoursP = document.createElement('p');
            hoursP.innerHTML = `<strong>Часы работы:</strong> ${business.hours}`;
            detailsDiv.appendChild(hoursP);
        }
    } else if (business.type === 'service') {
        if (business.serviceType) {
            const typeP = document.createElement('p');
            typeP.innerHTML = `<strong>Тип услуги:</strong> ${business.serviceType === 'cleaning' ? 'Уборка' : business.serviceType === 'repair' ? 'Ремонт' : 'Консультации'}`;
            detailsDiv.appendChild(typeP);
        }
        if (business.address) {
            const addressP = document.createElement('p');
            addressP.innerHTML = `<strong>Адрес:</strong> ${business.address}`;
            detailsDiv.appendChild(addressP);
        }
        if (business.phone) {
            const phoneP = document.createElement('p');
            phoneP.innerHTML = `<strong>Телефон:</strong> ${business.phone}`;
            detailsDiv.appendChild(phoneP);
        }
    } else if (business.type === 'family_time') {
        if (business.activityType) {
            const typeP = document.createElement('p');
            typeP.innerHTML = `<strong>Тип активности:</strong> ${business.activityType === 'playground' ? 'Детская площадка' : business.activityType === 'amusement_park' ? 'Парк аттракционов' : 'Зоопарк'}`;
            detailsDiv.appendChild(typeP);
        }
        if (business.address) {
            const addressP = document.createElement('p');
            addressP.innerHTML = `<strong>Адрес:</strong> ${business.address}`;
            detailsDiv.appendChild(addressP);
        }
        if (business.ageRange) {
            const ageP = document.createElement('p');
            ageP.innerHTML = `<strong>Возрастной диапазон:</strong> ${business.ageRange}`;
            detailsDiv.appendChild(ageP);
        }
    } else if (business.type === 'sport_recreation') {
        if (business.sportType) {
            const typeP = document.createElement('p');
            typeP.innerHTML = `<strong>Тип активности:</strong> ${business.sportType === 'gym' ? 'Спортзал' : business.sportType === 'pool' ? 'Бассейн' : 'Походы'}`;
            detailsDiv.appendChild(typeP);
        }
        if (business.address) {
            const addressP = document.createElement('p');
            addressP.innerHTML = `<strong>Адрес:</strong> ${business.address}`;
            detailsDiv.appendChild(addressP);
        }
        if (business.hours) {
            const hoursP = document.createElement('p');
            hoursP.innerHTML = `<strong>Часы работы:</strong> ${business.hours}`;
            detailsDiv.appendChild(hoursP);
        }
    } else if (business.type === 'historical_site') {
        if (business.historicalType) {
            const typeP = document.createElement('p');
            typeP.innerHTML = `<strong>Тип места:</strong> ${business.historicalType === 'castle' ? 'Замок' : business.historicalType === 'ruins' ? 'Руины' : 'Памятник'}`;
            detailsDiv.appendChild(typeP);
        }
        if (business.address) {
            const addressP = document.createElement('p');
            addressP.innerHTML = `<strong>Адрес:</strong> ${business.address}`;
            detailsDiv.appendChild(addressP);
        }
        if (business.historicalPeriod) {
            const periodP = document.createElement('p');
            periodP.innerHTML = `<strong>Исторический период:</strong> ${business.historicalPeriod}`;
            detailsDiv.appendChild(periodP);
        }
    }

    businessInfoContainer.appendChild(detailsDiv);
    infoPanel.appendChild(businessInfoContainer);
}

// Функция для отображения сцены карты
function showMapScene() {
    const infoPanel = document.getElementById('info-panel');
    const topPanel = document.getElementById('top-panel');

    if (topPanel) {
        topPanel.parentNode.removeChild(topPanel);
    }

    infoPanel.innerHTML = '';

    if (topPanel) {
        infoPanel.appendChild(topPanel);
    }

    updateNavigationBar('Карта бизнесов');

    currentBusiness = null;
    updateScene();
    updateList();
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', () => {
    showMapScene();
});