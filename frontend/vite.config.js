import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

// Write version.json to public so it's served as a static file
mkdirSync('./public', { recursive: true })
writeFileSync('./public/version.json', JSON.stringify({ service: 'frontend', version: pkg.version }))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
  },
})
