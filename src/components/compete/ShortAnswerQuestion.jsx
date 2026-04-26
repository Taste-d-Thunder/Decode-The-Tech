import React from 'react';
import { Input } from '@/components/ui/Input';

export function ShortAnswerQuestion({ question, answer, onChange }) {
  return (
    <div className="w-full max-w-xl">
      <Input
        value={answer || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here..."
        className="text-lg py-6 px-4"
      />
    </div>
  );
}
