<script lang="ts">
    import { page } from '$app/stores';
    import { Container, Row, Col, Icon, Card, Modal, Table, Button } from "@sveltestrap/sveltestrap";
    import { getCdnUrl, formatGraphicPath, formatMapScreenshot, formatPalettePath, formatWadDownloadPath, formatMapAutomap, formatEndoomPath } from "$lib/util/ia-url-formatter";
    import MapComponent from "$lib/components/MapComponent.svelte";
    import type { Endoom, Map, NiceNames, Wad, WadLumps, WadType } from "$lib/util/msgpack-models";
    import { queryLumpList, queryWad, queryWadByName } from "$lib/util/wad-lookup";
    import details from "$lib/images/details.png";
    import { escapeHTML, humanizeFileSize, trimToLength } from "$lib/util";
    import { redirect } from '@sveltejs/kit';
    import { onMount } from 'svelte';
    import MetaTags from 'svelte-meta-tags/MetaTags.svelte';
    import { Jumper } from "$lib/components/spinners";
    import { goto } from '$app/navigation';

    const base = 'https://wadarchive-browser.github.io';

    let modalEndoom: [endoom: Endoom, mode: "text" | "image"] | undefined;

    let modalMap: Map | undefined;

    let wad: Wad & {
        formattedDescription: string
    };

    let wadLumps: WadLumps | undefined;

    let theErr: unknown | undefined;
    let loadLumpsErr: unknown | undefined;
    let loadingLumps = false;

    onMount(() => {
        let wadId = $page.url.searchParams.get('id');
        const wadName = $page.url.searchParams.get('name');

        if (wadId && wadId.length > 9) {
            wadId = wadId.slice(0, 9);
        }

        if (!wadId && !wadName) {
            throw redirect(300, '/');
        }

        (async () => {
            const wad1 = wadId ? await queryWad(wadId) : await queryWadByName(wadName!);

            const formattedDescription = trimToLength(500, wad1.FormattedDescription);

            Object.assign(wad1, {formattedDescription});

            // @ts-expect-error Object.assign use
            wad = wad1

            const params = $page.url.searchParams;
            if (params.has('id')) {
                if (wad1.CanonicalFilename) {
                    params.delete('id');
                    params.set('name', wad1.CanonicalFilename);

                    goto('?' + params, { replaceState: true });
                } else if (params.get('id')!.length > 9) {
                    params.set('id', wad1.IdSmall);

                    goto('?' + params, { replaceState: true });
                }
            }
        })().catch(err => {
            theErr = err;
        });
    });

    function loadLumps() {
        loadingLumps = true;
        (async () => {
            wadLumps = await queryLumpList(wad);
        })().catch(err => {
            loadLumpsErr = err;
        }).finally(() => {
            loadingLumps = false;
        });
    }
</script>

<style lang="scss">
    .graphicsimage,
    .endoomthumb {
        width: 100%;
    }
    .main-image,
    .automapimage,
    .endoomimage {
        max-width: 100%;
        background: #222222;
        aspect-ratio: 4 / 3;
        display: inline-block;
    }

    .endoomtext {
        -webkit-appearance: none;
        appearance: none;
        padding: 0;
        border: none;
        display: inline-block;
        background: none;
    }
    .endoomtext > img {
        width: 20px;
        height: 20px;
        vertical-align: middle;
    }

    .pre-scrollable {
        max-height: 340px;
        overflow-y: scroll;
    }

    h2 {
        margin-top: 2rem;
    }

    .lumps-table-num {

    }
    .lumps-table-name {
        max-width: 14rem;
        > code {
            word-wrap: normal;
        }
    }
    .lumps-table-size {
        width: 100%;
        white-space: nowrap;
    }
    .lumps-table-type {

    }
    .lumps-table-sha1:not(th),
    .lumps-table-md5:not(th),
    .lumps-table-sha256:not(th) {
        font-size: 0.65em;
        line-height: 2em;
    }
</style>

<svelte:head>
    {#if !wad}
        <title>Wad Archive</title>
    {/if}
</svelte:head>

{#if theErr}
    <p>Failed to load required data. Error details:</p>
    <pre>{theErr}</pre>
{:else if !wad}
    <Jumper size="60" color="var(--bs-code-color)" unit="px" duration="1.5s" />
{:else}
    <MetaTags
        title={wad.Title}
        titleTemplate="%s - Wad Archive"
        description={wad.formattedDescription}
        canonical={wad.CanonicalFilename ? `${base}/wad?name=${wad.CanonicalFilename}` : `${base}/wad?id=${wad.IdSmall}`}
        openGraph={{
            type: 'website',
            title: `${wad.Title} - Wad Archive`,
            description: wad.formattedDescription,
            images: [...wad.ogImages()],
            siteName: 'Wad Archive Mirror'
        }}
        twitter={{
            cardType: 'summary_large_image',
            title: `${wad.Title} - Wad Archive`,
            description: wad.formattedDescription,
            image: wad.MainScreenshot ?? undefined,
            imageAlt: `Main screenshot for ${wad.Title}`
        }}
    />

    <h1>{wad.Title}</h1>

    <Container>
        <Row>
            <Col>
                <Row>
                    {#if wad.Filename}
                        <Col xs="2">Filename</Col>
                        <Col><code>wad.Filename</code></Col>
                    {:else}
                        <Col xs="2">Filenames</Col>
                        <Col>{#each wad.FallbackFilenames as filename, i}{i != 0 ? ";" : ""} <code>{filename}</code>{/each}</Col>
                    {/if}
                </Row>
                <Row>
                    <Col xs="2">Size</Col>
                    <Col>{humanizeFileSize(Number(wad.Size))}</Col>
                </Row>
                <Row>
                    <Col xs="2">MD5</Col>
                    <Col>{wad.Md5 ?? "Unknown"}</Col>
                </Row>
                <Row>
                    <Col xs="2">SHA-1</Col>
                    <Col>{wad.Sha1 ?? "Unknown"}</Col>
                </Row>
                <Row>
                    <Col xs="2">SHA-256</Col>
                    <Col>{wad.Sha256 ?? "Unknown"}</Col>
                </Row>
                <Row>
                    <Col xs="2">WAD Type</Col>
                    <Col>{wad.Type ?? "Unknown"}</Col>
                </Row>
                <Row>
                    <Col xs="2">IWAD</Col>
                    <Col>
                        {#each wad.Iwads as iwad, i}{i != 0 ? "," : ""} <code>{iwad}</code>{/each}
                        {#if wad.Iwads.length == 0}
                            Unknown
                        {/if}
                    </Col>
                </Row>
                <Row>
                    <Col xs="2">Engines</Col>
                    <Col>
                        {#each wad.Engines as engine, i}{i != 0 ? "," : ""} {engine}{/each}
                        {#if wad.Engines.length == 0}
                            Unknown
                        {/if}
                    </Col>
                </Row>
                {#if wad.CountsLumps != null}
                <Row>
                    <Col xs="2">Lumps</Col>
                    <Col>{wad.CountsLumps}</Col>
                </Row>
                {/if}
                {#if wad.Maps.length}
                <Row>
                    <Col xs="2">Maps</Col>
                    <Col>{#each wad.Maps as map, i}{i != 0 ? "," : ""} <a href="#{map.Name}">{map.Name}</a>{/each}</Col>
                </Row>
                {/if}
            </Col>
            <Col xs="4" style="text-align: center">
                {#if wad.MainScreenshot}
                    <div>
                        <img class="main-image" alt={wad.Title} src={wad.MainScreenshot} />
                    </div>
                {/if}
                {wad.formattedDescription}
            </Col>
        </Row>
    </Container>

    {#if wad.CanDownload}
        <h2>Download</h2>
        <a rel="nofollow" href={formatWadDownloadPath(wad)}><Icon style="color: white" name="download" /> Download <em>{wad.Title}</em> from Wad Archive (Internet Archive mirror)</a>
    {/if}

    {#if wad.Readmes.length}
        <h2>Readme</h2>
        <pre class="pre-scrollable">{wad.Readmes[0]}</pre>
    {/if}

    {#if wad.Maps.length}
        <h2>Maps</h2>
        <Container>
            <Row cols={{ xs: 1, sm: 2 }}>
                {#each wad.Maps as map}
                    <Col id={map.Name}>
                        <MapComponent {wad} {map} openAutomapCallback={() => (modalMap = map)} />
                    </Col>
                {/each}
            </Row>
        </Container>
    {/if}

    {#if wad.Graphics.length}
        <h2>Graphics</h2>
        <Container>
            <Row cols={{ xs: 2, lg: 4 }}>
                {#each wad.Graphics as graphic}
                    <Col>
                        <Card body inverse class="mb-4">
                            <a href={getCdnUrl(formatGraphicPath(wad, graphic))} style="text-align: center">
                                <div>
                                    <img class="graphicsimage" alt={graphic.Name} src={getCdnUrl(formatGraphicPath(wad, graphic))} />
                                </div>
                                {graphic.Name}
                            </a>
                        </Card>
                    </Col>
                {/each}
            </Row>
        </Container>
    {/if}

    {#if wad.Endooms.length}
        <h2>Endoom</h2>
        <Container>
            <Row cols={{ xs: 2, lg: 4 }}>
                {#each wad.Endooms as endoom}
                    <Col>
                        <Card body inverse class="mb-4">
                            <a href={formatEndoomPath(wad, endoom)} on:click|preventDefault={() => (modalEndoom = [endoom, "image"])} style="text-align: center">
                                <img class="endoomthumb" alt={endoom.Name} src={getCdnUrl(formatEndoomPath(wad, endoom))} />
                            </a>
                            <div style="text-align: center">
                                <a href={formatEndoomPath(wad, endoom)} class="automap" target="_blank" on:click|preventDefault={() => (modalEndoom = [endoom, "image"])}>{endoom.Name}</a>
                                <!-- svelte-ignore a11y-invalid-attribute -->
                                <button class="endoomtext" title="Show as text" on:click|preventDefault={() => (modalEndoom = [endoom, "text"])}>
                                    <img src={details} alt="Show as text" />
                                </button>
                            </div>
                        </Card>
                    </Col>
                {/each}
            </Row>
        </Container>
    {/if}

    {#if Object.keys(wad.Palettes).length > 0}
        <h2>Color Palettes</h2>
        {#each Object.entries(wad.Palettes) as [palette, paletteImages]}
            <h3>{palette}</h3>

            <Row cols={{ xs: 1, sm: 2, md: 4 }}>
                {#each paletteImages as paletteImage}
                    <Col>
                        <Card body class="mb-4">
                            <img alt={paletteImage} src={getCdnUrl(formatPalettePath(wad, paletteImage))} />
                        </Card>
                    </Col>
                {/each}
            </Row>
        {/each}
    {/if}

    <!--<pre>{JSON.stringify(wad, null, 4)}</pre>-->
    <!--<div>{@html data.content}</div>-->

    {#if wad.Maps.length}
        <Modal body header="Automap for {modalMap?.Name ?? 'Map'}" isOpen={modalMap != null} toggle={() => (modalMap = undefined)} size="xl">
            {#if modalMap?.HasAutomapImage}
                <img alt="Automap for {modalMap?.Name ?? 'Map'}" src={getCdnUrl(formatMapAutomap(wad, modalMap))} class="automapimage" />
            {/if}
        </Modal>
    {/if}

    {#if wad.Endooms.length}
        <Modal body header="Endoom" isOpen={modalEndoom != null} toggle={() => (modalEndoom = undefined)} size="xl">
            {#if modalEndoom?.[1] == "text"}
                <pre style="text-align: center; line-height: normal;">{modalEndoom[0].Text}</pre>
            {:else if modalEndoom?.[1] == "image"}
                <img alt="Endoom" class="endoomimage" src={getCdnUrl(formatEndoomPath(wad, modalEndoom[0]))} />
            {/if}
        </Modal>
    {/if}

    {#if wad.LumpsInfoIndex}
        <h2>Lumps</h2>
        {#if loadLumpsErr}
        <p>Failed to load lump data. Error details:</p>
        <pre>{loadLumpsErr}</pre>
        {:else if !wadLumps}
        {#if loadingLumps}
        <Jumper size="60" color="var(--bs-code-color)" unit="px" duration="1.5s" />
        {:else}
        <Button title="Load {wad.CountsLumps} lumps" on:click={e => { e.preventDefault(); loadLumps() }}>
            Load {wad.CountsLumps} lumps
        </Button>
        {/if}
        {:else}
        <Container>
            <Table borderless size="sm" responsive>
                <thead>
                    <tr>
                        <th class="lumps-table-num">#</th>
                        <th class="lumps-table-name">Name</th>
                        <th class="lumps-table-size">Size</th>
                        <th class="lumps-table-type">Type</th>
                        <th class="lumps-table-sha1">SHA-1</th>
                        <th class="lumps-table-md5">MD5</th>
                        <th class="lumps-table-sha256">SHA-256</th>
                    </tr>
                </thead>
                <tbody>
                    {#each wadLumps.Lumps as lump, idx}
                    <tr>
                        <th class="lumps-table-num" scope="row">{idx}</th>
                        <td class="lumps-table-name">
                            {#if lump.Corrupt}
                            <span title="File was corrupt">⚠️</span>
                            {/if}
                            {#if lump.Compressed}
                            <span title="File is compressed">🗜️</span>
                            {/if}

                            <code>{@html escapeHTML(lump.Name).replace(/\//g, '/&ZeroWidthSpace;')}</code></td>
                        <td class="lumps-table-size">{humanizeFileSize(lump.Size)}</td>
                        <td class="lumps-table-type">{lump.Type}</td>
                        <td class="lumps-table-sha1">{lump.Sha1}</td>
                        <td class="lumps-table-md5">{lump.Md5}</td>
                        <td class="lumps-table-sha256">{lump.Sha256}</td>
                    </tr>
                    {/each}
                </tbody>
            </Table>

            <Row cols={{ xs: 2, lg: 4 }}>
                {#each wad.Graphics as graphic}
                    <Col>
                        <Card body inverse class="mb-4">
                            <a href={getCdnUrl(formatGraphicPath(wad, graphic))} style="text-align: center">
                                <div>
                                    <img class="graphicsimage" alt={graphic.Name} src={getCdnUrl(formatGraphicPath(wad, graphic))} />
                                </div>
                                {graphic.Name}
                            </a>
                        </Card>
                    </Col>
                {/each}
            </Row>
        </Container>
        {/if}
    {/if}
{/if}