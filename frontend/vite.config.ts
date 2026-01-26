import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vite.dev/config/
const isDocker = fs.existsSync('/app/certs/server.key');
const certPath = isDocker ? '/app/certs' : '../certs';

export default defineConfig({
  plugins: [react()],
  server: {
    https: fs.existsSync(`${certPath}/server.key`) ? {
      key: fs.readFileSync(`${certPath}/server.key`),
      cert: fs.readFileSync(`${certPath}/server.crt`),
    } : undefined
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
