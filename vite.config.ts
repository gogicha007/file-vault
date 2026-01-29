import { defineConfig } from 'vite'
// import { devtools } from '@tanstack/devtools-vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

const config = defineConfig({
  // Use relative base so built assets work when loaded via file://
  // inside the Electron app instead of assuming a web server at '/'.
  base: './',
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    TanStackRouterVite(),
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
