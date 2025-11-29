'use client';

import { useAuth } from '@/contexts/auth-context';
import { Plus, Upload, FileText, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';

export default function Home() {
  const { user } = useAuth();
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Добро пожаловать, {user?.name || 'Гость'}! 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Вот обзор ваших задач и активности на сегодня.
        </p>
      </header>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 glass-card rounded-xl hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Всего задач</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{stats?.totalTasks || 0}</h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full text-blue-500 border border-blue-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="p-6 glass-card rounded-xl hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">В работе</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{stats?.activeTasks || 0}</h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-full text-yellow-500 border border-yellow-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="p-6 glass-card rounded-xl hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Часов сегодня</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{stats?.totalHoursToday || 0}</h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full text-green-500 border border-green-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="p-6 glass-card rounded-xl hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Клиенты</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{stats?.totalClients || 0}</h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-full text-purple-500 border border-purple-500/20">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>
        <div className="flex gap-4">
          <Link href="/tasks" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm">
            <Plus className="w-4 h-4" />
            Новая задача
          </Link>
          <Link href="/reports" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium shadow-sm">
            <FileText className="w-4 h-4" />
            Создать отчет
          </Link>
          <Link href="/files" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium shadow-sm">
            <Upload className="w-4 h-4" />
            Загрузить файл
          </Link>
        </div>
      </div>
    </div>
  );
}


