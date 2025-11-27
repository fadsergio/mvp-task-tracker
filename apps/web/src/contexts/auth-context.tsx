'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
    id: string;
    email: string;
    name?: string;
    role: string;
    tenantId: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Проверяем наличие токена при загрузке
        const checkAuth = () => {
            const token = localStorage.getItem('access_token');
            const userStr = localStorage.getItem('user');

            if (token && userStr) {
                try {
                    setUser(JSON.parse(userStr));
                } catch (error) {
                    console.error('Failed to parse user data:', error);
                    localStorage.removeItem('user');
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const data = await authApi.login(email, password);

            // Сохраняем токены
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);

            // Декодируем JWT для получения user data (простой способ)
            const payload = JSON.parse(atob(data.access_token.split('.')[1]));
            const userData: User = {
                id: payload.sub,
                email: payload.email,
                role: payload.role || 'EXECUTOR',
                tenantId: payload.tenantId,
                name: payload.name,
            };

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('user_id', userData.id);
            setUser(userData);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (email: string, password: string, name: string) => {
        try {
            const data = await authApi.register(email, password, name);

            // После регистрации автоматически логинимся
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);

            const payload = JSON.parse(atob(data.access_token.split('.')[1]));
            const userData: User = {
                id: payload.sub,
                email: payload.email,
                role: payload.role || 'EXECUTOR',
                tenantId: payload.tenantId,
                name: payload.name || name,
            };

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('user_id', userData.id);
            setUser(userData);
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            if (user) {
                await authApi.logout(user.id);
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            // Очищаем все данные
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('user_id');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
