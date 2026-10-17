import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Zap,
  CheckCircle,
  Calculator,
  Sparkles,
  BookOpen,
  Flame,
  Award,
  Layers,
  Printer,
  Edit3,
  Sliders,
  Compass,
  Cpu,
  GraduationCap,
  ExternalLink,
  Timer,
  PlayCircle,
  Hash,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { useFocus } from '../context/FocusContext';
import { formulasApi } from '../api/formulasApi';
import FormulaCard from '../components/formulas/FormulaCard';
import MathView from '../components/common/MathView';
import HeroMathCanvas from '../components/home/HeroMathCanvas';
import {
  FALLBACK_SUBJECTS,
  FALLBACK_FEATURED_FORMULAS,
  FEATURED_LABS_SPOTLIGHT,
  FORMULA_OF_THE_DAY
} from '../data/homeFallbackData';
import { normalizeFormula } from '../utils/formulaUtils';

export default function HomePage() {
  const { setIsSearchOpen, setIsScratchpadOpen, setActiveSolverSlug, profile } = useStudent();
  const { setIsSetupOpen, isFocusActive } = useFocus();

  const [formulas, setFormulas] = useState(FALLBACK_FEATURED_FORMULAS);
  const [allLiveFormulas, setAllLiveFormulas] = useState([]);
  const [subjects, setSubjects] = useState(FALLBACK_SUBJECTS);
  const [loading, setLoading] = useState(true);

  // Featured formula filter state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formulaSearch, setFormulaSearch] = useState('');

  // Fetch live data from backend; fallback data ensures zero blank flash
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [forms, subs] = await Promise.all([
          formulasApi.getFormulas(),
          formulasApi.getSubjects(),
        ]);
        if (forms && Array.isArray(forms) && forms.length > 0) {
          const normalized = forms.map(normalizeFormula);
          setAllLiveFormulas(normalized);
          // Prioritize formulas with interactive demos
          const withDemo = normalized.filter((f) => f.has_demo);
          setFormulas(withDemo.length >= 6 ? withDemo : normalized);
        }
        if (subs && Array.isArray(subs) && subs.length > 0) {
          // Merge API subject data with our rich fallback metadata (sample_latex, etc.)
          const merged = subs.map((s) => {
            const fallback = FALLBACK_SUBJECTS.find((fs) => fs.slug === s.slug);
            return {
              ...fallback,
              ...s,
              sample_latex: fallback?.sample_latex || 'f(x) = y',
            };
          });
          setSubjects(merged);
        }
      } catch (err) {
        console.warn('Note: Backend API unavailable or offline, using enriched offline dataset.', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter featured formulas
  const filteredFeatured = useMemo(() => {
    return formulas.filter((f) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const subj = (f.subject_slug || f.subject_name || '').toLowerCase();
        if (selectedCategory === 'calculus' && !subj.includes('calculus')) return false;
        if (selectedCategory === 'physics' && !subj.includes('physics')) return false;
        if (selectedCategory === 'geometry' && !subj.includes('geometry') && !subj.includes('trig')) return false;
        if (selectedCategory === 'algebra' && !subj.includes('algebra') && !subj.includes('number')) return false;
        if (selectedCategory === 'cs' && !subj.includes('computer') && !subj.includes('discrete')) return false;
      }
      // Search query
      if (formulaSearch.trim()) {
        const q = formulaSearch.toLowerCase();
        const matchesTitle = f.title?.toLowerCase().includes(q);
        const matchesSummary = f.summary?.toLowerCase().includes(q);
        const matchesLatex = f.formula_latex?.toLowerCase().includes(q);
        const matchesKeywords = (f.keywords || []).some((k) => k.toLowerCase().includes(q));
        return matchesTitle || matchesSummary || matchesLatex || matchesKeywords;
      }
      return true;
    });
  }, [formulas, selectedCategory, formulaSearch]);

  return (
    <div className="space-y-20 pb-24">
      
      {/* ======================================================== */}
      {/* 1. HERO SECTION WITH SPLIT TWO-COLUMN INTERACTIVE CANVAS */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-white via-zinc-50/60 to-white dark:from-black dark:via-zinc-950/70 dark:to-black">
        
        {/* Subtle background math grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#71717a_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.07] dark:opacity-[0.14] pointer-events-none" />
        
        {/* Ambient subtle light glow */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Top Scholar HUD Micro-Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>BehindTheMath 2.0</span>
              <span className="text-zinc-300 dark:text-zinc-700">·</span>
              <span className="text-zinc-500 dark:text-zinc-400 font-normal">Full-Stack Interactive STEM Learning</span>
            </div>

            {profile && (
              <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                  <strong className="text-zinc-900 dark:text-white font-semibold">{profile.study_streak_days || 7} Day Streak</strong>
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="inline-flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>{profile.xp_points || 425} XP</span>
                </span>
                <button
                  onClick={() => setIsSetupOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Timer className="w-3 h-3 text-cyan-500" />
                  <span>{isFocusActive ? 'Focus Active' : 'Start Focus Mode'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Two-Column Grid: Headline & CTAs on Left, HeroMathCanvas on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Headline, Description & CTAs */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-5xl text-black dark:text-white tracking-tight leading-[1.12]">
                Understand the formula. <br />
                <span className="bg-gradient-to-r from-black via-zinc-800 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
                  See the math behind it.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                Move beyond rote memorization. Explore mathematical principles through live 60 FPS visual simulations, step-by-step algebraic derivations, production C & Python code, and progressive hint quizzes.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-sm shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search 169 Formulas (Ctrl+K)</span>
                </button>

                <Link
                  to="/lab"
                  className="px-6 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold text-sm shadow-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Visual Labs Hub</span>
                </Link>

                <button
                  onClick={() => setActiveSolverSlug('quadratic-equation')}
                  className="px-5 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold text-sm shadow-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  title="Launch Step-by-Step Equation Solver"
                >
                  <Calculator className="w-4 h-4 text-cyan-500" />
                  <span>Step Solver</span>
                </button>
              </div>

              {/* Quick Jump Topic Tags */}
              <div className="pt-2 flex items-center gap-2 flex-wrap text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Quick Jump:</span>
                <Link to="/library?subject=calculus" className="hover:underline hover:text-black dark:hover:text-white">Calculus</Link>
                <span>•</span>
                <Link to="/library?subject=physics" className="hover:underline hover:text-black dark:hover:text-white">Physics</Link>
                <span>•</span>
                <Link to="/library?subject=linear-algebra" className="hover:underline hover:text-black dark:hover:text-white">Linear Algebra</Link>
                <span>•</span>
                <Link to="/practice" className="hover:underline text-emerald-600 dark:text-emerald-400 font-medium">Daily Speed Quiz</Link>
                <span>•</span>
                <Link to="/rankings" className="hover:underline font-bold text-black dark:text-white inline-flex items-center gap-1">🏆 Hall of Fame</Link>
              </div>
            </div>

            {/* Right Column: Interactive Hero Math Canvas */}
            <div className="lg:col-span-6">
              <div className="relative">
                {/* Decorative border glow */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-transparent to-amber-500/20 blur-lg opacity-70 pointer-events-none" />
                <HeroMathCanvas />
              </div>
            </div>

          </div>

          {/* Platform Stat Badges */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 backdrop-blur-xs shadow-xs hover:border-black dark:hover:border-white transition-colors">
              <span className="font-heading font-extrabold text-2xl text-black dark:text-white block">{allLiveFormulas.length || 169}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Curated Deep Derivations</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 backdrop-blur-xs shadow-xs hover:border-black dark:hover:border-white transition-colors">
              <span className="font-heading font-extrabold text-2xl text-black dark:text-white block">20</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">60 FPS Visual Simulations</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 backdrop-blur-xs shadow-xs hover:border-black dark:hover:border-white transition-colors">
              <span className="font-heading font-extrabold text-2xl text-black dark:text-white block">{subjects.length}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Core STEM Disciplines</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 backdrop-blur-xs shadow-xs hover:border-black dark:hover:border-white transition-colors">
              <span className="font-heading font-extrabold text-2xl text-black dark:text-white block">C & Python</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Complete Code Implementations</span>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. THE 4 LEARNING PILLARS OF BEHINDTHEMATH              */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Pedagogical Architecture
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-black dark:text-white">
            How BehindTheMath Works
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Four interconnected perspectives for every mathematical law to achieve true mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
              1. Visual Geometric Intuition
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Real-time 60 FPS HTML5 canvas experiments. Slide parameters, observe relationships, and build visual mental models before writing a single equation.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
              2. Step-by-Step Derivations
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Complete algebraic proofs from first principles. Every line is justified with mathematical rationale, boundary conditions, and historical context.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
              3. Dual Code Tabs (C & Python)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Executable, zero-dependency implementations with floating-point guards, domain validation, and memory safety considerations.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
              4. Active Exam Practice & Solvers
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Hints-first speed quizzes, step-by-step algebraic equation solvers, spaced-repetition flashcards, and printable PDF cheat sheet generation.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. INTERACTIVE VISUAL LABS SPOTLIGHT CAROUSEL            */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
              Live Physics & Math Simulations
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-black dark:text-white">
              Interactive Visual Labs Hub
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
              Tweak orbital gravity, wave harmonics, relativistic dilation, and chaos theory with live parameter controls.
            </p>
          </div>

          <Link
            to="/lab"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs sm:text-sm font-semibold shadow-xs hover:opacity-90 transition-opacity self-start sm:self-auto"
          >
            <span>Launch All 20 Labs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURED_LABS_SPOTLIGHT.map((lab) => (
            <Link
              key={lab.id}
              to={`/lab?id=${lab.id}`}
              className="group p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-black dark:hover:border-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {lab.tag}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                    {lab.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">
                    {lab.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {lab.desc}
                  </p>
                </div>

                {/* Formula Highlight Box */}
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center font-mono text-xs flex items-center justify-center min-h-[44px]">
                  <MathView math={lab.formula} display={false} />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-black dark:text-white">
                <span className="group-hover:underline">Launch Simulation</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. FEATURED FORMULAS GRID WITH FILTER CHIPS & SEARCH    */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
              Curated Derivation Modules
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-black dark:text-white">
              Featured Mathematical Formulas
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
              Each module includes step-by-step derivation, geometric insight, and full C & Python source code.
            </p>
          </div>

          <Link
            to="/library"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-black dark:text-white hover:underline transition-all"
          >
            <span>Browse Full Library ({allLiveFormulas.length || 169})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter Chips & Inline Quick Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs font-semibold">
            {[
              { id: 'all', label: 'All Featured' },
              { id: 'calculus', label: 'Calculus' },
              { id: 'physics', label: 'Physics' },
              { id: 'geometry', label: 'Geometry & Trig' },
              { id: 'algebra', label: 'Algebra & Numbers' },
              { id: 'cs', label: 'CS & Algorithms' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Inline Formula Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter featured..."
              value={formulaSearch}
              onChange={(e) => setFormulaSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
          </div>
        </div>

        {/* Formulas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatured.map((formula) => (
            <FormulaCard key={formula.id || formula.slug} formula={formula} />
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. 12 CORE MATHEMATICAL DISCIPLINES GRID                */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
              Structured Academic Pathways
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-black dark:text-white">
              12 Core Mathematical Disciplines
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
              From foundational arithmetic and geometry to multivariable calculus, Einsteinian physics, and algorithmic complexity.
            </p>
          </div>

          <Link
            to="/learn"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-black dark:text-white hover:underline transition-all"
          >
            <span>View Learning Path</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subjects.map((sub) => (
            <Link
              key={sub.id || sub.slug}
              to={`/library?subject=${sub.slug}`}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-black dark:hover:border-white shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl">{sub.icon || '📐'}</div>
                  <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
                    {sub.formula_count || 12} formulas
                  </span>
                </div>

                <h3 className="font-heading font-bold text-sm sm:text-base text-zinc-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">
                  {sub.name}
                </h3>
                
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {sub.description}
                </p>

                {/* KaTeX Sample Formula Badge */}
                {sub.sample_latex && (
                  <div className="mt-3 py-1.5 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-center overflow-x-auto scrollbar-none">
                    <MathView math={sub.sample_latex} display={false} />
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-semibold text-black dark:text-white flex items-center justify-between">
                <span>Explore Subject</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. STUDENT POWER TOOLS STUDIO                           */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
            Student Toolkit
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-black dark:text-white">
            Built for Exam Mastery & Problem Solving
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            Integrated student utilities designed to accelerate understanding and test preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Tool 1: Step Solver */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
                Step-by-Step Solver
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Plug in coefficients for quadratic equations, Pythagorean triangles, circle properties, and GCD/LCM to inspect intermediate algebraic steps.
              </p>
            </div>
            <button
              onClick={() => setActiveSolverSlug('quadratic-equation')}
              className="w-full py-2.5 px-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <span>Launch Solver</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tool 2: Spaced Repetition Flashcards */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
                Spaced Flashcards
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Active recall testing with SM-2 spaced repetition algorithm. Reinforce formula recall, variable meanings, and boundary conditions.
              </p>
            </div>
            <Link
              to="/flashcards"
              className="w-full py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <span>Study Flashcards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Tool 3: Exam Cheat Sheet Generator */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Printer className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
                Custom Cheat Sheets
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Select your target syllabus or bookmarked formulas. Generate high-resolution, print-optimized PDF cheat sheets for exam revision.
              </p>
            </div>
            <Link
              to="/cheatsheet"
              className="w-full py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <span>Export Cheat Sheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Tool 4: Live Math Scratchpad */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
                Live Math Scratchpad
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Full-screen canvas whiteboard with LaTeX formula preview, handwriting canvas, color markers, and export to PNG for notes.
              </p>
            </div>
            <button
              onClick={() => setIsScratchpadOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <span>Open Scratchpad</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. FORMULA OF THE DAY & MATHEMATICAL WISDOM             */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-6 sm:p-10 border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 shadow-lg relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Formula of the Day Spotlight</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-black dark:text-white">
                {FORMULA_OF_THE_DAY.title}
              </h2>

              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                Discovered by {FORMULA_OF_THE_DAY.author} · {FORMULA_OF_THE_DAY.field}
              </p>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {FORMULA_OF_THE_DAY.description}
              </p>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 italic border-l-2 border-black dark:border-white pl-3 py-0.5">
                "{FORMULA_OF_THE_DAY.insight}"
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <Link
                  to={`/library?search=euler`}
                  className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs shadow-xs hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <span>Explore Euler Formulas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/practice"
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Test Your Intuition</span>
                </Link>
              </div>
            </div>

            {/* Right Side: KaTeX Large Formula Box */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 text-center">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                The Universal Equation
              </span>

              <div className="text-2xl sm:text-3xl font-mono py-4">
                <MathView math={FORMULA_OF_THE_DAY.formula_latex} display={true} />
              </div>

              <div className="w-full space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-left text-xs">
                {FORMULA_OF_THE_DAY.key_variables.map((v) => (
                  <div key={v.name} className="flex items-center justify-between gap-2">
                    <span className="font-mono font-semibold text-black dark:text-white">
                      <MathView math={v.symbol} display={false} />
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">{v.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. COMMUNITY & LEARNING CTA BANNER                      */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-black text-white dark:bg-zinc-950 dark:border dark:border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
              Our Mission — Behind the Math
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl leading-tight">
              Turning Potential into Possibilities.
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              At Behind the Math, our mission is to help every student discover their potential and become the best version of themselves. Free, open-source, and accessible to everyone, everywhere.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/library"
                className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs sm:text-sm hover:opacity-90 shadow-md flex items-center gap-2 transition-opacity"
              >
                <span>Browse All Formulas</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/lab"
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Open Visual Labs</span>
              </Link>
              <Link
                to="/about"
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
              >
                <span>About the Project</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
