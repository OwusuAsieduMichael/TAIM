import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/** Dev-only proxy: forwards /api/gas to Google Apps Script (avoids browser CORS). */
function gasDevProxy(gasUrl: string) {
  return {
    name: 'taim-gas-proxy',
    configureServer(server: { middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void } }) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/gas')) {
          next();
          return;
        }
        if (!gasUrl) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Set VITE_GAS_URL in apps/web/.env to your Apps Script /exec URL' }));
          return;
        }
        try {
          const body = await readBody(req);
          const upstream = await fetch(gasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body,
            redirect: 'follow',
          });
          const text = await upstream.text();
          res.statusCode = upstream.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(text);
        } catch (err) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: 'Failed to reach Google Apps Script',
              details: err instanceof Error ? err.message : String(err),
            }),
          );
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname), '');
  const useGas = env.VITE_API_BACKEND === 'gas';
  const gasUrl = env.VITE_GAS_URL ?? '';

  return {
    plugins: [react(), tailwindcss(), ...(useGas ? [gasDevProxy(gasUrl)] : [])],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      open: true,
      proxy: useGas
        ? {}
        : {
            '/api': {
              target: 'http://localhost:4000',
              changeOrigin: true,
            },
          },
    },
  };
});
