// Функция для проверки авторизации
function checkAuth() {
    const companyData = localStorage.getItem('companyData');
    return companyData !== null;
}

// Функция для выхода из системы
function logout() {
    localStorage.removeItem('companyData');
    window.location.href = '/auth/login';
} 