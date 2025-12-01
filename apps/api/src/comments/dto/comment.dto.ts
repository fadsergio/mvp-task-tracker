import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateCommentDto {
    @IsString()
    taskId: string;

    @IsString()
    text: string;

    @IsOptional()
    @IsArray()
    mentions?: string[];

    @IsOptional()
    @IsArray()
    fileIds?: string[];
}

export class UpdateCommentDto {
    @IsString()
    text: string;
}
