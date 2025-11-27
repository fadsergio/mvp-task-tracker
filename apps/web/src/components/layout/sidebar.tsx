'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Users, Building2, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
    { href: '/', label: 'Главная', icon: LayoutDashboard },
    { href: '/tasks', label: 'Задачи', icon: CheckSquare },
    { href: '/clients', label: 'Клиенты', icon: Building2 },
    { href: '/users', label: 'Сотрудники', icon: Users },
    { href: '/reports', label: 'Отчеты', icon: FileText },
    { href: '/settings', label: 'Настройки', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r border-border h-[calc(100vh-4rem)] bg-muted/10 p-4 hidden md:block">
            <div className="space-y-1">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <link.icon className="w-5 h-5" />
                            {link.label}
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
}

