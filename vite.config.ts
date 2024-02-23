import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import terser from '@rollup/plugin-terser';

export default defineConfig({
    plugins: [
        sveltekit(),
        terser({
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
                toplevel: true,
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
            mangle: {
                module: true,
                toplevel: true,
            }
        }),
    ],
    ssr: {
        noExternal: ['@popperjs/core']
    },
    worker: {
        plugins: () => [
            sveltekit(),
            terser({
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
                    toplevel: true,
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
                mangle: {
                    module: true,
                    toplevel: true,
                }
            }),
        ],
        format: 'es'
    },
    build: {
        minify: 'esbuild',
    }
});
