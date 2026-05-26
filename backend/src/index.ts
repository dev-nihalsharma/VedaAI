import http from 'http';
import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectMongo } from './db/mongo';
import authRoutes from './routes/auth.routes';
import assignmentsRoutes from './routes/assignments.routes';
import { attachWebSocket } from './ws/server';
import { startGenerationWorker } from './queues/generation.worker';

async function main() {
  await connectMongo();

  const app = express();
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api/assignments', assignmentsRoutes);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[api] error', err);
    res.status(500).json({ error: err?.message || 'Internal error' });
  });

  const httpServer = http.createServer(app);
  attachWebSocket(httpServer);

  startGenerationWorker();

  httpServer.listen(env.PORT, () => {
    console.log(`[api] listening on :${env.PORT}`);
    console.log(`[ws]  listening on :${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('[bootstrap] fatal', err);
  process.exit(1);
});
