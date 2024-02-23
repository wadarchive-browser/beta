import { browser } from '$app/environment';
import { wrap } from 'comlink';

export type WorkerConstructor = {
    new (options?: { name?: string }): Worker
}

export async function getWorker<T>(workerImport: () => Promise<{default: WorkerConstructor}>) {
    if (browser) {
        // https://medium.com/geekculture/sveltekit-web-worker-8cfc0c86abf6
        const worker = new ((await workerImport()).default)();

        return wrap<T>(worker);
    }
}