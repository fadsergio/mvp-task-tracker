import { useState } from 'react';
import { Edit, LayoutList, Calendar, User as UserIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { CustomColumn } from '@/hooks/use-task-settings';

interface Task {
    id: string;
    title: string;
    priority: string;
    status: string;
    assignees?: Array<{ name: string }>;
    dueDate?: string;
    client?: { name: string };
    spentTime?: number;
    customFields?: Record<string, any>;
}

interface TaskBlock {
    id: string;
    title: string;
    status?: string;
    color: string;
    filter?: (task: Task) => boolean;
}

interface TaskTableProps {
    tasks: Task[];
    layout: 'standard' | 'split' | 'priority';
    taskBlocks: TaskBlock[];
    customColumns?: CustomColumn[];
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

export default function TaskTable({ tasks, layout, taskBlocks, customColumns = [], onEdit }: TaskTableProps) {
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const { t, i18n } = useTranslation();

    const dateLocale = i18n.language === 'ru' ? ru : enUS;

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const priorityOrder: Record<string, number> = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };

    const sortedTasks = [...tasks].sort((a, b) => {
        if (!sortConfig) return 0;

        const { key, direction } = sortConfig;
        let aValue: any;
        let bValue: any;

        if (key === 'assignee') {
            aValue = a.assignees?.[0]?.name || '';
            bValue = b.assignees?.[0]?.name || '';
        } else if (key === 'client') {
            aValue = a.client?.name || '';
            bValue = b.client?.name || '';
        } else if (key === 'priority') {
            aValue = priorityOrder[a.priority] || 0;
            bValue = priorityOrder[b.priority] || 0;
        } else if (key.startsWith('custom_')) {
            const fieldId = key.replace('custom_', '');
            aValue = a.customFields?.[fieldId] || '';
            bValue = b.customFields?.[fieldId] || '';
        } else {
            aValue = a[key as keyof Task];
            bValue = b[key as keyof Task];
        }

        // Handle null/undefined
        if (aValue === undefined || aValue === null) aValue = '';
        if (bValue === undefined || bValue === null) bValue = '';

        if (aValue < bValue) {
            return direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig?.key !== columnKey) return null;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 ml-1 text-primary" /> : <ArrowDown className="w-4 h-4 ml-1 text-primary" />;
    };

    // Шаблон "По блокам" (теперь используем переданные блоки и группируем по статусу)
    if (layout === 'priority') {
        return (
            <div className="space-y-6">
                {taskBlocks.map((block) => {
                    // Filter tasks by status matching the block's status
                    const blockTasks = sortedTasks.filter((t) => t.status === block.status);

                    const blockColor = {
                        blue: 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20',
                        yellow: 'border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-950/20',
                        green: 'border-green-500/30 bg-green-50/50 dark:bg-green-950/20',
                        red: 'border-red-500/30 bg-red-50/50 dark:bg-red-950/20',
                        purple: 'border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20',
                        gray: 'border-gray-500/30 bg-gray-50/50 dark:bg-gray-950/20',
                    }[block.color] || 'border-gray-500/30 bg-gray-50/50';

                    return (
                        <section key={block.id} className={`rounded-lg border-2 ${blockColor} p-4`}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-foreground">{block.title}</h2>
                                <span className="text-sm text-foreground bg-muted px-3 py-1 rounded-full">
                                    {blockTasks.length} {blockTasks.length === 1 ? (i18n.language === 'ru' ? 'задача' : 'task') : (i18n.language === 'ru' ? 'задач' : 'tasks')}
                                </span>
                            </div>

                            {blockTasks.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    {t('tasks.no_tasks')}
                                </div>
                            ) : (
                                <div className="bg-card rounded-lg shadow overflow-hidden border border-border">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-muted/50 border-b border-border">
                                            <tr>
                                                <th
                                                    className="px-6 py-3 font-medium text-foreground cursor-pointer hover:text-foreground/80 transition-colors group select-none"
                                                    onClick={() => handleSort('title')}
                                                >
                                                    <div className="flex items-center">
                                                        {t('tasks.title')}
                                                        <SortIcon columnKey="title" />
                                                    </div>
                                                </th>
                                                <th
                                                    className="px-6 py-3 font-medium text-gray-900 cursor-pointer hover:text-gray-700 transition-colors group select-none"
                                                    onClick={() => handleSort('client')}
                                                >
                                                    <div className="flex items-center">
                                                        {t('tasks.project')}
                                                        <SortIcon columnKey="client" />
                                                    </div>
                                                </th>
                                                <th
                                                    className="px-6 py-3 font-medium text-gray-900 cursor-pointer hover:text-gray-700 transition-colors group select-none"
                                                    onClick={() => handleSort('assignee')}
                                                >
                                                    <div className="flex items-center">
                                                        {t('tasks.assignee')}
                                                        <SortIcon columnKey="assignee" />
                                                    </div>
                                                </th>
                                                {customColumns.map((col) => (
                                                    <th
                                                        key={col.id}
                                                        className="px-6 py-3 font-medium text-gray-900 cursor-pointer hover:text-gray-700 transition-colors group select-none"
                                                        onClick={() => handleSort(`custom_${col.id}`)}
                                                    >
                                                        <div className="flex items-center">
                                                            {col.title}
                                                            <SortIcon columnKey={`custom_${col.id}`} />
                                                        </div>
                                                    </th>
                                                ))}
                                                <th
                                                    className="px-6 py-3 font-medium text-gray-900 cursor-pointer hover:text-gray-700 transition-colors group select-none"
                                                    onClick={() => handleSort('spentTime')}
                                                >
                                                    <div className="flex items-center">
                                                        {t('tasks.spent_time')}
                                                        <SortIcon columnKey="spentTime" />
                                                    </div>
                                                </th>
                                                <th
                                                    className="px-6 py-3 font-medium text-gray-900 cursor-pointer hover:text-gray-700 transition-colors group select-none"
                                                    onClick={() => handleSort('dueDate')}
                                                >
                                                    <div className="flex items-center">
                                                        {t('tasks.due_date')}
                                                        <SortIcon columnKey="dueDate" />
                                                    </div>
                                                </th>
                                                <th className="px-6 py-3 font-medium text-muted-foreground"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {blockTasks.map((task) => (
                                                <tr key={task.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onDoubleClick={() => onEdit(task)}>
                                                    <td className="px-6 py-4 font-medium text-foreground">{task.title}</td>
                                                    <td className="px-6 py-4 text-foreground">
                                                        {task.client?.name || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-foreground">
                                                        {task.assignees?.[0]?.name || t('tasks.no_assignee', 'Unassigned')}
                                                    </td>
                                                    {customColumns.map((col) => (
                                                        <td key={col.id} className="px-6 py-4 text-foreground">
                                                            {task.customFields?.[col.id] || '-'}
                                                        </td>
                                                    ))}
                                                    <td className="px-6 py-4 text-foreground">
                                                        {task.spentTime || 0} {t('common.hours')}
                                                    </td>
                                                    <td className="px-6 py-4 text-foreground">
                                                        {task.dueDate ? format(new Date(task.dueDate), 'dd.MM.yyyy') : '-'}
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
        const selectedTask = sortedTasks.find(t => t.id === selectedTaskId);

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                {/* Left Column: Task List */}
                <div className="lg:col-span-1 bg-card rounded-lg shadow overflow-hidden border border-border flex flex-col">
                    <div className="p-4 border-b border-border bg-muted/50">
                        <h3 className="font-semibold text-foreground">{t('tasks.title')}</h3>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {sortedTasks.map(task => (
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
                                        {t(`priority.${task.priority}`)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    {task.dueDate && (
                                        <span>{format(new Date(task.dueDate), 'dd.MM')}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Task Details */}
                <div className="lg:col-span-2 bg-card rounded-lg shadow border border-border overflow-hidden flex flex-col">
                    {selectedTask ? (
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-border flex justify-between items-start bg-muted/10">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-2">{selectedTask.title}</h2>
                                    <div className="flex items-center gap-2">
                                        {selectedTask.client && (
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                • {t('tasks.project')}: {selectedTask.client.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => onEdit(selectedTask)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                                >
                                    <Edit className="w-4 h-4" />
                                    {t('tasks.edit')}
                                </button>
                            </div>

                            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('tasks.assignee')}</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                                <UserIcon className="w-4 h-4" />
                                            </div>
                                            <span className="text-foreground font-medium">
                                                {selectedTask.assignees?.[0]?.name || t('tasks.no_assignee', 'Unassigned')}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('tasks.due_date')}</h3>
                                        <div className="flex items-center gap-2 text-foreground">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            {selectedTask.dueDate ? format(new Date(selectedTask.dueDate), 'dd.MM.yyyy') : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('tasks.spent_time')}</h3>
                                        <div className="flex items-center gap-2 text-foreground">
                                            <span className="font-medium">{selectedTask.spentTime || 0} {t('common.hours')}</span>
                                        </div>
                                    </div>
                                    {/* Custom Fields in Details */}
                                    {customColumns.map((col) => (
                                        <div key={col.id}>
                                            <h3 className="text-sm font-medium text-muted-foreground mb-1">{col.title}</h3>
                                            <div className="text-foreground">
                                                {selectedTask.customFields?.[col.id] || '-'}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('tasks.description')}</h3>
                                    <div className="p-4 bg-muted/30 rounded-lg border border-border min-h-[100px] text-sm text-foreground">
                                        {/* Здесь могло бы быть описание задачи, если бы оно было в API */}
                                        {t('tasks.no_description', 'No description available.')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <LayoutList className="w-8 h-8 opacity-50" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-1">{t('tasks.select_task', 'Select a task')}</h3>
                            <p className="text-sm max-w-xs">{t('tasks.select_task_desc', 'Click on a task in the list to view details.')}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Шаблон "Стандартный" - все задачи в одной таблице
    return (
        <div className="bg-card rounded-lg shadow overflow-hidden border border-border">
            <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border">
                    <tr>
                        <th
                            className="px-6 py-3 font-medium text-foreground cursor-pointer hover:text-foreground/80 transition-colors group select-none"
                            onClick={() => handleSort('title')}
                        >
                            <div className="flex items-center">
                                {t('tasks.title')}
                                <SortIcon columnKey="title" />
                            </div>
                        </th>

                        <th
                            className="px-6 py-3 font-medium text-foreground cursor-pointer hover:text-foreground/80 transition-colors group select-none"
                            onClick={() => handleSort('priority')}
                        >
                            <div className="flex items-center">
                                {t('tasks.priority')}
                                <SortIcon columnKey="priority" />
                            </div>
                        </th>
                        <th
                            className="px-6 py-3 font-medium text-foreground cursor-pointer hover:text-foreground/80 transition-colors group select-none"
                            onClick={() => handleSort('assignee')}
                        >
                            <div className="flex items-center">
                                {t('tasks.assignee')}
                                <SortIcon columnKey="assignee" />
                            </div>
                        </th>
                        {customColumns.map((col) => (
                            <th
                                key={col.id}
                                className="px-6 py-3 font-medium text-foreground cursor-pointer hover:text-foreground/80 transition-colors group select-none"
                                onClick={() => handleSort(`custom_${col.id}`)}
                            >
                                <div className="flex items-center">
                                    {col.title}
                                    <SortIcon columnKey={`custom_${col.id}`} />
                                </div>
                            </th>
                        ))}
                        <th
                            className="px-6 py-3 font-medium text-foreground cursor-pointer hover:text-foreground/80 transition-colors group select-none"
                            onClick={() => handleSort('spentTime')}
                        >
                            <div className="flex items-center">
                                {t('tasks.spent_time')}
                                <SortIcon columnKey="spentTime" />
                            </div>
                        </th>
                        <th
                            className="px-6 py-3 font-medium text-foreground cursor-pointer hover:text-foreground/80 transition-colors group select-none"
                            onClick={() => handleSort('dueDate')}
                        >
                            <div className="flex items-center">
                                {t('tasks.due_date')}
                                <SortIcon columnKey="dueDate" />
                            </div>
                        </th>
                        <th className="px-6 py-3 font-medium text-muted-foreground"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {sortedTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onDoubleClick={() => onEdit(task)}>
                            <td className="px-6 py-4 font-medium text-foreground">{task.title}</td>

                            <td className="px-6 py-4">
                                <span className={getPriorityColor(task.priority)}>{t(`priority.${task.priority}`)}</span>
                            </td>
                            <td className="px-6 py-4 text-foreground">
                                {task.assignees?.[0]?.name || t('tasks.no_assignee', 'Unassigned')}
                            </td>
                            {customColumns.map((col) => (
                                <td key={col.id} className="px-6 py-4 text-foreground">
                                    {task.customFields?.[col.id] || '-'}
                                </td>
                            ))}
                            <td className="px-6 py-4 text-foreground">
                                {task.spentTime || 0} {t('common.hours')}
                            </td>
                            <td className="px-6 py-4 text-foreground">
                                {task.dueDate ? format(new Date(task.dueDate), 'dd.MM.yyyy') : '-'}
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
                    {sortedTasks.length === 0 && (
                        <tr>
                            <td colSpan={7 + customColumns.length} className="px-6 py-8 text-center text-muted-foreground">
                                {t('tasks.no_tasks')}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
