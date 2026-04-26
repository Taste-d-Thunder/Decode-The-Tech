import React from 'react';
import { classNames } from '@/lib/utils';

export function TrueFalseQuestion({ question, answer, onChange }) {
  const currentSelection = answer; // String 'True' or 'False'

  return (
    <div className="flex gap-4">
      {['True', 'False'].map((opt) => {
        const isSelected = currentSelection === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={classNames(
              "flex-1 py-4 px-6 rounded-lg border transition-all text-center text-lg font-medium",
              isSelected 
                ? (opt === 'True' 
                    ? "border-[var(--success)] bg-[rgba(16,185,129,0.1)] text-[var(--success)]" 
                    : "border-[var(--danger)] bg-[rgba(239,68,68,0.1)] text-[var(--danger)]")
                : "border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
