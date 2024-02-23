// @ts-check

import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = /** @satisfies {import('@sveltejs/kit').Config} */ ({
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			fallback: '404.html'
		}),

		prerender: {
			// @ts-expect-error
			entries: ['/', '/wad-index', '/wad-index/digit', '/search', '/googlesearch', '/wad', ...'0123456789abcdefghijklmnopqrstuvwxyz'.split('').map(e => '/wad-index/' + e)]
		},

		paths: {
			base: '/beta'
		},
	}
});

export default config;
