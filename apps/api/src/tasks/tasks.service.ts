import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContextService } from '../common/providers/context.service';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    create(data: any, tenantId: string, userId: string) {
        const { assigneeIds, assigneeId, ...rest } = data;
        // Support both single assigneeId (legacy) and assigneeIds array
        const idsToConnect = assigneeIds || (assigneeId ? [assigneeId] : []);

        return this.prisma.task.create({
            data: {
                ...rest,
                tenantId,
                createdById: userId,
                assignees: idsToConnect.length > 0 ? {
                    connect: idsToConnect.map((id: string) => ({ id }))
                } : undefined,
            },
        });
    }

    findAll(tenantId: string) {
        return this.prisma.task.findMany({
            where: { tenantId },
            include: { assignees: true, client: true },
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

        const { assigneeIds, assigneeId, ...rest } = data;

        // Support both single assigneeId (legacy) and assigneeIds array
        const idsToConnect = assigneeIds !== undefined ? assigneeIds : (assigneeId !== undefined ? [assigneeId] : undefined);

        return this.prisma.task.update({
            where: { id },
            data: {
                ...rest,
                assignees: idsToConnect !== undefined
                    ? { set: idsToConnect.map((id: string) => ({ id })) }
                    : undefined,
            },
        });
    }
}
