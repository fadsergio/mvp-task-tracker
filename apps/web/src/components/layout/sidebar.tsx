'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Users, Briefcase, FileText, Settings, FolderOpen, UserPlus, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function Sidebar() {
    const pathname = usePathname();
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);



    useEffect(() => {
        setMounted(true);
    }, []);

    const links = [
        { href: '/', label: 'Главная', icon: LayoutDashboard },
        { href: '/tasks', label: 'Задачи', icon: CheckSquare },
        { href: '/clients', label: 'Клиенты', icon: Users },
        { href: '/reports', label: 'Отчеты', icon: BarChart },
        { href: '/files', label: 'Файлы', icon: FolderOpen },
        { href: '/users', label: 'Команда', icon: UserPlus },
        { href: '/settings', label: 'Настройки', icon: Settings },
    ];

    return (
        <aside className="w-64 border-r border-border/40 bg-muted/10 hidden md:block">
            <div className="p-4 space-y-2">
                {mounted && links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                            {link.label}
                        </Link>
                    );
                })}
            </div>

        </aside>
    );
}
