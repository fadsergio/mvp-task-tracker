import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
    constructor(private prisma: PrismaService) { }

    async getByTask(taskId: string, tenantId: string) {
        return this.prisma.comment.findMany({
            where: { taskId, tenantId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    async create(data: CreateCommentDto, userId: string, tenantId: string) {
        return this.prisma.comment.create({
            data: {
                taskId: data.taskId,
                text: data.text,
                mentions: data.mentions || [],
                fileIds: data.fileIds || [],
                userId,
                tenantId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    async update(id: string, dto: UpdateCommentDto, userId: string, tenantId: string) {
        // Проверяем что комментарий принадлежит пользователю
        const comment = await this.prisma.comment.findFirst({
            where: { id, tenantId, userId },
        });

        if (!comment) {
            throw new Error('Comment not found or access denied');
        }

        return this.prisma.comment.update({
            where: { id },
            data: { text: dto.text },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    async delete(id: string, userId: string, tenantId: string) {
        // Проверяем что комментарий принадлежит пользователю
        const comment = await this.prisma.comment.findFirst({
            where: { id, tenantId, userId },
        });

        if (!comment) {
            throw new Error('Comment not found or access denied');
        }

        return this.prisma.comment.delete({ where: { id } });
    }
}
