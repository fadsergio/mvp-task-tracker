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
}
