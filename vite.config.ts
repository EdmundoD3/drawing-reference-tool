import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [
    svelte(),
    viteSingleFile()
  ],
  server: {
    host: true,
    port: 5173
  },
  build: {
    cssCodeSplit: false
  }
})