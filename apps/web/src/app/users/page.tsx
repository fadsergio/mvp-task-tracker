'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { Users, Plus, Mail, Shield, Loader2 } from 'lucide-react';
import UserModal from '@/components/user-modal';

export default function UsersPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

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

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Сотрудники</h1>
                    <p className="text-muted-foreground">Управление командой и доступом.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Пригласить сотрудника
                </button>
            </header>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-md">
                    Ошибка загрузки сотрудников. Попробуйте обновить страницу.
                </div>
            ) : users?.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-border p-8 text-center">
                    <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">Команда пуста</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                        Пригласите коллег, чтобы начать совместную работу.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {users.map((user: any) => (
                        <div
                            key={user.id}
                            onClick={() => handleEdit(user)}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-300">
                                            {user.name?.[0] || user.email[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-foreground">{user.name || 'Без имени'}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground mt-4">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {user.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    ID: {user.id.slice(0, 8)}...
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <UserModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                user={selectedUser}
            />
        </div>
    );
}
