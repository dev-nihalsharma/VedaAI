'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Image from 'next/image';
import { setAuth } from '@/store/authSlice';
import { useLoginMutation } from '@/store/api';
import logo from '../../../assets/logo.png';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('johndoe@vedaai.test');
  const [password, setPassword] = useState('password123');
  const [login, { isLoading, error }] = useLoginMutation();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage.getItem('token')) {
      router.replace('/assignments');
    }
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setAuth(res));
      router.replace('/assignments');
    } catch {
      // error is rendered below
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-soft p-8 w-full max-w-md">
        <div className="mb-6">
          <Image src={logo} alt="VedaAI" height={32} className="object-contain" />
        </div>
        <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
        <p className="text-sm text-muted mb-6">Log in to continue creating assignments.</p>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand/20"
            />
          </label>
          {error && (
            <div className="text-sm text-hard">
              {(error as any)?.data?.error || 'Login failed'}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand text-white rounded-full py-2.5 font-medium disabled:opacity-60"
          >
            {isLoading ? 'Signing in…' : 'Log in'}
          </button>
        </form>
        <p className="text-xs text-muted mt-4">
          Seeded teacher: <code>johndoe@vedaai.test</code> / <code>password123</code>
        </p>
      </div>
    </main>
  );
}
