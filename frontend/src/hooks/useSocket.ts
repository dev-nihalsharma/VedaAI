'use client';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { ingestEvent } from '@/store/jobsSlice';
import type { JobEvent } from '@shared/types';
import type { RootState } from '@/store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

let singleton: Socket | null = null;

function getSocket(token: string): Socket {
  if (singleton && singleton.connected && (singleton.auth as any)?.token === token) {
    return singleton;
  }
  if (singleton) {
    singleton.disconnect();
  }
  singleton = io(WS_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
  });
  return singleton;
}

export function useAssignmentSocket(assignmentId: string | null): void {
  const dispatch = useDispatch();
  const token = useSelector((s: RootState) => s.auth.token);
  const subscribedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token || !assignmentId) return;
    const socket = getSocket(token);

    const handleJob = (e: JobEvent) => {
      dispatch(ingestEvent({ assignmentId, event: e }));
    };

    const subscribe = () => {
      socket.emit('subscribe', { assignmentId });
      subscribedRef.current = assignmentId;
    };

    if (socket.connected) subscribe();
    else socket.once('connect', subscribe);

    socket.on('job', handleJob);

    return () => {
      socket.off('job', handleJob);
      socket.emit('unsubscribe', { assignmentId });
      subscribedRef.current = null;
    };
  }, [assignmentId, token, dispatch]);
}
