'use client';

import { Settings } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Настройки</h1>
                <p className="text-muted-foreground">Управление профилем и настройками приложения.</p>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-border p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <Settings className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-foreground">Общие настройки</h3>
                        <p className="text-sm text-muted-foreground">Измените основные параметры вашего аккаунта.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-md border border-border">
                        <p className="text-sm text-muted-foreground">Настройки пока недоступны в MVP версии.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
