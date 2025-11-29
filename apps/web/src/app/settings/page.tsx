'use client';

import { useTaskSettings } from '@/hooks/use-task-settings';
import { LayoutList, Kanban, AlignVerticalJustifyStart, List } from 'lucide-react';

export default function SettingsPage() {
    const { settings, updateSettings } = useTaskSettings();

    const columns = [
        { id: 'status', label: 'Статус' },
        { id: 'priority', label: 'Приоритет' },
        { id: 'project', label: 'Проект' },
        { id: 'participants', label: 'Участники' },
        { id: 'dueDate', label: 'Срок' },
        { id: 'spentTime', label: 'Затрачено времени' },
    ];

    const layouts = [
        {
            id: 'standard',
            name: 'Стандартный',
            description: 'Классический вид таблицы или канбан-доски.',
            icon: LayoutList
        },
        {
            id: 'split',
            name: 'Фокус (Split View)',
            description: 'Список задач слева, детали выбранной задачи справа.',
            icon: Kanban
        },
        {
            id: 'priority',
            name: 'По блокам',
            description: 'Задачи сгруппированы по настраиваемым блокам (статусам).',
            icon: AlignVerticalJustifyStart
        }
    ];

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-12">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Настройки</h1>
                <p className="text-muted-foreground">Управление отображением задач.</p>
            </header>

            {/* Режимы отображения */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <LayoutList className="w-5 h-5" />
                    Режимы отображения задач
                </h2>
                <div className="glass-card p-6 rounded-xl border border-border/40">
                    <p className="text-sm text-muted-foreground mb-4">
                        Выберите, какие режимы отображения будут доступны на странице задач. Должен быть активен хотя бы один режим.
                    </p>
                    <div className="space-y-3">
                        <label className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border-2 ${settings.enabledViews?.table ?? true
                                ? 'bg-primary/5 border-primary/30 shadow-sm'
                                : 'bg-muted/20 border-border/30 opacity-60'
                            }`}>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">Режим "Список"</span>
                                    {(settings.enabledViews?.table ?? true) && (
                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                                            Активен
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Задачи группируются по настраиваемым блокам</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.enabledViews?.table ?? true}
                                onChange={(e) => {
                                    if (!e.target.checked && !(settings.enabledViews?.kanban ?? true)) return;
                                    updateSettings({
                                        enabledViews: {
                                            table: e.target.checked,
                                            kanban: settings.enabledViews?.kanban ?? true
                                        }
                                    });
                                }}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                        </label>
                        <label className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border-2 ${settings.enabledViews?.kanban ?? true
                                ? 'bg-primary/5 border-primary/30 shadow-sm'
                                : 'bg-muted/20 border-border/30 opacity-60'
                            }`}>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">Режим "Канбан"</span>
                                    {(settings.enabledViews?.kanban ?? true) && (
                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                                            Активен
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Задачи отображаются в виде колонок по статусам</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.enabledViews?.kanban ?? true}
                                onChange={(e) => {
                                    if (!e.target.checked && !(settings.enabledViews?.table ?? true)) return;
                                    updateSettings({
                                        enabledViews: {
                                            table: settings.enabledViews?.table ?? true,
                                            kanban: e.target.checked
                                        }
                                    });
                                }}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                        </label>
                    </div>
                </div>
            </section>

            {/* Настройки режима "Список" */}
            {(settings.enabledViews?.table ?? true) && (
                <>
                    <section className="space-y-4 pl-6 border-l-4 border-primary/30">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                <LayoutList className="w-5 h-5" />
                                Настройки режима "Список"
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Эти настройки применяются только в режиме "Список"
                            </p>
                        </div>
                    </section>

                    {/* Шаблон отображения */}
                    <section className="space-y-4 pl-6">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Kanban className="w-4 h-4" />
                            Шаблон отображения
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {layouts.map((layout) => (
                                <button
                                    key={layout.id}
                                    onClick={() => updateSettings({ layout: layout.id as any })}
                                    className={`glass-card p-6 rounded-xl text-left transition-all hover:scale-[1.02] border-2 ${settings.layout === layout.id
                                            ? 'border-primary bg-primary/5 shadow-sm'
                                            : 'border-border/30 hover:border-primary/20'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-3 bg-background rounded-lg shadow-sm">
                                            <layout.icon className={`w-6 h-6 ${settings.layout === layout.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                        </div>
                                        {settings.layout === layout.id && (
                                            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                                                Активен
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-foreground mb-2">{layout.name}</h4>
                                    <p className="text-sm text-muted-foreground">{layout.description}</p>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Отображение колонок */}
                    <section className="space-y-4 pl-6">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <List className="w-4 h-4" />
                            Отображение колонок
                        </h3>
                        <div className="glass-card p-6 rounded-xl border border-border/40">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {columns.map((col) => (
                                    <label key={col.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border/50">
                                        <input
                                            type="checkbox"
                                            checked={settings.visibleColumns[col.id as keyof typeof settings.visibleColumns]}
                                            onChange={(e) => updateSettings({
                                                visibleColumns: {
                                                    ...settings.visibleColumns,
                                                    [col.id]: e.target.checked
                                                }
                                            })}
                                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-foreground">{col.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Блоки задач */}
                    <section className="space-y-4 pl-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <AlignVerticalJustifyStart className="w-4 h-4" />
                                Блоки задач
                            </h3>
                            <button
                                onClick={() => updateSettings({
                                    taskBlocks: [
                                        ...settings.taskBlocks,
                                        { id: crypto.randomUUID(), title: 'Новый блок', statuses: [], color: 'gray' }
                                    ]
                                })}
                                className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Добавить блок
                            </button>
                        </div>

                        <div className="space-y-4">
                            {settings.taskBlocks.map((block, index) => (
                                <div key={block.id} className="glass-card p-4 rounded-xl border border-border/40 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="text"
                                            value={block.title}
                                            onChange={(e) => {
                                                const newBlocks = [...settings.taskBlocks];
                                                newBlocks[index].title = e.target.value;
                                                updateSettings({ taskBlocks: newBlocks });
                                            }}
                                            className="flex-1 bg-transparent border-b border-border focus:border-primary outline-none px-2 py-1 font-medium"
                                            placeholder="Название блока"
                                        />
                                        <select
                                            value={block.color}
                                            onChange={(e) => {
                                                const newBlocks = [...settings.taskBlocks];
                                                newBlocks[index].color = e.target.value as any;
                                                updateSettings({ taskBlocks: newBlocks });
                                            }}
                                            className="bg-muted border border-border rounded-md px-2 py-1 text-sm"
                                        >
                                            <option value="blue">Синий</option>
                                            <option value="yellow">Желтый</option>
                                            <option value="green">Зеленый</option>
                                            <option value="red">Красный</option>
                                            <option value="purple">Фиолетовый</option>
                                            <option value="gray">Серый</option>
                                        </select>
                                        <button
                                            onClick={() => {
                                                const newBlocks = settings.taskBlocks.filter(b => b.id !== block.id);
                                                updateSettings({ taskBlocks: newBlocks });
                                            }}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="Удалить блок"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </button>
                                    </div>

                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2">Статусы в этом блоке:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { id: 'NEW', label: 'Новая' },
                                                { id: 'IN_PROGRESS', label: 'В работе' },
                                                { id: 'REVIEW', label: 'На проверке' },
                                                { id: 'DONE', label: 'Готово' }
                                            ].map((status) => (
                                                <label key={status.id} className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={block.statuses.includes(status.id)}
                                                        onChange={(e) => {
                                                            const newBlocks = [...settings.taskBlocks];
                                                            if (e.target.checked) {
                                                                newBlocks[index].statuses.push(status.id);
                                                            } else {
                                                                newBlocks[index].statuses = newBlocks[index].statuses.filter(s => s !== status.id);
                                                            }
                                                            updateSettings({ taskBlocks: newBlocks });
                                                        }}
                                                        className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
                                                    />
                                                    <span className="text-sm">{status.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
