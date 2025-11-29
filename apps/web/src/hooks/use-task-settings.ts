import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TaskLayout = 'standard' | 'split' | 'priority';

export interface TaskBlock {
    id: string;
    title: string;
    statuses: string[];
    color: 'blue' | 'yellow' | 'green' | 'red' | 'purple' | 'gray';
}

export interface TaskSettings {
    layout: TaskLayout;
    enabledViews: {
        table: boolean;
        kanban: boolean;
    };
    visibleColumns: {
        status: boolean;
        priority: boolean;
        project: boolean;
        participants: boolean;
        dueDate: boolean;
        spentTime: boolean;
    };
    taskBlocks: TaskBlock[];
}

interface TaskSettingsStore {
    settings: TaskSettings;
    isLoaded: boolean;
    updateSettings: (updates: Partial<TaskSettings>) => void;
}

const defaultSettings: TaskSettings = {
    layout: 'standard',
    enabledViews: {
        table: true,
        kanban: true,
    },
    visibleColumns: {
        status: true,
        priority: true,
        project: true,
        participants: true,
        dueDate: true,
        spentTime: true,
    },
    taskBlocks: [
        { id: '1', title: 'Новые задачи', statuses: ['NEW'], color: 'blue' },
        { id: '2', title: 'В работе', statuses: ['IN_PROGRESS'], color: 'yellow' },
        { id: '3', title: 'На проверке', statuses: ['REVIEW'], color: 'purple' },
        { id: '4', title: 'Завершено', statuses: ['DONE'], color: 'green' },
    ],
};

export const useTaskSettings = create<TaskSettingsStore>()(
    persist(
        (set) => ({
            settings: defaultSettings,
            isLoaded: false,
            updateSettings: (updates) =>
                set((state) => ({
                    settings: { ...state.settings, ...updates },
                })),
        }),
        {
            name: 'task-settings',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.isLoaded = true;
                }
            },
        }
    )
);
