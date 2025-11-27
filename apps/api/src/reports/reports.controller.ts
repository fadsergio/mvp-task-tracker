import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
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

        const data = await this.reportsService.generateTimeReport(filters);

        if (exportFormat === 'csv' && res) {
            const csv = this.reportsService.convertToCSV(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=time-report.csv');
            return res.send(csv);
        }

        return data;
    }
}
