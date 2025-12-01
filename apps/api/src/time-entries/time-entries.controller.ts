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

    findOne(@Param('id') id: string) {
        return this.timeEntriesService.findOne(id);
    }

    @Get('task/:taskId')
    findByTask(@Param('taskId') taskId: string) {
        return this.timeEntriesService.findByTask(taskId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.timeEntriesService.remove(id);
    }
}
