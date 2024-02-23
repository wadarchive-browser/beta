import { Wad, WadLumps, convertUint8ArrayToHex } from './msgpack-models';
import { openDB } from 'idb';
import { browser } from '$app/environment';
import { wrap } from 'comlink';
import { base } from '$app/paths';

const dbPromise = browser ? openDB(`WadCache${base}`, 5, {
    upgrade(database, oldVersion, newVersion, _transaction, _event) {
        if (database.objectStoreNames.contains('CachedData'))
            database.deleteObjectStore('CachedData');

        database.createObjectStore('CachedData');
    },
}) : undefined;

const workerPromise = browser ? (async () => {
    // https://medium.com/geekculture/sveltekit-web-worker-8cfc0c86abf6
    const { default: ZstdWorker } = await import('./zstd-thread?worker');
    const worker = new ZstdWorker();

    return wrap<{
        fetchAndDecompress(path: string): Promise<unknown>
    }>(worker);
})() : undefined;

export async function fetchAndParseZstd(path: string, cache = true): Promise<unknown> {
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