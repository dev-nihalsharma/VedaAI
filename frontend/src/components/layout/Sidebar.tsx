'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/authSlice';
import type { RootState } from '@/store';

const NAV = [
  { href: '/assignments', label: 'Home', match: (p: string) => p === '/' },
  { href: '#', label: 'My Groups' },
  { href: '/assignments', label: 'Assignments', match: (p: string) => p.startsWith('/assignments') },
  { href: '#', label: "AI Teacher's Toolkit" },
  { href: '#', label: 'My Library' },
];

export function Sidebar() {
  const pathname = usePathname() || '';
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);

  return (
    <aside className="hidden lg:flex no-print w-64 shrink-0 flex-col bg-white border-r border-gray-100 h-screen sticky top-0">
      <div className="px-6 pt-6 pb-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-white text-sm font-bold">V</div>
        <span className="font-semibold text-lg">VedaAI</span>
      </div>

      <div className="px-4">
        <button
          onClick={() => router.push('/assignments/new')}
          className="w-full bg-brand text-white rounded-full py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90"
        >
          <span>+</span> Create Assignment
        </button>
      </div>

      <nav className="mt-6 px-2 flex-1">
        {NAV.map((item) => {
          const active = item.match ? item.match(pathname) : false;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={
                'flex items-center px-4 py-2.5 rounded-lg text-sm mb-1 ' +
                (active ? 'bg-gray-100 text-ink font-medium' : 'text-muted hover:bg-gray-50')
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-5 border-t border-gray-100 pt-4 mt-auto">
        <Link href="#" className="text-sm text-muted px-2 block mb-3">Settings</Link>
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
            {(user?.name || 'JD').split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </div>
          <div className="text-xs">
            <div className="font-semibold">{user?.school?.split(',')[0] || 'Delhi Public School'}</div>
            <div className="text-muted">{user?.school?.split(',').slice(1).join(',').trim() || 'Bokaro Steel City'}</div>
          </div>
        </div>
        <button
          onClick={() => {
            dispatch(logout());
            router.push('/login');
          }}
          className="mt-3 text-xs text-muted hover:text-ink"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
