import { PrismaClient } from '@prisma/client';
import { ContextService } from '../common/providers/context.service';

export type CustomPrismaClient = ReturnType<typeof prismaExtendedClient>;

export const prismaExtendedClient = (prisma: PrismaClient) => {
    return prisma.$extends({
        query: {
            $allModels: {
                async findMany({ args, query }) {
                    const tenantId = ContextService.get<string>('tenantId');
                    if (tenantId) {
                        args.where = { ...args.where, tenantId };
                    }
                    return query(args);
                },
                async findFirst({ args, query }) {
                    const tenantId = ContextService.get<string>('tenantId');
                    if (tenantId) {
                        args.where = { ...args.where, tenantId };
                    }
                    return query(args);
                },
                async count({ args, query }) {
                    const tenantId = ContextService.get<string>('tenantId');
                    if (tenantId) {
                        args.where = { ...args.where, tenantId };
                    }
                    return query(args);
                },
                // Note: create, update, delete also need tenantId handling
                async create({ args, query }) {
                    const tenantId = ContextService.get<string>('tenantId');
                    if (tenantId) {
                        (args.data as any).tenantId = tenantId;
                    }
                    return query(args);
                },
            },
        },
    });
};
