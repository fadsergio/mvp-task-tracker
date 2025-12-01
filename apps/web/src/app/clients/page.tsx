'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '@/lib/api';
import { Building2, Plus, Mail, Phone, Loader2, Edit, LayoutGrid, List } from 'lucide-react';
import ClientModal from '@/components/client-modal';

export default function ClientsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: clientsData, isLoading, error } = useQuery({
        queryKey: ['clients'],
        queryFn: clientsApi.getAll,
    });

    const clients = clientsData?.filter((client: any) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.contact?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (client: any) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedClient(null);
    };

    const [view, setView] = useState<'grid' | 'list'>('grid');

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Клиенты</h1>
                    <p className="text-gray-900">Управление клиентами и проектами.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Поиск клиентов..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-3 pr-4 py-2 border border-border rounded-md text-sm bg-background w-64 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
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
                        Новый клиент
                    </button>
                </div>
            </header>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-500/10 text-red-600 border border-red-500/20 rounded-md">
                    Ошибка загрузки клиентов. Попробуйте обновить страницу.
                </div>
            ) : clients?.length === 0 ? (
                <div className="bg-gray-100 rounded-lg p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900">Нет клиентов</h3>
                    <p className="text-gray-900 mt-2 max-w-sm mx-auto">
                        Создайте первого клиента, чтобы начать отслеживать задачи и время.
                    </p>
                </div>
            ) : view === 'grid' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {clients.map((client: any) => (
                        <div key={client.id} className="bg-white rounded-xl p-6 hover:scale-[1.02] transition-all duration-200 group relative border border-gray-200">
                            <button
                                onClick={() => handleEdit(client)}
                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-blue-600"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/20">
                                    <Building2 className="w-6 h-6 text-blue-500" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 pr-8">{client.name}</h3>
                            <div className="space-y-2.5 text-sm text-gray-900">
                                {client.contact?.email && (
                                    <div className="flex items-center gap-2.5">
                                        <Mail className="w-4 h-4 text-primary/70" />
                                        {client.contact.email}
                                    </div>
                                )}
                                {client.contact?.phone && (
                                    <div className="flex items-center gap-2.5">
                                        <Phone className="w-4 h-4 text-primary/70" />
                                        {client.contact.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-900">Название</th>
                                <th className="px-6 py-4 font-medium text-gray-900">Email</th>
                                <th className="px-6 py-4 font-medium text-gray-900">Телефон</th>
                                <th className="px-6 py-4 font-medium text-gray-900"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {clients.map((client: any) => (
                                <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <Building2 className="w-4 h-4 text-blue-500" />
                                        </div>
                                        {client.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">{client.contact?.email || '-'}</td>
                                    <td className="px-6 py-4 text-gray-900">{client.contact?.phone || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleEdit(client)}
                                            className="text-gray-500 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ClientModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                client={selectedClient}
            />
        </div>
    );
}

