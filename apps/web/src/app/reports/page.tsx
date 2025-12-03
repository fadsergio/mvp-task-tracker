'use client';

import { useState, useEffect } from 'react';
import { reportsApi, clientsApi, usersApi } from '@/lib/api';
import { Download, Filter, X, FileSpreadsheet, FileText } from 'lucide-react';

export default function ReportsPage() {
    // State variables
    const [groupBy, setGroupBy] = useState<string>('client');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [includeTaskDates, setIncludeTaskDates] = useState(false);

    const [clients, setClients] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [clientDetail, setClientDetail] = useState<any>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    // Fetch filter options
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [clientsData, usersData] = await Promise.all([
                    clientsApi.getAll(),
                    usersApi.getAll()
                ]);
                setClients(clientsData);
                setUsers(usersData);
            } catch (error) {
                console.error('Failed to fetch filter options:', error);
            }
        };
        fetchFilters();
    }, []);

    // Fetch report data
    useEffect(() => {
        const fetchData = async () => {
            // Если выбран один клиент, показываем детальный вид
            if (selectedClients.length === 1) {
                setIsLoadingDetail(true);
                try {
                    const detail = await reportsApi.getClientDetail({
                        clientId: selectedClients[0],
                        dateFrom: dateFrom || undefined,
                        dateTo: dateTo || undefined,
                        priority: selectedPriorities[0] || undefined,
                    });
                    setClientDetail(detail);
                } catch (error) {
                    console.error('Failed to fetch client detail:', error);
                    setClientDetail(null);
                } finally {
                    setIsLoadingDetail(false);
                }
                return;
            }

            // Иначе показываем обычный отчет
            setClientDetail(null);
            setIsLoading(true);
            try {
                const result = await reportsApi.getTaskReport({
                    groupBy: groupBy as 'client' | 'assignee',
                    dateFrom: dateFrom || undefined,
                    dateTo: dateTo || undefined,
                    clientId: selectedClients[0] || undefined,
                    priority: selectedPriorities[0] || undefined,
                });
                setData(Array.isArray(result) ? result : []);
            } catch (error) {
                console.error('Failed to fetch report data:', error);
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [groupBy, dateFrom, dateTo, selectedClients, selectedPriorities]);

    const handleExport = async () => {
        try {
            await reportsApi.exportTaskReportCSV({
                groupBy: groupBy as 'client' | 'assignee',
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined,
                clientId: selectedClients[0] || undefined,
                priority: selectedPriorities[0] || undefined,
            });
        } catch (error) {
            console.error('Failed to export CSV:', error);
        }
    };

    const handleExportExcel = async () => {
        try {
            await reportsApi.exportExcel({
                groupBy: groupBy as 'client' | 'assignee',
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined,
                clientId: selectedClients[0] || undefined,
                priority: selectedPriorities[0] || undefined,
                includeTaskDates,
            });
        } catch (error) {
            console.error('Failed to export Excel:', error);
        }
    };

    const handleExportPDF = async () => {
        try {
            await reportsApi.exportPDF({
                groupBy: groupBy as 'client' | 'assignee',
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined,
                clientId: selectedClients[0] || undefined,
                priority: selectedPriorities[0] || undefined,
                includeTaskDates,
            });
        } catch (error) {
            console.error('Failed to export PDF:', error);
        }
    };

    const toggleClient = (clientId: string) => {
        setSelectedClients(prev =>
            prev.includes(clientId) ? prev.filter(id => id !== clientId) : [clientId]
        );
    };

    const togglePriority = (priority: string) => {
        setSelectedPriorities(prev =>
            prev.includes(priority) ? prev.filter(p => p !== priority) : [priority]
        );
    };

    const clearFilters = () => {
        setDateFrom('');
        setDateTo('');
        setSelectedClients([]);
        setSelectedPriorities([]);
    };

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortBy) return 0;

        let aVal: any, bVal: any;

        if (sortBy === 'name') {
            aVal = a.group;
            bVal = b.group;
        } else if (sortBy === 'total') {
            aVal = a.totalTasks;
            bVal = b.totalTasks;
        } else if (sortBy === 'hours') {
            aVal = a.totalHours || 0;
        } else if (sortBy === 'highPriority') {
            aVal = a.byPriority?.HIGH || 0;
            bVal = b.byPriority?.HIGH || 0;
        }

        if (typeof aVal === 'string') {
            return sortOrder === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        }

        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    const activeFiltersCount = selectedClients.length + selectedPriorities.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

    const priorities = [
        { value: 'LOW', label: 'Низкий' },
        { value: 'MEDIUM', label: 'Средний' },
        { value: 'HIGH', label: 'Высокий' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Отчеты</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${showFilters
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Фильтры
                        {activeFiltersCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-white text-blue-600 rounded-full font-medium">{activeFiltersCount}</span>
                        )}
                    </button>
                    <div className="flex gap-2">
                        <button onClick={handleExport} className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm" title="Экспорт в CSV">
                            <Download className="w-4 h-4 mr-2" />
                            CSV
                        </button>
                        <button onClick={handleExportExcel} className="flex items-center px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm" title="Экспорт в Excel">
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Excel
                        </button>
                        <button onClick={handleExportPDF} className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm" title="Экспорт в PDF">
                            <FileText className="w-4 h-4 mr-2" />
                            PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border">
                <div className="p-4">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setGroupBy('client')}
                            className={`px-3 py-2 rounded-md text-sm transition-colors ${groupBy === 'client'
                                ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            Клиенты
                        </button>
                        <button
                            onClick={() => setGroupBy('assignee')}
                            className={`px-3 py-2 rounded-md text-sm transition-colors ${groupBy === 'assignee'
                                ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            Исполнители
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="border-t p-4 bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Фильтры</h3>
                            {activeFiltersCount > 0 && (
                                <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                    <X className="w-3 h-3" />
                                    Очистить
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase block mb-2">Период</label>
                                <div className="space-y-2">
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        placeholder="С"
                                        className="w-full px-3 py-1.5 text-sm border rounded-md"
                                    />
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        placeholder="По"
                                        className="w-full px-3 py-1.5 text-sm border rounded-md"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase block mb-2">Клиенты</label>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {clients.map(client => (
                                        <label key={client.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                checked={selectedClients.includes(client.id)}
                                                onChange={() => toggleClient(client.id)}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{client.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase block mb-2">Приоритеты</label>
                                <div className="space-y-1">
                                    {priorities.map(priority => (
                                        <label key={priority.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                checked={selectedPriorities.includes(priority.value)}
                                                onChange={() => togglePriority(priority.value)}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{priority.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase block mb-2">Настройки отчета</label>
                                <div className="space-y-1">
                                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={includeTaskDates}
                                            onChange={(e) => setIncludeTaskDates(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Добавлять даты задач</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border">
                {isLoadingDetail ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : clientDetail ? (
                    <div className="p-6 space-y-6">
                        {/* Статистика клиента */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Статистика клиента</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{clientDetail.stats.total}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Всего задач</div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{clientDetail.stats.done}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Выполнено</div>
                                </div>
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{clientDetail.stats.inProgress}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">В работе</div>
                                </div>
                            </div>
                        </div>

                        {/* Список задач */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Задачи клиента</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Исполнитель</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Приоритет</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Часы</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата создания</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {clientDetail.tasks.map((task: any) => (
                                            <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-6 py-4 text-sm font-medium">{task.title}</td>
                                                <td className="px-6 py-4 text-sm">{task.assignees?.[0]?.name || 'Не назначен'}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs ${task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                                        task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>
                                                        {task.priority === 'HIGH' ? 'Высокий' : task.priority === 'MEDIUM' ? 'Средний' : 'Низкий'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">{task.spentTime || 0}</td>
                                                <td className="px-6 py-4 text-sm">{new Date(task.createdAt).toLocaleDateString('ru-RU')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : isLoading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">Нет данных</div>
                ) : (
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th
                                    onClick={() => handleSort('name')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <div className="flex items-center gap-1">
                                        {groupBy === 'client' ? 'Клиент' : 'Исполнитель'}
                                        {sortBy === 'name' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('total')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <div className="flex items-center gap-1">
                                        Всего задач
                                        {sortBy === 'total' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('hours')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <div className="flex items-center gap-1">
                                        Часы
                                        {sortBy === 'hours' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('highPriority')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <div className="flex items-center gap-1">
                                        Высокий приоритет
                                        {sortBy === 'highPriority' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {sortedData.map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 text-sm font-medium">
                                        {item.group}
                                    </td>
                                    <td className="px-6 py-4 text-sm">{item.totalTasks}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{(item.totalHours || 0).toFixed(1)}</td>
                                    <td className="px-6 py-4 text-sm">{item.byPriority?.HIGH || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
