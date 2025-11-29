import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const tenantId = 'demo-tenant';
    const password = await bcrypt.hash('password123', 10);

    console.log('Seeding database...');

    // 1. Create Users
    const users = [];
    const userNames = ['Анна Иванова', 'Петр Петров', 'Сергей Сергеев', 'Мария Сидорова', 'Дмитрий Кузнецов'];

    // Main demo user
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            name: 'Демо Пользователь',
            password,
            tenantId,
            role: 'ADMIN',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
        },
    });
    users.push(demoUser);

    for (let i = 0; i < userNames.length; i++) {
        const user = await prisma.user.upsert({
            where: { email: `user${i + 1}@example.com` },
            update: {},
            create: {
                email: `user${i + 1}@example.com`,
                name: userNames[i],
                password,
                tenantId,
                role: 'EXECUTOR',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
            },
        });
        users.push(user);
    }

    // 2. Create Client (Project)
    const client = await prisma.client.create({
        data: {
            name: 'Разработка MVP',
            tenantId,
            contact: { email: 'client@example.com', phone: '+79990000000' },
        },
    });

    // 3. Create Tasks
    const tasksData = [
        { title: 'Дизайн главной страницы', status: 'DONE', priority: 'HIGH', assigneeIndex: 0 },
        { title: 'Настройка базы данных', status: 'DONE', priority: 'HIGH', assigneeIndex: 1 },
        { title: 'API аутентификации', status: 'REVIEW', priority: 'HIGH', assigneeIndex: 2 },
        { title: 'Верстка списка задач', status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeIndex: 3 },
        { title: 'Интеграция с календарем', status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeIndex: 4 },
        { title: 'Тестирование мобильной версии', status: 'NEW', priority: 'MEDIUM', assigneeIndex: 0 },
        { title: 'Написание документации', status: 'NEW', priority: 'LOW', assigneeIndex: 1 },
        { title: 'Оптимизация производительности', status: 'NEW', priority: 'LOW', assigneeIndex: 2 },
    ];

    for (const t of tasksData) {
        await prisma.task.create({
            data: {
                title: t.title,
                status: t.status as any,
                priority: t.priority as any,
                tenantId,
                createdById: demoUser.id,
                clientId: client.id,
                assignees: {
                    connect: [{ id: users[t.assigneeIndex + 1].id }] // +1 because 0 is demoUser
                }
            },
        });
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
