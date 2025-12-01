import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
    tasks: any[];
    onEdit: (task: any) => void;
}

export default function CalendarView({ tasks, onEdit }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: ru });
    const endDate = endOfWeek(monthEnd, { locale: ru });

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    const allDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    return (
        <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-foreground capitalize">
                        {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                    </h2>
                    <div className="flex items-center gap-1">
                        <button onClick={prevMonth} className="p-1 hover:bg-muted rounded-full">
                            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <button onClick={nextMonth} className="p-1 hover:bg-muted rounded-full">
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-border bg-muted/50">
                {weekDays.map((day, i) => (
                    <div key={i} className="py-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 auto-rows-fr bg-background">
                {allDays.map((day, i) => {
                    const dayTasks = tasks.filter(task =>
                        task.dueDate && isSameDay(new Date(task.dueDate), day)
                    );

                    return (
                        <div
                            key={day.toString()}
                            className={`min-h-[120px] p-2 border-b border-r border-border ${!isSameMonth(day, monthStart) ? 'bg-muted/20 text-muted-foreground' : ''
                                }`}
                        >
                            <div className={`text-sm font-medium mb-1 ${isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center' : ''
                                }`}>
                                {format(day, dateFormat)}
                            </div>
                            <div className="space-y-1">
                                {dayTasks.map(task => (
                                    <button
                                        key={task.id}
                                        onClick={() => onEdit(task)}
                                        className={`w-full text-left text-xs p-1.5 rounded truncate border ${task.priority === 'HIGH' ? 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-300' :
                                            task.priority === 'MEDIUM' ? 'bg-yellow-50 border-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-900/30 dark:text-yellow-300' :
                                                'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-300'
                                            }`}
                                    >
                                        {task.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
