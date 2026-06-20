'use client';

import React from 'react';

// AuthGate is now a pass-through component.
// Auth logic (redirect to login, show loading) is handled by ConditionalShell in the root layout.
// This component is kept for backwards compatibility with sub-pages that import it.
export default function AuthGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
