<script lang="ts">
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
    <a class="cum" href="{base}/wad-index/{initial === '#' ? 'digit' : initial}">{initial.toUpperCase()}</a>
{/each}
</span>