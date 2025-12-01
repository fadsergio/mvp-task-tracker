import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_SERVICE } from '../prisma/prisma.module';
import type { CustomPrismaClient } from '../prisma/prisma.extension';

@Injectable()
export class ReportsService {
    constructor(@Inject(PRISMA_SERVICE) private prisma: CustomPrismaClient) { }

    async generateTimeReport(filters: {
        groupBy?: 'client' | 'user';
        dateFrom?: Date;
        dateTo?: Date;
        clientId?: string;
        userId?: string;
    }): Promise<any[]> {
        const where: any = {};

        if (filters.dateFrom || filters.dateTo) {
            where.date = {};
            if (filters.dateFrom) where.date.gte = filters.dateFrom;
            if (filters.dateTo) where.date.lte = filters.dateTo;
        }

        if (filters.userId) where.userId = filters.userId;
        if (filters.clientId) {
            where.task = {
                clientId: filters.clientId
            };
        }

        console.log('ReportsService: Querying with where:', JSON.stringify(where, null, 2));

        const timeEntries = await this.prisma.timeEntry.findMany({
            where,
            include: {
                user: true,
                task: {
                    include: {
                        client: true,
                    },
                },
            },
        });
        console.log('ReportsService: Found entries:', timeEntries.length);

        if (filters.groupBy === 'client') {
            return this.groupByClient(timeEntries);
        } else if (filters.groupBy === 'user') {
            return this.groupByUser(timeEntries);
        }

        return timeEntries;
    }

    private groupByClient(entries: any[]): any[] {
        const grouped = entries.reduce((acc, entry) => {
            const clientName = entry.task?.client?.name || 'No Client';
            if (!acc[clientName]) {
                acc[clientName] = {
                    client: clientName,
                    totalHours: 0,
                    entries: [],
                };
            }
            acc[clientName].totalHours += entry.durationHours;
            acc[clientName].entries.push(entry);
            return acc;
        }, {});

        return Object.values(grouped);
    }

    private groupByUser(entries: any[]): any[] {
        const grouped = entries.reduce((acc, entry) => {
            const userName = entry.user?.name || entry.user?.email || 'Unknown';
            if (!acc[userName]) {
                acc[userName] = {
                    user: userName,
                    totalHours: 0,
                    entries: [],
                };
            }
            acc[userName].totalHours += entry.durationHours;
            acc[userName].entries.push(entry);
            return acc;
        }, {});

        return Object.values(grouped);
    }

    convertToCSV(data: any[]): string {
        if (!data || data.length === 0) {
            return 'No data';
        }

        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];

        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'object' ? JSON.stringify(value) : value;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }

    async generateTaskReport(filters: {
        groupBy?: 'client' | 'status' | 'assignee';
        dateFrom?: Date;
        dateTo?: Date;
        clientId?: string;
        status?: string;
        priority?: string;
    }): Promise<any[]> {
        const where: any = {};

        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
            if (filters.dateTo) where.createdAt.lte = filters.dateTo;
        }

        if (filters.clientId) where.clientId = filters.clientId;
        if (filters.status) where.status = filters.status;
        if (filters.priority) where.priority = filters.priority;

        const tasks = await this.prisma.task.findMany({
            where,
            include: {
                client: true,
                assignees: true,
            },
        });

        if (filters.groupBy === 'client') {
            return this.groupTasksByClient(tasks);
        } else if (filters.groupBy === 'status') {
            return this.groupTasksByStatus(tasks);
        } else if (filters.groupBy === 'assignee') {
            return this.groupTasksByAssignee(tasks);
        }

        return tasks;
    }

    private groupTasksByClient(tasks: any[]): any[] {
        const grouped = tasks.reduce((acc, task) => {
            const clientName = task.client?.name || 'Без клиента';
            if (!acc[clientName]) {
                acc[clientName] = {
                    group: clientName,
                    totalTasks: 0,
                    totalHours: 0,
                    byStatus: { NEW: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0, PAUSED: 0 },
                    byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0 },
                };
            }
            acc[clientName].totalTasks++;
            acc[clientName].totalHours += task.spentTime || 0;
            acc[clientName].byStatus[task.status]++;
            acc[clientName].byPriority[task.priority]++;
            return acc;
        }, {});

        return Object.values(grouped);
    }

    private groupTasksByStatus(tasks: any[]): any[] {
        const grouped = tasks.reduce((acc, task) => {
            const statusName = task.status;
            if (!acc[statusName]) {
                acc[statusName] = {
                    group: statusName,
                    totalTasks: 0,
                    totalHours: 0,
                    byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0 },
                };
            }
            acc[statusName].totalTasks++;
            acc[statusName].totalHours += task.spentTime || 0;
            acc[statusName].byPriority[task.priority]++;
            return acc;
        }, {});

        return Object.values(grouped);
    }

    private groupTasksByAssignee(tasks: any[]): any[] {
        const grouped: any = {};

        tasks.forEach(task => {
            if (task.assignees && task.assignees.length > 0) {
                task.assignees.forEach((assignee: any) => {
                    const assigneeName = assignee.name || assignee.email;
                    if (!grouped[assigneeName]) {
                        grouped[assigneeName] = {
                            group: assigneeName,
                            totalTasks: 0,
                            totalHours: 0,
                            byStatus: { NEW: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0, PAUSED: 0 },
                            byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0 },
                        };
                    }
                    grouped[assigneeName].totalTasks++;
                    grouped[assigneeName].totalHours += task.spentTime || 0;
                    grouped[assigneeName].byStatus[task.status]++;
                    grouped[assigneeName].byPriority[task.priority]++;
                });
            } else {
                const unassignedKey = 'Не назначено';
                if (!grouped[unassignedKey]) {
                    grouped[unassignedKey] = {
                        group: unassignedKey,
                        totalTasks: 0,
                        totalHours: 0,
                        byStatus: { NEW: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0, PAUSED: 0 },
                        byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0 },
                    };
                }
                grouped[unassignedKey].totalTasks++;
                grouped[unassignedKey].totalHours += task.spentTime || 0;
                grouped[unassignedKey].byStatus[task.status]++;
                grouped[unassignedKey].byPriority[task.priority]++;
            }
        });

        return Object.values(grouped);
    }
}
