import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  optimizeDeps: {
    exclude: [
      'ssh2',
      'cpu-features',
      'dockerode',
      '@mizu/minato-service',
      '@mizu/minato-repository',
    ],
  },
  ssr: {
    external: [
      'ssh2',
      'cpu-features',
      'dockerode',
      '@mizu/minato-service',
      '@mizu/minato-repository',
    ],
  },
})
