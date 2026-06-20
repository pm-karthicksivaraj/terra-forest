'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TerraForestPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-forest-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Redirecting to Dashboard...</p>
      </div>
    </div>
  );
}
