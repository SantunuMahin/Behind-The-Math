import React from 'react';
import { X, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext';
import MathView from '../common/MathView';

export default function FormulaComparisonModal({ onClose }) {
  const { compareList, removeFromCompare } = useStudent();

  const gridColsClass =
    compareList.length === 1
      ? 'md:grid-cols-1'
      : compareList.length === 2
      ? 'md:grid-cols-2'
      : 'md:grid-cols-3';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
            <div>
              <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
                Formula Side-by-Side Comparison
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Contrast definitions, variables, prerequisites, and computational properties
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="p-6 overflow-y-auto">
          {compareList.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-sm">
              No formulas selected to compare.
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${gridColsClass} gap-4`}>
              {compareList.map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {f.subject_name}
                      </span>
                      <button
                        onClick={() => removeFromCompare(f.id)}
                        className="text-xs text-rose-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    <h4 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
                      {f.title}
                    </h4>

                    {/* Formula LaTeX */}
                    <div className="p-3 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center font-mono text-xs">
                      <MathView math={f.formula_latex} display={true} />
                    </div>

                    {/* Summary */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Intuition / Summary
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {f.summary}
                      </p>
                    </div>

                    {/* Difficulty */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Level
                      </span>
                      <span className="text-xs capitalize font-medium text-slate-700 dark:text-slate-200">
                        {f.level}
                      </span>
                    </div>

                    {/* Topics */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Topics
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(f.topic_names || []).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <Link
                      to={`/lesson/${f.slug}`}
                      onClick={onClose}
                      className="block text-center w-full py-2 rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all active:scale-[0.98]"
                    >
                      Open Full Lesson →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
