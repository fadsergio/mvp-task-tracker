import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_SERVICE } from '../prisma/prisma.module';
import type { CustomPrismaClient } from '../prisma/prisma.extension';

@Injectable()
export class DashboardService {
    constructor(@Inject(PRISMA_SERVICE) private prisma: CustomPrismaClient) { }

    async getStats(tenantId: string, userId: string) {
        const totalTasks = await this.prisma.task.count({
            where: { tenantId }
        });

        const activeTasks = await this.prisma.task.count({
            where: {
                tenantId,
                status: {
                    in: ['NEW', 'IN_PROGRESS', 'REVIEW'],
                },
            },
        });

        const completedTasks = await this.prisma.task.count({
            where: {
                tenantId,
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
                // Assuming TimeEntry has tenantId, if not we filter by user or task->tenantId
                // Based on schema, TimeEntry doesn't have tenantId? Let's check schema.
                // Schema says: TimeEntry has user, task. Task has tenantId.
                // Wait, schema view showed TimeEntry DOES NOT have tenantId?
                // Let's re-read schema.
                // Line 78: model TimeEntry { ... }
                // It has taskId, userId.
                // It DOES NOT have tenantId explicitly in the snippet I saw?
                // Let's check schema again.
                // Line 22: timeEntries TimeEntry[]
                // Line 56: timeEntries TimeEntry[]
                // Line 78: model TimeEntry
                // ...
                // It seems TimeEntry might NOT have tenantId directly.
                // I should check schema.prisma again to be sure.
                // If it doesn't, I need to filter by task: { tenantId }
                task: {
                    tenantId
                },
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

        const totalClients = await this.prisma.client.count({
            where: { tenantId }
        });

        return {
            totalTasks,
            activeTasks,
            completedTasks,
            totalHoursToday,
            totalClients
        };
    }
}
