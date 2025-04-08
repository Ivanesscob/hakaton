// Функция для загрузки информации о компании
function loadCompanyInfo() {
    // Получаем данные компании из localStorage
    const companyData = localStorage.getItem('companyData');
    
    if (!companyData) {
        // Если данных нет, перенаправляем на страницу входа
        window.location.href = '/auth/login';
        return;
    }
    
    try {
        // Парсим JSON данные
        const data = JSON.parse(companyData);
        
        if (data.status === 'success' && data.company) {
            // Обновляем информацию на странице
            document.getElementById('company-name').textContent = data.company.name || 'Название компании';
            document.getElementById('company-email').textContent = `Email: ${data.company.email || 'email@company.com'}`;
            
            // Форматируем дату создания
            let createdDate = 'Не указана';
            if (data.company.created_at) {
                const date = new Date(data.company.created_at);
                createdDate = date.toLocaleDateString('ru-RU');
            }
            document.getElementById('company-created').textContent = `Дата создания: ${createdDate}`;
        } else {
            console.error('Неверный формат данных компании');
            window.location.href = '/auth/login';
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных компании:', error);
        window.location.href = '/auth/login';
    }
}

// Загружаем информацию при загрузке страницы
document.addEventListener('DOMContentLoaded', loadCompanyInfo); 