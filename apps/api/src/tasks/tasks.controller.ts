import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(
        private readonly tasksService: TasksService,
        private readonly importService: ImportService
    ) { }

    @Post()
    create(@Body() createTaskDto: any, @Req() req: any) {
        return this.tasksService.create(createTaskDto, req.user.tenantId, req.user.userId);
    }

    @Post('import')
    @UseInterceptors(FileInterceptor('file'))
    importTasks(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        return this.importService.importFromFile(file, req.user.tenantId, req.user.userId);
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
