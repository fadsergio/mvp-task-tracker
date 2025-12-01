import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTaskDates() {
    console.log('🌱 Seeding task dates and hours...');

    const tasks = await prisma.task.findMany();

    for (const task of tasks) {
        // Random due date within next 30 days
        const daysAhead = Math.floor(Math.random() * 30) + 1;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + daysAhead);

        // Random spent time between 0-40 hours
        const spentTime = Math.floor(Math.random() * 41);

        // Random created date within last 60 days
        const daysAgo = Math.floor(Math.random() * 60);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        await prisma.task.update({
            where: { id: task.id },
            data: {
                dueDate,
                spentTime,
                createdAt,
                updatedAt: new Date(),
            },
        });

        console.log(`✅ Updated task: ${task.title}`);
    }

    console.log('✨ Task dates and hours seeded successfully!');
}

seedTaskDates()
    .catch((e) => {
        console.error('❌ Error seeding task dates:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
