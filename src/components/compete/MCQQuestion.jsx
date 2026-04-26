import React, { useMemo } from 'react';
import { classNames } from '@/lib/utils';

export function MCQQuestion({ question, answer, onChange }) {
  // Parse options if it's a string (from DB)
  const options = useMemo(() => {
    try {
      return typeof question.options === 'string' ? JSON.parse(question.options) : question.options;
    } catch (e) {
      return [];
    }
  }, [question.options]);

  // Determine if it's multi-select based on the correct answer structure from admin, 
  // but since client doesn't see correct answers, we could infer it from a flag.
  // For simplicity in this demo, let's assume it's single select unless options are specifically rendered with checkboxes.
  // We will treat it as an array to be safe.
  const currentSelection = Array.isArray(answer) ? answer : (answer ? [answer] : []);

  const handleToggle = (opt) => {
    // Single select mode for now
    onChange([opt]);
  };

  if (!options || options.length === 0) return <div>No options available.</div>;

  return (
    <div className="flex flex-col gap-3">
      {options.map((opt, idx) => {
        const isSelected = currentSelection.includes(opt);
        return (
          <button
            key={idx}
            type="button"
            onClick={() => handleToggle(opt)}
            className={classNames(
              "flex items-center w-full text-left p-4 rounded-lg border transition-all duration-200",
              isSelected 
                ? "border-[var(--accent-primary)] bg-[rgba(99,102,241,0.1)] text-[var(--accent-primary)] font-medium" 
                : "border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-gray-400"
            )}
          >
            <div className={classNames(
              "flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition-colors",
              isSelected ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]" : "border-gray-400"
            )}>
              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
