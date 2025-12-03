import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TaskLayout = 'standard' | 'split' | 'priority';

export interface TaskBlock {
    id: string;
    title: string;
    status?: string;
    color: 'blue' | 'yellow' | 'green' | 'red' | 'purple' | 'gray';
}

export interface CustomColumn {
    id: string;
    title: string;
    type: 'text' | 'number' | 'select' | 'date';
    options?: string[];
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
    customColumns: CustomColumn[];
    tableSettings: {
        rowsPerPage: 10 | 25 | 50 | 100;
        defaultSort: { field: string; order: 'asc' | 'desc' };
    };
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
        { id: 'todo', title: 'К выполнению', status: 'TODO', color: 'blue' },
        { id: 'in_progress', title: 'В работе', status: 'IN_PROGRESS', color: 'yellow' },
        { id: 'done', title: 'Выполнено', status: 'DONE', color: 'green' },
    ],
    customColumns: [],
    tableSettings: {
        rowsPerPage: 25,
        defaultSort: { field: 'createdAt', order: 'desc' },
    },
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
            version: 1,
            migrate: (persistedState: any, version) => {
                if (version === 0 || !version) {
                    // Reset taskBlocks if migrating from version 0 (or no version)
                    return {
                        ...persistedState,
                        taskBlocks: defaultSettings.taskBlocks,
                        visibleColumns: defaultSettings.visibleColumns,
                    };
                }
                return persistedState;
            },
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.isLoaded = true;
                }
            },
        }
    )
);
