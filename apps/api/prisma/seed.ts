import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Генераторы случайных данных
const firstNames = ['Александр', 'Мария', 'Дмитрий', 'Анна', 'Сергей', 'Елена', 'Иван', 'Ольга', 'Андрей', 'Наталья'];
const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Козлов', 'Смирнов', 'Попов', 'Васильев', 'Соколов', 'Михайлов', 'Новиков'];

const companyPrefixes = ['ООО', 'АО', 'ИП', 'ЗАО'];
const companyNames = ['Технологии', 'Инновации', 'Системы', 'Решения', 'Софт', 'Девелопмент', 'Консалтинг', 'Сервис', 'Групп', 'Проект'];
const companySuffixes = ['Плюс', 'Про', 'Эксперт', 'Мастер', 'Центр', 'Лаб', 'Студия', 'Агентство'];

const taskTitles = [
    'Разработка API для мобильного приложения',
    'Оптимизация производительности базы данных',
    'Создание дизайн-системы',
    'Интеграция платежной системы',
    'Настройка CI/CD pipeline',
    'Рефакторинг legacy кода',
    'Написание unit-тестов',
    'Миграция на новую версию фреймворка',
    'Разработка админ-панели',
    'Настройка мониторинга и логирования',
    'Создание документации API',
    'Оптимизация SEO',
    'Разработка системы уведомлений',
    'Интеграция с внешними сервисами',
    'Настройка безопасности приложения',
    'Разработка мобильной версии',
    'Создание отчетов и аналитики',
    'Настройка резервного копирования',
    'Разработка чат-бота',
    'Оптимизация UI/UX'
];

const taskDescriptions = [
    'Необходимо реализовать RESTful API с полной документацией',
    'Провести анализ и оптимизировать медленные запросы',
    'Создать единый стиль для всех компонентов приложения',
    'Интегрировать Stripe/PayPal для приема платежей',
    'Настроить автоматическое тестирование и деплой',
    'Улучшить читаемость и поддерживаемость кода',
    'Покрыть критический функционал тестами',
    'Обновить зависимости и адаптировать код',
    'Разработать интерфейс для управления системой',
    'Настроить Prometheus и Grafana для мониторинга'
];

function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
    const tenantId = 'demo-tenant';
    const password = await bcrypt.hash('password123', 10);

    console.log('🌱 Seeding database...');

    // 1. Создаем 7 сотрудников
    console.log('👥 Creating employees...');
    const employees = [];

    for (let i = 0; i < 7; i++) {
        const firstName = randomElement(firstNames);
        const lastName = randomElement(lastNames);
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@company.com`;

        const employee = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                name: `${firstName} ${lastName}`,
                password,
                tenantId,
                role: i === 0 ? 'ADMIN' : randomElement(['MANAGER', 'EXECUTOR', 'EXECUTOR']),
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            },
        });
        employees.push(employee);
        console.log(`  ✓ ${employee.name} (${employee.email})`);
    }

    // 2. Создаем 15 компаний (клиентов)
    console.log('\n🏢 Creating companies...');
    const companies = [];

    for (let i = 0; i < 15; i++) {
        const companyName = `${randomElement(companyPrefixes)} "${randomElement(companyNames)} ${randomElement(companySuffixes)}"`;
        const phone = `+7${randomInt(900, 999)}${randomInt(1000000, 9999999)}`;
        const email = `info@company${i}.ru`;

        const company = await prisma.client.create({
            data: {
                name: companyName,
                tenantId,
                contact: {
                    email,
                    phone,
                    address: `г. Москва, ул. ${randomElement(['Ленина', 'Пушкина', 'Гагарина', 'Мира'])}, д. ${randomInt(1, 100)}`,
                    website: `https://company${i}.ru`
                },
            },
        });
        companies.push(company);
        console.log(`  ✓ ${company.name}`);
    }

    // 3. Создаем 20 задач
    console.log('\n📋 Creating tasks...');
    const statuses = ['TODO', 'IN_PROGRESS', 'DONE'];
    const priorities = ['LOW', 'MEDIUM', 'HIGH'];

    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 20; i++) {
        const assigneeCount = randomInt(1, 3);
        const selectedEmployees: typeof employees = [];
        for (let j = 0; j < assigneeCount; j++) {
            const emp = randomElement(employees);
            if (!selectedEmployees.find(e => e.id === emp.id)) {
                selectedEmployees.push(emp);
            }
        }

        const task = await prisma.task.create({
            data: {
                title: taskTitles[i],
                description: randomElement(taskDescriptions),
                priority: randomElement(priorities) as any,
                status: randomElement(statuses) as any,
                tenantId,
                createdById: employees[0].id,
                clientId: randomElement(companies).id,
                dueDate: randomDate(now, oneMonthLater),
                spentTime: randomInt(0, 40) * 0.5,
                tags: [
                    randomElement(['frontend', 'backend', 'design', 'testing', 'devops']),
                    randomElement(['urgent', 'important', 'research', 'bug', 'feature'])
                ],
                assignees: {
                    connect: selectedEmployees.map(e => ({ id: e.id }))
                },
                createdAt: randomDate(oneMonthAgo, now),
            },
        });
        console.log(`  ✓ ${task.title} (${task.status})`);
    }

    console.log('\n✅ Seeding finished!');
    console.log('\n📊 Summary:');
    console.log(`  - Employees: 7`);
    console.log(`  - Companies: 15`);
    console.log(`  - Tasks: 20`);
    console.log('\n🔑 Login credentials:');
    console.log(`  Email: ${employees[0].email}`);
    console.log(`  Password: password123`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
