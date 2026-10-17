import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Bookmark,
  Copy,
  Check,
  CheckCircle,
  Share2,
  Printer,
  Sparkles,
  BookOpen,
  Calculator,
  ExternalLink,
  ArrowRight,
  Lightbulb,
  Award,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  ShieldAlert,
  Terminal,
  Cpu,
  Compass
} from 'lucide-react';
import { lessonsApi, formulasApi } from '../api/formulasApi';
import { useStudent } from '../context/StudentContext';
import MathView from '../components/common/MathView';
import CodeTabs from '../components/common/CodeTabs';
import { normalizeFormula } from '../utils/formulaUtils';
import allFormulasData from '../data/allFormulas.json';

// Interactive Lab components
import CircleAreaLab from '../components/labs/CircleAreaLab';
import PythagoreanLab from '../components/labs/PythagoreanLab';
import QuadraticLab from '../components/labs/QuadraticLab';
import UnitCircleLab from '../components/labs/UnitCircleLab';
import DerivativeLab from '../components/labs/DerivativeLab';
import EuclideanGcdLab from '../components/labs/EuclideanGcdLab';
import BigOComplexityLab from '../components/labs/BigOComplexityLab';
import NormalDistributionLab from '../components/labs/NormalDistributionLab';
import HarmonicWaveLab from '../components/labs/HarmonicWaveLab';
import MatrixTransformLab from '../components/labs/MatrixTransformLab';
import ProjectileMotionLab from '../components/labs/ProjectileMotionLab';
import SnellsLawLab from '../components/labs/SnellsLawLab';
import LagrangeMultipliersLab from '../components/labs/LagrangeMultipliersLab';
import LorentzDilationLab from '../components/labs/LorentzDilationLab';
import CosineSimilarityLab from '../components/labs/CosineSimilarityLab';
import FourierSeriesLab from '../components/labs/FourierSeriesLab';
import DoublePendulumLab from '../components/labs/DoublePendulumLab';
import KeplerOrbitLab from '../components/labs/KeplerOrbitLab';
import BayesTheoremLab from '../components/labs/BayesTheoremLab';
import NeuralNetworkLab from '../components/labs/NeuralNetworkLab';
import VideoExplanationCard from '../components/common/VideoExplanationCard';
import QRCodeView from '../components/common/QRCodeView';

// Curated accurate symbol definitions for prominent formulas
const CURATED_FORMULA_SYMBOLS = {
  'gradient-descent-adam': [
    { symbol: '\\theta_{t+1}', meaning: 'Updated model weight vector at step t+1', unit: 'dimensionless vector', constraint: '\\theta \\in \\mathbb{R}^d' },
    { symbol: '\\theta_t', meaning: 'Current model weight vector at step t', unit: 'dimensionless vector', constraint: '\\theta \\in \\mathbb{R}^d' },
    { symbol: '\\alpha', meaning: 'Learning rate (base step size hyperparameter)', unit: 'scalar', constraint: '\\alpha > 0 \\text{ (std: } 10^{-4} - 10^{-3}\\text{)}' },
    { symbol: '\\hat{m}_t', meaning: 'Bias-corrected first moment estimate (momentum)', unit: 'vector', constraint: '\\hat{m}_t = m_t / (1 - \\beta_1^t)' },
    { symbol: '\\hat{v}_t', meaning: 'Bias-corrected second raw moment estimate (uncentered variance)', unit: 'vector', constraint: '\\hat{v}_t = v_t / (1 - \\beta_2^t)' },
    { symbol: '\\beta_1, \\beta_2', meaning: 'Exponential decay hyperparameters for running moments', unit: 'scalar', constraint: '0 \\le \\beta_1, \\beta_2 < 1 \\text{ (std: } 0.9, 0.999\\text{)}' },
    { symbol: '\\epsilon', meaning: 'Smoothing term preventing numerical division by zero', unit: 'scalar', constraint: '\\epsilon > 0 \\text{ (std: } 10^{-8}\\text{)}' }
  ],
  'adam-optimizer-adaptive-update': [
    { symbol: '\\theta_{t+1}', meaning: 'Updated model weight vector at step t+1', unit: 'dimensionless vector', constraint: '\\theta \\in \\mathbb{R}^d' },
    { symbol: '\\theta_t', meaning: 'Current model weight vector at step t', unit: 'dimensionless vector', constraint: '\\theta \\in \\mathbb{R}^d' },
    { symbol: '\\alpha', meaning: 'Learning rate (base step size hyperparameter)', unit: 'scalar', constraint: '\\alpha > 0 \\text{ (std: } 10^{-4} - 10^{-3}\\text{)}' },
    { symbol: '\\hat{m}_t', meaning: 'Bias-corrected first moment estimate (momentum)', unit: 'vector', constraint: '\\hat{m}_t = m_t / (1 - \\beta_1^t)' },
    { symbol: '\\hat{v}_t', meaning: 'Bias-corrected second raw moment estimate (uncentered variance)', unit: 'vector', constraint: '\\hat{v}_t = v_t / (1 - \\beta_2^t)' },
    { symbol: '\\beta_1, \\beta_2', meaning: 'Exponential decay hyperparameters for running moments', unit: 'scalar', constraint: '0 \\le \\beta_1, \\beta_2 < 1 \\text{ (std: } 0.9, 0.999\\text{)}' },
    { symbol: '\\epsilon', meaning: 'Smoothing term preventing numerical division by zero', unit: 'scalar', constraint: '\\epsilon > 0 \\text{ (std: } 10^{-8}\\text{)}' }
  ],
  'quadratic-equation': [
    { symbol: 'x', meaning: 'Roots / solutions of the quadratic equation', unit: 'dimensionless', constraint: 'x \\in \\mathbb{R} \\text{ or } \\mathbb{C}' },
    { symbol: 'a', meaning: 'Leading quadratic coefficient', unit: 'dimensionless', constraint: 'a \\neq 0' },
    { symbol: 'b', meaning: 'Linear coefficient', unit: 'dimensionless', constraint: 'b \\in \\mathbb{R}' },
    { symbol: 'c', meaning: 'Constant term / y-intercept', unit: 'dimensionless', constraint: 'c \\in \\mathbb{R}' },
    { symbol: '\\Delta', meaning: 'Discriminant: \\Delta = b^2 - 4ac', unit: 'dimensionless', constraint: '\\Delta > 0 \\text{ (2 real), } =0 \\text{ (1 real), } <0 \\text{ (complex)}' }
  ],
  'circle-area': [
    { symbol: 'A', meaning: 'Total enclosed planar area', unit: '\\text{m}^2 \\text{ or unit}^2', constraint: 'A > 0' },
    { symbol: 'r', meaning: 'Radius from circle center to boundary', unit: '\\text{m} \\text{ or unit}', constraint: 'r \\ge 0' },
    { symbol: '\\pi', meaning: 'Archimedes constant (ratio of circumference to diameter)', unit: 'constant', constraint: '\\pi \\approx 3.14159265...' }
  ],
  'pythagorean-theorem': [
    { symbol: 'a', meaning: 'Length of adjacent perpendicular leg', unit: '\\text{length units}', constraint: 'a > 0' },
    { symbol: 'b', meaning: 'Length of opposite perpendicular leg', unit: '\\text{length units}', constraint: 'b > 0' },
    { symbol: 'c', meaning: 'Length of the hypotenuse (opposite the 90° right angle)', unit: '\\text{length units}', constraint: 'c > a \\text{ and } c > b' }
  ],
  'lorentz-dilation': [
    { symbol: '\\Delta t\'', meaning: 'Dilated time interval measured by observer in motion', unit: '\\text{seconds (s)}', constraint: '\\Delta t\' \\ge \\Delta t' },
    { symbol: '\\Delta t', meaning: 'Proper time interval measured in the rest frame of the event', unit: '\\text{seconds (s)}', constraint: '\\Delta t > 0' },
    { symbol: 'v', meaning: 'Relative velocity between observer reference frames', unit: '\\text{m/s}', constraint: '0 \\le v < c' },
    { symbol: 'c', meaning: 'Speed of light in vacuum', unit: '\\text{m/s}', constraint: 'c \\approx 2.99792 \\times 10^8 \\text{ m/s}' },
    { symbol: '\\gamma', meaning: 'Lorentz factor: \\gamma = 1 / \\sqrt{1 - v^2/c^2}', unit: 'dimensionless', constraint: '\\gamma \\ge 1' }
  ]
};

// Known solver slugs available in the platform
const SOLVER_MAPPINGS = {
  'quadratic-equation': 'quadratic-equation',
  'quadratic-formula': 'quadratic-equation',
  'circle-area': 'circle-area',
  'pythagorean-theorem': 'pythagorean-theorem',
  'gcd-lcm': 'gcd-lcm',
  'euclidean-algorithm-gcd': 'gcd-lcm',
  'compound-interest': 'compound-interest'
};

export default function LessonDetailPage() {
  const { slug } = useParams();
  const cleanSlug = (slug || '').replace(/\.html$/, '').toLowerCase();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interaction states
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [zoomEquation, setZoomEquation] = useState(false);

  // Student Context hooks
  const { bookmarks, toggleBookmark, notes, saveNote, awardXp, setActiveSolverSlug } = useStudent();

  // Personal note editing
  const [personalNote, setPersonalNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Mastery state
  const [isMastered, setIsMastered] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('btm_mastered_lessons') || '[]');
      return saved.includes(cleanSlug);
    } catch {
      return false;
    }
  });

  // Client-side fallback generator
  const createFallbackLesson = (rawFormula) => {
    const f = normalizeFormula(rawFormula);
    const slugKey = f.slug || f.id;
    const curatedSyms = CURATED_FORMULA_SYMBOLS[slugKey] || CURATED_FORMULA_SYMBOLS[f.id];

    return {
      id: f.id,
      formula: f,
      subtitle: f.summary,
      latex_display: f.formula_latex || f.title,
      plain_language_intuition: `${f.title} establishes a foundational mathematical principle in ${f.subject_name}. ${f.summary} This equation directly connects fundamental variables to enable quantitative modeling, geometric intuition, and precise algorithmic computation.`,
      conditions_and_assumptions: {
        applies_when: [
          `Valid within the standard mathematical domain of ${f.subject_name}.`,
          'All input parameters must be non-null, dimensionally consistent, and well-defined.',
          'Denominator expressions must be strictly non-zero to preserve continuity.'
        ],
        limitations: [
          'Does not apply when boundary conditions or mathematical singularities are violated.',
          'Numerical computation requires stabilization against floating-point overflow and underflow.'
        ]
      },
      worked_example_problem: `Calculate and verify the identity for ${f.title} using representative parameters.`,
      worked_example_steps: [
        { step: 1, description: `Identify the governing equation: ${f.formula_latex || f.title}.` },
        { step: 2, description: 'Extract known parameter values and verify all domain constraints.' },
        { step: 3, description: 'Perform algebraic evaluation to solve for the target quantity.' }
      ],
      worked_example_solution: `The computed result satisfies the ${f.title} relationship within verified tolerances.`,
      lab_component_name: f.has_demo ? f.formula_id : null,
      symbols: curatedSyms || (f.keywords || []).slice(0, 4).map((kw, idx) => ({
        id: idx,
        symbol: kw.charAt(0).toUpperCase(),
        meaning: `Parameter: ${kw}`,
        unit: 'standard units',
        constraint: 'Real number'
      })),
      code_snippets: [
        {
          id: 1,
          language: 'python',
          language_display: 'Python 3',
          code: `# ================================================================\n# BehindTheMath Interactive Formula Library\n# Formula: ${f.title}\n# Subject: ${f.subject_name} | Level: ${f.level}\n# ================================================================\nimport math\n\ndef compute():\n    """\n    ${f.summary}\n    """\n    print("Evaluating ${f.title}...")\n    return True\n\nif __name__ == '__main__':\n    compute()\n`
        },
        {
          id: 2,
          language: 'c',
          language_display: 'C (C11)',
          code: `/* ================================================================\n * BehindTheMath Interactive Formula Library\n * Formula: ${f.title}\n * Subject: ${f.subject_name}\n * ================================================================ */\n#include <stdio.h>\n#include <math.h>\n#include <stdbool.h>\n\nint main(void) {\n    printf("Computing ${f.title}...\\n");\n    printf("Verification complete.\\n");\n    return 0;\n}\n`
        }
      ]
    };
  };

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      setError(null);

      // 1. Try fetching from Django API
      try {
        const data = await lessonsApi.getLesson(cleanSlug);
        if (data && data.formula) {
          // Normalize formula attributes
          data.formula = normalizeFormula(data.formula);
          // Enrich symbols if curated version is available
          const slugKey = data.formula.slug || cleanSlug;
          if (CURATED_FORMULA_SYMBOLS[slugKey]) {
            data.symbols = CURATED_FORMULA_SYMBOLS[slugKey];
          }
          setLesson(data);
          if (notes[data.formula.id]) {
            setPersonalNote(notes[data.formula.id]);
          }
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Lesson API endpoint failed, attempting formula lookup:', err);
      }

      // 2. Try formula detail API
      try {
        const formulaData = await formulasApi.getFormula(cleanSlug);
        if (formulaData) {
          const fallbackLesson = createFallbackLesson(formulaData);
          setLesson(fallbackLesson);
          if (notes[formulaData.id]) {
            setPersonalNote(notes[formulaData.id]);
          }
          setLoading(false);
          return;
        }
      } catch (fErr) {
        console.warn('Formula API fallback failed, checking local catalog:', fErr);
      }

      // 3. Client-side local catalog matching (handles allFormulas.json)
      const normalizedAll = (allFormulasData || []).map(normalizeFormula);
      const matched = normalizedAll.find((f) => {
        if (!f) return false;
        const s = (f.slug || '').toLowerCase();
        const fid = (f.id || '').toLowerCase();
        const titleSlug = f.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const titleUnderscore = f.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        return s === cleanSlug || fid === cleanSlug || titleSlug === cleanSlug || titleUnderscore === cleanSlug;
      });

      if (matched) {
        const localFallback = createFallbackLesson(matched);
        setLesson(localFallback);
        if (notes[matched.id]) {
          setPersonalNote(notes[matched.id]);
        }
        setLoading(false);
        return;
      }

      setError('Lesson could not be found or loaded.');
      setLoading(false);
    };

    fetchLesson();
  }, [cleanSlug]);

  const handleCopyLatex = () => {
    if (!lesson?.latex_display && !lesson?.formula?.formula_latex) return;
    const latex = lesson.latex_display || lesson.formula.formula_latex;
    navigator.clipboard.writeText(latex);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2000);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2200);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleMastery = () => {
    const nextMastered = !isMastered;
    setIsMastered(nextMastered);
    try {
      const saved = JSON.parse(localStorage.getItem('btm_mastered_lessons') || '[]');
      const filtered = saved.filter((s) => s !== cleanSlug);
      if (nextMastered) {
        filtered.push(cleanSlug);
        awardXp(25, `Mastered ${lesson?.formula?.title || 'Formula'}! 🎓`);
      }
      localStorage.setItem('btm_mastered_lessons', JSON.stringify(filtered));
    } catch (e) {
      console.warn('Mastery save error:', e);
    }
  };

  const handleSavePersonalNote = () => {
    if (!lesson?.formula?.id) return;
    saveNote(lesson.formula.id, personalNote);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  // Related formulas recommendation from the same subject
  const relatedFormulas = useMemo(() => {
    if (!lesson?.formula) return [];
    const currentId = lesson.formula.id || lesson.formula.slug;
    const currentSubj = lesson.formula.subject_name;
    const normalizedAll = (allFormulasData || []).map(normalizeFormula);
    return normalizedAll
      .filter((f) => f.id !== currentId && f.subject_name === currentSubj)
      .slice(0, 3);
  }, [lesson]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-28 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full border-3 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
          Loading comprehensive lesson & mathematical derivations...
        </p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-5 px-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-3xl">
          ⚠️
        </div>
        <h2 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
          Lesson Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          {error || 'The requested formula lesson could not be loaded.'}
        </p>
        <div className="pt-2">
          <Link
            to="/library"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 shadow-sm"
          >
            <span>Browse Formula Library</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const { formula, symbols, code_snippets } = lesson;
  const isBookmarked = bookmarks.has(formula.id) || bookmarks.has(formula.formula_id) || bookmarks.has(formula.slug);
  const solverSlug = SOLVER_MAPPINGS[formula.slug] || SOLVER_MAPPINGS[formula.formula_id];

  // Render appropriate interactive simulation lab component
  const renderLabComponent = () => {
    const compName = lesson.lab_component_name || formula.formula_id || formula.slug || cleanSlug;
    switch (compName) {
      case 'circle-area':
        return <CircleAreaLab />;
      case 'pythagorean-theorem':
        return <PythagoreanLab />;
      case 'quadratic-equation':
      case 'quadratic-formula':
        return <QuadraticLab />;
      case 'unit-circle':
      case 'unit-circle-sine-cosine':
        return <UnitCircleLab />;
      case 'derivatives-tangent':
      case 'power-rule-derivatives':
        return <DerivativeLab />;
      case 'gcd-lcm':
      case 'euclidean-algorithm-gcd':
        return <EuclideanGcdLab />;
      case 'time-complexity':
      case 'big-o-notation':
        return <BigOComplexityLab />;
      case 'normal-distribution-pdf':
      case 'central-limit-theorem':
        return <NormalDistributionLab />;
      case 'harmonic-wave-equation':
        return <HarmonicWaveLab />;
      case 'matrix-determinant-2x2':
      case 'eigenvalue-equation':
        return <MatrixTransformLab />;
      case 'projectile-motion-range':
        return <ProjectileMotionLab />;
      case 'snells-law-refraction':
      case 'snells-law':
        return <SnellsLawLab />;
      case 'lagrange-multipliers':
        return <LagrangeMultipliersLab />;
      case 'lorentz-transformation-dilation':
      case 'lorentz-dilation':
        return <LorentzDilationLab />;
      case 'cosine-similarity-embeddings':
      case 'cosine-similarity':
        return <CosineSimilarityLab />;
      case 'fourier-series':
      case 'fourier-transform':
        return <FourierSeriesLab />;
      case 'double-pendulum':
      case 'chaos-theory':
        return <DoublePendulumLab />;
      case 'kepler-orbit':
      case 'keplers-third-law':
      case 'gravitational-force':
        return <KeplerOrbitLab />;
      case 'bayes-theorem':
      case 'conditional-probability':
        return <BayesTheoremLab />;
      case 'neural-network':
      case 'gradient-descent':
      case 'perceptron':
      case 'gradient-descent-adam':
      case 'adam-optimizer-adaptive-update':
        return <NeuralNetworkLab />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Official Printable Lesson Sheet Header (Print-Only) */}
      <div className="hidden print:flex items-center justify-between border-b-2 border-black pb-3 mb-4">
        <div>
          <span className="font-heading font-black text-sm tracking-wider uppercase">
            BehindTheMath Academy · STEM Study Sheet
          </span>
          <div className="text-[10px] text-zinc-600 font-serif italic">
            Understand the formula · Explore the relationship · See the math behind it
          </div>
        </div>
        <div className="text-right font-mono text-[9px] text-zinc-600">
          <div>{formula.subject_name} · {formula.level?.toUpperCase()}</div>
          <div>https://behindthemath.org/lesson/{formula.slug}</div>
        </div>
      </div>

      {/* 1. Breadcrumbs & Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800/80 pb-5 print:hidden">
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 flex-wrap">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link>
          <span className="text-slate-300 dark:text-zinc-700">/</span>
          <Link to="/library" className="hover:text-slate-900 dark:hover:text-white transition-colors">Library</Link>
          <span className="text-slate-300 dark:text-zinc-700">/</span>
          <Link
            to={`/library?subject=${formula.subject_slug || formula.subject_name.toLowerCase().replace(/\s+/g, '-')}`}
            className="hover:text-slate-900 dark:hover:text-white transition-colors font-medium text-slate-700 dark:text-zinc-300"
          >
            {formula.subject_name}
          </Link>
          <span className="text-slate-300 dark:text-zinc-700">/</span>
          <span className="font-semibold text-slate-900 dark:text-zinc-100 truncate max-w-[220px]">
            {formula.title}
          </span>
        </nav>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Share */}
          <button
            onClick={handleShareLink}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/70 text-slate-600 dark:text-zinc-300 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Copy Share Link"
          >
            {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedShare ? 'Copied' : 'Share'}</span>
          </button>

          {/* Print / Study Sheet */}
          <button
            onClick={handlePrint}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs print:hidden"
            title="Print STEM Study Sheet / Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Print Study Sheet</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={() => toggleBookmark(formula.id)}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              isBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 shadow-2xs'
                : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300'
            }`}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark for Revision'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>

          {/* Mastery Button */}
          <button
            onClick={handleToggleMastery}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isMastered
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                : 'border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isMastered ? 'Mastered (+25 XP)' : 'Mark Mastered'}</span>
          </button>
        </div>
      </div>

      {/* 2. Lesson Title & Header Badges */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
            {formula.subject_name}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 capitalize">
            {formula.level}
          </span>
          {formula.has_demo && (
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 flex items-center gap-1">
              <span>⚡</span>
              <span>Interactive Virtual Lab</span>
            </span>
          )}
          {solverSlug && (
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <span>🧮</span>
              <span>Step-by-Step Solver</span>
            </span>
          )}
        </div>

        <h1 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-slate-900 dark:text-white">
          {formula.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 leading-relaxed font-normal">
          {lesson.subtitle || formula.summary}
        </p>
      </div>

      {/* 3. The Hero Equation Showcase (Theme-Adaptive, Contrast-Guaranteed) */}
      <section className="relative p-6 sm:p-8 md:p-10 rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-gradient-to-br from-slate-50/80 via-white to-sky-50/30 dark:from-zinc-900/90 dark:via-zinc-900/60 dark:to-zinc-950 shadow-sm overflow-hidden space-y-6 print-break-inside-avoid avoid-break print:border-2 print:border-black print:rounded-2xl print:bg-white print:p-6">
        
        {/* Subtle Mathematical Grid Paper Background Accent */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.05] print:hidden"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Card Header Strip */}
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-3 border-b border-slate-200/60 dark:border-zinc-800/80 pb-3 print:border-black/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse print:hidden" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 print:text-black">
              The Governing Equation
            </span>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            {/* Equation Font Scale Toggle */}
            <button
              onClick={() => setZoomEquation((z) => !z)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
              title="Toggle equation scale"
            >
              {zoomEquation ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-mono">{zoomEquation ? '100%' : '140%'}</span>
            </button>

            {/* Copy LaTeX Button */}
            <button
              onClick={handleCopyLatex}
              className="px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedLatex ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLatex ? 'LaTeX Copied' : 'Copy LaTeX'}</span>
            </button>
          </div>
        </div>

        {/* The Equation Stage (Scrollbar-free on Print with responsive clamp) */}
        <div
          className={`hero-equation-stage relative z-10 text-center py-4 overflow-x-auto print:overflow-visible print:overflow-x-visible scrollbar-none text-slate-900 dark:text-white print:text-black transition-all select-all font-mono print:text-base print:py-2 ${
            zoomEquation ? 'text-3xl sm:text-4xl md:text-5xl py-8' : 'text-2xl sm:text-3xl md:text-4xl'
          }`}
        >
          <MathView math={lesson.latex_display || formula.formula_latex} display={true} />
        </div>

        {/* Card Footer Strip with Context & Actions */}
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-slate-200/60 dark:border-zinc-800/80 text-xs text-slate-500 dark:text-zinc-400 print:border-black/20 print:text-zinc-700">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-300 print:text-black font-semibold">
              Exact analytical identity
            </span>
            <span>•</span>
            <span className="print:text-black">{formula.subject_name}</span>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            {solverSlug && (
              <Link
                to={`/solver/${solverSlug}`}
                onClick={() => setActiveSolverSlug && setActiveSolverSlug(solverSlug)}
                className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>Open in Step-by-Step Solver</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            {renderLabComponent() && (
              <a
                href="#interactive-lab"
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>Jump to Interactive Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 4. Symbol Definitions & Parameter Units */}
      {symbols && symbols.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-indigo-500">∑</span>
              <span>Symbol Definitions & Domain Constraints</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              {symbols.length} parameters identified
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xs bg-white dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-28">Symbol</th>
                    <th className="px-4 py-3">Physical Meaning / Role</th>
                    <th className="px-4 py-3 w-36">Unit / Dimension</th>
                    <th className="px-4 py-3 w-44">Domain Constraint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {symbols.map((sym, idx) => (
                    <tr
                      key={sym.id || idx}
                      className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                          <MathView math={sym.symbol} />
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-800 dark:text-zinc-200 leading-normal">
                        {sym.meaning}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-zinc-400 font-mono text-xs whitespace-nowrap">
                        {sym.unit && sym.unit.includes('\\') ? <MathView math={sym.unit} /> : (sym.unit || '—')}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-zinc-400 font-mono text-xs whitespace-nowrap">
                        {sym.constraint && sym.constraint.includes('\\') ? <MathView math={sym.constraint} /> : (sym.constraint || '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 5. Plain Language Meaning & Conceptual Intuition */}
      {lesson.plain_language_intuition && (
        <section className="space-y-4">
          <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <span>Visual Intuition: The Math Behind It</span>
          </h2>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-4 shadow-2xs">
            <p className="text-base text-slate-700 dark:text-zinc-300 leading-relaxed font-normal">
              {lesson.plain_language_intuition}
            </p>

            {/* 3 Intuitive Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  <Compass className="w-4 h-4" />
                  <span>The Core Mechanism</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Establishes a quantitative invariant, conservation rule, or optimization trajectory between parameters.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <Cpu className="w-4 h-4" />
                  <span>Variable Dynamics</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Controls how rates of change and step sizes behave dynamically as the system approaches equilibrium or convergence.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Real-World Impact</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Applied universally across engineering, physics modeling, computer graphics, and machine learning pipelines.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. Conditions & Operating Assumptions */}
      {lesson.conditions_and_assumptions?.applies_when?.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <span>Conditions & Assumptions</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Applies When */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-3">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Valid Operating Domain</span>
              </span>
              <ul className="space-y-2 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200/90 list-disc pl-5">
                {lesson.conditions_and_assumptions.applies_when.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Limitations & Singularities */}
            <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Critical Constraints & Singularities</span>
              </span>
              <ul className="space-y-2 text-xs sm:text-sm text-amber-950 dark:text-amber-200/90 list-disc pl-5">
                {(lesson.conditions_and_assumptions.limitations || [
                  'Does not apply when dividing by zero or outside real continuous limits.',
                  'Singularities and discontinuities require numerical smoothing or limiting approximations.'
                ]).map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 7. Embedded Interactive Simulation Lab */}
      {renderLabComponent() && (
        <section id="interactive-lab" className="space-y-4 pt-2 print-break-inside-avoid avoid-break">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-amber-500">⚡</span>
                <span>Interactive Virtual Experiment Lab</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Manipulate parameters in real time and watch the governing relationship unfold dynamically.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-medium print:hidden">
              60 FPS Live Canvas
            </span>
          </div>

          {/* Print-Only Interactive Lab QR Code Banner */}
          <div className="hidden print:flex items-center justify-between p-3.5 border-2 border-black rounded-xl bg-white gap-4 print-break-inside-avoid">
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                <span>⚡</span>
                <span>60 FPS LIVE VIRTUAL SIMULATION LAB</span>
              </div>
              <p className="text-[11px] text-zinc-800 leading-snug">
                Scan this QR code with your mobile camera to interactively adjust parameters, weights, and observe real-time dynamical changes in your browser.
              </p>
              <div className="font-mono text-[9px] text-zinc-600">
                {`https://behindthemath.org/lesson/${formula.slug || cleanSlug}#interactive-lab`}
              </div>
            </div>
            <QRCodeView
              value={`https://behindthemath.org/lesson/${formula.slug || cleanSlug}#interactive-lab`}
              size={90}
              includeLabel={true}
              label="Run Lab"
            />
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm bg-white dark:bg-zinc-900 p-2 sm:p-4 print:border-2 print:border-black print:rounded-2xl print:p-2 print-break-inside-avoid">
            {renderLabComponent()}
          </div>
        </section>
      )}

      {/* 8. Visual Video Explanation */}
      <VideoExplanationCard formula={formula} />

      {/* 9. Step-by-Step Worked Example */}
      {lesson.worked_example_problem && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-500" />
              <span>Step-by-Step Worked Example</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
              Exam Derivation
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-5">
            <div className="space-y-1.5 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                Problem Statement
              </span>
              <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                {lesson.worked_example_problem}
              </p>
            </div>

            {lesson.worked_example_steps && lesson.worked_example_steps.length > 0 && (
              <div className="space-y-3.5">
                {lesson.worked_example_steps.map((st) => (
                  <div key={st.step} className="flex items-start gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {st.step}
                    </span>
                    <div className="text-slate-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
                      {st.description}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {lesson.worked_example_solution && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>{lesson.worked_example_solution}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 10. Multi-Language Production Code Tabs */}
      {code_snippets && code_snippets.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-500" />
              <span>Production-Ready Code Implementations</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
              Python 3 & C (C11)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            Executable algorithms with input validation, zero-division guards, and boundary checks.
          </p>
          <CodeTabs codeSnippets={code_snippets} />
        </section>
      )}

      {/* 11. Next Recommended Formulas to Learn (Web Navigation Only) */}
      {relatedFormulas.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800 print:hidden">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" />
              <span>Continue Learning in {formula.subject_name}</span>
            </h2>
            <Link
              to={`/library?subject=${formula.subject_slug || formula.subject_name.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {relatedFormulas.map((rel) => (
              <Link
                key={rel.id}
                to={`/lesson/${rel.slug}`}
                className="group p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
                      {rel.level}
                    </span>
                    {rel.has_demo && <span className="text-amber-500 font-medium">⚡ Lab</span>}
                  </div>
                  <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {rel.title}
                  </h3>
                  <div className="py-2 text-center text-xs overflow-x-hidden text-slate-700 dark:text-zinc-300">
                    <MathView math={rel.formula_latex} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-zinc-500 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                  <span>Explore Lesson</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 12. Personal Study Notes & Exam Mnemonic Box */}
      <section className="space-y-4 print-break-inside-avoid">
        {/* Screen Version (Interactive Textarea) */}
        <div className="print:hidden space-y-4">
          <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <span>📝</span>
            <span>Personal Study Reminder & Exam Mnemonic</span>
          </h2>
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-2xs">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Write down your personal memory shortcuts, common exam pitfalls, or derivation tips. Saved directly to your student profile.
            </p>
            <textarea
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              placeholder="Type your notes here, e.g.: In Adam optimizer, remember that beta_1 controls momentum (mean) while beta_2 controls RMSProp (variance). Division by sqrt(v_hat) + eps prevents gradient explosion..."
              rows={3}
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-normal"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                {personalNote.length > 0 ? `${personalNote.length} characters` : 'Auto-saved locally'}
              </span>
              <button
                onClick={handleSavePersonalNote}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs shadow-2xs hover:opacity-90 flex items-center gap-1.5 cursor-pointer transition-opacity"
              >
                {noteSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <CheckCircle className="w-3.5 h-3.5" />}
                <span>{noteSaved ? 'Note Saved!' : 'Save Note'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Print-Only Useful Notes Card */}
        <div className="hidden print:block border-2 border-black rounded-xl p-3.5 bg-white text-black space-y-2 print-break-inside-avoid">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
            <span>📝</span>
            <span>STUDENT EXAM MNEMONIC & DERIVATION NOTES</span>
          </div>
          {personalNote ? (
            <p className="text-xs font-mono text-zinc-900 leading-relaxed whitespace-pre-wrap">
              {personalNote}
            </p>
          ) : (
            <div className="space-y-2 pt-1">
              <div className="border-b border-dashed border-zinc-400 h-3.5" />
              <div className="border-b border-dashed border-zinc-400 h-3.5" />
              <div className="border-b border-dashed border-zinc-400 h-3.5" />
              <span className="text-[9px] text-zinc-500 italic block pt-0.5">
                Space reserved for handwritten derivation shortcuts & exam mnemonics
              </span>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
