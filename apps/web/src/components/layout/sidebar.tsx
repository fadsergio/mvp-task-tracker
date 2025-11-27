import Link from 'next/link';
import { LayoutDashboard, CheckSquare, Users, Building2, FileText, Settings } from 'lucide-react';

const links = [
    { href: '/', label: 'Today', icon: LayoutDashboard },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/clients', label: 'Clients', icon: Building2 },
    { href: '/users', label: 'Users', icon: Users },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
    return (
        <aside className="w-64 border-r border-gray-200 dark:border-gray-800 h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950 p-4">
            <div className="space-y-1">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <link.icon className="w-5 h-5" />
                        {link.label}
                    </Link>
                ))}
            </div>
        </aside>
    );
}
