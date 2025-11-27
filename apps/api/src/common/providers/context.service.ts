import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class ContextService {
    private static readonly als = new AsyncLocalStorage<Map<string, any>>();

    static run(callback: () => void) {
        this.als.run(new Map(), callback);
    }

    static set(key: string, value: any) {
        const store = this.als.getStore();
        if (store) {
            store.set(key, value);
        }
    }

    static get<T>(key: string): T | undefined {
        const store = this.als.getStore();
        return store?.get(key);
    }
}
