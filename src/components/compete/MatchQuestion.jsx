import React, { useMemo, useState, useEffect } from 'react';

// Simplified Match Question where options are presented as pairs to connect
export function MatchQuestion({ question, answer, onChange }) {
  const pairs = useMemo(() => {
    try {
      return typeof question.options === 'string' ? JSON.parse(question.options) : question.options;
    } catch (e) {
      return { left: [], right: [] };
    }
  }, [question.options]);

  // answer format: { "leftItem1": "rightItem2", ... }
  const currentAnswers = answer || {};

  const handleSelect = (leftItem, e) => {
    onChange({
      ...currentAnswers,
      [leftItem]: e.target.value
    });
  };

  if (!pairs.left || !pairs.right) return <div>Invalid match data.</div>;

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {pairs.left.map((leftItem, idx) => (
        <div key={idx} className="flex items-center gap-4 p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)]">
          <div className="flex-1 font-medium">{leftItem}</div>
          <div className="flex-shrink-0 font-bold text-[var(--text-muted)]">➔</div>
          <div className="flex-1">
            <select
              value={currentAnswers[leftItem] || ''}
              onChange={(e) => handleSelect(leftItem, e)}
              className="w-full p-2 rounded border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
            >
              <option value="" disabled>Select match...</option>
              {pairs.right.map((rightItem, rIdx) => (
                <option key={rIdx} value={rightItem}>
                  {rightItem}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
