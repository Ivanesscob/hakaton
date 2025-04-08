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