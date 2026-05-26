import http from 'http';
import { Server as IOServer } from 'socket.io';
import { env } from '../config/env';
import { verifyToken } from '../middleware/auth';
import { setIO } from './emit';

export function attachWebSocket(httpServer: http.Server): IOServer {
  const io = new IOServer(httpServer, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Missing token'));
    const decoded = verifyToken(token);
    if (!decoded) return next(new Error('Invalid token'));
    (socket.data as any).userId = decoded.sub;
    next();
  });

  io.on('connection', (socket) => {
    socket.on('subscribe', (payload: { assignmentId?: string }) => {
      const id = payload?.assignmentId;
      if (!id || typeof id !== 'string') return;
      socket.join(`assignment:${id}`);
    });
    socket.on('unsubscribe', (payload: { assignmentId?: string }) => {
      const id = payload?.assignmentId;
      if (!id || typeof id !== 'string') return;
      socket.leave(`assignment:${id}`);
    });
  });

  setIO(io);
  return io;
}
