'use client';

import dynamic from 'next/dynamic';

// ConditionalShell depends on localStorage (auth state) — must not be SSR-ed
// to avoid hydration mismatch between server (unauthenticated) and client (authenticated)
const ConditionalShell = dynamic(
  () => import('@/components/layout/ConditionalShell'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-forest-400 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return <ConditionalShell>{children}</ConditionalShell>;
}
