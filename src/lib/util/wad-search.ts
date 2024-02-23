import { browser } from '$app/environment';
import { getWorker } from './worker-helper';
import type { SearchResult } from '../workers/search-thread';

const workerPromise = getWorker<{
    searchWads(searchQuery: string, limit?: number): Promise<SearchResult>
}>(() => import('./search-thread?worker'));

export async function searchWads(searchQuery: string, limit = 1000): Promise<SearchResult> {
    if (!browser) {
        throw new Error('Cannot call searchWads in server');
    }

    console.time('Search for ' + searchQuery);
    const results = await (await workerPromise)!.searchWads(searchQuery, limit);
    console.timeEnd('Search for ' + searchQuery);

    return results;
}
