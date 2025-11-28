'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '@/lib/api';
import { Building2, Plus, Mail, Phone, Loader2, Edit } from 'lucide-react';
import ClientModal from '@/components/client-modal';

export default function ClientsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);

    const { data: clients, isLoading, error } = useQuery({
        queryKey: ['clients'],
        queryFn: clientsApi.getAll,
    });

    const handleEdit = (client: any) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedClient(null);
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Клиенты</h1>
                    <p className="text-muted-foreground">Управление клиентами и проектами.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Новый клиент
                </button>
            </header>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-md">
                    Ошибка загрузки клиентов. Попробуйте обновить страницу.
                </div>
            ) : clients?.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-border p-8 text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">Нет клиентов</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                        Создайте первого клиента, чтобы начать отслеживать задачи и время.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {clients.map((client: any) => (
                        <div key={client.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow group relative">
                            <button
                                onClick={() => handleEdit(client)}
                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary/80"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <Building2 className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2 pr-8">{client.name}</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                {client.contact?.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        {client.contact.email}
                                    </div>
                                )}
                                {client.contact?.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        {client.contact.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
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

