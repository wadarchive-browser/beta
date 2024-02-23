import { Wad, WadLumps } from './msgpack-models';
import { openDB, type DBSchema } from 'idb';
import { browser } from '$app/environment';
import { base } from '$app/paths';
import { getWorker } from './worker-helper';

export type MsgpackDeserialized = unknown;

interface WadCacheDB extends DBSchema {
    CachedData: {
        key: string;
        value: MsgpackDeserialized;
    }
}
const dbPromise = browser ? openDB<WadCacheDB>(`WadCache${base}`, 7, {
    upgrade(database) {
        if (database.objectStoreNames.contains('CachedData'))
            database.deleteObjectStore('CachedData');

        database.createObjectStore('CachedData');
    },
}) : undefined;

const workerPromise = getWorker<{
    fetchAndDecompress(path: string): Promise<MsgpackDeserialized>
}>(() => import('../workers/zstd-thread?worker'));

export async function fetchAndParseZstd(path: string, cache = true): Promise<MsgpackDeserialized> {
    if (!browser) {
        throw new Error('This function should only be called in browser');
    }
    console.log(path);
    const db = await dbPromise;
    const worker = await workerPromise;

    const existingResult = await db!.get('CachedData', path);
    if (existingResult !== undefined) {
        return existingResult;
    }

    const result = await worker!.fetchAndDecompress(path);

    if (cache) {
        await db!.add('CachedData', result, path);
    }
    return result;
}

export async function queryWad(id: string): Promise<Wad> {
    const decodedMessage = await fetchAndParseZstd(`${base}/wad-data/${id.slice(0, 3)}.msg.zstd`) as Record<string, unknown[]>;

    return new Wad(decodedMessage[id]);
}

export async function queryLumpList(wad: Wad): Promise<WadLumps | undefined> {
    if (wad.LumpsInfoIndex == null) return undefined;

    const decodedMessage = await fetchAndParseZstd(`/lumps${wad.LumpsInfoIndex[0]}/${wad.LumpsInfoIndex[1]}.msg.zstd`, false) as Record<string, unknown[]>;

    if (wad.Id in decodedMessage)
        return new WadLumps(decodedMessage[wad.Id]);

    return undefined;
}

export async function queryWadByName(name: string): Promise<Wad> {
    const decodedMessage = await fetchAndParseZstd(`${base}/wadsByName.msg.zstd`) as Record<string, string>;

    return await queryWad(decodedMessage[name]);
}