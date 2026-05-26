import { Server as IOServer } from 'socket.io';

let io: IOServer | null = null;

export function setIO(server: IOServer): void {
  io = server;
}

export function emitJobUpdate(assignmentId: string, payload: unknown): void {
  if (!io) return;
  io.to(`assignment:${assignmentId}`).emit('job', payload);
}
