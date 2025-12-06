import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, differenceInDays, addMonths } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Task {
    id: string;
    title: string;
    priority: string;
    status: string;
    assignees?: Array<{ name: string }>;
    dueDate?: string;
    createdAt?: string;
    client?: { name: string };
}

interface GanttChartProps {
    tasks: Task[];
    colorBy: 'priority' | 'status';
    colors: {
        priority: {
            HIGH: string;
            MEDIUM: string;
            LOW: string;
        };
        status: {
            TODO: string;
            IN_PROGRESS: string;
            DONE: string;
        };
    };
    onEdit: (task: Task) => void;
    onColorChange: (colors: GanttChartProps['colors']) => void;
}

export default function GanttChart({ tasks, colorBy, colors, onEdit, onColorChange }: GanttChartProps) {
    // Фильтруем задачи с датами
    const tasksWithDates = useMemo(() => {
        return tasks.filter(t => t.createdAt && t.dueDate);
    }, [tasks]);

    // Определяем временной диапазон
    const { startDate, endDate, totalDays } = useMemo(() => {
        if (tasksWithDates.length === 0) {
            const now = new Date();
            return {
                startDate: startOfMonth(now),
                endDate: endOfMonth(addMonths(now, 2)),
                totalDays: 90
            };
        }

        const dates = tasksWithDates.flatMap(t => [
            new Date(t.createdAt!),
            new Date(t.dueDate!)
        ]);

        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

        const start = startOfMonth(minDate);
        const end = endOfMonth(maxDate);

        return {
            startDate: start,
            endDate: end,
            totalDays: differenceInDays(end, start) + 1
        };
    }, [tasksWithDates]);

    // Генерируем месяцы для заголовка
    const months = useMemo(() => {
        const result = [];
        let current = startDate;
        while (current <= endDate) {
            const monthEnd = endOfMonth(current);
            const daysInView = differenceInDays(
                monthEnd > endDate ? endDate : monthEnd,
                current
            ) + 1;
            result.push({
                label: format(current, 'LLLL yyyy', { locale: ru }),
                days: daysInView
            });
            current = addMonths(current, 1);
        }
        return result;
    }, [startDate, endDate]);

    // Функция получения цвета
    const getTaskColor = (task: Task) => {
        if (colorBy === 'priority') {
            return colors.priority[task.priority as keyof typeof colors.priority] || '#9ca3af';
        } else {
            return colors.status[task.status as keyof typeof colors.status] || '#9ca3af';
        }
    };

    // Вычисляем позицию и ширину задачи
    const getTaskPosition = (task: Task) => {
        const taskStart = new Date(task.createdAt!);
        const taskEnd = new Date(task.dueDate!);

        const offsetDays = differenceInDays(taskStart, startDate);
        const durationDays = differenceInDays(taskEnd, taskStart) + 1;

        const leftPercent = (offsetDays / totalDays) * 100;
        const widthPercent = (durationDays / totalDays) * 100;

        return { leftPercent, widthPercent };
    };

    // Вычисляем позицию текущей даты
    const todayPosition = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (today < startDate || today > endDate) {
            return null;
        }

        const offsetDays = differenceInDays(today, startDate);
        return (offsetDays / totalDays) * 100;
    }, [startDate, endDate, totalDays]);

    // Проверка просроченных задач
    const isOverdue = (task: Task) => {
        if (task.status === 'DONE') return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate!);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    if (tasksWithDates.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-card rounded-lg border border-border">
                <div className="text-center text-muted-foreground">
                    <p className="text-lg font-medium">Нет задач с датами</p>
                    <p className="text-sm mt-2">Добавьте даты начала и окончания к задачам</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
            {/* Заголовок с месяцами */}
            <div className="bg-muted/50 border-b border-border flex">
                <div className="w-[200px] flex-shrink-0 px-3 py-2 text-sm font-medium text-foreground border-r border-border">
                    Задача
                </div>
                <div className="flex flex-1">
                    {months.map((month, idx) => (
                        <div
                            key={idx}
                            style={{ width: `${(month.days / totalDays) * 100}%` }}
                            className="px-2 py-2 text-center text-xs font-medium text-foreground border-r border-border"
                        >
                            {month.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Задачи */}
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {tasksWithDates.map((task) => {
                    const { leftPercent, widthPercent } = getTaskPosition(task);
                    const color = getTaskColor(task);

                    return (
                        <div
                            key={task.id}
                            className="flex border-b border-border hover:bg-muted/30 transition-colors"
                        >
                            {/* Название задачи */}
                            <div className="w-[200px] flex-shrink-0 px-3 py-2 border-r border-border">
                                <div className="font-medium text-foreground text-xs truncate">
                                    {task.title}
                                </div>
                                <div className="text-[10px] text-muted-foreground truncate">
                                    {task.assignees?.[0]?.name || 'Не назначен'}
                                </div>
                            </div>

                            {/* Временная шкала */}
                            <div className="relative flex-1" style={{ height: '48px' }}>
                                {/* Линия "Сегодня" */}
                                {todayPosition !== null && (
                                    <div
                                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                                        style={{ left: `${todayPosition}%` }}
                                        title="Сегодня"
                                    >
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-red-500 whitespace-nowrap">
                                            Сегодня
                                        </div>
                                    </div>
                                )}

                                <div
                                    className={`absolute top-1/2 -translate-y-1/2 h-6 rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center px-2 ${isOverdue(task) ? 'ring-2 ring-red-500 ring-opacity-50' : ''
                                        }`}
                                    style={{
                                        left: `${leftPercent}%`,
                                        width: `${widthPercent}%`,
                                        minWidth: '30px',
                                        backgroundColor: color
                                    }}
                                    onClick={() => onEdit(task)}
                                    title={`${format(new Date(task.createdAt!), 'dd.MM.yyyy')} - ${format(new Date(task.dueDate!), 'dd.MM.yyyy')}${isOverdue(task) ? ' (ПРОСРОЧЕНО)' : ''}`}
                                >
                                    <span className="text-white text-[10px] font-medium truncate">
                                        {task.client?.name || ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Легенда */}
            <div className="bg-muted/30 border-t border-border px-4 py-2">
                <div className="flex items-center gap-4 text-xs flex-wrap">
                    <span className="font-medium text-foreground">Цвета по {colorBy === 'priority' ? 'приоритету' : 'статусу'}:</span>
                    {colorBy === 'priority' ? (
                        <>
                            <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                                <input
                                    type="color"
                                    value={colors.priority.HIGH}
                                    onChange={(e) => onColorChange({
                                        ...colors,
                                        priority: {
                                            ...colors.priority,
                                            HIGH: e.target.value
                                        }
                                    })}
                                    className="w-3 h-3 rounded cursor-pointer border-0"
                                    title="Изменить цвет"
                                />
                                <span className="text-muted-foreground">Высокий</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                                <input
                                    type="color"
                                    value={colors.priority.MEDIUM}
                                    onChange={(e) => onColorChange({
                                        ...colors,
                                        priority: {
                                            ...colors.priority,
                                            MEDIUM: e.target.value
                                        }
                                    })}
                                    className="w-3 h-3 rounded cursor-pointer border-0"
                                    title="Изменить цвет"
                                />
                                <span className="text-muted-foreground">Средний</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                                <input
                                    type="color"
                                    value={colors.priority.LOW}
                                    onChange={(e) => onColorChange({
                                        ...colors,
                                        priority: {
                                            ...colors.priority,
                                            LOW: e.target.value
                                        }
                                    })}
                                    className="w-3 h-3 rounded cursor-pointer border-0"
                                    title="Изменить цвет"
                                />
                                <span className="text-muted-foreground">Низкий</span>
                            </label>
                        </>
                    ) : (
                        <>
                            <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                                <input
                                    type="color"
                                    value={colors.status.TODO}
                                    onChange={(e) => onColorChange({
                                        ...colors,
                                        status: {
                                            ...colors.status,
                                            TODO: e.target.value
                                        }
                                    })}
                                    className="w-3 h-3 rounded cursor-pointer border-0"
                                    title="Изменить цвет"
                                />
                                <span className="text-muted-foreground">К выполнению</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                                <input
                                    type="color"
                                    value={colors.status.IN_PROGRESS}
                                    onChange={(e) => onColorChange({
                                        ...colors,
                                        status: {
                                            ...colors.status,
                                            IN_PROGRESS: e.target.value
                                        }
                                    })}
                                    className="w-3 h-3 rounded cursor-pointer border-0"
                                    title="Изменить цвет"
                                />
                                <span className="text-muted-foreground">В работе</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                                <input
                                    type="color"
                                    value={colors.status.DONE}
                                    onChange={(e) => onColorChange({
                                        ...colors,
                                        status: {
                                            ...colors.status,
                                            DONE: e.target.value
                                        }
                                    })}
                                    className="w-3 h-3 rounded cursor-pointer border-0"
                                    title="Изменить цвет"
                                />
                                <span className="text-muted-foreground">Готово</span>
                            </label>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
