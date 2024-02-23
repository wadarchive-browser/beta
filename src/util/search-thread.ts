import { WadFuzzy } from './msgpack-models';

import MiniSearch, { type AsPlainObject } from 'minisearch';

import { fetchAndParseZstd } from './wad-lookup';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { expose } from 'comlink';

interface SearchDB extends DBSchema {
    CachedData: {
        key: string;
        value: [WadFuzzy[], AsPlainObject];
    }
}

let base: string | undefined = undefined;
let dbPromise: Promise<IDBPDatabase<SearchDB>> | undefined = undefined;

class SearchEngine {

    constructor (
        private readonly haystack: MiniSearch,
        private readonly wadsFuzzy: WadFuzzy[],
    ) {
    }

    static async create() {
        const opts = {
            idField: 'realId',
            fields: ['Id', 'Md5', 'Sha256', 'Names', 'Filenames'], // fields to index for full-text search
            storeFields: undefined
        };

        let wadsFuzzy: WadFuzzy[] | undefined = undefined;
        let search: MiniSearch | undefined = undefined;
        const db = await dbPromise;
        if (db) {
            const cached = await db.get('CachedData', 'SearchEngine');
            if (cached) {
                console.time('Loading wadsFuzzy from cache');
                wadsFuzzy = cached[0];
                search = MiniSearch.loadJS(cached[1], opts);
                console.timeEnd('Loading wadsFuzzy from cache');
            }
        }

        if (!search || !wadsFuzzy) {
            console.time('Loading wadsFuzzy');
            wadsFuzzy = (await fetchAndParseZstd(`${base}/wadsFuzzy.msg.zstd`, false) as unknown[][])
                .map(e => new WadFuzzy(e));
            console.timeEnd('Loading wadsFuzzy');

            console.time('Building search table');
            search = new MiniSearch(opts);
            search.addAll(wadsFuzzy.map((e, i) => ({...e, realId: i})));
            console.timeEnd('Building search table');

            if (db) {
                await db.add('CachedData', [wadsFuzzy, search.toJSON()], 'SearchEngine');
            }
        }

        return new SearchEngine(search, wadsFuzzy);
    }

    searchWads(searchQuery: string) {
        const results = this.haystack.search(searchQuery);

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return {
            count: results.length,
            filteredOrderedCount: results.length,
            *get() {
                for (let i = 0; i < results.length; i++) {
                    yield self.wadsFuzzy[results[i].id as number];
                }
            }
        };
    }
}

let searchData: SearchEngine | undefined;

export interface SearchResult {
    count: number;
    results: WadFuzzy[];
}

function *limitIterable<T>(iterable: Iterable<T>, limit: number) {
    let index = 0;
    for (const item of iterable) {
        if (index++ >= limit) return;
        yield item;
    }
}

expose({
    async searchWads(base1: string, searchQuery: string, limit = 1000): Promise<SearchResult> {
        base ??= base1;
        dbPromise ??= openDB<SearchDB>(`WadSearch${base}`, 1, {
            upgrade(database) {
                if (database.objectStoreNames.contains('CachedData'))
                    database.deleteObjectStore('CachedData');

                database.createObjectStore('CachedData');
            },
        });

        searchData ??= await SearchEngine.create();

        const results = searchData.searchWads(searchQuery);
        return {
            count: results.count,
            results: [...limitIterable(results.get(), limit)]
        };
    }
});
