'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/lib/api';
import { Send, Loader2, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface TaskCommentsProps {
    taskId: string;
}

export default function TaskComments({ taskId }: TaskCommentsProps) {
    const [text, setText] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const queryClient = useQueryClient();

    const { data: comments, isLoading } = useQuery({
        queryKey: ['comments', taskId],
        queryFn: () => commentsApi.getByTask(taskId),
    });

    const createMutation = useMutation({
        mutationFn: commentsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
            setText('');
        },
        onError: (error: any) => {
            console.error('Failed to create comment:', error);
            const errorMsg = error?.response?.data?.message || error?.response?.data?.error || error.message || 'Неизвестная ошибка';
            const statusCode = error?.response?.status || 'Unknown';
            alert(`Ошибка при добавлении комментария (${statusCode}):\n${JSON.stringify(errorMsg, null, 2)}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, text }: { id: string; text: string }) =>
            commentsApi.update(id, text),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
            setEditingId(null);
            setEditText('');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: commentsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        createMutation.mutate({ taskId, text });
    };

    const handleEdit = (comment: any) => {
        setEditingId(comment.id);
        setEditText(comment.text);
    };

    const handleUpdate = (id: string) => {
        if (!editText.trim()) return;
        updateMutation.mutate({ id, text: editText });
    };

    const handleDelete = (id: string) => {
        if (confirm('Удалить комментарий?')) {
            deleteMutation.mutate(id);
        }
    };

    const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;

    return (
        <div className="flex flex-col h-full">
            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-96">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : comments?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Комментариев пока нет
                    </div>
                ) : (
                    comments?.map((comment: any) => (
                        <div key={comment.id} className="flex gap-3 group">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {comment.user.avatar ? (
                                    <img
                                        src={comment.user.avatar}
                                        alt={comment.user.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                        {comment.user.name?.[0] || comment.user.email[0].toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Comment Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm text-foreground">
                                        {comment.user.name || comment.user.email}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(comment.createdAt), {
                                            addSuffix: true,
                                            locale: ru,
                                        })}
                                    </span>
                                </div>

                                {editingId === comment.id ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                            rows={2}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdate(comment.id)}
                                                disabled={updateMutation.isPending}
                                                className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                                            >
                                                Сохранить
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="px-3 py-1 text-xs bg-secondary text-foreground rounded-md hover:bg-secondary/80"
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                                            {comment.text}
                                        </p>

                                        {/* Actions */}
                                        {comment.userId === currentUserId && (
                                            <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(comment)}
                                                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                                                >
                                                    <Edit className="w-3 h-3" />
                                                    Изменить
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(comment.id)}
                                                    className="text-xs text-muted-foreground hover:text-red-600 flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Удалить
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="border-t border-border pt-4">
                <div className="flex gap-2">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Добавить комментарий..."
                        className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        rows={2}
                    />
                    <button
                        type="submit"
                        disabled={!text.trim() || createMutation.isPending}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {createMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
