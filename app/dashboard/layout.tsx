'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import BottomNav from '@/components/layout/bottom-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useApp();

  useEffect(() => {
    if (!currentUser && pathname !== '/') {
      router.push('/');
    }
  }, [currentUser, router, pathname]);

  if (!currentUser) {
    return null;
  }

  // Only show bottom nav on main pages
  const showBottomNav = [
    '/dashboard',
    '/vehicles',
    '/clients',
    '/notifications',
    '/more',
  ].includes(pathname);

  return (
    <>
      {children}
      {showBottomNav && <BottomNav />}
    </>
  );
}
