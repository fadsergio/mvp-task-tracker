import Link from 'next/link';
import { User, Bell } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-gray-950">
            <div className="flex items-center gap-4">
                <Link href="/" className="text-xl font-bold tracking-tight">
                    TaskTracker
                </Link>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                    <Bell className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                </div>
            </div>
        </nav>
    );
}
