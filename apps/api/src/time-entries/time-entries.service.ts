import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimeEntriesService {
    constructor(private prisma: PrismaService) { }

    create(data: any) {
        return this.prisma.timeEntry.create({ data });
    }

    findAll() {
        return this.prisma.timeEntry.findMany();
    }

    findOne(id: string) {
        return this.prisma.timeEntry.findUnique({ where: { id } });
    }

    findByTask(taskId: string) {
        return this.prisma.timeEntry.findMany({
            where: { taskId },
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        });
    }

    remove(id: string) {
        return this.prisma.timeEntry.delete({ where: { id } });
    }
}
