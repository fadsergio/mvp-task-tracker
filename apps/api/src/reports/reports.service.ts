import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_SERVICE } from '../prisma/prisma.module';
import type { CustomPrismaClient } from '../prisma/prisma.extension';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import * as path from 'path';
import * as fs from 'fs';

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
            if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom);
            if (filters.dateTo) {
                const dateTo = new Date(filters.dateTo);
                dateTo.setHours(23, 59, 59, 999);
                where.date.lte = dateTo;
            }
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
        groupBy?: 'client' | 'assignee';
        dateFrom?: Date;
        dateTo?: Date;
        clientId?: string;
        priority?: string;
    }): Promise<any[]> {
        const where: any = {};

        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
            if (filters.dateTo) {
                const dateTo = new Date(filters.dateTo);
                dateTo.setHours(23, 59, 59, 999); // Include the entire end date
                where.createdAt.lte = dateTo;
            }
        }

        if (filters.clientId) where.clientId = filters.clientId;
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
                    byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0 },
                };
            }
            acc[clientName].totalTasks++;
            acc[clientName].totalHours += task.spentTime || 0;
            acc[clientName].byPriority[task.priority]++;
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
                            byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0 },
                        };
                    }
                    grouped[assigneeName].totalTasks++;
                    grouped[assigneeName].totalHours += task.spentTime || 0;
                    grouped[assigneeName].byPriority[task.priority]++;
                });
            } else {
                const unassignedKey = 'Не назначено';
                if (!grouped[unassignedKey]) {
                    grouped[unassignedKey] = {
                        group: unassignedKey,
                        totalTasks: 0,
                        totalHours: 0,
                        byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0 },
                    };
                }
                grouped[unassignedKey].totalTasks++;
                grouped[unassignedKey].totalHours += task.spentTime || 0;
                grouped[unassignedKey].byPriority[task.priority]++;
            }
        });

        return Object.values(grouped);
    }

    async getClientDetail(filters: {
        clientId: string;
        dateFrom?: Date;
        dateTo?: Date;
        priority?: string;
    }) {
        const where: any = { clientId: filters.clientId };

        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
            if (filters.dateTo) {
                const dateTo = new Date(filters.dateTo);
                dateTo.setHours(23, 59, 59, 999);
                where.createdAt.lte = dateTo;
            }
        }

        if (filters.priority) {
            where.priority = filters.priority;
        }

        const tasks = await this.prisma.task.findMany({
            where,
            include: {
                assignees: true,
                client: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const stats = {
            total: tasks.length,
            done: tasks.filter((t: any) => t.status === 'DONE' || t.status === 'COMPLETED').length, // Fallback if status still exists in types or logic
            inProgress: tasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
        };

        // Recalculate stats based on priority since status is removed/deprecated? 
        // Actually user removed status. Let's check what stats should be.
        // The original code had stats.done and stats.inProgress. 
        // Since status is removed, these stats might be meaningless or need to be based on something else.
        // But for now, I will just return total and maybe breakdown by priority if needed.
        // However, the frontend expects stats.done and stats.inProgress.
        // If status is completely gone from DB, I cannot calculate these.
        // I should probably remove them or replace them with priority stats.
        // Let's look at the previous code for getClientDetail.

        // Wait, I see I am replacing lines 215-233.
        // The previous code was:
        // const tasks = await this.prisma.task.findMany({ where: { clientId }, ... });
        // const stats = { total: tasks.length };
        // return { stats, tasks };

        // So I should just keep total.

        return {
            stats: {
                total: tasks.length
            },
            tasks,
        };
    }

    async generateExcel(filters: any): Promise<any> {
        try {
            const data = await this.generateTaskReport(filters);
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Отчет');

            worksheet.columns = [
                { header: 'Клиент / Группа', key: 'group', width: 30 },
                { header: 'Всего задач', key: 'totalTasks', width: 15 },
                { header: 'Всего часов', key: 'totalHours', width: 15 },
                { header: 'Высокий приоритет', key: 'high', width: 20 },
                { header: 'Средний приоритет', key: 'medium', width: 20 },
                { header: 'Низкий приоритет', key: 'low', width: 20 },
            ];

            if (Array.isArray(data)) {
                data.forEach((item: any) => {
                    if (item.group) {
                        worksheet.addRow({
                            group: item.group,
                            totalTasks: item.totalTasks,
                            totalHours: item.totalHours,
                            high: item.byPriority?.HIGH || 0,
                            medium: item.byPriority?.MEDIUM || 0,
                            low: item.byPriority?.LOW || 0,
                        });
                    } else {
                        if (worksheet.rowCount === 1) {
                            const columns = [
                                { header: 'Название', key: 'title', width: 30 },
                                { header: 'Клиент', key: 'client', width: 20 },
                                { header: 'Приоритет', key: 'priority', width: 15 },
                                { header: 'Часы', key: 'spentTime', width: 10 },
                            ];
                            if (filters.includeTaskDates) {
                                columns.push({ header: 'Создано', key: 'createdAt', width: 15 });
                            }
                            worksheet.columns = columns;
                        }
                        const row: any = {
                            title: item.title,
                            client: item.client?.name || '-',
                            priority: item.priority,
                            spentTime: item.spentTime || 0,
                        };
                        if (filters.includeTaskDates) {
                            row.createdAt = item.createdAt ? item.createdAt.toISOString().split('T')[0] : '-';
                        }
                        worksheet.addRow(row);
                    }
                });
            }

            return await workbook.xlsx.writeBuffer();
        } catch (error) {
            console.error('Error in generateExcel:', error);
            throw error;
        }
    }

    async generatePDF(filters: any): Promise<Buffer> {
        const logFile = path.join(process.cwd(), 'debug_log.txt');
        const log = (msg: string) => {
            try {
                fs.appendFileSync(logFile, new Date().toISOString() + ': ' + msg + '\n');
            } catch (e) {
                console.error('Failed to write to log file:', e);
            }
        };

        try {
            log('Starting PDF generation...');
            log(`includeTaskDates parameter: ${filters.includeTaskDates}`);
            const data = await this.generateTaskReport(filters);
            log(`Data fetched: ${data.length} items`);

            return new Promise((resolve, reject) => {
                try {
                    const PDFDoc = (PDFDocument as any).default || PDFDocument;
                    log('PDFDocument class loaded');

                    const doc = new PDFDoc({
                        margin: 40,
                        size: 'A4',
                        bufferPages: true
                    });
                    log('PDFDocument instance created');

                    const buffers: Buffer[] = [];

                    doc.on('data', (chunk: any) => buffers.push(chunk));
                    doc.on('end', () => {
                        log('PDF generation finished, resolving buffer');
                        resolve(Buffer.concat(buffers));
                    });
                    doc.on('error', (err: any) => {
                        log(`PDF stream error: ${err.message}`);
                        console.error('PDF stream error:', err);
                        reject(err);
                    });

                    const fontsPath = path.join(process.cwd(), 'dist', 'fonts');
                    log(`Resolved fonts path: ${fontsPath}`);

                    const regularFontPath = path.join(fontsPath, 'Roboto-Regular.ttf');
                    const boldFontPath = path.join(fontsPath, 'Roboto-Bold.ttf');

                    log(`Checking font files existence...`);
                    log(`Regular font exists: ${fs.existsSync(regularFontPath)}`);
                    log(`Bold font exists: ${fs.existsSync(boldFontPath)}`);

                    doc.registerFont('Roboto', regularFontPath);
                    doc.registerFont('Roboto-Bold', boldFontPath);
                    log('Fonts registered successfully');

                    doc.fontSize(20).font('Roboto-Bold').text('Отчет по задачам', { align: 'center' });
                    doc.moveDown(0.5);
                    doc.fontSize(10).font('Roboto').text(`Дата формирования: ${new Date().toLocaleDateString('ru-RU')}`, { align: 'center' });
                    doc.moveDown(1.5);

                    if (data.length > 0 && data[0].group) {
                        this.renderGroupedTable(doc, data, filters.groupBy);
                    } else {
                        log(`Calling renderTaskList with includeDates: ${filters.includeTaskDates}`);
                        this.renderTaskList(doc, data, filters.includeTaskDates);
                    }

                    doc.end();
                    log('PDF generation completed (stream ended)');
                } catch (innerError: any) {
                    log(`Error in PDF generation promise: ${innerError.message}\n${innerError.stack}`);
                    console.error('Error in PDF generation promise:', innerError);
                    reject(innerError);
                }
            });
        } catch (error: any) {
            fs.appendFileSync(path.join(process.cwd(), 'debug_log.txt'), `Error in generatePDF: ${error.message}\n${error.stack}\n`);
            console.error('Error in generatePDF:', error);
            throw error;
        }
    }

    private renderGroupedTable(doc: any, data: any[], groupBy: string) {
        const pageWidth = doc.page.width - 80;
        const startX = 40;
        let currentY = doc.y;

        const columns = [
            { header: groupBy === 'client' ? 'Клиент' : 'Исполнитель', width: pageWidth * 0.35 },
            { header: 'Задач', width: pageWidth * 0.13 },
            { header: 'Часов', width: pageWidth * 0.13 },
            { header: 'Выс.', width: pageWidth * 0.13 },
            { header: 'Сред.', width: pageWidth * 0.13 },
            { header: 'Низ.', width: pageWidth * 0.13 }
        ];

        doc.font('Roboto-Bold').fontSize(10);
        let currentX = startX;

        columns.forEach(col => {
            doc.text(col.header, currentX, currentY, {
                width: col.width,
                align: 'left',
                continued: false
            });
            currentX += col.width;
        });

        currentY += 20;
        doc.moveTo(startX, currentY - 5).lineTo(startX + pageWidth, currentY - 5).stroke();

        doc.font('Roboto').fontSize(9);

        data.forEach((item: any, index: number) => {
            if (currentY > doc.page.height - 100) {
                doc.addPage();
                currentY = 40;

                doc.font('Roboto-Bold').fontSize(10);
                currentX = startX;
                columns.forEach(col => {
                    doc.text(col.header, currentX, currentY, {
                        width: col.width,
                        align: 'left',
                        continued: false
                    });
                    currentX += col.width;
                });
                currentY += 20;
                doc.moveTo(startX, currentY - 5).lineTo(startX + pageWidth, currentY - 5).stroke();
                doc.font('Roboto').fontSize(9);
            }

            currentX = startX;
            const rowHeight = 18;
            const groupName = item.group || 'Неизвестно';

            doc.text(groupName, currentX, currentY, {
                width: columns[0].width - 5,
                align: 'left',
                continued: false,
                ellipsis: true
            });
            currentX += columns[0].width;

            doc.text(item.totalTasks.toString(), currentX, currentY, {
                width: columns[1].width,
                align: 'center',
                continued: false
            });
            currentX += columns[1].width;

            doc.text((item.totalHours || 0).toFixed(1), currentX, currentY, {
                width: columns[2].width,
                align: 'center',
                continued: false
            });
            currentX += columns[2].width;

            doc.text((item.byPriority?.HIGH || 0).toString(), currentX, currentY, {
                width: columns[3].width,
                align: 'center',
                continued: false
            });
            currentX += columns[3].width;

            doc.text((item.byPriority?.MEDIUM || 0).toString(), currentX, currentY, {
                width: columns[4].width,
                align: 'center',
                continued: false
            });
            currentX += columns[4].width;

            doc.text((item.byPriority?.LOW || 0).toString(), currentX, currentY, {
                width: columns[5].width,
                align: 'center',
                continued: false
            });

            currentY += rowHeight;

            if (index < data.length - 1) {
                doc.strokeColor('#CCCCCC')
                    .moveTo(startX, currentY - 2)
                    .lineTo(startX + pageWidth, currentY - 2)
                    .stroke()
                    .strokeColor('#000000');
            }
        });
    }

    private renderTaskList(doc: any, data: any[], includeDates: boolean) {
        const pageWidth = doc.page.width - 80;
        const startX = 40;
        let currentY = doc.y;

        const columns = [
            { header: 'Название', width: pageWidth * (includeDates ? 0.35 : 0.45) },
            { header: 'Клиент', width: pageWidth * (includeDates ? 0.25 : 0.30) },
            { header: 'Приоритет', width: pageWidth * 0.15 },
            { header: 'Часы', width: pageWidth * 0.10 }
        ];

        if (includeDates) {
            columns.push({ header: 'Создано', width: pageWidth * 0.15 });
        }

        doc.font('Roboto-Bold').fontSize(10);
        let currentX = startX;

        columns.forEach(col => {
            doc.text(col.header, currentX, currentY, {
                width: col.width,
                align: 'left',
                continued: false
            });
            currentX += col.width;
        });

        currentY += 20;
        doc.moveTo(startX, currentY - 5).lineTo(startX + pageWidth, currentY - 5).stroke();

        doc.font('Roboto').fontSize(9);

        data.forEach((item: any, index: number) => {
            if (currentY > doc.page.height - 100) {
                doc.addPage();
                currentY = 40;

                doc.font('Roboto-Bold').fontSize(10);
                currentX = startX;
                columns.forEach(col => {
                    doc.text(col.header, currentX, currentY, {
                        width: col.width,
                        align: 'left',
                        continued: false
                    });
                    currentX += col.width;
                });
                currentY += 20;
                doc.moveTo(startX, currentY - 5).lineTo(startX + pageWidth, currentY - 5).stroke();
                doc.font('Roboto').fontSize(9);
            }

            currentX = startX;
            const rowHeight = 18;
            const title = item.title || 'Без названия';
            const client = item.client ? item.client.name : '-';

            doc.text(title, currentX, currentY, {
                width: columns[0].width - 5,
                align: 'left',
                continued: false,
                ellipsis: true
            });
            currentX += columns[0].width;

            doc.text(client, currentX, currentY, {
                width: columns[1].width - 5,
                align: 'left',
                continued: false,
                ellipsis: true
            });
            currentX += columns[1].width;

            doc.text(item.priority || '-', currentX, currentY, {
                width: columns[2].width,
                align: 'center',
                continued: false
            });
            currentX += columns[2].width;

            doc.text((item.spentTime || 0).toString(), currentX, currentY, {
                width: columns[3].width,
                align: 'center',
                continued: false
            });
            currentX += columns[3].width;

            if (includeDates) {
                const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') : '-';
                doc.text(dateStr, currentX, currentY, {
                    width: columns[4].width,
                    align: 'center',
                    continued: false
                });
            }

            currentY += rowHeight;

            if (index < data.length - 1) {
                doc.strokeColor('#CCCCCC')
                    .moveTo(startX, currentY - 2)
                    .lineTo(startX + pageWidth, currentY - 2)
                    .stroke()
                    .strokeColor('#000000');
            }
        });
    }
}
