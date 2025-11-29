import { useState } from 'react';
import { Edit, LayoutList, Calendar, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    assignees?: Array<{ name: string }>;
    dueDate?: string;
    client?: { name: string };
}

interface TaskBlock {
    id: string;
    title: string;
    statuses: string[];
    color: string;
}

interface TaskTableProps {
    tasks: Task[];
    layout: 'standard' | 'split' | 'priority';
    taskBlocks: TaskBlock[];
    onEdit: (task: Task) => void;
}

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'HIGH': return 'text-red-500 font-medium';
        case 'MEDIUM': return 'text-yellow-600 font-medium';
        case 'LOW': return 'text-green-500 font-medium';
        default: return 'text-gray-500';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'NEW': return 'Новая';
        case 'IN_PROGRESS': return 'В работе';
        case 'REVIEW': return 'На проверке';
        case 'DONE': return 'Готово';
        default: return status;
    }
};

export default function TaskTable({ tasks, layout, taskBlocks, onEdit }: TaskTableProps) {
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    // Шаблон "По блокам"
    if (layout === 'priority') {
        return (
            <div className="space-y-6">
                {taskBlocks.map((block) => {
                    const blockTasks = tasks.filter((t) => block.statuses.includes(t.status));

                    const blockColor = {
                        blue: 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20',
                        yellow: 'border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-950/20',
                        green: 'border-green-500/30 bg-green-50/50 dark:bg-green-950/20',
                        red: 'border-red-500/30 bg-red-50/50 dark:bg-red-950/20',
                        purple: 'border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20',
                        gray: 'border-gray-500/30 bg-gray-50/50 dark:bg-gray-950/20',
                    }[block.color];

                    return (
                        <section key={block.id} className={`rounded-lg border-2 ${blockColor} p-4`}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-foreground">{block.title}</h2>
                                <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                    {blockTasks.length} {blockTasks.length === 1 ? 'задача' : 'задач'}
                                </span>
                            </div>

                            {blockTasks.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Нет задач в этом блоке
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-border">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-muted/50 border-b border-border">
                                            <tr>
                                                <th className="px-6 py-3 font-medium text-muted-foreground">Название</th>
                                                <th className="px-6 py-3 font-medium text-muted-foreground">Приоритет</th>
                                                <th className="px-6 py-3 font-medium text-muted-foreground">Проект</th>
                                                <th className="px-6 py-3 font-medium text-muted-foreground">Исполнитель</th>
                                                <th className="px-6 py-3 font-medium text-muted-foreground">Срок</th>
                                                <th className="px-6 py-3 font-medium text-muted-foreground"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {blockTasks.map((task) => (
                                                <tr key={task.id} className="hover:bg-muted/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-foreground">{task.title}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={getPriorityColor(task.priority)}>{task.priority}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-foreground">
                                                        {task.client?.name || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-foreground">
                                                        {task.assignees?.[0]?.name || 'Не назначен'}
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-foreground">
                                                        {task.dueDate ? format(new Date(task.dueDate), 'd MMM yyyy', { locale: ru }) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => onEdit(task)}
                                                            className="text-primary hover:text-primary/80 transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>
        );
    }

    // Шаблон "Фокус" (Split View)
    if (layout === 'split') {
        const selectedTask = tasks.find(t => t.id === selectedTaskId);

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                {/* Left Column: Task List */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-border flex flex-col">
                    <div className="p-4 border-b border-border bg-muted/30">
                        <h3 className="font-semibold text-foreground">Список задач</h3>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {tasks.map(task => (
                            <div
                                key={task.id}
                                onClick={() => setSelectedTaskId(task.id)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedTaskId === task.id
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-transparent hover:bg-muted/50'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className={`font-medium text-sm ${selectedTaskId === task.id ? 'text-primary' : 'text-foreground'}`}>
                                        {task.title}
                                    </h4>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${task.priority === 'HIGH' ? 'border-red-200 text-red-600 bg-red-50' :
                                            task.priority === 'MEDIUM' ? 'border-yellow-200 text-yellow-600 bg-yellow-50' :
                                                'border-green-200 text-green-600 bg-green-50'
                                        }`}>
                                        {task.priority}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{getStatusLabel(task.status)}</span>
                                    {task.dueDate && (
                                        <span>{format(new Date(task.dueDate), 'd MMM', { locale: ru })}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Task Details */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-border overflow-hidden flex flex-col">
                    {selectedTask ? (
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-border flex justify-between items-start bg-muted/10">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-2">{selectedTask.title}</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                            {getStatusLabel(selectedTask.status)}
                                        </span>
                                        {selectedTask.client && (
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                • Проект: {selectedTask.client.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => onEdit(selectedTask)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                                >
                                    <Edit className="w-4 h-4" />
                                    Редактировать
                                </button>
                            </div>

                            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Исполнитель</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <UserIcon className="w-4 h-4" />
                                            </div>
                                            <span className="text-foreground font-medium">
                                                {selectedTask.assignees?.[0]?.name || 'Не назначен'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Срок выполнения</h3>
                                        <div className="flex items-center gap-2 text-foreground">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            {selectedTask.dueDate ? format(new Date(selectedTask.dueDate), 'd MMMM yyyy', { locale: ru }) : 'Не указан'}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Описание</h3>
                                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50 min-h-[100px] text-sm text-foreground">
                                        {/* Здесь могло бы быть описание задачи, если бы оно было в API */}
                                        Описание задачи отсутствует.
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <LayoutList className="w-8 h-8 opacity-50" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-1">Выберите задачу</h3>
                            <p className="text-sm max-w-xs">Нажмите на задачу в списке слева, чтобы просмотреть её детали.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Шаблон "Стандартный" - все задачи в одной таблице
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-border">
            <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border">
                    <tr>
                        <th className="px-6 py-3 font-medium text-muted-foreground">Название</th>
                        <th className="px-6 py-3 font-medium text-muted-foreground">Статус</th>
                        <th className="px-6 py-3 font-medium text-muted-foreground">Приоритет</th>
                        <th className="px-6 py-3 font-medium text-muted-foreground">Исполнитель</th>
                        <th className="px-6 py-3 font-medium text-muted-foreground">Срок</th>
                        <th className="px-6 py-3 font-medium text-muted-foreground"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {tasks.map((task) => (
                        <tr key={task.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-foreground">{task.title}</td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-medium">
                                    {getStatusLabel(task.status)}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={getPriorityColor(task.priority)}>{task.priority}</span>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                                {task.assignees?.[0]?.name || 'Не назначен'}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                                {task.dueDate ? format(new Date(task.dueDate), 'd MMM yyyy', { locale: ru }) : '-'}
                            </td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => onEdit(task)}
                                    className="text-primary hover:text-primary/80 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {tasks.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                Задач пока нет
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
