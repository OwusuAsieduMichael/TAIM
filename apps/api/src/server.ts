import { getEnv } from './config/env.js';
import { createApp } from './app.js';
import { prisma } from './lib/prisma.js';

const { PORT } = getEnv();
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`TAIM API listening on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use (another API instance or app).`);
    console.error('Fix: stop the other process, or set PORT=4001 in apps/api/.env');
    console.error(`Find PID (Windows): netstat -ano | findstr :${PORT}`);
    console.error('Then: taskkill /PID <pid> /F\n');
    process.exit(1);
  }
  console.error(err);
  process.exit(1);
});

function shutdown(signal: string) {
  console.info(`\n${signal} received, closing server and database connections...`);
  server.close(() => {
    void prisma
      .$disconnect()
      .then(() => {
        console.info('Shutdown complete.');
        process.exit(0);
      })
      .catch(() => process.exit(1));
  });

  setTimeout(() => {
    console.error('Forced exit after timeout.');
    void prisma.$disconnect().finally(() => process.exit(1));
  }, 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
