import React, { useState, useEffect } from 'react';
import { X, Calculator, ArrowRight, Sparkles, AlertCircle, Copy, Check } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { solverApi } from '../../api/formulasApi';
import MathView from '../common/MathView';

export default function StepByStepSolverModal() {
  const { activeSolverSlug, setActiveSolverSlug } = useStudent();
  const [solverInfo, setSolverInfo] = useState(null);
  const [inputs, setInputs] = useState({});
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedResult, setCopiedResult] = useState(false);

  const handleCopyResult = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  useEffect(() => {
    if (!activeSolverSlug) {
      setSolverInfo(null);
      setSolution(null);
      return;
    }

    const loadSolver = async () => {
      setLoading(true);
      setError(null);
      try {
        const solvers = await solverApi.getSolvers();
        const found = solvers.find((s) => s.slug === activeSolverSlug) || solvers[0];
        setSolverInfo(found);

        // initialize default values
        const defaults = {};
        (found.inputs_schema || []).forEach((inp) => {
          defaults[inp.id] = inp.default;
        });
        setInputs(defaults);

        // run initial calculation
        const initialRes = await solverApi.calculate(found.slug, defaults);
        setSolution(initialRes);
      } catch (err) {
        setError('Failed to load solver module.');
      } finally {
        setLoading(false);
      }
    };

    loadSolver();
  }, [activeSolverSlug]);

  const handleInputChange = (id, val) => {
    setInputs((prev) => ({ ...prev, [id]: val }));
  };

  const handleCalculate = async (e) => {
    e?.preventDefault();
    if (!solverInfo) return;
    setLoading(true);
    setError(null);
    try {
      const res = await solverApi.calculate(solverInfo.slug, inputs);
      if (!res.success) {
        setError(res.error || 'Calculation failed');
        setSolution(null);
      } else {
        setSolution(res);
      }
    } catch (err) {
      setError(err.message || 'Error executing solver.');
    } finally {
      setLoading(false);
    }
  };

  if (!activeSolverSlug || !solverInfo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-100"
      onClick={() => setActiveSolverSlug(null)}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
                {solverInfo.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Live parameter evaluation with intermediate algebraic derivations
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSolverSlug(null)}
            className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Formula Display */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Governing Equation
            </span>
            <div className="text-base text-zinc-800 dark:text-zinc-100">
              <MathView math={solverInfo.formula_latex} display={true} />
            </div>
          </div>

          {/* Dynamic Inputs Form */}
          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {solverInfo.inputs_schema.map((inp) => (
                <div key={inp.id} className="space-y-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    {inp.label}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={inputs[inp.id] ?? ''}
                    onChange={(e) => handleInputChange(inp.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Evaluating...' : 'Solve & Show Derivations'}</span>
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Solution & Derivation Steps */}
          {solution && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Computed Result Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100 flex items-start justify-between gap-3 shadow-xs">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                    Computed Verified Solution
                  </span>
                  <div className="font-heading font-extrabold text-lg sm:text-xl">
                    {solution.result}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyResult(solution.result)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
                >
                  {copiedResult ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Step-by-Step Breakdown */}
              {solution.steps && solution.steps.length > 0 && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Intermediate Algebraic Steps:</span>
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">
                      {solution.steps.length} Steps
                    </span>
                  </div>

                  <div className="space-y-3 relative pl-3 sm:pl-4 before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
                    {solution.steps.map((st) => (
                      <div
                        key={st.step}
                        className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 relative shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-black text-white dark:bg-white dark:text-black font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {st.step}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                            {st.title}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 pl-8 leading-relaxed">
                          {st.description}
                        </p>
                        {st.latex && (
                          <div className="ml-8 p-2.5 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 overflow-x-auto font-mono">
                            <MathView math={st.latex} display={true} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
