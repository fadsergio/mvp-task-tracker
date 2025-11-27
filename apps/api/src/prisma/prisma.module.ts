import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { prismaExtendedClient } from './prisma.extension';

export const PRISMA_SERVICE = 'PRISMA_SERVICE';

@Global()
@Module({
    providers: [
        PrismaService,
        {
            provide: PRISMA_SERVICE,
            useFactory: (prismaService: PrismaService) => {
                return prismaExtendedClient(prismaService);
            },
            inject: [PrismaService],
        },
    ],
    exports: [PrismaService, PRISMA_SERVICE],
})
export class PrismaModule { }
