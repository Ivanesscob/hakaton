// Функция для генерации формы ларька
function generateKioskForm() {
    return `
    <form class="form-block">
        <h2>Данные для ларька</h2>
        <input type="hidden" name="type" value="kiosk">
        <input type="text" name="name" placeholder="Название ларька" required>
        <input type="text" name="hours" placeholder="Часы работы" required>
        <input type="text" name="location" placeholder="Местоположение" required>
        <textarea name="description" placeholder="Описание ларька" rows="4"></textarea>
        
        <div class="image-options">
            <h3>Изображение ларька</h3>
            <div class="image-option-container">
                <label>
                    <input type="radio" name="image_option" value="generate" checked onchange="toggleImageInput()">
                    Сгенерировать с помощью AI
                </label>
                <div id="generate-image-input">
                    <textarea name="image_prompt" placeholder="Опишите, как должен выглядеть ваш ларёк"></textarea>
                    <button type="button" onclick="generateImage(this.previousElementSibling.value)">Сгенерировать</button>
                </div>
            </div>
            <div class="image-option-container">
                <label>
                    <input type="radio" name="image_option" value="upload" onchange="toggleImageInput()">
                    Загрузить своё изображение
                </label>
                <div id="upload-image-input" style="display: none;">
                    <input type="file" name="image" accept="image/*" onchange="previewImage(this)">
                </div>
            </div>
            <img id="image-preview" style="display: none; max-width: 100%; margin-top: 1rem;">
        </div>
    </form>
    `;
}

// Функция для генерации формы ресторана
function generateRestaurantForm() {
    return `
    <form class="container">
        <div class="form-block">
            <h2>Данные для ресторана</h2>
            <input type="hidden" name="type" value="restaurant">
            <input type="text" name="name" placeholder="Название ресторана" required>
            <input type="text" name="address" placeholder="Адрес" required>
            <input type="text" name="hours" placeholder="Часы работы (например, 10:00-22:00)" required>
            <input type="text" name="phone" placeholder="Телефон (например, +79991234567)" required>
            <input type="number" name="seats" placeholder="Количество мест" required min="1">
            <textarea name="description" placeholder="Описание ресторана" rows="4"></textarea>
            
            <h3>Меню</h3>
            <div id="menu-items">
                <div class="menu-item">
                    <input type="text" name="menu_items[]" placeholder="Название блюда">
                    <input type="text" name="menu_prices[]" placeholder="Цена">
                    <textarea name="menu_descriptions[]" placeholder="Описание блюда"></textarea>
                </div>
            </div>
            <button type="button" onclick="addMenuItem()">Добавить блюдо</button>
            
            <div class="image-options">
                <h3>Изображение ресторана</h3>
                <div class="image-option-container">
                    <label>
                        <input type="radio" name="image_option" value="generate" checked onchange="toggleImageInput()">
                        Сгенерировать с помощью AI
                    </label>
                    <div id="generate-image-input">
                        <textarea name="image_prompt" placeholder="Опишите, как должен выглядеть ваш ресторан"></textarea>
                        <button type="button" onclick="generateImage(this.previousElementSibling.value)">Сгенерировать</button>
                    </div>
                </div>
                <div class="image-option-container">
                    <label>
                        <input type="radio" name="image_option" value="upload" onchange="toggleImageInput()">
                        Загрузить своё изображение
                    </label>
                    <div id="upload-image-input" style="display: none;">
                        <input type="file" name="image" accept="image/*" onchange="previewImage(this)">
                    </div>
                </div>
                <img id="image-preview" style="display: none; max-width: 100%; margin-top: 1rem;">
            </div>
        </div>
        
        <div class="side-block">
            <div class="side-block-top">
                <h3>Особенности</h3>
                <div id="features">
                    <input type="text" name="features[]" placeholder="Особенность (например, Живая музыка)">
                </div>
                <button type="button" onclick="addFeature()">Добавить особенность</button>
            </div>
            <div class="side-block-bottom">
                <h3>Дополнительные услуги</h3>
                <div id="services">
                    <label><input type="checkbox" name="services[]" value="delivery"> Доставка</label>
                    <label><input type="checkbox" name="services[]" value="takeaway"> Еда навынос</label>
                    <label><input type="checkbox" name="services[]" value="reservation"> Бронирование столиков</label>
                    <label><input type="checkbox" name="services[]" value="catering"> Кейтеринг</label>
                </div>
            </div>
        </div>
    </form>
    `;
}

// Функция для генерации формы гостиницы
function generateHotelForm() {
    return `
    <form class="container">
        <div class="form-block">
            <h2>Данные для гостиницы</h2>
            <input type="hidden" name="type" value="hotel">
            <input type="text" name="name" placeholder="Название гостиницы" required>
            <input type="text" name="address" placeholder="Адрес" required>
            <input type="text" name="phone" placeholder="Телефон" required>
            <input type="number" name="rooms" placeholder="Количество номеров" required min="1">
            <textarea name="description" placeholder="Описание гостиницы" rows="4"></textarea>
            
            <h3>Типы номеров</h3>
            <div id="room-types">
                <div class="room-type">
                    <input type="text" name="room_types[]" placeholder="Тип номера">
                    <input type="number" name="room_prices[]" placeholder="Цена за ночь">
                    <textarea name="room_descriptions[]" placeholder="Описание номера"></textarea>
                </div>
            </div>
            <button type="button" onclick="addRoomType()">Добавить тип номера</button>
            
            <div class="image-options">
                <h3>Изображение гостиницы</h3>
                <div class="image-option-container">
                    <label>
                        <input type="radio" name="image_option" value="generate" checked onchange="toggleImageInput()">
                        Сгенерировать с помощью AI
                    </label>
                    <div id="generate-image-input">
                        <textarea name="image_prompt" placeholder="Опишите, как должна выглядеть ваша гостиница"></textarea>
                        <button type="button" onclick="generateImage(this.previousElementSibling.value)">Сгенерировать</button>
                    </div>
                </div>
                <div class="image-option-container">
                    <label>
                        <input type="radio" name="image_option" value="upload" onchange="toggleImageInput()">
                        Загрузить своё изображение
                    </label>
                    <div id="upload-image-input" style="display: none;">
                        <input type="file" name="image" accept="image/*" onchange="previewImage(this)">
                    </div>
                </div>
                <img id="image-preview" style="display: none; max-width: 100%; margin-top: 1rem;">
            </div>
        </div>
        
        <div class="side-block">
            <div class="side-block-top">
                <h3>Удобства</h3>
                <div id="amenities">
                    <div class="amenity-group">
                        <h4>Общие удобства</h4>
                        <label><input type="checkbox" name="amenities[]" value="wifi"> Wi-Fi</label>
                        <label><input type="checkbox" name="amenities[]" value="parking"> Парковка</label>
                        <label><input type="checkbox" name="amenities[]" value="restaurant"> Ресторан</label>
                        <label><input type="checkbox" name="amenities[]" value="pool"> Бассейн</label>
                    </div>
                    <div class="amenity-group">
                        <h4>В номерах</h4>
                        <label><input type="checkbox" name="room_amenities[]" value="tv"> Телевизор</label>
                        <label><input type="checkbox" name="room_amenities[]" value="ac"> Кондиционер</label>
                        <label><input type="checkbox" name="room_amenities[]" value="minibar"> Минибар</label>
                        <label><input type="checkbox" name="room_amenities[]" value="safe"> Сейф</label>
                    </div>
                </div>
            </div>
            <div class="side-block-bottom">
                <h3>Дополнительные услуги</h3>
                <div id="services">
                    <label><input type="checkbox" name="services[]" value="airport_transfer"> Трансфер из/в аэропорт</label>
                    <label><input type="checkbox" name="services[]" value="room_service"> Обслуживание номеров</label>
                    <label><input type="checkbox" name="services[]" value="spa"> СПА-услуги</label>
                    <label><input type="checkbox" name="services[]" value="conference"> Конференц-залы</label>
                </div>
            </div>
        </div>
    </form>
    `;
}

// Функция для генерации формы местной кухни
function generateLocalCuisineForm() {
    return `
    <form class="container">
        <div class="form-block">
            <h2>Данные для местной кухни</h2>
            <input type="hidden" name="type" value="local_cuisine">
            <input type="text" name="name" placeholder="Название заведения" required>
            <input type="text" name="region" placeholder="Регион (например, Кавказ)" required>
            <input type="text" name="address" placeholder="Адрес" required>
            <input type="text" name="phone" placeholder="Телефон" required>
            <textarea name="description" placeholder="Описание кухни и традиций" rows="4"></textarea>
            
            <h3>Традиционные блюда</h3>
            <div id="dishes">
                <div class="dish">
                    <input type="text" name="dishes[]" placeholder="Название блюда">
                    <input type="text" name="dish_prices[]" placeholder="Цена">
                    <textarea name="dish_descriptions[]" placeholder="Описание блюда и его истории"></textarea>
                </div>
            </div>
            <button type="button" onclick="addDish()">Добавить блюдо</button>
            
            <div class="image-options">
                <h3>Изображение заведения</h3>
                <div class="image-option-container">
                    <label>
                        <input type="radio" name="image_option" value="generate" checked onchange="toggleImageInput()">
                        Сгенерировать с помощью AI
                    </label>
                    <div id="generate-image-input">
                        <textarea name="image_prompt" placeholder="Опишите, как должно выглядеть ваше заведение"></textarea>
                        <button type="button" onclick="generateImage(this.previousElementSibling.value)">Сгенерировать</button>
                    </div>
                </div>
                <div class="image-option-container">
                    <label>
                        <input type="radio" name="image_option" value="upload" onchange="toggleImageInput()">
                        Загрузить своё изображение
                    </label>
                    <div id="upload-image-input" style="display: none;">
                        <input type="file" name="image" accept="image/*" onchange="previewImage(this)">
                    </div>
                </div>
                <img id="image-preview" style="display: none; max-width: 100%; margin-top: 1rem;">
            </div>
        </div>
        
        <div class="side-block">
            <div class="side-block-top">
                <h3>Особенности кухни</h3>
                <div id="cuisine-features">
                    <label><input type="checkbox" name="features[]" value="vegetarian"> Вегетарианские блюда</label>
                    <label><input type="checkbox" name="features[]" value="halal"> Халяльная еда</label>
                    <label><input type="checkbox" name="features[]" value="spicy"> Острые блюда</label>
                    <label><input type="checkbox" name="features[]" value="seasonal"> Сезонное меню</label>
                </div>
            </div>
            <div class="side-block-bottom">
                <h3>Дополнительные услуги</h3>
                <div id="services">
                    <label><input type="checkbox" name="services[]" value="masterclass"> Кулинарные мастер-классы</label>
                    <label><input type="checkbox" name="services[]" value="catering"> Выездное обслуживание</label>
                    <label><input type="checkbox" name="services[]" value="delivery"> Доставка</label>
                    <label><input type="checkbox" name="services[]" value="takeaway"> Еда навынос</label>
                </div>
            </div>
        </div>
    </form>
    `;
}

// Функция для генерации формы отелей
function generateHotelsForm() {
    return `
    <form class="container">
        <div class="form-block">
            <h2>Данные для отеля</h2>
            <input type="hidden" name="type" value="hotels">
            <input type="text" name="name" placeholder="Название отеля" required>
            <input type="text" name="address" placeholder="Адрес" required>
            <input type="text" name="phone" placeholder="Телефон" required>
            <input type="number" name="rooms" placeholder="Количество номеров" required min="1">
            <input type="number" name="stars" placeholder="Количество звёзд" min="1" max="5">
            <textarea name="description" placeholder="Описание отеля" rows="4"></textarea>
            
            <h3>Типы номеров</h3>
            <div id="room-types">
                <div class="room-type">
                    <input type="text" name="room_types[]" placeholder="Тип номера">
                    <input type="number" name="room_prices[]" placeholder="Цена за ночь">
                    <textarea name="room_descriptions[]" placeholder="Описание номера"></textarea>
                </div>
            </div>
            <button type="button" onclick="addRoomType()">Добавить тип номера</button>
            
            <div class="image-options">
                <h3>Изображение отеля</h3>
                <div class="image-option-container">
                    <label>
                        <input type="radio" name="image_option" value="generate" checked onchange="toggleImageInput()">
                        Сгенерировать с помощью AI
                    </label>
                    <div id="generate-image-input">
                        <textarea name="image_prompt" placeholder="Опишите, как должен выглядеть ваш отель"></textarea>
                        <button type="button" onclick="generateImage(this.previousElementSibling.value)">Сгенерировать</button>
                    </div>
                </div>
                <div class="image-option-container">
                    <label>
                        <input type="radio" name="image_option" value="upload" onchange="toggleImageInput()">
                        Загрузить своё изображение
                    </label>
                    <div id="upload-image-input" style="display: none;">
                        <input type="file" name="image" accept="image/*" onchange="previewImage(this)">
                    </div>
                </div>
                <img id="image-preview" style="display: none; max-width: 100%; margin-top: 1rem;">
            </div>
        </div>
        
        <div class="side-block">
            <div class="side-block-top">
                <h3>Удобства</h3>
                <div id="amenities">
                    <div class="amenity-group">
                        <h4>Общие удобства</h4>
                        <label><input type="checkbox" name="amenities[]" value="wifi"> Wi-Fi</label>
                        <label><input type="checkbox" name="amenities[]" value="parking"> Парковка</label>
                        <label><input type="checkbox" name="amenities[]" value="restaurant"> Ресторан</label>
                        <label><input type="checkbox" name="amenities[]" value="pool"> Бассейн</label>
                        <label><input type="checkbox" name="amenities[]" value="gym"> Фитнес-центр</label>
                        <label><input type="checkbox" name="amenities[]" value="spa"> СПА-центр</label>
                    </div>
                    <div class="amenity-group">
                        <h4>В номерах</h4>
                        <label><input type="checkbox" name="room_amenities[]" value="tv"> Телевизор</label>
                        <label><input type="checkbox" name="room_amenities[]" value="ac"> Кондиционер</label>
                        <label><input type="checkbox" name="room_amenities[]" value="minibar"> Минибар</label>
                        <label><input type="checkbox" name="room_amenities[]" value="safe"> Сейф</label>
                        <label><input type="checkbox" name="room_amenities[]" value="balcony"> Балкон</label>
                    </div>
                </div>
            </div>
            <div class="side-block-bottom">
                <h3>Дополнительные услуги</h3>
                <div id="services">
                    <label><input type="checkbox" name="services[]" value="airport_transfer"> Трансфер из/в аэропорт</label>
                    <label><input type="checkbox" name="services[]" value="room_service"> Обслуживание номеров</label>
                    <label><input type="checkbox" name="services[]" value="conference"> Конференц-залы</label>
                    <label><input type="checkbox" name="services[]" value="wedding"> Свадебные услуги</label>
                    <label><input type="checkbox" name="services[]" value="excursions"> Экскурсии</label>
                </div>
            </div>
        </div>
    </form>
    `;
}

// Функция для генерации формы недвижимости
function generateRealEstateForm() {
    return `
    <form class="container">
        <div class="form-block">
            <h2>Данные для недвижимости</h2>
            <input type="hidden" name="type" value="real_estate">
            <input type="text" name="name" placeholder="Название объекта" required>
            <input type="text" name="address" placeholder="Адрес" required>
            <select name="property_type" required>
                <option value="" disabled selected>Тип недвижимости</option>
                <option value="apartment">Квартира</option>
                <option value="house">Дом</option>
                <option value="commercial">Коммерческая недвижимость</option>
                <option value="land">Земельный участок</option>
            </select>
            <input type="number" name="area" placeholder="Площадь (кв.м)" required min="1">
            <input type="number" name="price" placeholder="Цена" required min="0">
            <textarea name="description" placeholder="Описание объекта" rows="4"></textarea>
            
            <h3>Характеристики</h3>
            <div id="features">
                <div class="feature-group">
                    <h4>Основные характеристики</h4>
                    <input type="number" name="rooms" placeholder="Количество комнат" min="1">
                    <input type="number" name="floor" placeholder="Этаж" min="1">
                    <input type="number" name="total_floors" placeholder="Всего этажей" min="1">
                    <input type="text" name="year_built" placeholder="Год постройки">
                </div>
            </div>
            
            <div class="image-options">
                <h3>Изображение объекта</h3>
                <div class="image-option-container">
                    <label>
                        <input type="radio" name="image_option" value="generate" checked onchange="toggleImageInput()">
                        Сгенерировать с помощью AI
                    </label>
                    <div id="generate-image-input">
                        <textarea name="image_prompt" placeholder="Опишите, как должен выглядеть объект"></textarea>
                        <button type="button" onclick="generateImage(this.previousElementSibling.value)">Сгенерировать</button>
                    </div>
                </div>
                <div class="image-option-container">
                    <label>
                        <input type="radio" name="image_option" value="upload" onchange="toggleImageInput()">
                        Загрузить своё изображение
                    </label>
                    <div id="upload-image-input" style="display: none;">
                        <input type="file" name="image" accept="image/*" onchange="previewImage(this)">
                    </div>
                </div>
                <img id="image-preview" style="display: none; max-width: 100%; margin-top: 1rem;">
            </div>
        </div>
        
        <div class="side-block">
            <div class="side-block-top">
                <h3>Удобства</h3>
                <div id="amenities">
                    <div class="amenity-group">
                        <h4>Общие удобства</h4>
                        <label><input type="checkbox" name="amenities[]" value="parking"> Парковка</label>
                        <label><input type="checkbox" name="amenities[]" value="security"> Охрана</label>
                        <label><input type="checkbox" name="amenities[]" value="playground"> Детская площадка</label>
                        <label><input type="checkbox" name="amenities[]" value="garden"> Сад</label>
                    </div>
                    <div class="amenity-group">
                        <h4>В помещении</h4>
                        <label><input type="checkbox" name="interior_amenities[]" value="furniture"> Мебель</label>
                        <label><input type="checkbox" name="interior_amenities[]" value="appliances"> Бытовая техника</label>
                        <label><input type="checkbox" name="interior_amenities[]" value="internet"> Интернет</label>
                        <label><input type="checkbox" name="interior_amenities[]" value="ac"> Кондиционер</label>
                    </div>
                </div>
            </div>
            <div class="side-block-bottom">
                <h3>Дополнительная информация</h3>
                <div id="additional-info">
                    <label><input type="checkbox" name="features[]" value="new"> Новостройка</label>
                    <label><input type="checkbox" name="features[]" value="repair"> Свежий ремонт</label>
                    <label><input type="checkbox" name="features[]" value="exclusive"> Эксклюзивное предложение</label>
                    <label><input type="checkbox" name="features[]" value="urgent"> Срочная продажа</label>
                </div>
            </div>
        </div>
    </form>
    `;
} 