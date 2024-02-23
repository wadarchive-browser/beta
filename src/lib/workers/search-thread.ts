import { WadFuzzy } from '../util/msgpack-models';

import { fetchAndParseZstd } from '../util/wad-lookup';
import { base } from '$app/paths';
import { expose } from 'comlink';

import uFuzzy from '@leeoniya/ufuzzy';

const empty: readonly [] = [];

class SearchEngine {
    constructor(
        private readonly uf: uFuzzy,
        private readonly wadsFuzzy: WadFuzzy[],
        private readonly haystack: string[],
    ) { }

    static async create() {
        console.time('Loading wadsFuzzy');
        const wadsFuzzy = (await fetchAndParseZstd(`${base}/wadsFuzzy.msg.zstd`, true) as unknown[][])
            .map(e => new WadFuzzy(e));
        console.timeEnd('Loading wadsFuzzy');

        return new SearchEngine(
            new uFuzzy({
                intraMode: 1,
                intraChars: '[a-z\\d\'\\.]'
            }),
            wadsFuzzy,
            wadsFuzzy.map(e => `${e.Id} ${e.Md5} ${e.Sha256} ${e.Names.join(' ')} ${e.Filenames.join(' ')}`)
        );
    }

    searchWads(searchQuery: string, limit: number): {
        readonly count: number;
        readonly results: readonly WadFuzzy[];
    } {
        // pre-filter
        const idxs = this.uf.filter(this.haystack, searchQuery);

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const wadsFuzzy = this.wadsFuzzy;

        // idxs can be null when the needle is non-searchable (has no alpha-numeric chars)
        if (idxs != null && idxs.length > 0) {
            // sort/rank only when <= 10,000 items
            const infoThresh = 1e4;

            if (idxs.length <= infoThresh) {
                const info = this.uf.info(idxs, this.haystack, searchQuery);

                // order is a double-indirection array (a re-order of the passed-in idxs)
                // this allows corresponding info to be grabbed directly by idx, if needed
                const order = this.uf.sort(info, this.haystack, searchQuery);

                // render post-filtered & ordered matches
                return {
                    count: order.length,
                    results: [...(function*() {
                        const actualLimit = Math.min(order.length, limit);
                        for (let i = 0; i < actualLimit; i++) {
                            // using info.idx here instead of idxs because uf.info() may have
                            // further reduced the initial idxs based on prefix/suffix rules
                            yield wadsFuzzy[info.idx[order[i]]];
                        }
                    })()]
                };
            } else {
                // render pre-filtered but unordered matches
                return {
                    count: idxs.length,
                    results: [...(function*() {
                        const actualLimit = Math.min(idxs.length, limit);
                        for (let i = 0; i < actualLimit; i++) {
                            yield wadsFuzzy[idxs[i]];
                        }
                    })()]
                };
            }
        } else {
            return {
                count: 0,
                results: empty
            };
        }
    }
}

let searchData: SearchEngine | undefined;

export interface SearchResult {
    readonly count: number;
    readonly results: readonly WadFuzzy[];
}

expose({
    async searchWads(searchQuery: string, limit = 1000): Promise<SearchResult> {
        searchData ??= await SearchEngine.create();

        const results = searchData.searchWads(searchQuery, limit);
        return {
            count: results.count,
            results: results.results
        };
    }
});
