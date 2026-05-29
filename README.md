# Tourism KG — fixed version

## Запуск сервера
```cmd
cd C:\Users\User\Desktop\travel-project-fixed\server
npm install
npm run dev
```

В `server/.env` нужно указать:
```env
MONGO_URI=ваш_mongodb_uri
JWT_SECRET=любой_длинный_секрет
PORT=5000
```

## Запуск фронта
```cmd
cd C:\Users\User\Desktop\travel-project-fixed\frontend\frontend-new
npm install
npm run dev
```

Открыть адрес Vite: обычно `http://localhost:5173`.

## Что добавлено
- Главная страница турагентства с карточками туров и фильтрами.
- Страница отдельного тура.
- Бронирование/заявки с фронта.
- Заявки видны manager/admin/superadmin в панели.
- Статусы заявок: new, in_work, confirmed, cancelled.
- Лайки и комментарии к турам.
- Профиль пользователя.
- Роль manager.
- Super Admin может назначать manager/admin/user и банить менеджеров/админов через интерфейс.
