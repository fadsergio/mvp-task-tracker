import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { ImportService } from './import.service';

@Module({
    controllers: [TasksController],
    providers: [TasksService, ImportService],
})
export class TasksModule { }
