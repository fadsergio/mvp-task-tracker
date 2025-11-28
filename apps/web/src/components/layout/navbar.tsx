'use client';

import Link from 'next/link';
import { User, Bell, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/theme-toggle';
import ProfileModal from '@/components/profile-modal';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const router = useRouter();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push('/auth/login');
    };

    return (
        <>
            <nav className="h-16 border-b border-border flex items-center justify-between px-6 bg-background">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            <CheckSquare className="w-5 h-5" />
                        </div>
                        TaskTracker
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <ThemeToggle />
                            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="flex items-center gap-3 pl-4 border-l border-border">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-foreground">{user?.name || 'User'}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                                </div>
                                <button
                                    onClick={() => setIsProfileModalOpen(true)}
                                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors overflow-hidden"
                                    title="Редактировать профиль"
                                >
                                    {(user as any)?.avatar ? (
                                        <img
                                            src={(user as any).avatar}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-muted-foreground hover:text-red-600 transition-colors"
                                    title="Выйти"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            <LogIn className="w-4 h-4" />
                            Войти
                        </Link>
                    )}
                </div>
            </nav>
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </>
    );
}

function CheckSquare({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
    );
}

