'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '@/lib/api';
import FileUpload from '@/components/file-upload';
import { FileText, Trash2, Download, Loader2, File as FileIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function FilesPage() {
    const queryClient = useQueryClient();

    const { data: files, isLoading, error } = useQuery({
        queryKey: ['files'],
        queryFn: filesApi.list,
    });

    const deleteFileMutation = useMutation({
        mutationFn: filesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files'] });
        },
    });

    const handleUploadComplete = () => {
        queryClient.invalidateQueries({ queryKey: ['files'] });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Файлы</h1>
                <p className="text-muted-foreground">Загрузка и управление файлами.</p>
            </header>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                        <FileText className="w-5 h-5" />
                        Загрузить новый файл
                    </h2>
                    <FileUpload onUploadComplete={handleUploadComplete} />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-border p-6 h-fit">
                    <h2 className="text-lg font-semibold mb-4 text-foreground">Недавние файлы</h2>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="text-sm text-red-500">
                            Ошибка загрузки списка файлов.
                        </div>
                    ) : files?.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Список файлов пуст.</p>
                    ) : (
                        <div className="space-y-3">
                            {files?.map((file: any) => (
                                <div key={file.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md border border-border hover:bg-muted/50 transition-colors group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-600">
                                            <FileIcon className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{file.originalName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(file.size)} • {format(new Date(file.createdAt), 'd MMM yyyy', { locale: ru })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                                            title="Скачать"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                        <button
                                            onClick={() => deleteFileMutation.mutate(file.id)}
                                            className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors"
                                            title="Удалить"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
