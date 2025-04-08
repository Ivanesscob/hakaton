// Глобальная переменная для отслеживания текущего бизнеса
let currentBusiness = null;

// Переменная для отслеживания режима отображения (блоки или карта)
let isMapView = false;

// API-ключ Hugging Face (замените на ваш ключ)
const HF_API_KEY = "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"; // Замените на ваш ключ
const HF_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1";

// Функция для генерации изображения по промпту
async function generateImage(prompt) {
    const headers = {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
    };
    const payload = { "inputs": prompt };

    try {
        const response = await fetch(HF_API_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (response.status === 200) {
            const imageBlob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]); // Получаем base64 без префикса
                reader.onerror = reject;
                reader.readAsDataURL(imageBlob);
            });
        } else {
            console.error(`Ошибка генерации изображения: ${response.status}, ${await response.text()}`);
            return null;
        }
    } catch (error) {
        console.error(`Исключение при генерации изображения: ${error}`);
        return null;
    }
}

// Функция для обработки загрузки файла
function handleFileUpload(fileInput) {
    return new Promise((resolve, reject) => {
        const file = fileInput.files[0];
        if (!file) {
            resolve(null);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]); // Получаем base64 без префикса
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

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
        backButton.style.display = 'grid';
    }
}

// Функция для обновления сцены
// Функция для обновления сцены
function updateScene() {
    const sceneContainer = document.getElementById('scene-container');
    sceneContainer.innerHTML = '';

    if (currentBusiness) {
        if (currentBusiness.products && currentBusiness.products.length > 0) {
            currentBusiness.products.forEach(product => {
                const productBox = document.createElement('div');
                productBox.className = 'scene-box';

                if (product.image) {
                    const img = document.createElement('img');
                    img.src = product.image.startsWith('data:') ? product.image : `data:image/png;base64,${product.image}`;
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

        // Создаем контейнер для переключения
        const toggleContainer = document.createElement('div');
        toggleContainer.style.display = 'grid';
        toggleContainer.style.marginBottom = '10px';
        toggleContainer.style.gridTemplateColumns = '3';

        const toggleButton = document.createElement('button');
        toggleButton.className = 'form-submit';
        toggleButton.textContent = isMapView ? 'Показать блоки' : 'Показать карту';
        toggleButton.addEventListener('click', () => {
            isMapView = !isMapView;
            updateScene();
        });
        toggleContainer.appendChild(toggleButton);
        sceneContainer.appendChild(toggleContainer);

        // Контейнер для блоков бизнесов
        const businessesContainer = document.createElement('div');
        businessesContainer.id = 'businesses-container';
        businessesContainer.style.display = isMapView ? 'none' : 'grid';
        businessesContainer.style.gap = '10px';
        businessesContainer.style.gridTemplateColumns = '3';

        // Контейнер для карты
        const mapContainer = document.createElement('div');
        mapContainer.id = 'map';
        mapContainer.style.height = '90%';
        mapContainer.style.width = '300%';
        mapContainer.style.display = isMapView ? 'block' : 'none';

        sceneContainer.appendChild(businessesContainer);
        sceneContainer.appendChild(mapContainer);

        // Заполняем блоки бизнесов
        businesses.forEach((business) => {
            const sceneBox = document.createElement('div');
            sceneBox.className = 'scene-box';
            sceneBox.style.display = 'grid';
            sceneBox.style.alignItems = 'center';
            sceneBox.style.justifyContent = 'center';
            sceneBox.style.padding = '10px';
            sceneBox.style.gridColumn = 'auto';

            if (business.image) {
                const img = document.createElement('img');
                img.src = business.image.startsWith('data:') ? business.image : `data:image/png;base64,${business.image}`;
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
            businessesContainer.appendChild(sceneBox);
        });

        const addBusinessBox = document.createElement('div');
        addBusinessBox.className = 'scene-box add-business';
        addBusinessBox.innerHTML = '<div class="add-icon">+</div><div class="add-text">Добавить бизнес</div>';
        addBusinessBox.addEventListener('click', () => {
            showAddBusinessScene();
        });
        businessesContainer.appendChild(addBusinessBox);

        // Инициализируем карту, если выбран режим карты
        if (isMapView) {
            try {
                // Проверяем, доступен ли Leaflet
                if (typeof L === 'undefined') {
                    console.error('Leaflet.js не подключен. Убедитесь, что вы добавили <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script> в ваш HTML.');
                    return;
                }

                // Инициализируем карту
                const map = L.map('map', {
                    center: [55.7558, 37.6173], // Центр карты (Москва, например)
                    zoom: 10,
                    zoomControl: true
                });

                // Добавляем тайловый слой OpenStreetMap
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19
                }).addTo(map);

                // Добавляем метки для бизнесов
                const validMarkers = [];
                businesses.forEach(business => {
                    if (business.latitude && business.longitude) {
                        const marker = L.marker([business.latitude, business.longitude]).addTo(map);
                        marker.bindPopup(`<b>${business.name}</b>`);
                        marker.on('click', () => {
                            currentBusiness = business;
                            updateScene();
                            updateList();
                            showBusinessProductsScene(business);
                        });
                        validMarkers.push([business.latitude, business.longitude]);
                    }
                });

                // Если есть метки, подстраиваем карту под них
                if (validMarkers.length > 0) {
                    const bounds = L.latLngBounds(validMarkers);
                    map.fitBounds(bounds, { padding: [50, 50] });
                } else {
                    console.warn('Нет бизнесов с координатами для отображения на карте.');
                }

                // Принудительно обновляем карту после инициализации
                setTimeout(() => {
                    map.invalidateSize();
                }, 100);
            } catch (error) {
                console.error('Ошибка при инициализации карты:', error);
            }
        }
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
        listItem.style.display = 'grid';
        listItem.style.alignItems = 'center';
        listItem.style.gap = '10px';
        listItem.style.backgroundColor = currentBusiness && currentBusiness._id === business._id ? '#e0e0e0' : 'transparent';

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
                productItem.style.display = 'grid';
                productItem.style.gridTemplateColumns = '3';
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
                showBusinessProductsScene(business);
                updateScene();
                updateList();
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

    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Тип бизнеса:';
    typeLabel.style.marginTop = '10px';
    typeLabel.style.display = 'block';

    const typeSelect = document.createElement('select');
    typeSelect.className = 'form-input';
    typeSelect.innerHTML = `
        <option value="restaurant">Ресторан</option>
        <option value="real_estate">Недвижимость</option>
        <option value="hotel">Отели</option>
        <option value="attraction">Интересные места</option>
        <option value="service">Услуги</option>
        <option value="family_time">Время с детьми</option>
        <option value="sport_recreation">Спорт и отдых</option>
        <option value="historical_site">Исторические места</option>
    `;

    // Поля для ресторана
    const restaurantFields = document.createElement('div');
    restaurantFields.className = 'restaurant-fields';
    restaurantFields.style.display = 'block';

    const hoursInput = document.createElement('input');
    hoursInput.type = 'text';
    hoursInput.placeholder = 'Часы работы (например, 10:00-22:00)';
    hoursInput.className = 'form-input';

    const restaurantAddressInput = document.createElement('input');
    restaurantAddressInput.type = 'text';
    restaurantAddressInput.placeholder = 'Адрес';
    restaurantAddressInput.className = 'form-input';

    const phoneInput = document.createElement('input');
    phoneInput.type = 'text';
    phoneInput.placeholder = 'Телефон';
    phoneInput.className = 'form-input';

    const seatsInput = document.createElement('input');
    seatsInput.type = 'number';
    seatsInput.placeholder = 'Количество мест';
    seatsInput.className = 'form-input';

    restaurantFields.appendChild(hoursInput);
    restaurantFields.appendChild(restaurantAddressInput);
    restaurantFields.appendChild(phoneInput);
    restaurantFields.appendChild(seatsInput);

    // Поля для недвижимости
    const realEstateFields = document.createElement('div');
    realEstateFields.className = 'real-estate-fields';
    realEstateFields.style.display = 'none';

    const propertyTypeInput = document.createElement('select');
    propertyTypeInput.className = 'form-input';
    propertyTypeInput.innerHTML = `
        <option value="apartment">Квартира</option>
        <option value="house">Дом</option>
        <option value="office">Офис</option>
    `;

    const propertyTypeLabel = document.createElement('label');
    propertyTypeLabel.textContent = 'Тип недвижимости:';
    propertyTypeLabel.style.marginTop = '10px';
    propertyTypeLabel.style.display = 'block';

    const areaInput = document.createElement('input');
    areaInput.type = 'number';
    areaInput.placeholder = 'Площадь (кв.м)';
    areaInput.className = 'form-input';

    const realEstateAddressInput = document.createElement('input');
    realEstateAddressInput.type = 'text';
    realEstateAddressInput.placeholder = 'Адрес';
    realEstateAddressInput.className = 'form-input';

    const roomsInput = document.createElement('input');
    roomsInput.type = 'number';
    roomsInput.placeholder = 'Количество комнат';
    roomsInput.className = 'form-input';

    realEstateFields.appendChild(propertyTypeLabel);
    realEstateFields.appendChild(propertyTypeInput);
    realEstateFields.appendChild(areaInput);
    realEstateFields.appendChild(realEstateAddressInput);
    realEstateFields.appendChild(roomsInput);

    // Поля для отелей
    const hotelFields = document.createElement('div');
    hotelFields.className = 'hotel-fields';
    hotelFields.style.display = 'none';

    const starsInput = document.createElement('input');
    starsInput.type = 'number';
    starsInput.placeholder = 'Количество звезд (1-5)';
    starsInput.className = 'form-input';
    starsInput.min = 1;
    starsInput.max = 5;

    const hotelAddressInput = document.createElement('input');
    hotelAddressInput.type = 'text';
    hotelAddressInput.placeholder = 'Адрес';
    hotelAddressInput.className = 'form-input';

    const hotelPhoneInput = document.createElement('input');
    hotelPhoneInput.type = 'text';
    hotelPhoneInput.placeholder = 'Телефон';
    hotelPhoneInput.className = 'form-input';

    const roomsAvailableInput = document.createElement('input');
    roomsAvailableInput.type = 'number';
    roomsAvailableInput.placeholder = 'Количество доступных номеров';
    roomsAvailableInput.className = 'form-input';

    hotelFields.appendChild(starsInput);
    hotelFields.appendChild(hotelAddressInput);
    hotelFields.appendChild(hotelPhoneInput);
    hotelFields.appendChild(roomsAvailableInput);

    // Поля для интересных мест
    const attractionFields = document.createElement('div');
    attractionFields.className = 'attraction-fields';
    attractionFields.style.display = 'none';

    const attractionTypeInput = document.createElement('select');
    attractionTypeInput.className = 'form-input';
    attractionTypeInput.innerHTML = `
        <option value="park">Парк</option>
        <option value="museum">Музей</option>
        <option value="landmark">Достопримечательность</option>
    `;

    const attractionTypeLabel = document.createElement('label');
    attractionTypeLabel.textContent = 'Тип места:';
    attractionTypeLabel.style.marginTop = '10px';
    attractionTypeLabel.style.display = 'block';

    const attractionAddressInput = document.createElement('input');
    attractionAddressInput.type = 'text';
    attractionAddressInput.placeholder = 'Адрес';
    attractionAddressInput.className = 'form-input';

    const attractionHoursInput = document.createElement('input');
    attractionHoursInput.type = 'text';
    attractionHoursInput.placeholder = 'Часы работы (например, 9:00-18:00)';
    attractionHoursInput.className = 'form-input';

    attractionFields.appendChild(attractionTypeLabel);
    attractionFields.appendChild(attractionTypeInput);
    attractionFields.appendChild(attractionAddressInput);
    attractionFields.appendChild(attractionHoursInput);

    // Поля для услуг
    const serviceFields = document.createElement('div');
    serviceFields.className = 'service-fields';
    serviceFields.style.display = 'none';

    const serviceTypeInput = document.createElement('select');
    serviceTypeInput.className = 'form-input';
    serviceTypeInput.innerHTML = `
        <option value="cleaning">Уборка</option>
        <option value="repair">Ремонт</option>
        <option value="consulting">Консультации</option>
    `;

    const serviceTypeLabel = document.createElement('label');
    serviceTypeLabel.textContent = 'Тип услуги:';
    serviceTypeLabel.style.marginTop = '10px';
    serviceTypeLabel.style.display = 'block';

    const serviceAddressInput = document.createElement('input');
    serviceAddressInput.type = 'text';
    serviceAddressInput.placeholder = 'Адрес';
    serviceAddressInput.className = 'form-input';

    const servicePhoneInput = document.createElement('input');
    servicePhoneInput.type = 'text';
    servicePhoneInput.placeholder = 'Телефон';
    servicePhoneInput.className = 'form-input';

    serviceFields.appendChild(serviceTypeLabel);
    serviceFields.appendChild(serviceTypeInput);
    serviceFields.appendChild(serviceAddressInput);
    serviceFields.appendChild(servicePhoneInput);

    // Поля для "Время с детьми"
    const familyTimeFields = document.createElement('div');
    familyTimeFields.className = 'family-time-fields';
    familyTimeFields.style.display = 'none';

    const familyActivityTypeInput = document.createElement('select');
    familyActivityTypeInput.className = 'form-input';
    familyActivityTypeInput.innerHTML = `
        <option value="playground">Детская площадка</option>
        <option value="amusement_park">Парк аттракционов</option>
        <option value="zoo">Зоопарк</option>
    `;

    const familyActivityTypeLabel = document.createElement('label');
    familyActivityTypeLabel.textContent = 'Тип активности:';
    familyActivityTypeLabel.style.marginTop = '10px';
    familyActivityTypeLabel.style.display = 'block';

    const familyTimeAddressInput = document.createElement('input');
    familyTimeAddressInput.type = 'text';
    familyTimeAddressInput.placeholder = 'Адрес';
    familyTimeAddressInput.className = 'form-input';

    const ageRangeInput = document.createElement('input');
    ageRangeInput.type = 'text';
    ageRangeInput.placeholder = 'Возрастной диапазон (например, 3-12)';
    ageRangeInput.className = 'form-input';

    familyTimeFields.appendChild(familyActivityTypeLabel);
    familyTimeFields.appendChild(familyActivityTypeInput);
    familyTimeFields.appendChild(familyTimeAddressInput);
    familyTimeFields.appendChild(ageRangeInput);

    // Поля для "Спорт и отдых"
    const sportRecreationFields = document.createElement('div');
    sportRecreationFields.className = 'sport-recreation-fields';
    sportRecreationFields.style.display = 'none';

    const sportTypeInput = document.createElement('select');
    sportTypeInput.className = 'form-input';
    sportTypeInput.innerHTML = `
        <option value="gym">Спортзал</option>
        <option value="pool">Бассейн</option>
        <option value="hiking">Походы</option>
    `;

    const sportTypeLabel = document.createElement('label');
    sportTypeLabel.textContent = 'Тип активности:';
    sportTypeLabel.style.marginTop = '10px';
    sportTypeLabel.style.display = 'block';

    const sportAddressInput = document.createElement('input');
    sportAddressInput.type = 'text';
    sportAddressInput.placeholder = 'Адрес';
    sportAddressInput.className = 'form-input';

    const sportHoursInput = document.createElement('input');
    sportHoursInput.type = 'text';
    sportHoursInput.placeholder = 'Часы работы (например, 7:00-22:00)';
    sportHoursInput.className = 'form-input';

    sportRecreationFields.appendChild(sportTypeLabel);
    sportRecreationFields.appendChild(sportTypeInput);
    sportRecreationFields.appendChild(sportAddressInput);
    sportRecreationFields.appendChild(sportHoursInput);

    // Поля для исторических мест
    const historicalSiteFields = document.createElement('div');
    historicalSiteFields.className = 'historical-site-fields';
    historicalSiteFields.style.display = 'none';

    const historicalTypeInput = document.createElement('select');
    historicalTypeInput.className = 'form-input';
    historicalTypeInput.innerHTML = `
        <option value="castle">Замок</option>
        <option value="ruins">Руины</option>
        <option value="monument">Памятник</option>
    `;

    const historicalTypeLabel = document.createElement('label');
    historicalTypeLabel.textContent = 'Тип места:';
    historicalTypeLabel.style.marginTop = '10px';
    historicalTypeLabel.style.display = 'block';

    const historicalAddressInput = document.createElement('input');
    historicalAddressInput.type = 'text';
    historicalAddressInput.placeholder = 'Адрес';
    historicalAddressInput.className = 'form-input';

    const historicalPeriodInput = document.createElement('input');
    historicalPeriodInput.type = 'text';
    historicalPeriodInput.placeholder = 'Исторический период (например, Средневековье)';
    historicalPeriodInput.className = 'form-input';

    historicalSiteFields.appendChild(historicalTypeLabel);
    historicalSiteFields.appendChild(historicalTypeInput);
    historicalSiteFields.appendChild(historicalAddressInput);
    historicalSiteFields.appendChild(historicalPeriodInput);

    typeSelect.addEventListener('change', () => {
        restaurantFields.style.display = typeSelect.value === 'restaurant' ? 'block' : 'none';
        realEstateFields.style.display = typeSelect.value === 'real_estate' ? 'block' : 'none';
        hotelFields.style.display = typeSelect.value === 'hotel' ? 'block' : 'none';
        attractionFields.style.display = typeSelect.value === 'attraction' ? 'block' : 'none';
        serviceFields.style.display = typeSelect.value === 'service' ? 'block' : 'none';
        familyTimeFields.style.display = typeSelect.value === 'family_time' ? 'block' : 'none';
        sportRecreationFields.style.display = typeSelect.value === 'sport_recreation' ? 'block' : 'none';
        historicalSiteFields.style.display = typeSelect.value === 'historical_site' ? 'block' : 'none';
    });

    const imageOptionLabel = document.createElement('label');
    imageOptionLabel.textContent = 'Способ добавления изображения:';
    imageOptionLabel.style.marginTop = '10px';
    imageOptionLabel.style.display = 'block';

    const imageOptionSelect = document.createElement('select');
    imageOptionSelect.className = 'form-input';
    imageOptionSelect.innerHTML = `
        <option value="url">Ввести URL</option>
        <option value="generate">Сгенерировать по промпту</option>
        <option value="upload">Загрузить с устройства</option>
    `;

    const imageUrlInput = document.createElement('input');
    imageUrlInput.type = 'text';
    imageUrlInput.placeholder = 'Введите URL изображения (опционально)';
    imageUrlInput.className = 'form-input';
    imageUrlInput.style.display = 'block';

    const imagePromptInput = document.createElement('input');
    imagePromptInput.type = 'text';
    imagePromptInput.placeholder = 'Введите промпт для генерации (например, "a modern cafe")';
    imagePromptInput.className = 'form-input';
    imagePromptInput.style.display = 'none';

    const imageFileInput = document.createElement('input');
    imageFileInput.type = 'file';
    imageFileInput.accept = 'image/*';
    imageFileInput.className = 'form-input';
    imageFileInput.style.display = 'none';

    imageOptionSelect.addEventListener('change', () => {
        if (imageOptionSelect.value === 'url') {
            imageUrlInput.style.display = 'block';
            imagePromptInput.style.display = 'none';
            imageFileInput.style.display = 'none';
        } else if (imageOptionSelect.value === 'generate') {
            imageUrlInput.style.display = 'none';
            imagePromptInput.style.display = 'block';
            imageFileInput.style.display = 'none';
        } else {
            imageUrlInput.style.display = 'none';
            imagePromptInput.style.display = 'none';
            imageFileInput.style.display = 'block';
        }
    });

    // Поля для координат
    const coordinatesLabel = document.createElement('label');
    coordinatesLabel.textContent = 'Координаты (широта, долгота):';
    coordinatesLabel.style.marginTop = '10px';
    coordinatesLabel.style.display = 'block';

    const latitudeInput = document.createElement('input');
    latitudeInput.type = 'number';
    latitudeInput.step = 'any';
    latitudeInput.placeholder = 'Широта (например, 55.7558)';
    latitudeInput.className = 'form-input';

    const longitudeInput = document.createElement('input');
    longitudeInput.type = 'number';
    longitudeInput.step = 'any';
    longitudeInput.placeholder = 'Долгота (например, 37.6173)';
    longitudeInput.className = 'form-input';

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Добавить';
    submitButton.className = 'form-submit';

    form.appendChild(nameInput);
    form.appendChild(typeLabel);
    form.appendChild(typeSelect);
    form.appendChild(restaurantFields);
    form.appendChild(realEstateFields);
    form.appendChild(hotelFields);
    form.appendChild(attractionFields);
    form.appendChild(serviceFields);
    form.appendChild(familyTimeFields);
    form.appendChild(sportRecreationFields);
    form.appendChild(historicalSiteFields);
    form.appendChild(imageOptionLabel);
    form.appendChild(imageOptionSelect);
    form.appendChild(imageUrlInput);
    form.appendChild(imagePromptInput);
    form.appendChild(imageFileInput);
    form.appendChild(coordinatesLabel);
    form.appendChild(latitudeInput);
    form.appendChild(longitudeInput);
    form.appendChild(submitButton);
    formContainer.appendChild(form);

    sceneContainer.appendChild(formContainer);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const businessName = nameInput.value.trim();
        const businessType = typeSelect.value;
        const imageOption = imageOptionSelect.value;
        let businessImage = null;

        if (imageOption === 'url') {
            businessImage = imageUrlInput.value.trim() || null;
        } else if (imageOption === 'generate' && imagePromptInput.value.trim()) {
            const prompt = imagePromptInput.value.trim();
            submitButton.disabled = true;
            submitButton.textContent = 'Генерируем изображение...';
            businessImage = await generateImage(prompt);
            submitButton.disabled = false;
            submitButton.textContent = 'Добавить';
            if (!businessImage) {
                alert('Не удалось сгенерировать изображение. Попробуйте снова.');
                return;
            }
        } else if (imageOption === 'upload') {
            businessImage = await handleFileUpload(imageFileInput);
        }

        if (businessName) {
            let companyData = JSON.parse(localStorage.getItem('companyData')) || { status: 'success', businesses: [] };

            const newBusiness = {
                _id: Date.now().toString(),
                name: businessName,
                type: businessType,
                image: businessImage,
                products: [],
                latitude: parseFloat(latitudeInput.value) || null,
                longitude: parseFloat(longitudeInput.value) || null
            };

            if (businessType === 'restaurant') {
                newBusiness.hours = hoursInput.value.trim() || null;
                newBusiness.address = restaurantAddressInput.value.trim() || null;
                newBusiness.phone = phoneInput.value.trim() || null;
                newBusiness.seats = parseInt(seatsInput.value) || null;
            } else if (businessType === 'real_estate') {
                newBusiness.propertyType = propertyTypeInput.value;
                newBusiness.area = parseFloat(areaInput.value) || null;
                newBusiness.address = realEstateAddressInput.value.trim() || null;
                newBusiness.rooms = parseInt(roomsInput.value) || null;
            } else if (businessType === 'hotel') {
                newBusiness.stars = parseInt(starsInput.value) || null;
                newBusiness.address = hotelAddressInput.value.trim() || null;
                newBusiness.phone = hotelPhoneInput.value.trim() || null;
                newBusiness.roomsAvailable = parseInt(roomsAvailableInput.value) || null;
            } else if (businessType === 'attraction') {
                newBusiness.attractionType = attractionTypeInput.value;
                newBusiness.address = attractionAddressInput.value.trim() || null;
                newBusiness.hours = attractionHoursInput.value.trim() || null;
            } else if (businessType === 'service') {
                newBusiness.serviceType = serviceTypeInput.value;
                newBusiness.address = serviceAddressInput.value.trim() || null;
                newBusiness.phone = servicePhoneInput.value.trim() || null;
            } else if (businessType === 'family_time') {
                newBusiness.activityType = familyActivityTypeInput.value;
                newBusiness.address = familyTimeAddressInput.value.trim() || null;
                newBusiness.ageRange = ageRangeInput.value.trim() || null;
            } else if (businessType === 'sport_recreation') {
                newBusiness.sportType = sportTypeInput.value;
                newBusiness.address = sportAddressInput.value.trim() || null;
                newBusiness.hours = sportHoursInput.value.trim() || null;
            } else if (businessType === 'historical_site') {
                newBusiness.historicalType = historicalTypeInput.value;
                newBusiness.address = historicalAddressInput.value.trim() || null;
                newBusiness.historicalPeriod = historicalPeriodInput.value.trim() || null;
            }

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

    const businessButtonsContainer = document.createElement('div');
    businessButtonsContainer.style.display = 'grid';
    businessButtonsContainer.style.gridTemplateColumns = '3';
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

        const regenerateImageButton = document.createElement('button');
        regenerateImageButton.textContent = 'Регенерировать изображение';
        regenerateImageButton.className = 'form-submit';
        regenerateImageButton.style.background = 'linear-gradient(90deg, #00cc00 0%, #009900 100%)';
        regenerateImageButton.addEventListener('click', () => {
            showRegenerateImageScene(business, null);
        });
        businessButtonsContainer.appendChild(regenerateImageButton);
    }

    businessInfoContainer.appendChild(businessButtonsContainer);

    const productsContainer = document.createElement('div');
    productsContainer.className = 'products-container';

    const productsList = document.createElement('ul');
    productsList.className = 'products-list';

    if (business.products && business.products.length > 0) {
        business.products.forEach((product, productIndex) => {
            const productItem = document.createElement('li');
            productItem.className = 'product-item';
            productItem.style.display = 'grid';
            productItem.style.gridTemplateColumns = '3';
            productItem.style.gap = '5px';

            if (product.image) {
                const img = document.createElement('img');
                img.src = product.image.startsWith('data:') ? product.image : `data:image/png;base64,${product.image}`;
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
            buttonsContainer.style.display = 'grid';
            buttonsContainer.style.gridTemplateColumns = '3';
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

                const regenerateImageButton = document.createElement('button');
                regenerateImageButton.textContent = 'Регенерировать изображение';
                regenerateImageButton.className = 'form-submit';
                regenerateImageButton.style.background = 'linear-gradient(90deg, #00cc00 0%, #009900 100%)';
                regenerateImageButton.addEventListener('click', () => {
                    showRegenerateImageScene(business, productIndex);
                });
                buttonsContainer.appendChild(regenerateImageButton);
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

    infoPanel.appendChild(businessInfoContainer);
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

    const imageOptionLabel = document.createElement('label');
    imageOptionLabel.textContent = 'Способ добавления изображения:';
    imageOptionLabel.style.marginTop = '10px';
    imageOptionLabel.style.display = 'block';

    const imageOptionSelect = document.createElement('select');
    imageOptionSelect.className = 'form-input';
    imageOptionSelect.innerHTML = `
        <option value="url">Ввести URL</option>
        <option value="generate">Сгенерировать по промпту</option>
        <option value="upload">Загрузить с устройства</option>
    `;

    const imageUrlInput = document.createElement('input');
    imageUrlInput.type = 'text';
    imageUrlInput.placeholder = 'Введите URL изображения (опционально)';
    imageUrlInput.className = 'form-input';
    imageUrlInput.style.display = 'block';

    const imagePromptInput = document.createElement('input');
    imagePromptInput.type = 'text';
    imagePromptInput.placeholder = 'Введите промпт для генерации (например, "a delicious pizza")';
    imagePromptInput.className = 'form-input';
    imagePromptInput.style.display = 'none';

    const imageFileInput = document.createElement('input');
    imageFileInput.type = 'file';
    imageFileInput.accept = 'image/*';
    imageFileInput.className = 'form-input';
    imageFileInput.style.display = 'none';

    imageOptionSelect.addEventListener('change', () => {
        if (imageOptionSelect.value === 'url') {
            imageUrlInput.style.display = 'block';
            imagePromptInput.style.display = 'none';
            imageFileInput.style.display = 'none';
        } else if (imageOptionSelect.value === 'generate') {
            imageUrlInput.style.display = 'none';
            imagePromptInput.style.display = 'block';
            imageFileInput.style.display = 'none';
        } else {
            imageUrlInput.style.display = 'none';
            imagePromptInput.style.display = 'none';
            imageFileInput.style.display = 'block';
        }
    });

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Добавить продукт';
    submitButton.className = 'form-submit';

    form.appendChild(nameInput);
    form.appendChild(priceInput);
    form.appendChild(descriptionInput);
    form.appendChild(imageOptionLabel);
    form.appendChild(imageOptionSelect);
    form.appendChild(imageUrlInput);
    form.appendChild(imagePromptInput);
    form.appendChild(imageFileInput);
    form.appendChild(submitButton);
    formContainer.appendChild(form);

    sceneContainer.appendChild(formContainer);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const productName = nameInput.value.trim();
        const productPrice = parseFloat(priceInput.value);
        const productDescription = descriptionInput.value.trim();
        const imageOption = imageOptionSelect.value;
        let productImage = null;

        if (imageOption === 'url') {
            productImage = imageUrlInput.value.trim() || null;
        } else if (imageOption === 'generate' && imagePromptInput.value.trim()) {
            const prompt = imagePromptInput.value.trim();
            submitButton.disabled = true;
            submitButton.textContent = 'Генерируем изображение...';
            productImage = await generateImage(prompt);
            submitButton.disabled = false;
            submitButton.textContent = 'Добавить продукт';
            if (!productImage) {
                alert('Не удалось сгенерировать изображение. Попробуйте снова.');
                return;
            }
        } else if (imageOption === 'upload') {
            productImage = await handleFileUpload(imageFileInput);
        }

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
                image: productImage
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

    const imageOptionLabel = document.createElement('label');
    imageOptionLabel.textContent = 'Способ добавления изображения:';
    imageOptionLabel.style.marginTop = '10px';
    imageOptionLabel.style.display = 'block';

    const imageOptionSelect = document.createElement('select');
    imageOptionSelect.className = 'form-input';
    imageOptionSelect.innerHTML = `
        <option value="url">Ввести URL</option>
        <option value="generate">Сгенерировать по промпту</option>
        <option value="upload">Загрузить с устройства</option>
    `;

    const imageUrlInput = document.createElement('input');
    imageUrlInput.type = 'text';
    imageUrlInput.placeholder = 'Введите URL изображения (опционально)';
    imageUrlInput.className = 'form-input';
    imageUrlInput.value = product.image || '';
    imageUrlInput.style.display = 'block';

    const imagePromptInput = document.createElement('input');
    imagePromptInput.type = 'text';
    imagePromptInput.placeholder = 'Введите промпт для генерации (например, "a delicious pizza")';
    imagePromptInput.className = 'form-input';
    imagePromptInput.style.display = 'none';

    const imageFileInput = document.createElement('input');
    imageFileInput.type = 'file';
    imageFileInput.accept = 'image/*';
    imageFileInput.className = 'form-input';
    imageFileInput.style.display = 'none';

    imageOptionSelect.addEventListener('change', () => {
        if (imageOptionSelect.value === 'url') {
            imageUrlInput.style.display = 'block';
            imagePromptInput.style.display = 'none';
            imageFileInput.style.display = 'none';
        } else if (imageOptionSelect.value === 'generate') {
            imageUrlInput.style.display = 'none';
            imagePromptInput.style.display = 'block';
            imageFileInput.style.display = 'none';
        } else {
            imageUrlInput.style.display = 'none';
            imagePromptInput.style.display = 'none';
            imageFileInput.style.display = 'block';
        }
    });

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Сохранить изменения';
    submitButton.className = 'form-submit';

    form.appendChild(nameInput);
    form.appendChild(priceInput);
    form.appendChild(descriptionInput);
    form.appendChild(imageOptionLabel);
    form.appendChild(imageOptionSelect);
    form.appendChild(imageUrlInput);
    form.appendChild(imagePromptInput);
    form.appendChild(imageFileInput);
    form.appendChild(submitButton);
    formContainer.appendChild(form);

    sceneContainer.appendChild(formContainer);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const productName = nameInput.value.trim();
        const productPrice = parseFloat(priceInput.value);
        const productDescription = descriptionInput.value.trim();
        const imageOption = imageOptionSelect.value;
        let productImage = product.image;

        if (imageOption === 'url') {
            productImage = imageUrlInput.value.trim() || null;
        } else if (imageOption === 'generate' && imagePromptInput.value.trim()) {
            const prompt = imagePromptInput.value.trim();
            submitButton.disabled = true;
            submitButton.textContent = 'Генерируем изображение...';
            productImage = await generateImage(prompt);
            submitButton.disabled = false;
            submitButton.textContent = 'Сохранить изменения';
            if (!productImage) {
                alert('Не удалось сгенерировать изображение. Попробуйте снова.');
                return;
            }
        } else if (imageOption === 'upload') {
            productImage = await handleFileUpload(imageFileInput);
        }

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
                image: productImage
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

    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Тип бизнеса:';
    typeLabel.style.marginTop = '10px';
    typeLabel.style.display = 'block';

    const typeSelect = document.createElement('select');
    typeSelect.className = 'form-input';
    typeSelect.innerHTML = `
        <option value="restaurant" ${business.type === 'restaurant' ? 'selected' : ''}>Ресторан</option>
        <option value="real_estate" ${business.type === 'real_estate' ? 'selected' : ''}>Недвижимость</option>
        <option value="hotel" ${business.type === 'hotel' ? 'selected' : ''}>Отели</option>
        <option value="attraction" ${business.type === 'attraction' ? 'selected' : ''}>Интересные места</option>
        <option value="service" ${business.type === 'service' ? 'selected' : ''}>Услуги</option>
        <option value="family_time" ${business.type === 'family_time' ? 'selected' : ''}>Время с детьми</option>
        <option value="sport_recreation" ${business.type === 'sport_recreation' ? 'selected' : ''}>Спорт и отдых</option>
        <option value="historical_site" ${business.type === 'historical_site' ? 'selected' : ''}>Исторические места</option>
    `;

    // Поля для ресторана
    const restaurantFields = document.createElement('div');
    restaurantFields.className = 'restaurant-fields';
    restaurantFields.style.display = business.type === 'restaurant' ? 'block' : 'none';

    const hoursInput = document.createElement('input');
    hoursInput.type = 'text';
    hoursInput.placeholder = 'Часы работы (например, 10:00-22:00)';
    hoursInput.className = 'form-input';
    hoursInput.value = business.hours || '';

    const restaurantAddressInput = document.createElement('input');
    restaurantAddressInput.type = 'text';
    restaurantAddressInput.placeholder = 'Адрес';
    restaurantAddressInput.className = 'form-input';
    restaurantAddressInput.value = business.address || '';

    const phoneInput = document.createElement('input');
    phoneInput.type = 'text';
    phoneInput.placeholder = 'Телефон';
    phoneInput.className = 'form-input';
    phoneInput.value = business.phone || '';

    const seatsInput = document.createElement('input');
    seatsInput.type = 'number';
    seatsInput.placeholder = 'Количество мест';
    seatsInput.className = 'form-input';
    seatsInput.value = business.seats || '';

    restaurantFields.appendChild(hoursInput);
    restaurantFields.appendChild(restaurantAddressInput);
    restaurantFields.appendChild(phoneInput);
    restaurantFields.appendChild(seatsInput);

       // Поля для недвижимости
    const realEstateFields = document.createElement('div');
    realEstateFields.className = 'real-estate-fields';
    realEstateFields.style.display = business.type === 'real_estate' ? 'block' : 'none';

    const propertyTypeInput = document.createElement('select');
    propertyTypeInput.className = 'form-input';
    propertyTypeInput.innerHTML = `
        <option value="apartment" ${business.propertyType === 'apartment' ? 'selected' : ''}>Квартира</option>
        <option value="house" ${business.propertyType === 'house' ? 'selected' : ''}>Дом</option>
        <option value="office" ${business.propertyType === 'office' ? 'selected' : ''}>Офис</option>
    `;

    const propertyTypeLabel = document.createElement('label');
    propertyTypeLabel.textContent = 'Тип недвижимости:';
    propertyTypeLabel.style.marginTop = '10px';
    propertyTypeLabel.style.display = 'block';

    const areaInput = document.createElement('input');
    areaInput.type = 'number';
    areaInput.placeholder = 'Площадь (кв.м)';
    areaInput.className = 'form-input';
    areaInput.value = business.area || '';

    const realEstateAddressInput = document.createElement('input');
    realEstateAddressInput.type = 'text';
    realEstateAddressInput.placeholder = 'Адрес';
    realEstateAddressInput.className = 'form-input';
    realEstateAddressInput.value = business.address || '';

    const roomsInput = document.createElement('input');
    roomsInput.type = 'number';
    roomsInput.placeholder = 'Количество комнат';
    roomsInput.className = 'form-input';
    roomsInput.value = business.rooms || '';

    realEstateFields.appendChild(propertyTypeLabel);
    realEstateFields.appendChild(propertyTypeInput);
    realEstateFields.appendChild(areaInput);
    realEstateFields.appendChild(realEstateAddressInput);
    realEstateFields.appendChild(roomsInput);

    // Поля для отелей
    const hotelFields = document.createElement('div');
    hotelFields.className = 'hotel-fields';
    hotelFields.style.display = business.type === 'hotel' ? 'block' : 'none';

    const starsInput = document.createElement('input');
    starsInput.type = 'number';
    starsInput.placeholder = 'Количество звезд (1-5)';
    starsInput.className = 'form-input';
    starsInput.min = 1;
    starsInput.max = 5;
    starsInput.value = business.stars || '';

    const hotelAddressInput = document.createElement('input');
    hotelAddressInput.type = 'text';
    hotelAddressInput.placeholder = 'Адрес';
    hotelAddressInput.className = 'form-input';
    hotelAddressInput.value = business.address || '';

    const hotelPhoneInput = document.createElement('input');
    hotelPhoneInput.type = 'text';
    hotelPhoneInput.placeholder = 'Телефон';
    hotelPhoneInput.className = 'form-input';
    hotelPhoneInput.value = business.phone || '';

    const roomsAvailableInput = document.createElement('input');
    roomsAvailableInput.type = 'number';
    roomsAvailableInput.placeholder = 'Количество доступных номеров';
    roomsAvailableInput.className = 'form-input';
    roomsAvailableInput.value = business.roomsAvailable || '';

    hotelFields.appendChild(starsInput);
    hotelFields.appendChild(hotelAddressInput);
    hotelFields.appendChild(hotelPhoneInput);
    hotelFields.appendChild(roomsAvailableInput);

    // Поля для интересных мест
    const attractionFields = document.createElement('div');
    attractionFields.className = 'attraction-fields';
    attractionFields.style.display = business.type === 'attraction' ? 'block' : 'none';

    const attractionTypeInput = document.createElement('select');
    attractionTypeInput.className = 'form-input';
    attractionTypeInput.innerHTML = `
        <option value="park" ${business.attractionType === 'park' ? 'selected' : ''}>Парк</option>
        <option value="museum" ${business.attractionType === 'museum' ? 'selected' : ''}>Музей</option>
        <option value="landmark" ${business.attractionType === 'landmark' ? 'selected' : ''}>Достопримечательность</option>
    `;

    const attractionTypeLabel = document.createElement('label');
    attractionTypeLabel.textContent = 'Тип места:';
    attractionTypeLabel.style.marginTop = '10px';
    attractionTypeLabel.style.display = 'block';

    const attractionAddressInput = document.createElement('input');
    attractionAddressInput.type = 'text';
    attractionAddressInput.placeholder = 'Адрес';
    attractionAddressInput.className = 'form-input';
    attractionAddressInput.value = business.address || '';

    const attractionHoursInput = document.createElement('input');
    attractionHoursInput.type = 'text';
    attractionHoursInput.placeholder = 'Часы работы (например, 9:00-18:00)';
    attractionHoursInput.className = 'form-input';
    attractionHoursInput.value = business.hours || '';

    attractionFields.appendChild(attractionTypeLabel);
    attractionFields.appendChild(attractionTypeInput);
    attractionFields.appendChild(attractionAddressInput);
    attractionFields.appendChild(attractionHoursInput);

    // Поля для услуг
    const serviceFields = document.createElement('div');
    serviceFields.className = 'service-fields';
    serviceFields.style.display = business.type === 'service' ? 'block' : 'none';

    const serviceTypeInput = document.createElement('select');
    serviceTypeInput.className = 'form-input';
    serviceTypeInput.innerHTML = `
        <option value="cleaning" ${business.serviceType === 'cleaning' ? 'selected' : ''}>Уборка</option>
        <option value="repair" ${business.serviceType === 'repair' ? 'selected' : ''}>Ремонт</option>
        <option value="consulting" ${business.serviceType === 'consulting' ? 'selected' : ''}>Консультации</option>
    `;

    const serviceTypeLabel = document.createElement('label');
    serviceTypeLabel.textContent = 'Тип услуги:';
    serviceTypeLabel.style.marginTop = '10px';
    serviceTypeLabel.style.display = 'block';

    const serviceAddressInput = document.createElement('input');
    serviceAddressInput.type = 'text';
    serviceAddressInput.placeholder = 'Адрес';
    serviceAddressInput.className = 'form-input';
    serviceAddressInput.value = business.address || '';

    const servicePhoneInput = document.createElement('input');
    servicePhoneInput.type = 'text';
    servicePhoneInput.placeholder = 'Телефон';
    servicePhoneInput.className = 'form-input';
    servicePhoneInput.value = business.phone || '';

    serviceFields.appendChild(serviceTypeLabel);
    serviceFields.appendChild(serviceTypeInput);
    serviceFields.appendChild(serviceAddressInput);
    serviceFields.appendChild(servicePhoneInput);

    // Поля для "Время с детьми"
    const familyTimeFields = document.createElement('div');
    familyTimeFields.className = 'family-time-fields';
    familyTimeFields.style.display = business.type === 'family_time' ? 'block' : 'none';

    const familyActivityTypeInput = document.createElement('select');
    familyActivityTypeInput.className = 'form-input';
    familyActivityTypeInput.innerHTML = `
        <option value="playground" ${business.activityType === 'playground' ? 'selected' : ''}>Детская площадка</option>
        <option value="amusement_park" ${business.activityType === 'amusement_park' ? 'selected' : ''}>Парк аттракционов</option>
        <option value="zoo" ${business.activityType === 'zoo' ? 'selected' : ''}>Зоопарк</option>
    `;

    const familyActivityTypeLabel = document.createElement('label');
    familyActivityTypeLabel.textContent = 'Тип активности:';
    familyActivityTypeLabel.style.marginTop = '10px';
    familyActivityTypeLabel.style.display = 'block';

    const familyTimeAddressInput = document.createElement('input');
    familyTimeAddressInput.type = 'text';
    familyTimeAddressInput.placeholder = 'Адрес';
    familyTimeAddressInput.className = 'form-input';
    familyTimeAddressInput.value = business.address || '';

    const ageRangeInput = document.createElement('input');
    ageRangeInput.type = 'text';
    ageRangeInput.placeholder = 'Возрастной диапазон (например, 3-12)';
    ageRangeInput.className = 'form-input';
    ageRangeInput.value = business.ageRange || '';

    familyTimeFields.appendChild(familyActivityTypeLabel);
    familyTimeFields.appendChild(familyActivityTypeInput);
    familyTimeFields.appendChild(familyTimeAddressInput);
    familyTimeFields.appendChild(ageRangeInput);

    // Поля для "Спорт и отдых"
    const sportRecreationFields = document.createElement('div');
    sportRecreationFields.className = 'sport-recreation-fields';
    sportRecreationFields.style.display = business.type === 'sport_recreation' ? 'block' : 'none';

    const sportTypeInput = document.createElement('select');
    sportTypeInput.className = 'form-input';
    sportTypeInput.innerHTML = `
        <option value="gym" ${business.sportType === 'gym' ? 'selected' : ''}>Спортзал</option>
        <option value="pool" ${business.sportType === 'pool' ? 'selected' : ''}>Бассейн</option>
        <option value="hiking" ${business.sportType === 'hiking' ? 'selected' : ''}>Походы</option>
    `;

    const sportTypeLabel = document.createElement('label');
    sportTypeLabel.textContent = 'Тип активности:';
    sportTypeLabel.style.marginTop = '10px';
    sportTypeLabel.style.display = 'block';

    const sportAddressInput = document.createElement('input');
    sportAddressInput.type = 'text';
    sportAddressInput.placeholder = 'Адрес';
    sportAddressInput.className = 'form-input';
    sportAddressInput.value = business.address || '';

    const sportHoursInput = document.createElement('input');
    sportHoursInput.type = 'text';
    sportHoursInput.placeholder = 'Часы работы (например, 7:00-22:00)';
    sportHoursInput.className = 'form-input';
    sportHoursInput.value = business.hours || '';

    sportRecreationFields.appendChild(sportTypeLabel);
    sportRecreationFields.appendChild(sportTypeInput);
    sportRecreationFields.appendChild(sportAddressInput);
    sportRecreationFields.appendChild(sportHoursInput);

    // Поля для исторических мест
    const historicalSiteFields = document.createElement('div');
    historicalSiteFields.className = 'historical-site-fields';
    historicalSiteFields.style.display = business.type === 'historical_site' ? 'block' : 'none';

    const historicalTypeInput = document.createElement('select');
    historicalTypeInput.className = 'form-input';
    historicalTypeInput.innerHTML = `
        <option value="castle" ${business.historicalType === 'castle' ? 'selected' : ''}>Замок</option>
        <option value="ruins" ${business.historicalType === 'ruins' ? 'selected' : ''}>Руины</option>
        <option value="monument" ${business.historicalType === 'monument' ? 'selected' : ''}>Памятник</option>
    `;

    const historicalTypeLabel = document.createElement('label');
    historicalTypeLabel.textContent = 'Тип места:';
    historicalTypeLabel.style.marginTop = '10px';
    historicalTypeLabel.style.display = 'block';

    const historicalAddressInput = document.createElement('input');
    historicalAddressInput.type = 'text';
    historicalAddressInput.placeholder = 'Адрес';
    historicalAddressInput.className = 'form-input';
    historicalAddressInput.value = business.address || '';

    const historicalPeriodInput = document.createElement('input');
    historicalPeriodInput.type = 'text';
    historicalPeriodInput.placeholder = 'Исторический период (например, Средневековье)';
    historicalPeriodInput.className = 'form-input';
    historicalPeriodInput.value = business.historicalPeriod || '';

    historicalSiteFields.appendChild(historicalTypeLabel);
    historicalSiteFields.appendChild(historicalTypeInput);
    historicalSiteFields.appendChild(historicalAddressInput);
    historicalSiteFields.appendChild(historicalPeriodInput);

    typeSelect.addEventListener('change', () => {
        restaurantFields.style.display = typeSelect.value === 'restaurant' ? 'block' : 'none';
        realEstateFields.style.display = typeSelect.value === 'real_estate' ? 'block' : 'none';
        hotelFields.style.display = typeSelect.value === 'hotel' ? 'block' : 'none';
        attractionFields.style.display = typeSelect.value === 'attraction' ? 'block' : 'none';
        serviceFields.style.display = typeSelect.value === 'service' ? 'block' : 'none';
        familyTimeFields.style.display = typeSelect.value === 'family_time' ? 'block' : 'none';
        sportRecreationFields.style.display = typeSelect.value === 'sport_recreation' ? 'block' : 'none';
        historicalSiteFields.style.display = typeSelect.value === 'historical_site' ? 'block' : 'none';
    });

    const imageOptionLabel = document.createElement('label');
    imageOptionLabel.textContent = 'Способ добавления изображения:';
    imageOptionLabel.style.marginTop = '10px';
    imageOptionLabel.style.display = 'block';

    const imageOptionSelect = document.createElement('select');
    imageOptionSelect.className = 'form-input';
    imageOptionSelect.innerHTML = `
        <option value="url">Ввести URL</option>
        <option value="generate">Сгенерировать по промпту</option>
        <option value="upload">Загрузить с устройства</option>
    `;

    const imageUrlInput = document.createElement('input');
    imageUrlInput.type = 'text';
    imageUrlInput.placeholder = 'Введите URL изображения (опционально)';
    imageUrlInput.className = 'form-input';
    imageUrlInput.value = business.image || '';
    imageUrlInput.style.display = 'block';

    const imagePromptInput = document.createElement('input');
    imagePromptInput.type = 'text';
    imagePromptInput.placeholder = 'Введите промпт для генерации (например, "a modern cafe")';
    imagePromptInput.className = 'form-input';
    imagePromptInput.style.display = 'none';

    const imageFileInput = document.createElement('input');
    imageFileInput.type = 'file';
    imageFileInput.accept = 'image/*';
    imageFileInput.className = 'form-input';
    imageFileInput.style.display = 'none';

    imageOptionSelect.addEventListener('change', () => {
        if (imageOptionSelect.value === 'url') {
            imageUrlInput.style.display = 'block';
            imagePromptInput.style.display = 'none';
            imageFileInput.style.display = 'none';
        } else if (imageOptionSelect.value === 'generate') {
            imageUrlInput.style.display = 'none';
            imagePromptInput.style.display = 'block';
            imageFileInput.style.display = 'none';
        } else {
            imageUrlInput.style.display = 'none';
            imagePromptInput.style.display = 'none';
            imageFileInput.style.display = 'block';
        }
    });

    // Поля для координат
    const coordinatesLabel = document.createElement('label');
    coordinatesLabel.textContent = 'Координаты (широта, долгота):';
    coordinatesLabel.style.marginTop = '10px';
    coordinatesLabel.style.display = 'block';

    const latitudeInput = document.createElement('input');
    latitudeInput.type = 'number';
    latitudeInput.step = 'any';
    latitudeInput.placeholder = 'Широта (например, 55.7558)';
    latitudeInput.className = 'form-input';
    latitudeInput.value = business.latitude || '';

    const longitudeInput = document.createElement('input');
    longitudeInput.type = 'number';
    longitudeInput.step = 'any';
    longitudeInput.placeholder = 'Долгота (например, 37.6173)';
    longitudeInput.className = 'form-input';
    longitudeInput.value = business.longitude || '';

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Сохранить изменения';
    submitButton.className = 'form-submit';

    form.appendChild(nameInput);
    form.appendChild(typeLabel);
    form.appendChild(typeSelect);
    form.appendChild(restaurantFields);
    form.appendChild(realEstateFields);
    form.appendChild(hotelFields);
    form.appendChild(attractionFields);
    form.appendChild(serviceFields);
    form.appendChild(familyTimeFields);
    form.appendChild(sportRecreationFields);
    form.appendChild(historicalSiteFields);
    form.appendChild(imageOptionLabel);
    form.appendChild(imageOptionSelect);
    form.appendChild(imageUrlInput);
    form.appendChild(imagePromptInput);
    form.appendChild(imageFileInput);
    form.appendChild(coordinatesLabel);
    form.appendChild(latitudeInput);
    form.appendChild(longitudeInput);
    form.appendChild(submitButton);
    formContainer.appendChild(form);

    sceneContainer.appendChild(formContainer);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const businessName = nameInput.value.trim();
        const businessType = typeSelect.value;
        const imageOption = imageOptionSelect.value;
        let businessImage = business.image;

        if (imageOption === 'url') {
            businessImage = imageUrlInput.value.trim() || null;
        } else if (imageOption === 'generate' && imagePromptInput.value.trim()) {
            const prompt = imagePromptInput.value.trim();
            submitButton.disabled = true;
            submitButton.textContent = 'Генерируем изображение...';
            businessImage = await generateImage(prompt);
            submitButton.disabled = false;
            submitButton.textContent = 'Сохранить изменения';
            if (!businessImage) {
                alert('Не удалось сгенерировать изображение. Попробуйте снова.');
                return;
            }
        } else if (imageOption === 'upload') {
            businessImage = await handleFileUpload(imageFileInput);
        }

        if (businessName) {
            let companyData = JSON.parse(localStorage.getItem('companyData')) || { status: 'success', businesses: [] };

            const businessIndex = companyData.businesses.findIndex(b => b._id === business._id);
            if (businessIndex === -1) {
                console.error('Бизнес не найден');
                return;
            }

            const updatedBusiness = {
                _id: business._id,
                name: businessName,
                type: businessType,
                image: businessImage,
                products: business.products,
                latitude: parseFloat(latitudeInput.value) || null,
                longitude: parseFloat(longitudeInput.value) || null
            };

            if (businessType === 'restaurant') {
                updatedBusiness.hours = hoursInput.value.trim() || null;
                updatedBusiness.address = restaurantAddressInput.value.trim() || null;
                updatedBusiness.phone = phoneInput.value.trim() || null;
                updatedBusiness.seats = parseInt(seatsInput.value) || null;
            } else if (businessType === 'real_estate') {
                updatedBusiness.propertyType = propertyTypeInput.value;
                updatedBusiness.area = parseFloat(areaInput.value) || null;
                updatedBusiness.address = realEstateAddressInput.value.trim() || null;
                updatedBusiness.rooms = parseInt(roomsInput.value) || null;
            } else if (businessType === 'hotel') {
                updatedBusiness.stars = parseInt(starsInput.value) || null;
                updatedBusiness.address = hotelAddressInput.value.trim() || null;
                updatedBusiness.phone = hotelPhoneInput.value.trim() || null;
                updatedBusiness.roomsAvailable = parseInt(roomsAvailableInput.value) || null;
            } else if (businessType === 'attraction') {
                updatedBusiness.attractionType = attractionTypeInput.value;
                updatedBusiness.address = attractionAddressInput.value.trim() || null;
                updatedBusiness.hours = attractionHoursInput.value.trim() || null;
            } else if (businessType === 'service') {
                updatedBusiness.serviceType = serviceTypeInput.value;
                updatedBusiness.address = serviceAddressInput.value.trim() || null;
                updatedBusiness.phone = servicePhoneInput.value.trim() || null;
            } else if (businessType === 'family_time') {
                updatedBusiness.activityType = familyActivityTypeInput.value;
                updatedBusiness.address = familyTimeAddressInput.value.trim() || null;
                updatedBusiness.ageRange = ageRangeInput.value.trim() || null;
            } else if (businessType === 'sport_recreation') {
                updatedBusiness.sportType = sportTypeInput.value;
                updatedBusiness.address = sportAddressInput.value.trim() || null;
                updatedBusiness.hours = sportHoursInput.value.trim() || null;
            } else if (businessType === 'historical_site') {
                updatedBusiness.historicalType = historicalTypeInput.value;
                updatedBusiness.address = historicalAddressInput.value.trim() || null;
                updatedBusiness.historicalPeriod = historicalPeriodInput.value.trim() || null;
            }

            // Удаляем ненужные поля при смене типа бизнеса
            if (businessType !== 'restaurant') {
                delete updatedBusiness.hours;
                delete updatedBusiness.phone;
                delete updatedBusiness.seats;
            }
            if (businessType !== 'real_estate') {
                delete updatedBusiness.propertyType;
                delete updatedBusiness.area;
                delete updatedBusiness.rooms;
            }
            if (businessType !== 'hotel') {
                delete updatedBusiness.stars;
                delete updatedBusiness.roomsAvailable;
            }
            if (businessType !== 'attraction') {
                delete updatedBusiness.attractionType;
            }
            if (businessType !== 'service') {
                delete updatedBusiness.serviceType;
            }
            if (businessType !== 'family_time') {
                delete updatedBusiness.activityType;
                delete updatedBusiness.ageRange;
            }
            if (businessType !== 'sport_recreation') {
                delete updatedBusiness.sportType;
            }
            if (businessType !== 'historical_site') {
                delete updatedBusiness.historicalType;
                delete updatedBusiness.historicalPeriod;
            }

            companyData.businesses[businessIndex] = updatedBusiness;

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

// Функция для показа сцены регенерации изображения
function showRegenerateImageScene(business, productIndex) {
    const infoPanel = document.getElementById('info-panel');
    const topPanel = document.getElementById('top-panel');

    if (topPanel) {
        topPanel.parentNode.removeChild(topPanel);
    }

    infoPanel.innerHTML = '';

    if (topPanel) {
        infoPanel.appendChild(topPanel);
    }

    updateNavigationBar(productIndex !== null ? 'Регенерация изображения продукта' : 'Регенерация изображения бизнеса');

    const sceneContainer = document.getElementById('scene-container');

    sceneContainer.innerHTML = '';

    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';

    const form = document.createElement('form');
    form.className = 'business-form';

    const imageOptionLabel = document.createElement('label');
    imageOptionLabel.textContent = 'Способ добавления изображения:';
    imageOptionLabel.style.marginTop = '10px';
    imageOptionLabel.style.display = 'block';

    const imageOptionSelect = document.createElement('select');
    imageOptionSelect.className = 'form-input';
    imageOptionSelect.innerHTML = `
        <option value="url">Ввести URL</option>
        <option value="generate">Сгенерировать по промпту</option>
        <option value="upload">Загрузить с устройства</option>
    `;

    const imageUrlInput = document.createElement('input');
    imageUrlInput.type = 'text';
    imageUrlInput.placeholder = 'Введите URL изображения (опционально)';
    imageUrlInput.className = 'form-input';
    imageUrlInput.style.display = 'block';

    const imagePromptInput = document.createElement('input');
    imagePromptInput.type = 'text';
    imagePromptInput.placeholder = 'Введите промпт для генерации';
    imagePromptInput.className = 'form-input';
    imagePromptInput.style.display = 'none';

    const imageFileInput = document.createElement('input');
    imageFileInput.type = 'file';
    imageFileInput.accept = 'image/*';
    imageFileInput.className = 'form-input';
    imageFileInput.style.display = 'none';

    imageOptionSelect.addEventListener('change', () => {
        if (imageOptionSelect.value === 'url') {
            imageUrlInput.style.display = 'block';
            imagePromptInput.style.display = 'none';
            imageFileInput.style.display = 'none';
        } else if (imageOptionSelect.value === 'generate') {
            imageUrlInput.style.display = 'none';
            imagePromptInput.style.display = 'block';
            imageFileInput.style.display = 'none';
        } else {
            imageUrlInput.style.display = 'none';
            imagePromptInput.style.display = 'none';
            imageFileInput.style.display = 'block';
        }
    });

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Сгенерировать';
    submitButton.className = 'form-submit';

    form.appendChild(imageOptionLabel);
    form.appendChild(imageOptionSelect);
    form.appendChild(imageUrlInput);
    form.appendChild(imagePromptInput);
    form.appendChild(imageFileInput);
    form.appendChild(submitButton);
    formContainer.appendChild(form);

    sceneContainer.appendChild(formContainer);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const imageOption = imageOptionSelect.value;
        let newImage = null;

        if (imageOption === 'url') {
            newImage = imageUrlInput.value.trim() || null;
        } else if (imageOption === 'generate' && imagePromptInput.value.trim()) {
            const prompt = imagePromptInput.value.trim();
            submitButton.disabled = true;
            submitButton.textContent = 'Генерируем изображение...';
            newImage = await generateImage(prompt);
            submitButton.disabled = false;
            submitButton.textContent = 'Сгенерировать';
            if (!newImage) {
                alert('Не удалось сгенерировать изображение. Попробуйте снова.');
                return;
            }
        } else if (imageOption === 'upload') {
            newImage = await handleFileUpload(imageFileInput);
        }

        let companyData = JSON.parse(localStorage.getItem('companyData')) || { status: 'success', businesses: [] };
        const businessIndex = companyData.businesses.findIndex(b => b._id === business._id);
        if (businessIndex === -1) {
            console.error('Бизнес не найден');
            return;
        }

        if (productIndex !== null) {
            companyData.businesses[businessIndex].products[productIndex].image = newImage;
        } else {
            companyData.businesses[businessIndex].image = newImage;
        }

        localStorage.setItem('companyData', JSON.stringify(companyData));
        currentBusiness = companyData.businesses[businessIndex];
        showBusinessProductsScene(currentBusiness);
        updateScene();
        updateList();
    });
}