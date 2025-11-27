import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TimeEntriesService } from './time-entries.service';

@Controller('time-entries')
export class TimeEntriesController {
    constructor(private readonly timeEntriesService: TimeEntriesService) { }

    @Post()
    create(@Body() createTimeEntryDto: any) {
        return this.timeEntriesService.create(createTimeEntryDto);
    }

    @Get()
    findAll() {
        return this.timeEntriesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.timeEntriesService.findOne(id);
    }
}
