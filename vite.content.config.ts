import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': JSON.stringify({}),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/content/content.ts'),
      name: 'ContentScript',
      formats: ['iife'],
      fileName: () => 'content.js',
    },
    rollupOptions: {
      external: [],
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        globals: {},
      },
    },
  },
})