'use client';

import { useState, useRef } from 'react';
import { Upload, X, File as FileIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { filesApi } from '@/lib/api';

interface FileUploadProps {
    taskId?: string;
    onUploadComplete?: () => void;
}

export default function FileUpload({ taskId, onUploadComplete }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        setError(null);
        setSuccess(null);

        try {
            await filesApi.upload(file, taskId);
            setSuccess(`Файл ${file.name} успешно загружен`);
            if (onUploadComplete) {
                onUploadComplete();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка загрузки файла');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="w-full">
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Upload className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                        >
                            Выберите файл
                        </button>
                        {' '}или перетащите его сюда
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Любые файлы до 10MB
                    </p>
                </div>
            </div>

            {isUploading && (
                <div className="mt-4 flex items-center text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Загрузка...
                </div>
            )}

            {error && (
                <div className="mt-4 flex items-center text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-4 flex items-center text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {success}
                </div>
            )}
        </div>
    );
}
