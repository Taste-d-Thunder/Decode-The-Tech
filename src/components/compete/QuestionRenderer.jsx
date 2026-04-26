import React from 'react';
import { classNames } from '@/lib/utils';
import { MCQQuestion } from './MCQQuestion';
import { TrueFalseQuestion } from './TrueFalseQuestion';
import { ShortAnswerQuestion } from './ShortAnswerQuestion';
import { MatchQuestion } from './MatchQuestion';
// import { OrderingQuestion } from './OrderingQuestion'; // Future scope

export function QuestionRenderer({ question, index, answer, onAnswerChange }) {
  if (!question) return null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--accent-primary)] text-white font-bold shrink-0">
            {index + 1}
          </span>
          <h3 className="text-xl font-medium text-[var(--text-primary)] pt-1 whitespace-pre-wrap">
            {question.text}
          </h3>
        </div>
        <div className="flex flex-col items-end shrink-0 ml-4 gap-1">
          <span className="text-sm font-semibold bg-[var(--bg-tertiary)] px-2 py-1 rounded border border-[var(--border-color)]">
            {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
          </span>
          {question.negativeMarks > 0 && (
            <span className="text-xs text-[var(--danger)]">
              -{question.negativeMarks} Negative
            </span>
          )}
        </div>
      </div>

      {question.imageUrl && (
        <div className="mt-4 rounded-lg overflow-hidden border border-[var(--border-color)] max-w-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={question.imageUrl} 
            alt="Question reference" 
            className="w-full h-auto object-contain max-h-96"
          />
        </div>
      )}

      <div className="pl-12 mt-2">
        {question.type === 'MCQ' && (
          <MCQQuestion 
            question={question} 
            answer={answer} 
            onChange={(val) => onAnswerChange(question.id, val)} 
          />
        )}
        {question.type === 'TRUE_FALSE' && (
          <TrueFalseQuestion 
            question={question} 
            answer={answer} 
            onChange={(val) => onAnswerChange(question.id, val)} 
          />
        )}
        {question.type === 'SHORT_ANSWER' && (
          <ShortAnswerQuestion 
            question={question} 
            answer={answer} 
            onChange={(val) => onAnswerChange(question.id, val)} 
          />
        )}
        {question.type === 'MATCH' && (
          <MatchQuestion 
            question={question} 
            answer={answer} 
            onChange={(val) => onAnswerChange(question.id, val)} 
          />
        )}
        {/* Placeholder for unsupported types */}
        {['IMAGE', 'ORDERING'].includes(question.type) && (
          <div className="p-4 border border-dashed border-[var(--warning)] rounded text-[var(--warning)]">
            This question type ({question.type}) is under development.
          </div>
        )}
      </div>
    </div>
  );
}
