import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_SERVICE } from '../prisma/prisma.module';
import type { CustomPrismaClient } from '../prisma/prisma.extension';
import { S3Service } from './s3.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
    constructor(
        @Inject(PRISMA_SERVICE) private prisma: CustomPrismaClient,
        private s3Service: S3Service,
    ) { }

    async uploadFile(file: Express.Multer.File, uploadedBy: string, taskId?: string): Promise<any> {
        const fileKey = `${uuidv4()}-${file.originalname}`;
        const url = await this.s3Service.uploadFile(file, fileKey);

        return this.prisma.file.create({
            data: {
                filename: file.originalname,
                url,
                mime: file.mimetype,
                size: file.size,
                uploadedBy,
                taskId,
                tenantId: 'temp', // Will be set by Prisma Extension
            },
        });
    }

    findAll() {
        return this.prisma.file.findMany();
    }

    findOne(id: string) {
        return this.prisma.file.findUnique({ where: { id } });
    }

    async deleteFile(id: string) {
        const file = await this.findOne(id);
        if (file) {
            const key = file.url.split('/').pop();
            if (key) {
                await this.s3Service.deleteFile(key);
            }
            return this.prisma.file.delete({ where: { id } });
        }
    }
}

