'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { FaHome, FaBook } from 'react-icons/fa';
import { FaBrain } from 'react-icons/fa';
import { FaClipboardList } from 'react-icons/fa';

const TABS = [
  { href: '/assignments?tab=home', label: 'Home', tab: 'home', icon: FaHome },
  { href: '/assignments', label: 'Assignments', tab: null, icon: FaClipboardList },
  { href: '/assignments?tab=library', label: 'Library', tab: 'library', icon: FaBook },
  { href: '/assignments?tab=toolkit', label: 'AI Toolkit', tab: 'toolkit', icon: FaBrain },
];

function BottomNavContent() {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab');

  return (
    <>
      {TABS.map(({ href, label, tab, icon: Icon }) => {
        const active = tab
          ? activeTab === tab
          : pathname.startsWith('/assignments') && !activeTab;
        return (
          <Link
            key={label}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1"
          >
            <Icon className={`text-xl ${active ? 'text-brand' : 'text-gray-400'}`} />
            <span className={`text-[10px] font-medium ${active ? 'text-brand' : 'text-gray-400'}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </>
  );
}

export function BottomNav() {
  return (
    <nav className="lg:hidden no-print fixed bottom-3 left-3 right-3 z-50 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] flex items-stretch h-16">
      <Suspense>
        <BottomNavContent />
      </Suspense>
    </nav>
  );
}
