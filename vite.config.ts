import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// On Windows the folder can be opened as c:\... or C:\...; Vite then resolves React once per spelling,
// two copies load and the first hook crashes. Pin the root to one spelling.
const root = fileURLToPath(new URL('.', import.meta.url)).replace(/^[a-z]:/, (d) => d.toUpperCase())

// GitHub Pages serves this repository at https://vitermoldy.github.io/viterPortofolio/.
export default defineConfig(({ command }) => ({
  root,
  base: command === 'build' ? (process.env.SITE_BASE ?? '/viterPortofolio/') : '/',
  server: { port: 5189, strictPort: true },
  preview: { port: 5189, strictPort: true },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': root + 'src' },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    chunkSizeWarningLimit: 900,
  },
  test: {
