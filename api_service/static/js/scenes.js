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