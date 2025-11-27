import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    create(data: any) {
        return this.prisma.task.create({ data });
    }

    findAll() {
        return this.prisma.task.findMany();
    }

    findOne(id: string) {
        return this.prisma.task.findUnique({ where: { id } });
    }
}
