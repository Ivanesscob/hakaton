// Функция для переключения боковой панели
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    
    sidebar.classList.toggle('open');
    sidebarToggle.classList.toggle('open');
    
    // Изменяем направление стрелки
    const svg = sidebarToggle.querySelector('svg');
    if (sidebar.classList.contains('open')) {
        svg.innerHTML = '<polyline points="15 18 9 12 15 6"></polyline>';
    } else {
        svg.innerHTML = '<polyline points="9 18 15 12 9 6"></polyline>';
    }
}

// Инициализация пользовательского интерфейса
function initUI() {
    // Добавляем обработчики событий для боковой панели
    document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
    document.getElementById('logout-btn').addEventListener('click', logout);
} 