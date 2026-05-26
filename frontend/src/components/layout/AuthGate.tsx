'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useSelector((s: RootState) => s.auth.token);

  useEffect(() => {
    // Wait until hydration sets either a token or definitively null.
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('token');
    if (!stored) router.replace('/login');
  }, [router]);

  if (!token && typeof window !== 'undefined' && !window.localStorage.getItem('token')) {
    return null;
  }
  return <>{children}</>;
}
