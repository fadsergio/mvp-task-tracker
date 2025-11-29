'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api';
import { Plus, LayoutList, Kanban, Loader2, Calendar, User as UserIcon, Edit } from 'lucide-react';
import TaskModal from '@/components/task-modal';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTaskSettings } from '@/hooks/use-task-settings';
import TaskTable from '@/components/task-table';

export default function TasksPage() {
    const [view, setView] = useState<'table' | 'kanban'>('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const queryClient = useQueryClient();
    const { settings } = useTaskSettings();

    const { data: tasks, isLoading, error } = useQuery({
        queryKey: ['tasks'],
        queryFn: tasksApi.getAll,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            tasksApi.update(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'NEW': return 'Новая';
            case 'IN_PROGRESS': return 'В работе';
            case 'REVIEW': return 'На проверке';
            case 'DONE': return 'Готово';
            default: return status;
        }
    };

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            updateStatusMutation.mutate({ id: taskId, status });
        }
    };

    const handleEdit = (task: any) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">
                Ошибка загрузки задач. Попробуйте обновить страницу.
            </div>
        );
    }

    // Determine available views based on settings
    const availableViews = [];
    if (settings.enabledViews?.table ?? true) availableViews.push('table');
    if (settings.enabledViews?.kanban ?? true) availableViews.push('kanban');

    // If current view is disabled, switch to the first available view
    if (view === 'table' && !(settings.enabledViews?.table ?? true)) {
        if (availableViews.length > 0) setView(availableViews[0] as any);
    }
    if (view === 'kanban' && !(settings.enabledViews?.kanban ?? true)) {
        if (availableViews.length > 0) setView(availableViews[0] as any);
    }

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Задачи</h1>
                    <p className="text-muted-foreground">Управление задачами и проектами.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-muted p-1 rounded-lg">
                        {(settings.enabledViews?.table ?? true) && (
                            <button
                                onClick={() => setView('table')}
                                disabled={availableViews.length === 1}
                                className={`p-2 rounded-md transition-all ${view === 'table' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'} ${availableViews.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title="Режим Список"
                            >
                                <LayoutList className="w-4 h-4" />
                            </button>
                        )}
                        {(settings.enabledViews?.kanban ?? true) && (
                            <button
                                onClick={() => setView('kanban')}
                                disabled={availableViews.length === 1}
                                className={`p-2 rounded-md transition-all ${view === 'kanban' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'} ${availableViews.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title="Режим Канбан"
                            >
                                <Kanban className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Новая задача
                    </button>
                </div>
            </header>

            {view === 'table' ? (
                <TaskTable
                    tasks={tasks || []}
                    layout={settings.layout}
                    taskBlocks={settings.taskBlocks}
                    onEdit={handleEdit}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-12rem)] overflow-x-auto">
                    {['NEW', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((status) => (
                        <div
                            key={status}
                            className="bg-muted/30 rounded-lg p-4 flex flex-col gap-3 h-full border border-border/50"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, status)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                    {getStatusLabel(status)}
                                </h3>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                    {tasks?.filter((t: any) => t.status === status).length || 0}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                {tasks?.filter((t: any) => t.status === status).map((task: any) => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-border cursor-move hover:shadow-md transition-all group relative"
                                    >
                                        <button
                                            onClick={() => handleEdit(task)}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary/80"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <h4 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors pr-6">{task.title}</h4>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                                            <div className="flex items-center gap-1">
                                                <UserIcon className="w-3 h-3" />
                                                <span>{task.assignees?.[0]?.name || 'Нет'}</span>
                                            </div>
                                            {task.dueDate && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{format(new Date(task.dueDate), 'd MMM', { locale: ru })}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${task.priority === 'HIGH' ? 'border-red-200 text-red-600 bg-red-50' :
                                                task.priority === 'MEDIUM' ? 'border-yellow-200 text-yellow-600 bg-yellow-50' :
                                                    'border-green-200 text-green-600 bg-green-50'
                                                }`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <TaskModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                task={selectedTask}
            />
        </div>
    );
}
