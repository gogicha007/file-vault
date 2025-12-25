import { defineConfig } from 'vite'
// import { devtools } from '@tanstack/devtools-vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    viteReact(),
  ],
  define: {
    'process.env': {},
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      input: './index.html',
    },
  },
})

export default config
