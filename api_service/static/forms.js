// Функция для добавления пункта меню
function addMenuItem() {
    const menuItems = document.getElementById('menu-items');
    const newItem = document.createElement('div');
    newItem.innerHTML = '<input type="text" name="menu_items[]" placeholder="Блюдо">';
    menuItems.appendChild(newItem);
}

// Функция для добавления блюда
function addDish() {
    const dishes = document.getElementById('dishes');
    const newDish = document.createElement('div');
    newDish.innerHTML = '<input type="text" name="dishes[]" placeholder="Блюдо">';
    dishes.appendChild(newDish);
}

// Функция для переключения опций изображения
function toggleImageInput() {
    const generateOption = document.querySelector('input[value="generate"]');
    const uploadOption = document.querySelector('input[value="upload"]');
    const generateInput = document.getElementById('generate-image-input');
    const uploadInput = document.getElementById('upload-image-input');
    
    if (generateOption.checked) {
        generateInput.style.display = 'block';
        uploadInput.style.display = 'none';
    } else if (uploadOption.checked) {
        generateInput.style.display = 'none';
        uploadInput.style.display = 'block';
    }
}

// Функция для предпросмотра загруженного изображения
function previewImage(input) {
    const preview = document.getElementById('image-preview');
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

// Функция для генерации изображения с помощью AI
async function generateImage(prompt) {
    const responseDiv = document.getElementById('response');
    try {
        const response = await fetch('/generate-image/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt })
        });
        
        const result = await response.json();
        if (result.image_url) {
            const preview = document.getElementById('image-preview');
            preview.src = result.image_url;
            preview.style.display = 'block';
            return result.image_url;
        } else {
            throw new Error('Не удалось сгенерировать изображение');
        }
    } catch (error) {
        responseDiv.innerHTML = `Ошибка: ${error.message}`;
        responseDiv.className = 'error';
        return null;
    }
}

// Функция для добавления удобств
function addAmenity() {
    const amenities = document.getElementById('amenities');
    const newAmenity = document.createElement('div');
    newAmenity.innerHTML = '<input type="text" name="amenities[]" placeholder="Удобство">';
    amenities.appendChild(newAmenity);
}

// Функция для добавления характеристик
function addFeature() {
    const features = document.getElementById('features');
    const newFeature = document.createElement('div');
    newFeature.innerHTML = '<input type="text" name="features[]" placeholder="Характеристика">';
    features.appendChild(newFeature);
}

// Функция для валидации формы
function validateForm(formData) {
    const errors = [];
    
    // Проверка обязательных полей
    if (!formData.get('name')) {
        errors.push('Название обязательно для заполнения');
    }
    
    // Проверка типа бизнеса
    const type = formData.get('type');
    if (!type) {
        errors.push('Выберите тип бизнеса');
    }
    
    // Дополнительные проверки в зависимости от типа бизнеса
    switch (type) {
        case 'restaurant':
            if (!formData.get('address')) errors.push('Укажите адрес ресторана');
            if (!formData.get('phone')) errors.push('Укажите телефон ресторана');
            break;
        case 'hotel':
        case 'hotels':
            if (!formData.get('rooms')) errors.push('Укажите количество номеров');
            break;
        case 'real_estate':
            if (!formData.get('area')) errors.push('Укажите площадь объекта');
            if (!formData.get('property_type')) errors.push('Выберите тип недвижимости');
            break;
    }
    
    return errors;
}

// Функция для форматирования данных перед отправкой
function formatFormData(formData) {
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        if (key.endsWith('[]')) {
            const baseKey = key.slice(0, -2);
            if (!data[baseKey]) {
                data[baseKey] = [];
            }
            if (value.trim()) {
                data[baseKey].push(value.trim());
            }
        } else {
            data[key] = value.trim();
        }
    }
    
    return data;
} 