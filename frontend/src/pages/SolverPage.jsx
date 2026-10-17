import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Calculator, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RotateCcw,
  BookOpen,
  Zap,
  Info,
  Search,
  Edit3,
  Trash2,
  Share2,
  FileText
} from 'lucide-react';
import { solverApi } from '../api/formulasApi';
import MathView from '../components/common/MathView';
import InlineMath from '../components/common/InlineMath';
import SolverVisualCanvas from '../components/solver/SolverVisualCanvas';

// Comprehensive metadata, categories, icons, and preset scenarios for all 10 STEM solvers
const SOLVER_METADATA = {
  'quadratic-equation': {
    icon: '𝑥²',
    category: 'Algebra',
    badgeColor: 'bg-black text-white dark:bg-white dark:text-black',
    lessonSlug: 'quadratic-equation',
    presets: [
      { label: 'Two Real Roots (Δ > 0)', values: { a: 1, b: -5, c: 6 } },
      { label: 'Golden Ratio (x² - x - 1)', values: { a: 1, b: -1, c: -1 } },
      { label: 'Repeated Root (Δ = 0)', values: { a: 1, b: -6, c: 9 } },
      { label: 'Complex Roots (Δ < 0)', values: { a: 1, b: 2, c: 5 } },
    ]
  },
  'circle-area': {
    icon: '⭕',
    category: 'Geometry',
    badgeColor: 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black',
    lessonSlug: 'circle-area',
    presets: [
      { label: 'Radius r = 5', values: { r: 5 } },
      { label: 'Unit Circle r = 1', values: { r: 1 } },
      { label: 'Large Wheel r = 25', values: { r: 25 } },
    ]
  },
  'pythagorean-theorem': {
    icon: '📐',
    category: 'Geometry & Trig',
    badgeColor: 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black',
    lessonSlug: 'pythagorean-theorem',
    presets: [
      { label: 'Classic 3-4-5 Triangle', values: { a: 3, b: 4 } },
      { label: '5-12-13 Triangle', values: { a: 5, b: 12 } },
      { label: 'Isosceles Right (1-1-√2)', values: { a: 1, b: 1 } },
      { label: '8-15-17 Triangle', values: { a: 8, b: 15 } },
    ]
  },
  'gcd-lcm': {
    icon: '🔢',
    category: 'Number Theory',
    badgeColor: 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black',
    lessonSlug: 'gcd-lcm',
    presets: [
      { label: 'Classic 48 & 18', values: { a: 48, b: 18 } },
      { label: 'Euclid’s 1071 & 462', values: { a: 1071, b: 462 } },
      { label: 'Coprime Primes (17, 19)', values: { a: 17, b: 19 } },
    ]
  },
  'compound-interest': {
    icon: '📈',
    category: 'Stats & Finance',
    badgeColor: 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black',
    lessonSlug: null,
    presets: [
      { label: '$1,000 at 6% Monthly (5 yrs)', values: { p: 1000, r: 6, n: 12, t: 5 } },
      { label: '$5,000 at 8% Semi-Annual (10 yrs)', values: { p: 5000, r: 8, n: 2, t: 10 } },
      { label: '$10,000 at 10% Annual (30 yrs)', values: { p: 1000, r: 10, n: 1, t: 30 } },
    ]
  },
  'linear-system-2x2': {
    icon: '🔲',
    category: 'Linear & Vectors',
    badgeColor: 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black',
    lessonSlug: null,
    presets: [
      { label: 'Unique Intersection (1, 2)', values: { a1: 2, b1: 3, c1: 8, a2: 1, b2: -1, c2: -1 } },
      { label: 'Perpendicular Lines', values: { a1: 1, b1: 1, c1: 4, a2: 1, b2: -1, c2: 0 } },
      { label: 'Parallel Inconsistent', values: { a1: 2, b1: 4, c1: 6, a2: 2, b2: 4, c2: 10 } },
    ]
  },
  'derivative-polynomial': {
    icon: '∫′',
    category: 'Calculus',
    badgeColor: 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black',
    lessonSlug: 'gradient-descent-adam',
    presets: [
      { label: 'Parabola Minimum at x = 2', values: { a: 1, b: -4, c: 3, x0: 2 } },
      { label: 'Steep Slope at x = 4', values: { a: 1, b: -4, c: 3, x0: 4 } },
      { label: 'Inverted Parabola at x = 0', values: { a: -2, b: 6, c: 1, x0: 0 } },
    ]
  },
  'definite-integral': {
    icon: '∫',
    category: 'Calculus',
    badgeColor: 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black',
    lessonSlug: null,
    presets: [
      { label: '∫ [0 to 2] (3x² + 2x + 1) dx', values: { a_coeff: 3, b_coeff: 2, c_coeff: 1, lower: 0, upper: 2 } },
      { label: '∫ [0 to 1] (x²) dx = 1/3', values: { a_coeff: 1, b_coeff: 0, c_coeff: 0, lower: 0, upper: 1 } },
      { label: '∫ [1 to 3] (2x) dx = 8', values: { a_coeff: 0, b_coeff: 2, c_coeff: 0, lower: 1, upper: 3 } },
    ]
  },
  'vector-dot-cross': {
    icon: '↗',
    category: 'Linear & Vectors',
    badgeColor: 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black',
    lessonSlug: null,
    presets: [
      { label: 'Orthogonal Vectors (u · v = 0)', values: { u1: 1, u2: 0, u3: 0, v1: 0, v2: 1, v3: 0 } },
      { label: 'Standard 3D Bases', values: { u1: 1, u2: 2, u3: 3, v1: 4, v2: 5, v3: 6 } },
      { label: 'Parallel Vectors', values: { u1: 2, u2: 4, u3: 6, v1: 1, v2: 2, v3: 3 } },
    ]
  },
  'normal-zscore': {
    icon: '🔔',
    category: 'Stats & Finance',
    badgeColor: 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black',
    lessonSlug: null,
    presets: [
      { label: 'Mensa Level (X = 130, μ = 100, σ = 15)', values: { x: 130, mu: 100, sigma: 15 } },
      { label: 'Average Median (X = 100)', values: { x: 100, mu: 100, sigma: 15 } },
      { label: 'Top 1% Extreme (X = 135)', values: { x: 135, mu: 100, sigma: 15 } },
    ]
  },
};

const CATEGORIES = ['All', 'Algebra', 'Geometry & Trig', 'Calculus', 'Linear & Vectors', 'Stats & Finance'];

export default function SolverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSlug = searchParams.get('id') || searchParams.get('slug') || searchParams.get('s');

  const [solvers, setSolvers] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(urlSlug || 'quadratic-equation');
  const [inputs, setInputs] = useState({});
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [copiedResult, setCopiedResult] = useState(false);
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);

  // Scratchpad Canvas Refs
  const scratchRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [scratchColor, setScratchColor] = useState('pen');

  const workbenchRef = useRef(null);

  const handleCopyResult = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  const handleCopyLatexProof = () => {
    if (!solution || !solution.steps) return;
    const latexLines = solution.steps.map((st) => `% Step ${st.step}: ${st.title}\n${st.description}\n\\[\n${st.latex || ''}\n\\]`).join('\n\n');
    const fullProof = `% BehindTheMath Derivation Proof\n% Problem: ${currentSolver?.title}\n\n${latexLines}\n\n% Solution: ${solution.result}`;
    navigator.clipboard.writeText(fullProof);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2000);
  };

  // Scratchpad drawing logic
  useEffect(() => {
    if (!isScratchpadOpen || !scratchRef.current) return;
    const canvas = scratchRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth || 600;
    canvas.height = 160;

    // Grid lines
    ctx.strokeStyle = '#88888812';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, [isScratchpadOpen]);

  const startDrawing = (e) => {
    isDrawingRef.current = true;
    const canvas = scratchRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawingRef.current || !scratchRef.current) return;
    const canvas = scratchRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineWidth = scratchColor === 'eraser' ? 14 : 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = scratchColor === 'eraser' ? '#ffffff' : '#000000';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearScratch = () => {
    if (!scratchRef.current) return;
    const canvas = scratchRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Initial Load of all solvers
  useEffect(() => {
    const fetchSolvers = async () => {
      setLoading(true);
      try {
        const data = await solverApi.getSolvers();
        setSolvers(data);
        if (data.length > 0) {
          const target = data.find((s) => s.slug === (urlSlug || selectedSlug)) || data[0];
          initSolver(target, false);
        }
      } catch (err) {
        console.error('Failed to fetch solvers:', err);
        setError('Could not connect to solver engine.');
      } finally {
        setLoading(false);
      }
    };
    fetchSolvers();
  }, []);

  // React to URL searchParam changes
  useEffect(() => {
    if (urlSlug && urlSlug !== selectedSlug && solvers.length > 0) {
      const match = solvers.find((s) => s.slug === urlSlug);
      if (match) {
        initSolver(match, false);
      }
    }
  }, [urlSlug, solvers]);

  const initSolver = async (solver, shouldScroll = false) => {
    setSelectedSlug(solver.slug);
    setError(null);

    const defaults = {};
    (solver.inputs_schema || []).forEach((inp) => {
      defaults[inp.id] = inp.default;
    });
    setInputs(defaults);

    setEvaluating(true);
    try {
      const res = await solverApi.calculate(solver.slug, defaults);
      setSolution(res);
    } catch (err) {
      setError(err.message || 'Evaluation error');
      setSolution(null);
    } finally {
      setEvaluating(false);
    }

    if (shouldScroll && window.innerWidth < 1024 && workbenchRef.current) {
      workbenchRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectSolver = (solver) => {
    setSearchParams({ id: solver.slug });
    initSolver(solver, true);
  };

  const handleInputChange = (id, val) => {
    setInputs((prev) => ({ ...prev, [id]: val }));
  };

  const applyPreset = (presetValues) => {
    const merged = { ...inputs, ...presetValues };
    setInputs(merged);
    executeCalculation(selectedSlug, merged);
  };

  const handleResetDefaults = () => {
    if (!currentSolver) return;
    const defaults = {};
    (currentSolver.inputs_schema || []).forEach((inp) => {
      defaults[inp.id] = inp.default;
    });
    setInputs(defaults);
    executeCalculation(selectedSlug, defaults);
  };

  const executeCalculation = async (slug, formInputs) => {
    setEvaluating(true);
    setError(null);
    try {
      const res = await solverApi.calculate(slug, formInputs);
      if (!res.success) {
        setError(res.error || 'Calculation failed');
        setSolution(null);
      } else {
        setSolution(res);
      }
    } catch (err) {
      setError(err.message || 'Evaluation error');
      setSolution(null);
    } finally {
      setEvaluating(false);
    }
  };

  const handleCalculate = (e) => {
    e?.preventDefault();
    executeCalculation(selectedSlug, inputs);
  };

  const currentSolver = solvers.find((s) => s.slug === selectedSlug);
  const currentMeta = SOLVER_METADATA[selectedSlug] || {
    icon: '⚡',
    category: 'Mathematics',
    badgeColor: 'bg-zinc-800 text-white',
    lessonSlug: null,
    presets: []
  };

  const filteredSolvers = solvers.filter((s) => {
    const meta = SOLVER_METADATA[s.slug] || { category: 'Other' };
    const matchesCategory = activeCategory === 'All' || meta.category === activeCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || s.title.toLowerCase().includes(query) || s.slug.includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header with Coordinate Dot Grid Background */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-6 relative">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold shadow-xs">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Algebraic Engine</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-tight">
            Step-by-Step Formula Solver
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Enter custom parameters or select textbook scenarios. Explore intermediate algebraic laws, visual plots, and rigorous derivation proofs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/practice"
            className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Practice Problems</span>
          </Link>
          <Link
            to="/rankings"
            className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-opacity"
          >
            <span>🏆 Hall of Fame</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 2. Left Solver Navigation Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search solvers or formulas…"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-inner"
            />
          </div>

          {/* Solver Cards List */}
          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredSolvers.map((s) => {
              const meta = SOLVER_METADATA[s.slug] || {
                icon: '⚡',
                category: 'Math',
                badgeColor: 'bg-zinc-800 text-white',
              };
              const isSelected = selectedSlug === s.slug;

              return (
                <button
                  key={s.slug}
                  onClick={() => handleSelectSolver(s)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-150 group relative cursor-pointer ${
                    isSelected
                      ? 'border-black dark:border-white bg-zinc-950 text-white dark:bg-zinc-900 shadow-md ring-1 ring-black dark:ring-white'
                      : 'border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base select-none">{meta.icon}</span>
                      <h3 className={`text-xs sm:text-sm font-bold ${
                        isSelected ? 'text-white' : 'text-zinc-900 dark:text-white'
                      }`}>
                        {s.title}
                      </h3>
                    </div>

                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-zinc-700 uppercase tracking-wider whitespace-nowrap ${
                      isSelected ? 'bg-white text-black' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
                    }`}>
                      {meta.category}
                    </span>
                  </div>

                  {/* Typeset Math Preview */}
                  <div className={`py-1 px-2.5 rounded-xl text-center overflow-x-auto scrollbar-none transition-colors ${
                    isSelected ? 'bg-zinc-900 dark:bg-black text-white' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800'
                  }`}>
                    <div className="text-[11px]">
                      <MathView math={s.formula_latex} display={false} />
                    </div>
                  </div>

                  {isSelected && (
                    <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-6 rounded-r-full bg-white dark:bg-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Right Solver Workbench (8 cols) */}
        <div ref={workbenchRef} className="lg:col-span-8 space-y-6">
          {currentSolver ? (
            <div className="p-6 sm:p-7 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm space-y-6">
              
              {/* Header with Title & Action Links */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-850 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-lg shadow-xs">
                    {currentMeta.icon}
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-xl sm:text-2xl text-zinc-950 dark:text-white">
                      {currentSolver.title}
                    </h2>
                    <span className="text-xs text-zinc-400 font-medium">
                      Discipline: {currentMeta.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {currentMeta.lessonSlug && (
                    <Link
                      to={`/lesson/${currentMeta.lessonSlug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Full Lesson</span>
                      <ArrowRight className="w-3 h-3 opacity-60" />
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsScratchpadOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isScratchpadOpen ? 'Hide Scratchpad' : 'Scratchpad'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    title="Reset parameters to defaults"
                    className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white text-xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Interactive Scratchpad Drawer */}
              {isScratchpadOpen && (
                <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                      <span>Student Calculation Scratchpad</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setScratchColor('pen')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          scratchColor === 'pen'
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        Pen
                      </button>
                      <button
                        type="button"
                        onClick={() => setScratchColor('eraser')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          scratchColor === 'eraser'
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        Eraser
                      </button>
                      <button
                        type="button"
                        onClick={clearScratch}
                        className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Clear drawings"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <canvas
                    ref={scratchRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-crosshair touch-none shadow-inner"
                    style={{ height: '160px' }}
                  />
                </div>
              )}

              {/* Governing Formula Banner */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Governing Equation & Law
                </span>
                <div className="text-sm sm:text-base text-zinc-950 dark:text-white py-1 overflow-x-auto scrollbar-none font-medium">
                  <MathView math={currentSolver.formula_latex} display={true} />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              {currentMeta.presets && currentMeta.presets.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                    Textbook Scenarios & Presets:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentMeta.presets.map((pr, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyPreset(pr.values)}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                      >
                        {pr.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Inputs Form */}
              <form onSubmit={handleCalculate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(currentSolver.inputs_schema || []).map((inp) => (
                    <div key={inp.id} className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                        <span>{inp.label}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">({inp.id})</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={inputs[inp.id] ?? ''}
                        onChange={(e) => handleInputChange(inp.id, e.target.value)}
                        placeholder={`e.g. ${inp.default}`}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white font-mono transition-all shadow-inner"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={evaluating}
                  className="w-full py-3 rounded-2xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${evaluating ? 'animate-spin' : ''}`} />
                  <span>{evaluating ? 'Evaluating Transformations...' : 'Solve & Step Through Derivation'}</span>
                </button>
              </form>

              {/* Real-time Graphical Visualizer Canvas */}
              <SolverVisualCanvas
                slug={selectedSlug}
                inputs={inputs}
                calculatedValues={solution?.calculated_values || {}}
              />

              {/* Error Box */}
              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Solution & Derivation Steps */}
              {solution && (
                <div className="space-y-4 pt-2">
                  <div className="p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-white flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 block">
                        Verified Mathematical Solution
                      </span>
                      <div className="font-heading font-black text-lg sm:text-xl text-zinc-950 dark:text-white">
                        {solution.result}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start">
                      <button
                        type="button"
                        onClick={() => handleCopyResult(solution.result)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        {copiedResult ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedResult ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyLatexProof}
                        className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Copy complete step-by-step proof formatted as LaTeX"
                      >
                        {copiedLatex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
                        <span>{copiedLatex ? 'LaTeX Copied' : 'Export LaTeX'}</span>
                      </button>
                    </div>
                  </div>

                  {solution.steps && solution.steps.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-heading font-black text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Step-by-Step Derivation Breakdown</span>
                        </h4>
                        <span className="text-xs text-zinc-400 font-mono px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                          {solution.steps.length} Derivation Steps
                        </span>
                      </div>

                      <div className="space-y-3 relative pl-3 sm:pl-4 before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
                        {solution.steps.map((st) => (
                          <div
                            key={st.step}
                            className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2 relative shadow-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-black text-white dark:bg-white dark:text-black font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                {st.step}
                              </span>
                              <span className="font-bold text-xs sm:text-sm text-zinc-950 dark:text-white">
                                {st.title}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-8 leading-relaxed">
                              {st.description}
                            </p>
                            {st.latex && (
                              <div className="ml-8 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-950 dark:text-zinc-100 overflow-x-auto font-mono">
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
          ) : (
            <div className="p-16 text-center text-zinc-400 border border-dashed rounded-3xl border-zinc-200 dark:border-zinc-800">
              Loading solver workbench...
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
