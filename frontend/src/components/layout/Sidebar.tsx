'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/authSlice';
import type { RootState } from '@/store';
import { FaGear, FaUsers } from 'react-icons/fa6';
import { FaBook, FaBrain, FaHome, FaSignOutAlt } from 'react-icons/fa';
import logo from '../../../assets/logo.png';

const NAV = [
  { href: '/assignments?tab=home', label: 'Home', icon: <FaHome />, tab: 'home' },
  { href: '/assignments?tab=groups', label: 'My Groups', icon: <FaUsers />, tab: 'groups' },
  { href: '/assignments', label: 'Assignments', icon: <FaBook />, tab: null },
  { href: '/assignments?tab=toolkit', label: "AI Teacher's Toolkit", icon: <FaBrain />, tab: 'toolkit' },
  { href: '/assignments?tab=library', label: 'My Library', icon: <FaBook />, tab: 'library' },
];

function SidebarContent() {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab');
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);

  return (
    <aside className="hidden lg:flex no-print w-64 shrink-0 flex-col bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] m-3 h-[calc(100vh-1.5rem)] sticky top-3 overflow-y-auto">
      <div className="px-6 pt-6 pb-4 flex items-center gap-2">
        <Image src={logo} alt="VedaAI" height={42} className="object-contain" />
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
          const active = item.tab
            ? activeTab === item.tab
            : pathname.startsWith('/assignments') && !activeTab;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={
                'flex items-center px-4 py-2.5 rounded-lg text-sm mb-1 gap-2 ' +
                (active ? 'bg-gray-100 text-ink font-medium' : 'text-muted hover:bg-gray-50')
              }
            >
              {item.icon} {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-5 border-t border-gray-100 pt-4 mt-auto">
        <Link href="#" className="text-sm text-muted px-2 block mb-3 flex items-center gap-2 hover:text-ink"> <FaGear /> Settings</Link>
        <div className="flex justify-between items-center px-2 bg-gray-100 rounded-lg p-2">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
            {(user?.name || 'JD').split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </div>
          <div className="text-xs">
            <div className="font-semibold">{user?.school?.split(',')[0] || 'Delhi Public School'}</div>
            <div className="text-muted">{user?.school?.split(',').slice(1).join(',').trim() || 'Bokaro Steel City'}</div>
          </div>
          <button
            onClick={() => {
              dispatch(logout());
              router.push('/login');
            }}
            className=" text-xs text-muted  hover:text-ink"
          >
            <FaSignOutAlt className="w-4 h-4" /> 
          </button>
        </div>
      </div>
    </aside>
  );
}

export function Sidebar() {
  return (
    <Suspense>
      <SidebarContent />
    </Suspense>
  );
}
