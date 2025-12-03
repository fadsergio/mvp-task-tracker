'use client';

import { useTaskSettings } from '@/hooks/use-task-settings';
import { LayoutList, Kanban, AlignVerticalJustifyStart, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tasksApi } from '@/lib/api';
import { useState } from 'react';

export default function SettingsPage() {
    const { settings, updateSettings } = useTaskSettings();
    const { t } = useTranslation();

    const columns = [
        { id: 'priority', label: t('settings.col_priority') },
        { id: 'project', label: t('settings.col_project') },
        { id: 'participants', label: t('settings.col_participants') },
        { id: 'dueDate', label: t('settings.col_dueDate') },
        { id: 'spentTime', label: t('settings.col_spentTime') },
    ];

    const layouts = [
        {
            id: 'standard',
            name: t('settings.layout_standard'),
            description: t('settings.layout_standard_desc'),
            icon: LayoutList
        },
        {
            id: 'split',
            name: t('settings.layout_split'),
            description: t('settings.layout_split_desc'),
            icon: Kanban
        },
        {
            id: 'priority',
            name: t('settings.layout_blocks'),
            description: t('settings.layout_blocks_desc'),
            icon: AlignVerticalJustifyStart
        }
    ];

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-12">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('settings.title')}</h1>
                <p className="text-muted-foreground">{t('settings.subtitle')}</p>
            </header>

            {/* Режимы отображения */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <LayoutList className="w-5 h-5" />
                    {t('settings.view_modes')}
                </h2>
                <div className="glass-card p-6 rounded-xl border border-border/40">
                    <p className="text-sm text-muted-foreground mb-4">
                        {t('settings.view_modes_desc')}
                    </p>
                    <div className="space-y-3">
                        <label className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border-2 ${settings.enabledViews?.table ?? true
                            ? 'bg-primary/5 border-primary/30 shadow-sm'
                            : 'bg-muted/20 border-border/30 opacity-60'
                            }`}>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">{t('settings.mode_list')}</span>
                                    {(settings.enabledViews?.table ?? true) && (
                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                                            {t('settings.active')}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{t('settings.mode_list_desc')}</p>
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
                                    <span className="text-sm font-semibold text-foreground">{t('settings.mode_kanban')}</span>
                                    {(settings.enabledViews?.kanban ?? true) && (
                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                                            {t('settings.active')}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{t('settings.mode_kanban_desc')}</p>
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
                                {t('settings.list_settings')}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t('settings.list_settings_desc')}
                            </p>
                        </div>
                    </section>

                    {/* Шаблон отображения */}
                    <section className="space-y-4 pl-6">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Kanban className="w-4 h-4" />
                            {t('settings.layout_template')}
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
                                                {t('settings.active')}
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
                            {t('settings.columns')}
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

                    {/* Кастомные колонки */}
                    <section className="space-y-4 pl-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <List className="w-4 h-4" />
                                Кастомные колонки
                            </h3>
                            <button
                                onClick={() => updateSettings({
                                    customColumns: [
                                        ...(settings.customColumns || []),
                                        { id: crypto.randomUUID(), title: 'Новая колонка', type: 'text' }
                                    ]
                                })}
                                className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Добавить колонку
                            </button>
                        </div>

                        <div className="space-y-4">
                            {settings.customColumns?.map((column, index) => (
                                <div key={column.id} className="glass-card p-4 rounded-xl border border-border/40 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="text"
                                            value={column.title}
                                            onChange={(e) => {
                                                const newColumns = [...settings.customColumns];
                                                newColumns[index].title = e.target.value;
                                                updateSettings({ customColumns: newColumns });
                                            }}
                                            className="flex-1 bg-transparent border-b border-border focus:border-primary outline-none px-2 py-1 font-medium"
                                            placeholder="Название колонки"
                                        />
                                        <select
                                            value={column.type}
                                            onChange={(e) => {
                                                const newColumns = [...settings.customColumns];
                                                newColumns[index].type = e.target.value as any;
                                                updateSettings({ customColumns: newColumns });
                                            }}
                                            className="bg-muted border border-border rounded-md px-2 py-1 text-sm"
                                        >
                                            <option value="text">Текст</option>
                                            <option value="number">Число</option>
                                            <option value="date">Дата</option>
                                            <option value="select">Выбор</option>
                                        </select>
                                        <button
                                            onClick={() => {
                                                const newColumns = settings.customColumns.filter(c => c.id !== column.id);
                                                updateSettings({ customColumns: newColumns });
                                            }}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="Удалить"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </button>
                                    </div>

                                    {column.type === 'select' && (
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-2">Варианты выбора (через запятую)</p>
                                            <input
                                                type="text"
                                                value={column.options?.join(', ') || ''}
                                                onChange={(e) => {
                                                    const newColumns = [...settings.customColumns];
                                                    newColumns[index].options = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                                    updateSettings({ customColumns: newColumns });
                                                }}
                                                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm"
                                                placeholder="Вариант 1, Вариант 2, Вариант 3"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                </>
            )}

            {/* Импорт проектов */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-import"><path d="M12 3v12" /><path d="m8 11 4 4 4-4" /><path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" /></svg>
                    {t('settings.import_projects', 'Импорт задач')}
                </h2>
                <div className="glass-card p-6 rounded-xl border border-border/40">
                    <p className="text-sm text-muted-foreground mb-4">
                        {t('settings.import_desc', 'Загрузите файл JSON или CSV для импорта задач. Система автоматически распознает поля.')}
                    </p>

                    <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:bg-muted/30 transition-colors">
                        <input
                            type="file"
                            accept=".json,.csv"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                try {
                                    // @ts-ignore
                                    const { tasksApi } = await import('@/lib/api');
                                    await tasksApi.import(file);
                                    alert('Задачи успешно импортированы!');
                                    window.location.reload();
                                } catch (error) {
                                    console.error(error);
                                    alert('Ошибка при импорте файла');
                                }
                            }}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                            </div>
                            <span className="font-medium text-foreground">Нажмите для загрузки файла</span>
                            <span className="text-xs text-muted-foreground">JSON или CSV</span>
                        </label>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                        <p>Поддерживаемые поля: title, description, priority, assigneeEmail, dueDate, spentTime</p>
                    </div>
                </div>
            </section>

            {/* Настройки таблицы */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <List className="w-5 h-5" />
                    Настройки таблицы
                </h2>
                <div className="glass-card p-6 rounded-xl border border-border/40 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Строк на странице
                        </label>
                        <select
                            value={settings.tableSettings?.rowsPerPage || 25}
                            onChange={(e) => updateSettings({
                                tableSettings: {
                                    ...settings.tableSettings,
                                    rowsPerPage: parseInt(e.target.value) as 10 | 25 | 50 | 100,
                                }
                            })}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Уведомления */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                    Уведомления
                </h2>
                <div className="glass-card p-6 rounded-xl border border-border/40 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Настройки уведомлений (функция в разработке)
                    </p>
                    <div className="space-y-3 opacity-50 pointer-events-none">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                disabled
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-foreground">Уведомления о новых задачах</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                disabled
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-foreground">Напоминания о дедлайнах</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                disabled
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-foreground">Уведомления об упоминаниях</span>
                        </label>
                    </div>
                </div>
            </section>
        </div>
    );
}
