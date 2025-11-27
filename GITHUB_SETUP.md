# Инструкция по загрузке проекта на GitHub

## Шаг 1: Создайте новый репозиторий на GitHub

1. Перейдите на <https://github.com/new>
2. Заполните данные:
   - **Repository name**: `mvp-task-tracker` (или любое другое название)
   - **Description**: "MVP Task Tracker - SaaS приложение для управления задачами с учетом времени"
   - **Visibility**: Private или Public (на ваш выбор)
   - **НЕ** инициализируйте репозиторий с README, .gitignore или лицензией
3. Нажмите "Create repository"

## Шаг 2: Подключите локальный репозиторий к GitHub

После создания репозитория GitHub покажет инструкции. Используйте следующие команды:

```bash
# Перейдите в директорию проекта
cd C:\Users\user\.gemini\antigravity\scratch\mvp-task-tracker

# Добавьте удаленный репозиторий (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/mvp-task-tracker.git

# Переименуйте ветку в main (если нужно)
git branch -M main

# Отправьте код на GitHub
git push -u origin main
```

## Шаг 3: Проверьте загрузку

Обновите страницу репозитория на GitHub - вы должны увидеть все файлы проекта.

## Важно: Переменные окружения

⚠️ **НЕ** загружайте файл `.env` на GitHub! Он уже добавлен в `.gitignore`.

Для деплоя создайте `.env` файл на сервере со следующими переменными:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here

# S3 Storage (Yandex Object Storage)
S3_ENDPOINT=https://storage.yandexcloud.net
S3_REGION=ru-central1
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key

# Application
PORT=3000
NODE_ENV=production
```

## Дополнительно: GitHub Actions

После загрузки кода вы можете настроить CI/CD через GitHub Actions (это будет в Фазе 3).

## Альтернатива: SSH ключ

Если у вас настроен SSH ключ для GitHub, используйте SSH URL:

```bash
git remote add origin https://github.com/fadsergio/mvp-task-tracker.git
git push -u origin main
```
