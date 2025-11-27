'use client';

import { Plus } from 'lucide-react';

export default function ClientsPage() {
    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your clients and contacts.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    New Client
                </button>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Placeholder Client Card */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Client Alpha</h3>
                    <p className="text-sm text-gray-500 mt-1">contact@alpha.com</p>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between text-sm">
                        <span className="text-gray-500">Active Projects</span>
                        <span className="font-medium">3</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
