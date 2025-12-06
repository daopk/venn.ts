import { defineConfig } from 'tsdown'

export default defineConfig({
    entry: 'src/index.ts',
    clean: true,
    dts: true,
    minify: true,
    format: 'esm',
    external: ['d3'],
})
