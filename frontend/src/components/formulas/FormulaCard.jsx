import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Scale, ArrowRight, Zap, Calculator, Copy, Check, Eye } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import MathView from '../common/MathView';

function FormulaCard({ formula, onQuickInspect }) {
  const { bookmarks, toggleBookmark, compareList, addToCompare, setActiveSolverSlug } = useStudent();
  const [copied, setCopied] = useState(false);

  const isBookmarked = bookmarks.has(formula.id) || bookmarks.has(formula.formula_id);
  const isCompared = compareList.some((f) => f.id === formula.id);

  const handleCopyLatex = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (formula.formula_latex) {
      navigator.clipboard.writeText(formula.formula_latex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSubjectColorDot = (subject) => {
    const s = (subject || '').toLowerCase();
    if (s.includes('geom')) return 'bg-emerald-500';
    if (s.includes('calc')) return 'bg-blue-500';
    if (s.includes('phys')) return 'bg-purple-500';
    if (s.includes('algeb')) return 'bg-amber-500';
    if (s.includes('trig')) return 'bg-cyan-500';
    if (s.includes('stat')) return 'bg-teal-500';
    if (s.includes('prob')) return 'bg-rose-500';
    if (s.includes('linear')) return 'bg-indigo-500';
    if (s.includes('comp') || s.includes('cs')) return 'bg-violet-500';
    return 'bg-zinc-500';
  };

  const getLevelBadgeClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50';
      case 'intermediate':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/50';
      case 'advanced':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/50';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/60';
    }
  };

  const hasSolver = [
    'quadratic-equation',
    'circle-area',
    'pythagorean-theorem',
    'gcd-lcm',
    'compound-interest',
  ].includes(formula.formula_id || formula.slug);

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group hover:border-black dark:hover:border-white relative overflow-hidden">
      
      {/* Top Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${getSubjectColorDot(formula.subject_name)}`} />
            <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              {formula.subject_name || 'Mathematics'}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Quick Inspect Button */}
            {onQuickInspect && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickInspect(formula);
                }}
                title="Quick Peek Formula Details"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              </button>
            )}

            {/* 1-Click Copy LaTeX */}
            <button
              onClick={handleCopyLatex}
              title={copied ? "LaTeX Copied!" : "Copy LaTeX equation"}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Compare */}
            <button
              onClick={() => addToCompare(formula)}
              disabled={isCompared}
              title={isCompared ? 'Already in comparison dock' : 'Add to side-by-side comparison'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isCompared
                  ? 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                  : 'text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>

            {/* Bookmark */}
            <button
              onClick={() => toggleBookmark(formula.id)}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark formula'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isBookmarked
                  ? 'text-amber-500 fill-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                  : 'text-zinc-400 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <div>
          <Link
            to={`/lesson/${formula.slug}`}
            className="font-heading font-bold text-base text-zinc-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors line-clamp-1 group-hover:underline"
          >
            {formula.title}
          </Link>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
            {formula.summary}
          </p>
        </div>

        {/* Math Display Box */}
        <div 
          onClick={(e) => {
            if (onQuickInspect) {
              e.preventDefault();
              onQuickInspect(formula);
            }
          }}
          title={onQuickInspect ? "Click to inspect formula details" : undefined}
          className="relative py-3.5 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center font-mono text-xs overflow-x-auto scrollbar-none min-h-[54px] flex items-center justify-center cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
        >
          <MathView math={formula.formula_latex} display={true} />
        </div>
      </div>

      {/* Card Footer: Metadata & Quick Actions */}
      <div className="pt-3.5 mt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`px-2 py-0.5 rounded-md border font-medium capitalize text-[10px] ${getLevelBadgeClass(formula.level)}`}>
            {formula.level}
          </span>

          {formula.has_demo && (
            <Link
              to={`/lab?id=${formula.formula_id || formula.slug}`}
              title="Open interactive 60 FPS visual lab"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium text-[10px] border border-amber-500/20 transition-colors"
            >
              <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              <span>Lab</span>
            </Link>
          )}

          {hasSolver && (
            <button
              onClick={() => setActiveSolverSlug(formula.formula_id || formula.slug)}
              title="Launch Step-by-Step Solver"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-[10px] border border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              <Calculator className="w-2.5 h-2.5 text-cyan-500" />
              <span>Solver</span>
            </button>
          )}
        </div>

        <Link
          to={`/lesson/${formula.slug}`}
          className="inline-flex items-center gap-1 font-semibold text-xs text-black dark:text-white hover:underline transition-all shrink-0"
        >
          <span>Explore</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

export default memo(FormulaCard);
