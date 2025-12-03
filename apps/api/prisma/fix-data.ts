import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixData() {
    console.log('🔄 Fixing data: setting 2025 dates...');

    try {
        // Set random 2025 dates for ALL tasks
        const allTasks = await prisma.task.findMany();
        console.log(`📅 Updating dates for ${allTasks.length} tasks...`);

        for (const task of allTasks) {
            // Random date in 2025
            const start = new Date(2025, 0, 1);
            const end = new Date(2025, 11, 31);
            const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

            await prisma.task.update({
                where: { id: task.id },
                data: { dueDate: randomDate },
            });
        }

        console.log('✅ All tasks updated with 2025 due dates!');

    } catch (error) {
        console.error('❌ Error fixing data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixData();
