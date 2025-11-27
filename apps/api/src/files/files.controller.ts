import { Controller, Get, Post, Param, Delete, UseInterceptors, UploadedFile, Body, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('taskId') taskId: string,
        @Request() req: any,
    ) {
        const userId = req.user?.userId || 'system';
        return this.filesService.uploadFile(file, userId, taskId);
    }

    @Get()
    findAll() {
        return this.filesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.filesService.findOne(id);
    }

    @Delete(':id')
    deleteFile(@Param('id') id: string) {
        return this.filesService.deleteFile(id);
    }
}

