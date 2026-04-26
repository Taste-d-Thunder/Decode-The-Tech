"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] p-4 text-center">
      <div className="max-w-md w-full glass p-8 rounded-xl border border-[var(--danger)]">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Something went wrong!</h2>
        <p className="text-[var(--text-muted)] mb-6">
          {error.message || "An unexpected error occurred in the application."}
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="primary" onClick={() => reset()}>
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
