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
        @Query('groupBy') groupBy?: 'client' | 'assignee',
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('clientId') clientId?: string,
        @Query('priority') priority?: string,
        @Query('export') exportFormat?: string,
        @Res() res?: Response,
    ) {
        const filters = {
            groupBy,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
            clientId,
            priority,
        };

        const data = await this.reportsService.generateTaskReport(filters);

        if (exportFormat === 'csv' && res) {
            // Для отчета по задачам нужно немного преобразовать данные перед CSV, 
            // так как там вложенные объекты byPriority
            const flattenedData = data.map(item => {
                const flatItem: any = { ...item };
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

    @Get('client/:clientId/detail')
    async getClientDetail(
        @Query('clientId') clientId: string,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('priority') priority?: string,
    ) {
        const filters = {
            clientId,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
            priority,
        };
        return await this.reportsService.getClientDetail(filters);
    }

    @Get('export/excel')
    async exportExcel(@Query() filters: any, @Res() res: Response) {
        // Convert string 'true'/'false' to boolean if needed
        if (typeof filters.includeTaskDates === 'string') {
            filters.includeTaskDates = filters.includeTaskDates === 'true';
        }
        const buffer = await this.reportsService.generateExcel(filters);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=report.xlsx',
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Get('export/pdf')
    async exportPDF(@Query() filters: any, @Res() res: Response) {
        // Convert string 'true'/'false' to boolean if needed
        if (typeof filters.includeTaskDates === 'string') {
            filters.includeTaskDates = filters.includeTaskDates === 'true';
        }
        const buffer = await this.reportsService.generatePDF(filters);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=report.pdf',
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
}
