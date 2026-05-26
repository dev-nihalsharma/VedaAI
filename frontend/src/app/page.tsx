'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = typeof window !== 'undefined' && window.localStorage.getItem('token');
    router.replace(token ? '/assignments' : '/login');
  }, [router]);
  return null;
}
