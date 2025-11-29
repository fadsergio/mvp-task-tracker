import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_SERVICE } from '../prisma/prisma.module';
import type { CustomPrismaClient } from '../prisma/prisma.extension';

@Injectable()
export class DashboardService {
    constructor(@Inject(PRISMA_SERVICE) private prisma: CustomPrismaClient) { }

    async getStats() {
        const totalTasks = await this.prisma.task.count();
        const activeTasks = await this.prisma.task.count({
            where: {
                status: {
                    in: ['NEW', 'IN_PROGRESS', 'REVIEW'],
                },
            },
        });
        const completedTasks = await this.prisma.task.count({
            where: {
                status: 'DONE',
            },
        });

        // Calculate total hours spent today from TimeEntries
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const timeEntriesToday = await this.prisma.timeEntry.aggregate({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow
                }
            },
            _sum: {
                durationHours: true,
            },
        });

        const totalHoursToday = timeEntriesToday._sum.durationHours || 0;

        // Also count reports? Or maybe Clients?
        // User asked for "based on projects and tasks". Assuming Client = Project.
        const totalClients = await this.prisma.client.count();

        return {
            totalTasks,
            activeTasks,
            completedTasks,
            totalHoursToday,
            totalClients
        };
    }
}
