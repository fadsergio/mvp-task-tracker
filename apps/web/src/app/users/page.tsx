'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { Users, Plus, Mail, Shield, Loader2, LayoutGrid, List } from 'lucide-react';
import UserModal from '@/components/user-modal';
import { useTranslation } from 'react-i18next';

export default function UsersPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const { t } = useTranslation();

    const { data: users, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: usersApi.getAll,
    });

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'MANAGER': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        }
    };

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const getRoleName = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'Администратор';
            case 'MANAGER': return 'Менеджер';
            default: return 'Сотрудник';
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Команда</h1>
                    <p className="text-gray-900 dark:text-gray-400">Управление сотрудниками и их ролями.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-muted p-1 rounded-lg">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 rounded-md transition-all ${view === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-md transition-all ${view === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Пригласить сотрудника
                    </button>
                </div>
            </header>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-500/10 text-red-600 border border-red-500/20 rounded-md">
                    Ошибка загрузки.
                </div>
            ) : users?.length === 0 ? (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">Нет сотрудников</h3>
                    <p className="text-gray-900 dark:text-gray-400 mt-2 max-w-sm mx-auto">
                        Пригласите первого сотрудника в свою команду.
                    </p>
                </div>
            ) : (
                view === 'grid' ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {users.map((user: any) => (
                            <div
                                key={user.id}
                                onClick={() => handleEdit(user)}
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:scale-[1.02] transition-all duration-200 cursor-pointer group border border-gray-200 dark:border-gray-700"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-300 ring-2 ring-white/10">
                                                {user.name?.[0] || user.email[0].toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{user.name || 'Имя'}</h3>
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                user.role === 'MANAGER' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                    'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                }`}>
                                                {getRoleName(user.role)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2.5 text-sm text-gray-900 dark:text-gray-300 mt-2">
                                    <div className="flex items-center gap-2.5 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                        <Mail className="w-4 h-4 text-primary/70" />
                                        {user.email}
                                    </div>
                                    <div className="flex items-center gap-2.5 opacity-70">
                                        <Shield className="w-4 h-4 text-primary/70" />
                                        ID: {user.id.slice(0, 8)}...
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Сотрудник</th>
                                    <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Email</th>
                                    <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Роль</th>
                                    <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map((user: any) => (
                                    <tr
                                        key={user.id}
                                        onClick={() => handleEdit(user)}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold">
                                                    {user.name?.[0] || user.email[0].toUpperCase()}
                                                </div>
                                            )}
                                            {user.name || 'Имя'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-300">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                user.role === 'MANAGER' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                    'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                }`}>
                                                {getRoleName(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                                            {user.id.slice(0, 8)}...
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            <UserModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                user={selectedUser}
            />
        </div>
    );
}
