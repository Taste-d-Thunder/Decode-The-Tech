import React from 'react';
import { classNames } from '@/lib/utils';

export function RoundProgress({ current, total }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <div className="flex justify-between text-sm font-medium text-[var(--text-secondary)]">
        <span>Question {current} of {total}</span>
        <span>{Math.round((current / total) * 100)}%</span>
      </div>
      <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[var(--accent-primary)] transition-all duration-300 ease-out"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
