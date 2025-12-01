import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('time')
    async getTimeReport(
        @Query('groupBy') groupBy?: 'client' | 'user',
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('clientId') clientId?: string,
        @Query('userId') userId?: string,
        @Query('export') exportFormat?: string,
        @Res() res?: Response,
    ) {
        const filters = {
            groupBy,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
            clientId,
            userId,
        };
        console.log('ReportsController: Generating report with filters:', filters);

        const data = await this.reportsService.generateTimeReport(filters);
        console.log('ReportsController: Data generated, count:', data.length);

        if (exportFormat === 'csv' && res) {
            const csv = this.reportsService.convertToCSV(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=time-report.csv');
            return res.send(csv);
        }

        return data;
    }

    @Get('tasks')
    async getTaskReport(
        @Query('groupBy') groupBy?: 'client' | 'status' | 'assignee',
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('clientId') clientId?: string,
        @Query('status') status?: string,
        @Query('priority') priority?: string,
        @Query('export') exportFormat?: string,
        @Res() res?: Response,
    ) {
        const filters = {
            groupBy,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
            clientId,
            status,
            priority,
        };

        const data = await this.reportsService.generateTaskReport(filters);

        if (exportFormat === 'csv' && res) {
            // Для отчета по задачам нужно немного преобразовать данные перед CSV, 
            // так как там вложенные объекты byStatus и byPriority
            const flattenedData = data.map(item => {
                const flatItem: any = { ...item };
                if (item.byStatus) {
                    Object.keys(item.byStatus).forEach(status => {
                        flatItem[`status_${status}`] = item.byStatus[status];
                    });
                    delete flatItem.byStatus;
                }
                if (item.byPriority) {
                    Object.keys(item.byPriority).forEach(priority => {
                        flatItem[`priority_${priority}`] = item.byPriority[priority];
                    });
                    delete flatItem.byPriority;
                }
                return flatItem;
            });

            const csv = this.reportsService.convertToCSV(flattenedData);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=task-report.csv');
            return res.send(csv);
        }

        return res ? res.json(data) : data;
    }
}
