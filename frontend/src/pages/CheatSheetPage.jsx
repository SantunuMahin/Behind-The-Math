import React, { useState, useEffect } from 'react';
import { Printer, CheckSquare, Square, Download, Sparkles } from 'lucide-react';
import { formulasApi } from '../api/formulasApi';
import MathView from '../components/common/MathView';
import allFormulasRaw from '../data/allFormulas.json';
import { FALLBACK_SUBJECTS } from '../data/homeFallbackData';
import { normalizeFormula } from '../utils/formulaUtils';

export default function CheatSheetPage() {
  const [formulas, setFormulas] = useState(() => (allFormulasRaw || []).map(normalizeFormula));
  const [subjects, setSubjects] = useState(FALLBACK_SUBJECTS);
  const [selectedSubjects, setSelectedSubjects] = useState(() => new Set(FALLBACK_SUBJECTS.map((s) => s.slug)));
  const [columns, setColumns] = useState(3);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [forms, subs] = await Promise.all([
          formulasApi.getFormulas(),
          formulasApi.getSubjects(),
        ]);
        if (isMounted) {
          if (forms && Array.isArray(forms) && forms.length > 0) {
            setFormulas(forms.map(normalizeFormula));
          }
          if (subs && Array.isArray(subs) && subs.length > 0) {
            setSubjects(subs);
            setSelectedSubjects(new Set(subs.map((s) => s.slug)));
          }
        }
      } catch (err) {
        console.warn('Cheat sheet API fallback note:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSubject = (slug) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedSubjects(new Set(subjects.map((s) => s.slug)));
  };

  const deselectAll = () => {
    setSelectedSubjects(new Set());
  };

  const filteredFormulas = formulas.filter((f) => selectedSubjects.has(f.subject_slug));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Screen-only Controls (hidden when printing) */}
      <div className="space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exam Study Guide Generator</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-zinc-900 dark:text-white mt-1">
              Printable Formula Cheat Sheet
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Customize your formula selection and generate an exam review guide with 1 click.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Subject Checkboxes & Filter Options */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span>Include Subjects in Cheat Sheet:</span>
            <div className="flex items-center gap-2">
              <button onClick={selectAll} className="text-black dark:text-white font-bold hover:underline">
                Select All
              </button>
              <span>•</span>
              <button onClick={deselectAll} className="text-zinc-400 hover:underline">
                Clear
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {subjects.map((sub) => {
              const active = selectedSubjects.has(sub.slug);
              return (
                <button
                  key={sub.id}
                  onClick={() => toggleSubject(sub.slug)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                    active
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold'
                      : 'bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400'
                  }`}
                >
                  {active ? <CheckSquare className="w-3.5 h-3.5 text-white dark:text-black" /> : <Square className="w-3.5 h-3.5" />}
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Printable Cheat Sheet Document */}
      <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 sm:p-10 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 print:bg-white print:text-black print:border-none print:shadow-none print:p-0 transition-colors">
        
        {/* Document Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 print:border-zinc-300 pb-4 mb-6 flex items-baseline justify-between">
          <div>
            <h2 className="font-heading font-extrabold text-2xl text-zinc-900 dark:text-white print:text-black">
              BehindTheMath Formula Cheat Sheet
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
              Comprehensive Mathematical Index & Principles · Presented by Santunu Kaysar
            </p>
          </div>
          <span className="text-xs text-zinc-400">{filteredFormulas.length} formulas included</span>
        </div>

        {/* Cheat Sheet Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 gap-4`}>
          {filteredFormulas.map((f) => (
            <div
              key={f.id}
              className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900 print:bg-zinc-50 print:border-zinc-200 space-y-2 text-xs break-inside-avoid shadow-2xs"
            >
              <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                <span className="font-bold text-zinc-700 dark:text-zinc-300 print:text-zinc-700 uppercase">
                  {f.subject_name}
                </span>
                <span className="capitalize">{f.level}</span>
              </div>

              <div className="font-bold text-sm text-zinc-900 dark:text-white print:text-black truncate">
                {f.title}
              </div>

              <div className="py-2.5 text-center font-mono text-xs bg-white dark:bg-black print:bg-white rounded-xl border border-zinc-200 dark:border-zinc-800 print:border-zinc-200 overflow-x-auto">
                <MathView math={f.formula_latex} display={true} />
              </div>

              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 print:text-zinc-700 line-clamp-2 leading-tight">
                {f.summary}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
