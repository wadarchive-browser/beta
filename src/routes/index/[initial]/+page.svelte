<script lang="ts">
    import { Card, CardHeader, CardTitle, CardBody, CardSubtitle, CardText, Button, CardFooter, Col, Image, Row } from "@sveltestrap/sveltestrap";
    import { WadFuzzy, searchWads, type SearchResult } from "../../../util/wad-search";
    import { onDestroy, onMount } from "svelte";
    import { page } from "$app/stores";
    import { never } from "../../../util/promise";
    import { Jumper } from "../../../components/spinners";
    import { fetchAndParseZstd } from "../../../util/wad-lookup";
    import { base } from "$app/paths";
    import { Wad } from "../../../util/msgpack-models";
    import Pagination from "../../../components/Pagination.svelte";

    const displayInitial = $page.params.initial === 'digit' ? '#' : $page.params.initial;

    async function queryInitial(): Promise<Wad[]> {
        const decodedMessage = await fetchAndParseZstd(`${base}/wad-index/${$page.params.initial}.msg.zstd`) as unknown[][];

        return decodedMessage.map(e => new Wad(e));
    }
</script>

<style>
    .resultlink {
        color: inherit;
        text-decoration: none;
    }
</style>

<svelte:head>
    <title>Index - {displayInitial} - Wad Archive</title>
    <meta name="description" content="Search" />
    <!--<script async src="https://cse.google.com/cse.js?cx=a69bfdd3beb524c56"></script>-->
</svelte:head>

<!--<div class="gcse-search" />-->

{#await queryInitial()}
    <h2>{displayInitial}</h2>
{:then wads}
    <h2>{displayInitial} - {wads.length} entries</h2>

    <Pagination rows={wads} perPage={50} totalShownPages={3} let:row>
        {@const wad = row}
        <a href="/wad?id={wad.IdSmall}" class="resultlink">
            <Card class="mb-3">
                <Row>
                    {#if wad.MainScreenshot}
                    <Col xs="3">
                        <Image fluid thumbnail alt="Screenshot for {wad.Title}" src={wad.MainScreenshot}></Image>
                    </Col>
                    {/if}
                    <Col xs="auto">
                        <CardHeader>
                            {#if wad.IdealTitle}
                                <CardTitle>{wad.IdealTitle} ({wad.IdealFilename})</CardTitle>
                            {:else}
                                <CardTitle>{wad.IdealFilename}</CardTitle>
                            {/if}
                        </CardHeader>
                        <CardBody>
                            <CardText>
                                {#if wad.FallbackNames.length}
                                Alternative titles: {wad.FallbackNames.slice(1).join('; ')}<br>
                                {/if}
                                {#if wad.FallbackFilenames.length}
                                Alternative file names:
                                {#each wad.FallbackFilenames.slice(1) as filename, i}{i != 0 ? ";" : ""} <code>{filename}</code>{/each}<br>
                                {/if}
                                ID: <code>{wad.IdSmall}</code><br>
                                SHA-1: <code>{wad.Id}</code><br>
                                {#if wad.Md5}
                                MD5: <code>{wad.Md5}</code><br>
                                {/if}
                                {#if wad.Sha256}
                                SHA-256: <code>{wad.Sha256}</code><br>
                                {/if}
                            </CardText>
                        </CardBody>
                    </Col>
                </Row>
            </Card>
        </a>
    </Pagination>
{/await}