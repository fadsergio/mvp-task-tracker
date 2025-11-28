import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContextService } from '../common/providers/context.service';

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) { }

    create(data: any, tenantId: string) {
        const { email, phone, ...rest } = data;
        return this.prisma.client.create({
            data: {
                ...rest,
                contact: { email, phone },
                tenantId,
            },
        });
    }

    findAll(tenantId: string) {
        return this.prisma.client.findMany({
            where: { tenantId },
        });
    }

    findOne(id: string) {
        return this.prisma.client.findUnique({ where: { id } });
    }

    async update(id: string, data: any, tenantId: string) {
        // Verify client belongs to tenant
        const client = await this.prisma.client.findFirst({
            where: { id, tenantId },
        });

        if (!client) {
            throw new Error('Client not found or access denied');
        }

        const { email, phone, ...rest } = data;

        return this.prisma.client.update({
            where: { id },
            data: {
                ...rest,
                contact: (email !== undefined || phone !== undefined)
                    ? { email, phone }
                    : undefined,
            },
        });
    }
}
