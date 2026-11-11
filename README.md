# Sakartvelo - Georgian Restaurant Website

## Структура проекта

```
sakartvelo/
├── index.html          # Главный файл
├── css/
│   └── style.css           # Все стили
└── js/
    ├── config.js           # Конфиг: ключи EmailJS
    ├── cart.js             # Логика корзины
    ├── booking.js          # Логика бронирования + Email
    └── app.js              # Навигация, анимации
```

## Что работает

- 4 страницы: Главная, Меню, Вина, Бронирование
- Корзина предзаказа (напрямую в бронь стола)
- Email-уведомление гостю через EmailJS
- Интерактивная карта столиков
- Фильтры меню/вина

## Настройка Email (EmailJS)

### 1. Регистрация
Перейдите на https://www.emailjs.com
(бесплатно, до 200 писем/мес бесплатно)

### 2. Подключите Gmail
В панели: Email Services > Add New Service > Gmail
Скопируйте SERVICE_ID

### 3. Создайте шаблон письма
В панели: Email Templates > Create New Template

В поле "To email" укажите: {{to_email}}
В поле "Subject" напишите:
  Sakartvelo - Бронь стола подтверждена! {{booking_id}}

Тело письма (HTML оформление):

---
Уважаемый {{guest_name}},

Ваша бронь в ресторане Sakartvelo подтверждена!

• Номер брони:    {{booking_id}}
• Дата:           {{date}}
• Время:          {{time}}
• Стол №:         {{table}}
• Кол-во гостей: {{guests}}
• Телефон:        {{guest_phone}}

Ваш предзаказ:
{{preorder}}

Пожелания: {{wishes}}

Мы будем рады вас видеть!
Ресторан Sakartvelo
{{rest_addr}}
{{rest_phone}}
---

Скопируйте TEMPLATE_ID

### 4. Получите Public Key
В панели: Account > API Keys > Public Key

### 5. Вставьте ключи в config.js

```js
const CONFIG = {
  EMAILJS_SERVICE_ID:  'service_XXXXXXXX',
  EMAILJS_TEMPLATE_ID: 'template_XXXXXXXX',
  EMAILJS_PUBLIC_KEY:  'XXXXXXXXXXXXXXXX',
  ...
};
```

## Логика корзины

1. Гость добавляет блюда в корзину (кнопка «+ В корзину»)
2. Корзина хранится в localStorage браузера
3. Гость нажимает «Забронировать стол →» — переход на страницу брони
4. На странице брони показывается список блюд из корзины
5. После бронирования гость получает email с предзаказом
6. Повар будет готов к приходу гостя!

## Открытие сайта

Просто откройте index.html в браузере. Сервер не нужен.
