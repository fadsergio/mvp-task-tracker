'use client';

import { useState } from 'react';
import { Plus, LayoutList, Kanban } from 'lucide-react';

export default function TasksPage() {
    const [view, setView] = useState<'table' | 'kanban'>('table');

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your tasks and projects.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button
                            onClick={() => setView('table')}
                            className={`p-2 rounded-md ${view === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setView('kanban')}
                            className={`p-2 rounded-md ${view === 'kanban' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
                        >
                            <Kanban className="w-4 h-4" />
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus className="w-4 h-4" />
                        New Task
                    </button>
                </div>
            </header>

            {view === 'table' ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-500">Title</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Priority</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Assignee</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Due Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {/* Placeholder rows */}
                            <tr>
                                <td className="px-6 py-4">Design Homepage</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">In Progress</span></td>
                                <td className="px-6 py-4"><span className="text-red-500 font-medium">High</span></td>
                                <td className="px-6 py-4">Executor One</td>
                                <td className="px-6 py-4">Today</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
                    {['NEW', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((status) => (
                        <div key={status} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col gap-3">
                            <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider">{status.replace('_', ' ')}</h3>
                            {/* Placeholder Card */}
                            <div className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm border border-gray-200 dark:border-gray-600">
                                <p className="font-medium">Task Title</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
