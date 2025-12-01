import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Get('task/:taskId')
    getByTask(@Param('taskId') taskId: string, @Req() req: any) {
        return this.commentsService.getByTask(taskId, req.user.tenantId);
    }

    @Post()
    create(@Body() dto: CreateCommentDto, @Req() req: any) {
        return this.commentsService.create(dto, req.user.id, req.user.tenantId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCommentDto, @Req() req: any) {
        return this.commentsService.update(id, dto, req.user.id, req.user.tenantId);
    }

    @Delete(':id')
    delete(@Param('id') id: string, @Req() req: any) {
        return this.commentsService.delete(id, req.user.id, req.user.tenantId);
    }
}
