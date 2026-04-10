'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import BottomNav from '@/components/layout/bottom-nav';

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useApp();

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return null;
  }

  const showBottomNav = pathname === '/notifications';

  return (
    <>
      {children}
      {showBottomNav && <BottomNav />}
    </>
  );
}
