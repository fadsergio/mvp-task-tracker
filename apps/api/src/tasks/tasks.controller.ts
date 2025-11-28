import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    create(@Body() createTaskDto: any, @Req() req: any) {
        return this.tasksService.create(createTaskDto, req.user.tenantId, req.user.userId);
    }

    @Get()
    findAll(@Req() req: any) {
        return this.tasksService.findAll(req.user.tenantId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tasksService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTaskDto: any, @Req() req: any) {
        return this.tasksService.update(id, updateTaskDto, req.user.tenantId);
    }
}
