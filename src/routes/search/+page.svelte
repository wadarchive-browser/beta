<script lang="ts">
    import { Card, CardHeader, CardTitle, CardBody, CardSubtitle, CardText, Button, CardFooter } from "@sveltestrap/sveltestrap";
    import { searchWads } from "$lib/util/wad-search";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { Jumper } from "$lib/components/spinners";
    import type { WadFuzzy } from "$lib/util/msgpack-models";
    import { derived } from 'svelte/store';
    import { base } from "$app/paths";

    const q = derived(page, e => e.url.searchParams.get('q'));

    let lastQuery: string | undefined | null = undefined;

    let results: {
        query: string;
        count: number;
        results: WadFuzzy[];
    } | undefined = undefined;

    let searchErr: unknown | undefined;

    async function searchFor(query?: string | null) {
        console.log(query);

        if (query == lastQuery) return;

        if (!query) {
            return {query: '', count: 0, results: []};
        }

        return {
            ...await searchWads(query, 250),
            query
        };
    }

    onMount(() => {
        const unsub = q.subscribe(q => {
            searchFor(q).then(e => results = e).catch(e => {
                console.error(e);
                searchErr = e;
            });
        });

        return () => unsub();
    });

    /*
    onMount(() => {
        console.log('went two');
        searchResults = (async () => {
            const query = $page.url.searchParams.get('q');
            if (!query) return {query: '', count: 0, results: []};
            return {
                ...await searchWads(query, 250),
                query
            };
        })();
    });
    */
</script>

<style>
    .resultlink {
        color: inherit;
        text-decoration: none;
    }
</style>

<svelte:head>
    <title>Search</title>
    <meta name="description" content="Search" />
    <!--<script async src="https://cse.google.com/cse.js?cx=a69bfdd3beb524c56"></script>-->
</svelte:head>

<!--<div class="gcse-search" />-->

{#if searchErr}
    <p>Failed to load required data. Error details:</p>
    <pre>{searchErr}</pre>
{:else if !results}
    <Jumper size="60" color="var(--bs-code-color)" unit="px" duration="1.5s" />
{:else}
    <p>
        <b>Found {results.count} matches for "{results.query}" {#if results.count > 250}(displaying top 250 matches){/if}</b><br>
        Not what you were looking for? Try <a href="{base}/googlesearch?q={encodeURIComponent(results.query)}">searching with Google</a>
    </p>
    {#each results.results as result}
        <a href="{base}/wad?id={result.Id.slice(0, 9)}" class="resultlink">
            <Card class="mb-3">
                <CardHeader>
                    {#if result.Names[0]}
                        <CardTitle>{result.Names[0]} ({result.Filenames[0]})</CardTitle>
                    {:else}
                        <CardTitle>{result.Filenames[0]}</CardTitle>
                    {/if}
                </CardHeader>
                <CardBody>
                    <CardText>
                        {#if result.Names.length > 1}
                            Alternative titles: {result.Names.slice(1).join('; ')}<br>
                        {/if}
                        {#if result.Filenames.length > 1}
                            Alternative file names:
                            {#each result.Filenames.slice(1) as filename, i}{i != 0 ? ";" : ""} <code>{filename}</code>{/each}<br>
                        {/if}
                        ID: <code>{result.Id.slice(0, 9)}</code><br>
                        SHA-1: <code>{result.Id}</code><br>
                        {#if result.Md5}
                            MD5: <code>{result.Md5}</code><br>
                        {/if}
                        {#if result.Sha256}
                            SHA-256: <code>{result.Sha256}</code><br>
                        {/if}
                    </CardText>
                </CardBody>
            </Card>
        </a>
    {/each}
{/if}