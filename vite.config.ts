import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    ssr: {
        noExternal: ['@popperjs/core']
    },
    worker: {
		// plugins: () => [sveltekit()],
        format: 'es'
    },
    build: {
        minify: 'terser',
        terserOptions: {
            compress: {
                arguments: true,
                booleans: true,
                hoist_funs: true,
                join_vars: true,
                keep_classnames: false,
                keep_fnames: false,
                keep_infinity: true,
                module: true,
                unsafe: true,
                toplevel: false,
                unsafe_methods: true,
                unsafe_proto: true,
                unsafe_regexp: true,
                // reduce_funcs: false,

                // unsafe_passes: true,
                unsafe_arrows: true,
                // unsafe_comps: true,
                unsafe_Function: true,
                // unsafe_math: true,
                unsafe_symbols: true,

                unused: true,

                passes: 6,
            },
            sourceMap: true,
            mangle: false
        }
    }
});
