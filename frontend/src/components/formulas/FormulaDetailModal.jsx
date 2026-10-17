import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Copy,
  Check,
  Zap,
  Calculator,
  Bookmark,
  Scale,
  ArrowRight,
  Code,
  Sparkles,
  BookOpen,
  Video,
  Layers
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import MathView from '../common/MathView';

export default function FormulaDetailModal({ formula, onClose }) {
  const { bookmarks, toggleBookmark, compareList, addToCompare, setActiveSolverSlug } = useStudent();
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('python'); // 'python' | 'c'
  const [copiedCode, setCopiedCode] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!formula) return null;

  const isBookmarked = bookmarks.has(formula.id) || bookmarks.has(formula.formula_id);
  const isCompared = compareList.some((f) => f.id === formula.id);

  const handleCopyLatex = () => {
    if (formula.formula_latex) {
      navigator.clipboard.writeText(formula.formula_latex);
      setCopiedLatex(true);
      setTimeout(() => setCopiedLatex(false), 2000);
    }
  };

  // Sample code generation for instant preview
  const pythonSnippet = `# Python 3 Implementation
import math

def calculate_${(formula.slug || 'formula').replace(/-/g, '_')}(**kwargs):
    """
    ${formula.title}
    ${formula.summary}
    """
    # Mathematical formulation
    # LaTeX: ${formula.formula_latex}
    pass
`;

  const cSnippet = `// C (C11) Implementation
#include <stdio.h>
#include <math.h>

// ${formula.title}
// LaTeX: ${formula.formula_latex}
double calculate_${(formula.slug || 'formula').replace(/-/g, '_')}(double x) {
    // Implementation with domain bounds checks
    return x;
}
`;

  const handleCopyCode = () => {
    const code = activeCodeTab === 'python' ? pythonSnippet : cSnippet;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const hasSolver = [
    'quadratic-equation',
    'circle-area',
    'pythagorean-theorem',
    'gcd-lcm',
    'compound-interest',
  ].includes(formula.formula_id || formula.slug);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {formula.subject_name || 'Mathematics'}
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {formula.level || 'Intermediate'}
              </span>
              {formula.has_demo && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Zap className="w-2.5 h-2.5 fill-amber-500" />
                  <span>Interactive Lab Available</span>
                </span>
              )}
            </div>

            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-black dark:text-white">
              {formula.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          
          {/* Main Equation Box */}
          <div className="relative p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center">
            <button
              onClick={handleCopyLatex}
              title={copiedLatex ? "LaTeX Copied!" : "Copy LaTeX equation"}
              className="absolute top-3 right-3 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedLatex ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>LaTeX</span>
                </>
              )}
            </button>

            <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Governing Equation
            </span>

            <div className="text-xl sm:text-2xl font-mono py-2 overflow-x-auto scrollbar-none">
              <MathView math={formula.formula_latex} display={true} />
            </div>
          </div>

          {/* Intuition & Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>Conceptual Intuition</span>
            </h3>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {formula.summary}
            </p>
          </div>

          {/* Topics & Keywords Tags */}
          {formula.topics && formula.topics.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Related Topics & Keywords
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {formula.topics.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Code Implementation Tabs */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold">
                <button
                  onClick={() => setActiveCodeTab('python')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    activeCodeTab === 'python'
                      ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-2xs'
                      : 'text-zinc-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Python 3
                </button>
                <button
                  onClick={() => setActiveCodeTab('c')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    activeCodeTab === 'c'
                      ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-2xs'
                      : 'text-zinc-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  C (C11)
                </button>
              </div>

              <button
                onClick={handleCopyCode}
                className="text-xs text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-zinc-900 text-zinc-200 text-xs font-mono overflow-x-auto scrollbar-thin border border-zinc-800">
              <code>{activeCodeTab === 'python' ? pythonSnippet : cSnippet}</code>
            </pre>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBookmark(formula.id)}
              className={`p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{isBookmarked ? 'Bookmarked' : 'Save'}</span>
            </button>

            <button
              onClick={() => addToCompare(formula)}
              disabled={isCompared}
              className={`p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                isCompared
                  ? 'opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isCompared ? 'In Compare Dock' : 'Compare'}</span>
            </button>

            {hasSolver && (
              <button
                onClick={() => {
                  onClose();
                  setActiveSolverSlug(formula.formula_id || formula.slug);
                }}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-cyan-500" />
                <span>Solver</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {formula.has_demo && (
              <Link
                to={`/lab?id=${formula.formula_id || formula.slug}`}
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Open 60 FPS Lab</span>
              </Link>
            )}

            <Link
              to={`/lesson/${formula.slug}`}
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
            >
              <span>Full Lesson Derivation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
