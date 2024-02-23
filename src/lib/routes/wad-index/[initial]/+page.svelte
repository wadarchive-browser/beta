<script lang="ts">
    import { Card, CardHeader, CardTitle, CardBody, CardSubtitle, CardText, Button, CardFooter, Col, Image, Row } from "@sveltestrap/sveltestrap";
    import { page } from "$app/stores";
    import { Jumper } from "$lib/components/spinners";
    import { fetchAndParseZstd } from "$lib/util/wad-lookup";
    import { base } from "$app/paths";
    import { Wad } from "$lib/util/msgpack-models";
    import Pagination from "$lib/components/Pagination.svelte";
    import { trimToLength } from "$lib/util";

    const displayInitial = $page.params.initial === 'digit' ? '#' : $page.params.initial.toUpperCase();

    async function queryInitial(): Promise<Wad[]> {
        const decodedMessage = await fetchAndParseZstd(`${base}/wad-index/${$page.params.initial}.msg.zstd`) as unknown[][];

        return decodedMessage.map(e => new Wad(e));
    }
</script>

<style>
    :global(.resultlink) {
        color: inherit;
        text-decoration: none;
    }

    :global(.thumb-col) {
        width: 28%;
        padding-right: 0;
    }

    :global(.thumb-col + .col) {
        padding-left: 0;
    }
</style>

<svelte:head>
    <title>Index - {displayInitial} - Wad Archive</title>
    <meta name="description" content="Search" />
    <!--<script async src="https://cse.google.com/cse.js?cx=a69bfdd3beb524c56"></script>-->
</svelte:head>

<!--<div class="gcse-search" />-->

<h2>{displayInitial}</h2>
{#await queryInitial()}
    <Jumper size="60" color="var(--bs-code-color)" unit="px" duration="1.5s" />
{:then wads}
    <Pagination rows={wads} perPage={50} totalShownPages={3} let:row>
        {@const wad = row}
        <a href="{base}/wad?id={wad.IdSmall}" class="resultlink">
            <Card class="mb-3">
                <Row>
                    <Col xs="3" class="thumb-col">
                        <Image fluid alt="Screenshot for {wad.Title}" class="thumb" src={wad.MainScreenshot ?? 'https://placehold.co/800x600/111/EEE/png?text=No%20image'}></Image>
                    </Col>
                    <Col>
                        <CardHeader>
                            <CardTitle>
                                {#if wad.IdealTitle}
                                    {wad.IdealTitle} ({wad.IdealFilename})
                                {:else}
                                    {wad.IdealFilename}
                                {/if}
                            </CardTitle>
                        </CardHeader>
                        <CardBody>
                            <CardText>
                                {#if wad.FormattedDescription}
                                    <p>{trimToLength(250, wad.FormattedDescription)}</p>
                                {/if}
                                {#if wad.FallbackNames.length > 0}
                                    {#if wad.IdealTitle != wad.FallbackNames[0]}
                                        Alternative titles: {wad.FallbackNames.join('; ')}<br>
                                    {:else}
                                        {#if wad.FallbackNames.length > 1}
                                            Alternative titles: {wad.FallbackNames.slice(1).join('; ')}<br>
                                        {/if}
                                    {/if}
                                {/if}
                                {#if wad.FallbackFilenames.length > 0}
                                    {#if wad.IdealFilename != wad.FallbackFilenames[0]}
                                        Alternative file names: {#each wad.FallbackFilenames as filename, i}{i != 0 ? ";" : ""} <code>{filename}</code>{/each}<br>
                                    {:else}
                                        {#if wad.FallbackFilenames.length > 1}
                                            Alternative file names: {#each wad.FallbackFilenames.slice(1) as filename, i}{i != 0 ? ";" : ""} <code>{filename}</code>{/each}<br>
                                        {/if}
                                    {/if}
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