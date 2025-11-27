# MVP Task Tracker

Минималистичный SaaS таск-трекер для среднего бизнеса с ручным вводом времени, канбаном и календарем.

[![CI](https://github.com/fadsergio/mvp-task-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/fadsergio/mvp-task-tracker/actions/workflows/ci.yml)

## 🚀 Особенности

### Backend (NestJS + Prisma + PostgreSQL)

- ✅ **Аутентификация**: JWT + Refresh Tokens с bcrypt
- ✅ **RBAC**: Role-Based Access Control (Admin, Manager, Executor, Client)
- ✅ **Multitenancy**: Row-level изоляция данных через Prisma Extension
- ✅ **S3 File Storage**: Загрузка файлов в Yandex Object Storage
- ✅ **Billing**: Абстракция для CloudPayments и YooKassa
- ✅ **Reports**: Экспорт отчетов по времени в CSV

### Frontend (Next.js + TailwindCSS)

- 🎨 Современный UI с темной/светлой темой
- 📊 Три режима просмотра задач: таблица, канбан, календарь
- 🔍 Фильтры и поиск
- 📱 Адаптивный дизайн

## 📁 Структура проекта

```
mvp-task-tracker/
├── apps/
│   ├── web/          # Next.js Frontend
│   └── api/          # NestJS Backend
├── infra/            # Docker конфигурация
├── scripts/          # Утилиты (seed, migrate)
└── .github/          # CI/CD workflows
```

## 🛠 Требования

- **Node.js** 20+
- **pnpm** 10+
- **Docker** & Docker Compose
- **PostgreSQL** 15+ (для продакшена)

## 🚀 Быстрый старт (Локальная разработка)

### 1. Клонируйте репозиторий

```bash
git clone https://github.com/fadsergio/mvp-task-tracker.git
cd mvp-task-tracker
```

### 2. Запустите через Docker

```bash
cd infra
docker-compose up --build
```

Приложение будет доступно:

- **Frontend**: <http://localhost:3001>
- **Backend API**: <http://localhost:3000>
- **Adminer** (DB UI): <http://localhost:8080>

### 3. Примените миграции и seed данные

```bash
cd apps/api
pnpm install
npx prisma migrate dev
npx prisma db seed
```

## ⚙️ Конфигурация

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/appdb

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_key_change_in_production

# Application
PORT=3000
NODE_ENV=development

# S3 Storage (Yandex Object Storage)
S3_ENDPOINT=https://storage.yandexcloud.net
S3_REGION=ru-central1
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY=your_yandex_access_key
S3_SECRET_KEY=your_yandex_secret_key
```

### Подключение к Yandex Object Storage

1. Создайте бакет в [Yandex Cloud Console](https://console.cloud.yandex.ru/folders)
2. Создайте сервисный аккаунт с ролью `storage.editor`
3. Создайте статический ключ доступа
4. Добавьте ключи в `.env`

## 🌍 Деплой в РФ

### Рекомендуемый стек для РФ

- **Database**: Yandex Managed PostgreSQL / Selectel PostgreSQL
- **Storage**: Yandex Object Storage / Selectel Spaces
- **Hosting**: VPS с Docker / Managed Kubernetes

### Пример деплоя на VPS

```bash
# 1. Установите Docker на сервере
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Клонируйте репозиторий
git clone https://github.com/fadsergio/mvp-task-tracker.git
cd mvp-task-tracker

# 3. Создайте .env с продакшен настройками
nano .env

# 4. Запустите через Docker Compose
cd infra
docker-compose -f docker-compose.yml up -d --build

# 5. Примените миграции
docker exec task_tracker_api npx prisma migrate deploy
```

### Подключение к внешней PostgreSQL

Замените `DATABASE_URL` в `.env`:

```env
# Yandex Managed PostgreSQL
DATABASE_URL=postgresql://user:password@c-xxxxx.rw.mdb.yandexcloud.net:6432/dbname?sslmode=require

# Selectel PostgreSQL
DATABASE_URL=postgresql://user:password@xxx.selvpc.ru:5432/dbname?sslmode=require
```

## 🧪 Тестирование

```bash
# Unit тесты
cd apps/api
pnpm test

# E2E тесты (будут добавлены)
pnpm test:e2e

# Линтинг
pnpm lint
```

## 📦 Миграции и Seed

```bash
# Создать новую миграцию
cd apps/api
npx prisma migrate dev --name your_migration_name

# Применить миграции в продакшене
npx prisma migrate deploy

# Заполнить БД тестовыми данными
npx prisma db seed
```

## 🔐 Безопасность

- ✅ Пароли хешируются с помощью bcrypt (10 раундов)
- ✅ JWT токены с коротким временем жизни (15 минут)
- ✅ Refresh токены хешируются перед сохранением в БД
- ✅ Row-level multitenancy через Prisma Extension
- ✅ RBAC на уровне API (Guards)
- ⚠️ **Важно**: Измените `JWT_SECRET` и `JWT_REFRESH_SECRET` в продакшене!

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/refresh` - Обновление токена
- `POST /api/auth/logout` - Выход

### Files

- `POST /api/files/upload` - Загрузка файла
- `GET /api/files` - Список файлов
- `DELETE /api/files/:id` - Удаление файла

### Reports

- `GET /api/reports/time?groupBy=client&export=csv` - Экспорт отчета

## 🔄 Биллинг

Проект включает абстракцию для платежных провайдеров:

- `CloudPaymentsAdapter` - готов к интеграции
- `YooKassaAdapter` - готов к интеграции

Для активации реальных платежей см. документацию в `apps/api/src/billing/`

## 📝 Лицензия

MIT

## 👥 Контакты

- GitHub: [@fadsergio](https://github.com/fadsergio)
- Repository: [mvp-task-tracker](https://github.com/fadsergio/mvp-task-tracker)

- **Auth**: JWT-based authentication (Login/Register).
- **Tasks**: Table and Kanban views.
- **Clients**: Client management.
- **Multi-tenancy**: Row-level security (prepared in schema).

## Deployment (Russia / Yandex Cloud)

1. **Database**: Use Yandex Managed Service for PostgreSQL.
2. **Storage**: Use Yandex Object Storage (S3 compatible).
3. **Compute**: Deploy Docker containers to Yandex Compute Cloud or Serverless Containers.

Set the following ENV variables in production:

```env
DATABASE_URL=postgres://user:pass@host:6432/db?sslmode=verify-full
S3_ENDPOINT=https://storage.yandexcloud.net
```

## Billing

Billing is abstracted via `BillingProvider`.

- `CloudPayments` adapter (mock)
- `YooKassa` adapter (mock)

## License

Private.
