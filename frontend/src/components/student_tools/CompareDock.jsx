import React, { useState } from 'react';
import { Scale, X, ArrowRight } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import FormulaComparisonModal from './FormulaComparisonModal';

export default function CompareDock() {
  const { compareList, removeFromCompare, clearCompare } = useStudent();
  const [modalOpen, setModalOpen] = useState(false);

  if (!compareList || compareList.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-3 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
          <Scale className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
          <span>Compare ({compareList.length}/3):</span>
        </div>

        <div className="flex items-center gap-1.5">
          {compareList.map((formula) => (
            <span
              key={formula.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
            >
              <span className="max-w-[100px] truncate">{formula.title}</span>
              <button
                onClick={() => removeFromCompare(formula.id)}
                className="text-zinc-400 hover:text-rose-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-200 dark:border-zinc-800">
          <button
            onClick={clearCompare}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-1.5 py-1"
          >
            Clear
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-3 py-1 rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all active:scale-[0.98] flex items-center gap-1"
          >
            <span>Compare</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {modalOpen && (
        <FormulaComparisonModal onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
