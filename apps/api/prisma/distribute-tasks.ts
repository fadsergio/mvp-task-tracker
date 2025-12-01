import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function distributeTasks() {
    console.log('🔄 Distributing tasks and setting random hours...');

    try {
        // 1. Get all clients
        const clients = await prisma.client.findMany();
        if (clients.length === 0) {
            console.error('❌ No clients found. Please seed clients first.');
            return;
        }

        // 2. Get all tasks
        const tasks = await prisma.task.findMany();
        console.log(`Found ${tasks.length} tasks to update.`);

        for (const task of tasks) {
            // Pick a random client
            const randomClient = clients[Math.floor(Math.random() * clients.length)];

            // Generate random spent time (0.5 to 20 hours)
            const randomHours = Number((Math.random() * 19.5 + 0.5).toFixed(1));

            await prisma.task.update({
                where: { id: task.id },
                data: {
                    clientId: randomClient.id,
                    spentTime: randomHours,
                },
            });
        }

        console.log('✅ All tasks updated successfully!');

    } catch (error) {
        console.error('❌ Error distributing tasks:', error);
    } finally {
        await prisma.$disconnect();
    }
}

distributeTasks();
