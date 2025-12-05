
import { PrismaClient, Role, TaskStatus, Priority, TimeType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function getRandomDuration(min: number, max: number, step: number = 0.25): number {
    const range = (max - min) / step;
    const randomStep = Math.floor(Math.random() * (range + 1));
    return min + (randomStep * step);
}

function getRandomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDateToDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

async function main() {
    console.log('Start seeding Russian data v2 (Time & Dates)...');

    const tenantId = 'default-tenant';
    const password = await bcrypt.hash('password123', 10);

    // Date range: 2nd half of 2025 (July 1st) to Now
    const startDate = new Date('2025-07-01T00:00:00.000Z');
    const endDate = new Date(); // now

    // 1. Force Update Main User (Admin)
    const adminUser = await prisma.user.upsert({
        where: { email: 'serhio@example.com' },
        update: {
            role: Role.ADMIN,
            tenantId: tenantId,
        },
        create: {
            email: 'serhio@example.com',
            name: 'Сергей Админ',
            password,
            role: Role.ADMIN,
            tenantId,
        },
    });

    // 2. Cleanup old data
    console.log('Cleaning up old data...');
    await prisma.timeEntry.deleteMany({ where: { task: { tenantId } } });
    await prisma.task.deleteMany({ where: { tenantId } });
    await prisma.client.deleteMany({ where: { tenantId } });
    await prisma.user.deleteMany({
        where: {
            tenantId,
            email: { not: 'serhio@example.com' }
        }
    });

    // 3. Create 15 Clients
    console.log('Creating 15 Clients...');
    const companyNames = [
        'ООО Вектор', 'ЗАО Техно', 'ИП Иванов', 'ОАО ГазМяс', 'ООО СтройМаш',
        'ЗАО Альфа', 'ИП Петров', 'ООО Горизонт', 'ЗАО Прогресс', 'ООО Надежда',
        'ИП Сидоров', 'ООО Север', 'ЗАО Юг-Инвест', 'ООО Мегабайт', 'ЗАО ФинТех'
    ];
    const clients = [];
    for (let i = 0; i < 15; i++) {
        const client = await prisma.client.create({
            data: {
                name: companyNames[i] || `Компания ${i + 1}`,
                tenantId,
                contact: {
                    email: `info${i}@client.ru`,
                    phone: `+799900000${i < 10 ? '0' + i : i}`,
                    address: 'г. Москва, ул. Арбат, д. 10'
                },
                createdAt: getRandomDate(startDate, endDate),
            },
        });
        clients.push(client);
    }

    // 4. Create 10 Employees
    console.log('Creating 10 Employees...');
    const firstNames = ['Алексей', 'Дмитрий', 'Иван', 'Максим', 'Сергей', 'Анна', 'Мария', 'Елена', 'Ольга', 'Наталья'];
    const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Кузнецов', 'Смирнов', 'Попов', 'Соколов', 'Михайлов', 'Новиков', 'Федоров'];

    const employees = [];
    employees.push(adminUser);

    for (let i = 0; i < 10; i++) {
        const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
        const employee = await prisma.user.create({
            data: {
                email: `sotrudnik${i + 1}@company.ru`,
                name: name,
                password,
                role: Role.EXECUTOR,
                tenantId,
                createdAt: getRandomDate(startDate, endDate),
            },
        });
        employees.push(employee);
    }

    // 5. Create 20 Random Tasks with Time Entries
    console.log('Creating 20 Tasks with TimeEntries...');
    const taskTitles = [
        'Исправить ошибку входа', 'Обновить дизайн главной', 'Подготовить отчет за месяц',
        'Созвон с клиентом', 'Резервное копирование БД', 'Написать тесты',
        'Оптимизация API', 'Верстка нового лендинга', 'Настройка CI/CD', 'Код-ревью'
    ];

    for (let i = 1; i <= 20; i++) {
        const randomClient = clients[Math.floor(Math.random() * clients.length)];
        const randomAssignee = employees[Math.floor(Math.random() * employees.length)];
        const title = `${taskTitles[Math.floor(Math.random() * taskTitles.length)]} #${i}`;

        // Task created at random time
        const taskCreatedAt = getRandomDate(startDate, endDate);

        const assignees = [randomAssignee];
        if (Math.random() > 0.8) {
            assignees.push(employees[Math.floor(Math.random() * employees.length)]);
        }

        const statuses = Object.values(TaskStatus);
        const priorities = Object.values(Priority);
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        const task = await prisma.task.create({
            data: {
                title: title,
                description: `Описание задачи "${title}".`,
                tenantId,
                createdById: adminUser.id,
                clientId: randomClient.id,
                status: status,
                priority: priorities[Math.floor(Math.random() * priorities.length)],
                assignees: {
                    connect: assignees.map(u => ({ id: u.id }))
                },
                createdAt: taskCreatedAt,
                updatedAt: getRandomDate(taskCreatedAt, endDate),
                dueDate: getRandomDate(taskCreatedAt, new Date('2025-12-31')),
            },
        });

        // 6. Add Time Entries to this task (1-4 entries per task, minimum 1)
        const entryCount = Math.floor(Math.random() * 4) + 1;

        for (let j = 0; j < entryCount; j++) {
            const duration = getRandomDuration(0.25, 4); // min 0.25, max 4, step 0.25
            const entryDate = getRandomDate(taskCreatedAt, endDate);

            await prisma.timeEntry.create({
                data: {
                    taskId: task.id,
                    userId: randomAssignee.id,
                    date: entryDate,
                    durationHours: duration,
                    type: TimeType.PAID,
                    comment: `Работы по задаче (автогенерация) ${j + 1}`,
                    createdAt: entryDate,
                }
            });
        }

        // Update spentTime on task
        const entries = await prisma.timeEntry.findMany({ where: { taskId: task.id } });
        const totalHours = entries.reduce((acc, curr) => acc + curr.durationHours, 0);

        if (totalHours > 0) {
            await prisma.task.update({
                where: { id: task.id },
                data: { spentTime: totalHours }
            });
        }
    }

    console.log('Seeding v2 finished successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
