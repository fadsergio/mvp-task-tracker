import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PRISMA_SERVICE } from '../prisma/prisma.module';
import { CustomPrismaClient } from '../prisma/prisma.extension'; // Need to export type

@Injectable()
export class UsersService {
    constructor(@Inject(PRISMA_SERVICE) private prisma: CustomPrismaClient) { }

    async create(data: any) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });
    }

    findAll() {
        return this.prisma.user.findMany();
    }

    findOne(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    findById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    update(id: string, data: any) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }
}
