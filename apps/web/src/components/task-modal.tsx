'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi, clientsApi, usersApi } from '@/lib/api';
import { X, Loader2 } from 'lucide-react';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task?: any; // Если передан - режим редактирования
}

export default function TaskModal({ isOpen, onClose, task }: TaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [clientId, setClientId] = useState('');
    const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState('');
    const [spentTime, setSpentTime] = useState(0);
    const [error, setError] = useState('');

    const queryClient = useQueryClient();
    const isEditMode = !!task;

    // Предзаполнение полей при редактировании
    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setPriority(task.priority || 'MEDIUM');
            setClientId(task.clientId || '');
            setAssigneeIds(task.assignees?.map((u: any) => u.id) || []);
            setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
            setSpentTime(task.spentTime || 0);
        } else {
            // Сброс при создании
            setTitle('');
            setDescription('');
            setPriority('MEDIUM');
            setClientId('');
            setAssigneeIds([]);
            setDueDate('');
            setSpentTime(0);
        }
        setError('');
    }, [task, isOpen]);

    // Fetch clients and users for dropdowns
    const { data: clients } = useQuery({ queryKey: ['clients'], queryFn: clientsApi.getAll });
    const { data: users } = useQuery({ queryKey: ['users'], queryFn: usersApi.getAll });

    const mutation = useMutation({
        mutationFn: (data: any) => {
            if (isEditMode) {
                return tasksApi.update(task.id, data);
            }
            return tasksApi.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Ошибка сохранения задачи');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        mutation.mutate({
            title,
            description,
            priority,
            clientId: clientId || undefined,
            assigneeIds,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            spentTime: Number(spentTime),
            status: task?.status || 'NEW'
        });
    };

    const toggleAssignee = (userId: string) => {
        setAssigneeIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-4 text-foreground">
                    {isEditMode ? 'Редактировать задачу' : 'Новая задача'}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Название *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Сделать дизайн"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Описание
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={3}
                            placeholder="Подробности задачи..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Приоритет
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="LOW">Низкий</option>
                                <option value="MEDIUM">Средний</option>
                                <option value="HIGH">Высокий</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Срок
                            </label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Затрачено часов
                            </label>
                            <input
                                type="number"
                                step="0.25"
                                min="0"
                                value={spentTime}
                                onChange={(e) => setSpentTime(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Проект
                        </label>
                        <select
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Не выбран</option>
                            {clients?.map((client: any) => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Участники
                        </label>
                        <div className="w-full px-3 py-2 border border-border rounded-md bg-background h-40 overflow-y-auto space-y-1">
                            {users?.map((user: any) => (
                                <label key={user.id} className="flex items-center gap-2 p-1.5 hover:bg-muted/50 rounded cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={assigneeIds.includes(user.id)}
                                        onChange={() => toggleAssignee(user.id)}
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] overflow-hidden border border-border">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{user.name?.[0] || 'U'}</span>
                                            )}
                                        </div>
                                        <span className="text-sm text-foreground">{user.name || user.email}</span>
                                    </div>
                                </label>
                            ))}
                            {(!users || users.length === 0) && (
                                <p className="text-sm text-muted-foreground p-2">Нет доступных участников</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors flex items-center gap-2"
                        >
                            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isEditMode ? 'Сохранить' : 'Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
