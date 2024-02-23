<script lang="ts">
    import { Card, CardHeader, CardTitle, CardBody, CardSubtitle, CardText, Button, CardFooter } from "@sveltestrap/sveltestrap";
    import { WadFuzzy, searchWads, type SearchResult } from "../../util/wad-search";
    import { onDestroy, onMount } from "svelte";
    import { page } from "$app/stores";
    import { never } from "../../util/promise";
    import { Jumper } from "../../components/spinners";

    let searchResults: Promise<SearchResult & { query: string }> = never;

    import { derived, writable } from 'svelte/store';
    import { base } from "$app/paths";

    const initials = '#0123456789abcdefghijklmnopqrstuvwxyz'.split('');
</script>

<style>
    .cum {
        font-size: 350%;
        text-decoration: none;
        width: 58px;
        display: inline-block;
        text-align: center;
    }
</style>

<svelte:head>
    <title>Index - Table of Contents - Wad Archive</title>
    <meta name="description" content="Search" />
    <!--<script async src="https://cse.google.com/cse.js?cx=a69bfdd3beb524c56"></script>-->
</svelte:head>

<!--<div class="gcse-search" />-->

<span style="word-wrap: break-word;">
{#each initials as initial}
    <a class="cum" href="{base}/index/{initial === '#' ? 'digit' : initial}">{initial.toUpperCase()}</a>
{/each}
</span>