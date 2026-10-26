import react from '@vitejs/plugin-react'
import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { defineConfig, type Plugin } from 'vite'

// https://vite.dev/config/
const audioRescan = (): Plugin => ({
  name: 'audio-rescan',
  configureServer(server) {
    server.middlewares.use('/api/audio-rescan', (_req, res) => {
      execFile(
        'node',
        ['scripts/audio-index.mjs'],
        { cwd: server.config.root },
        () => {
          void readFile(`${server.config.root}/public/audio/index.json`, 'utf8')
            .then((data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
            })
            .catch(() => {
              res.statusCode = 500;
              res.end('{}');
            });
        },
      );
    });
  },
})

export default defineConfig({
  plugins: [react(), audioRescan()],
  server: { port: 5173, strictPort: true },
})
