'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import AppShell from '@/components/layout/AppShell';

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isAuthenticated, pathname, router]);

  // Login page always renders without shell
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Not authenticated — show nothing (redirect is happening)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-forest-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Authenticated — show with AppShell
  return <AppShell>{children}</AppShell>;
}
