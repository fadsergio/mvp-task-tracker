import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

export const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - добавляем токен к каждому запросу
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - обрабатываем ошибки и обновляем токены
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Если 401 и это не повторный запрос
        if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const userId = localStorage.getItem('user_id');

                if (refreshToken && userId) {
                    const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
                        userId,
                        refreshToken,
                    });

                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('refresh_token', data.refresh_token);

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                    }

                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Если refresh не удался - выходим
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_id');
                if (typeof window !== 'undefined') {
                    window.location.href = '/auth/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        return data;
    },

    register: async (email: string, password: string, name: string) => {
        const { data } = await api.post('/auth/register', {
            email,
            password,
            name,
            tenantId: 'default',
            role: 'EXECUTOR'
        });
        return data;
    },

    logout: async (userId: string) => {
        await api.post('/auth/logout', { userId });
    },
};

// Files API
export const filesApi = {
    upload: async (file: File, taskId?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        if (taskId) formData.append('taskId', taskId);

        const { data } = await api.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    list: async () => {
        const { data } = await api.get('/files');
        return data;
    },

    delete: async (id: string) => {
        await api.delete(`/files/${id}`);
    },
};

// Reports API
export const reportsApi = {
    getTimeReport: async (params: {
        groupBy?: 'client' | 'user';
        dateFrom?: string;
        dateTo?: string;
        clientId?: string;
        userId?: string;
    }) => {
        const { data } = await api.get('/reports/time', { params });
        return data;
    },

    exportCSV: async (params: {
        groupBy?: 'client' | 'user';
        dateFrom?: string;
        dateTo?: string;
    }) => {
        const response = await api.get('/reports/time', {
            params: { ...params, export: 'csv' },
            responseType: 'blob',
        });

        // Создаем ссылку для скачивания
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `time-report-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },
};

// Clients API
export const clientsApi = {
    getAll: async () => {
        const { data } = await api.get('/clients');
        return data;
    },

    create: async (data: { name: string; email?: string; phone?: string }) => {
        const response = await api.post('/clients', data);
        return response.data;
    },

    update: async (id: string, data: { name?: string; email?: string; phone?: string }) => {
        const response = await api.patch(`/clients/${id}`, data);
        return response.data;
    },
};

// Users API
export const usersApi = {
    getAll: async () => {
        const { data } = await api.get('/users');
        return data;
    },

    invite: async (data: { email: string; role: string; name?: string }) => {
        // В MVP используем register, так как invite флоу сложнее
        const { data: response } = await api.post('/auth/register', {
            ...data,
            password: 'Password123!', // Временный пароль для MVP
            tenantId: 'default',
        });
        return response;
    },

    updateRole: async (id: string, role: string) => {
        const { data } = await api.patch(`/users/${id}/role`, { role });
        return data;
    },

    update: async (id: string, data: { name?: string; email?: string; avatar?: string }) => {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    },
};

// Tasks API
export const tasksApi = {
    getAll: async () => {
        const { data } = await api.get('/tasks');
        return data;
    },

    create: async (data: any) => {
        const response = await api.post('/tasks', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/tasks/${id}`, data);
        return response.data;
    },
};

export default api;
