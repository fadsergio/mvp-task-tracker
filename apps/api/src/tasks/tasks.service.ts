import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContextService } from '../common/providers/context.service';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    create(data: any, tenantId: string, userId: string) {
        const { assigneeId, ...rest } = data;
        return this.prisma.task.create({
            data: {
                ...rest,
                tenantId,
                createdById: userId,
                assignees: assigneeId ? { connect: { id: assigneeId } } : undefined,
            },
        });
    }

    findAll(tenantId: string) {
        return this.prisma.task.findMany({
            where: { tenantId },
            include: { assignees: true },
        });
    }

    findOne(id: string) {
        return this.prisma.task.findUnique({ where: { id } });
    }

    async update(id: string, data: any, tenantId: string) {
        // Verify task belongs to tenant
        const task = await this.prisma.task.findFirst({
            where: { id, tenantId },
        });

        if (!task) {
            throw new Error('Task not found or access denied');
        }

        const { assigneeId, ...rest } = data;

        return this.prisma.task.update({
            where: { id },
            data: {
                ...rest,
                assignees: assigneeId !== undefined
                    ? (assigneeId ? { set: [{ id: assigneeId }] } : { set: [] })
                    : undefined,
            },
        });
    }
}
