import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, CornerDownLeft, Sparkles, BookOpen } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { formulasApi } from '../../api/formulasApi';
import MathView from './MathView';

export default function GlobalSearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useStudent();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isSearchOpen]);

  // Live Search with Debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await formulasApi.getFormulas({ search: query });
        setResults(data.slice(0, 8));
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        selectFormula(results[selectedIndex]);
      }
    }
  };

  const selectFormula = (formula) => {
    setIsSearchOpen(false);
    navigate(`/lesson/${formula.slug}`);
  };

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-100"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 gap-3">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search formulas, subjects, symbols (e.g. Pythagoras, quadratic, pi, calculus)..."
            className="flex-1 bg-transparent border-none outline-none text-black dark:text-white placeholder-zinc-400 text-base"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {loading && (
            <div className="py-8 text-center text-sm text-zinc-400">Searching mathematical index...</div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-8 text-center text-sm text-zinc-400">
              No formulas found for "{query}". Try searching by subject like <span className="font-semibold text-zinc-700 dark:text-zinc-300">Geometry</span> or <span className="font-semibold text-zinc-700 dark:text-zinc-300">Calculus</span>.
            </div>
          )}

          {!loading && results.map((formula, idx) => (
            <div
              key={formula.id}
              onClick={() => selectFormula(formula)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-4 ${
                selectedIndex === idx
                  ? 'bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white font-medium'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-zinc-800 dark:text-zinc-200'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate">{formula.title}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {formula.subject_name}
                  </span>
                  {formula.has_demo && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      ⚡ Demo
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {formula.summary}
                </div>
              </div>

              {formula.formula_latex && (
                <div className="hidden sm:block flex-shrink-0 text-right font-mono text-xs px-2.5 py-1 rounded bg-zinc-50 dark:bg-black border border-zinc-200/60 dark:border-zinc-800">
                  <MathView math={formula.formula_latex} />
                </div>
              )}
            </div>
          ))}

          {!query && (
            <div className="p-4 text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-500 dark:text-slate-300">Suggested Topics:</p>
              <div className="flex flex-wrap gap-2">
                {['Pythagorean Theorem', 'Circle Area', 'Quadratic Equation', 'Unit Circle', 'Derivatives', 'Bayes Theorem', 'GCD LCM'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Keybinds */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">↵</kbd> Open Lesson</span>
          </div>
          <span>Esc to exit</span>
        </div>
      </div>
    </div>
  );
}
