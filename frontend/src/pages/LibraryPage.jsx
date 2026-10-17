import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Bookmark,
  Zap,
  X,
  LayoutGrid,
  List,
  Table as TableIcon,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Calculator,
  Eye,
  Sparkles,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronUp
} from 'lucide-react';
import { formulasApi } from '../api/formulasApi';
import { useStudent } from '../context/StudentContext';
import FormulaCard from '../components/formulas/FormulaCard';
import FormulaDetailModal from '../components/formulas/FormulaDetailModal';
import MathView from '../components/common/MathView';
import allFormulasRaw from '../data/allFormulas.json';
import { FALLBACK_SUBJECTS } from '../data/homeFallbackData';
import { normalizeFormula, filterByAcademicStage } from '../utils/formulaUtils';

const PAGE_CHUNK_SIZE = 36;

const SOLVER_SLUGS = new Set([
  'quadratic-equation',
  'circle-area',
  'pythagorean-theorem',
  'gcd-lcm',
  'compound-interest',
]);

const POPULAR_SEARCHES = [
  'Quadratic',
  'Pythagoras',
  "Euler's",
  'Derivative',
  'Fourier',
  'Projectile',
  'Bayes',
  'Normal Distribution',
  'Matrix'
];

export default function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef(null);
  const loadMoreSentinelRef = useRef(null);

  // Initial params read from URL
  const initialSubject = searchParams.get('subject') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialLevel = searchParams.get('level') || 'all';
  const initialStage = searchParams.get('stage') || 'all';
  const initialSort = searchParams.get('sort') || 'default';
  const initialView = searchParams.get('view') || 'grid';

  // Normalize static JSON for instant offline render
  const initialFormulas = useMemo(() => {
    return (allFormulasRaw || []).map(normalizeFormula);
  }, []);

  const [formulas, setFormulas] = useState(initialFormulas);
  const [subjects, setSubjects] = useState(FALLBACK_SUBJECTS);
  const [viewMode, setViewMode] = useState(initialView); // 'grid' | 'compact' | 'table'
  const [inspectFormula, setInspectFormula] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedQuery, setDebouncedQuery] = useState(initialSearch);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedLevel, setSelectedLevel] = useState(initialLevel);
  const [selectedStage, setSelectedStage] = useState(initialStage);
  const [sortBy, setSortBy] = useState(initialSort);
  const [hasDemoOnly, setHasDemoOnly] = useState(searchParams.get('demo') === 'true');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(searchParams.get('bookmarked') === 'true');
  const [hasSolverOnly, setHasSolverOnly] = useState(searchParams.get('solver') === 'true');

  // Progressive loading chunk state
  const [visibleCount, setVisibleCount] = useState(PAGE_CHUNK_SIZE);
  const [copiedId, setCopiedId] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { bookmarks } = useStudent();

  // Debounce search query to prevent laggy keystroke re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Synchronize state with URL parameters cleanly without blowing away other keys
  const updateUrlParams = (updates) => {
    setSearchParams((prevParams) => {
      const next = new URLSearchParams(prevParams);
      Object.entries(updates).forEach(([key, val]) => {
        if (!val || val === 'all' || val === 'default' || val === false) {
          next.delete(key);
        } else {
          next.set(key, String(val));
        }
      });
      return next;
    }, { replace: true });
  };

  // Keep URL in sync when filters change
  useEffect(() => {
    updateUrlParams({
      subject: selectedSubject,
      search: debouncedQuery,
      level: selectedLevel,
      stage: selectedStage,
      sort: sortBy,
      view: viewMode !== 'grid' ? viewMode : null,
      demo: hasDemoOnly ? 'true' : null,
      bookmarked: bookmarkedOnly ? 'true' : null,
      solver: hasSolverOnly ? 'true' : null,
    });
  }, [selectedSubject, debouncedQuery, selectedLevel, selectedStage, sortBy, viewMode, hasDemoOnly, bookmarkedOnly, hasSolverOnly]);

  // Reset pagination chunk whenever filters change
  useEffect(() => {
    setVisibleCount(PAGE_CHUNK_SIZE);
  }, [debouncedQuery, selectedSubject, selectedLevel, selectedStage, sortBy, hasDemoOnly, bookmarkedOnly, hasSolverOnly]);

  // Keyboard shortcut: "/" to focus search, "Escape" to clear/blur
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Floating Back to Top listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch updated formulas from Django API in background if online
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
          }
        }
      } catch (err) {
        console.warn('Backend API unavailable; running on high-speed client-side formula index.', err);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  // Real-time dynamic formula counts per subject based on active academic stage
  const subjectCounts = useMemo(() => {
    const counts = { all: 0 };
    for (const f of formulas) {
      if (selectedStage !== 'all' && !filterByAcademicStage(f, selectedStage)) {
        continue;
      }
      counts.all = (counts.all || 0) + 1;
      const subSlug = f.subject_slug || f.subject_name?.toLowerCase().replace(/\s+/g, '-');
      if (subSlug) {
        counts[subSlug] = (counts[subSlug] || 0) + 1;
      }
    }
    return counts;
  }, [formulas, selectedStage]);

  // Main filter pipeline
  const filteredFormulas = useMemo(() => {
    let result = formulas.filter((f) => {
      // 1. Search Query
      if (debouncedQuery.trim()) {
        const q = debouncedQuery.toLowerCase();
        const matchesTitle = f.title?.toLowerCase().includes(q);
        const matchesSummary = f.summary?.toLowerCase().includes(q);
        const matchesSubject = f.subject_name?.toLowerCase().includes(q);
        const matchesLatex = f.formula_latex?.toLowerCase().includes(q);
        const matchesKeywords = (f.keywords || []).some((k) => k.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSummary && !matchesSubject && !matchesLatex && !matchesKeywords) {
          return false;
        }
      }

      // 2. Academic Stage Filter
      if (selectedStage !== 'all') {
        if (!filterByAcademicStage(f, selectedStage)) return false;
      }

      // 3. Subject Filter
      if (selectedSubject !== 'all') {
        if (f.subject_slug !== selectedSubject && f.subject_name?.toLowerCase() !== selectedSubject.toLowerCase()) {
          return false;
        }
      }

      // 4. Difficulty Level
      if (selectedLevel !== 'all' && f.level !== selectedLevel) {
        return false;
      }

      // 5. Interactive Demo Only
      if (hasDemoOnly && !f.has_demo) {
        return false;
      }

      // 6. Bookmarked Only
      if (bookmarkedOnly && !bookmarks.has(f.id) && !bookmarks.has(f.formula_id)) {
        return false;
      }

      // 7. Step Solver Only
      if (hasSolverOnly && !SOLVER_SLUGS.has(f.formula_id || f.slug)) {
        return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'subject-asc') {
      result.sort((a, b) => a.subject_name.localeCompare(b.subject_name));
    } else if (sortBy === 'subject-desc') {
      result.sort((a, b) => b.subject_name.localeCompare(a.subject_name));
    } else if (sortBy === 'level' || sortBy === 'level-asc') {
      const order = { beginner: 1, intermediate: 2, advanced: 3 };
      result.sort((a, b) => (order[a.level] || 4) - (order[b.level] || 4));
    } else if (sortBy === 'level-desc') {
      const order = { beginner: 1, intermediate: 2, advanced: 3 };
      result.sort((a, b) => (order[b.level] || 4) - (order[a.level] || 4));
    } else if (sortBy === 'demo') {
      result.sort((a, b) => (b.has_demo ? 1 : 0) - (a.has_demo ? 1 : 0));
    }

    return result;
  }, [formulas, debouncedQuery, selectedSubject, selectedLevel, selectedStage, sortBy, hasDemoOnly, bookmarkedOnly, hasSolverOnly, bookmarks]);

  // Progressive sliced items for instant 60 FPS rendering
  const visibleFormulas = useMemo(() => {
    return filteredFormulas.slice(0, visibleCount);
  }, [filteredFormulas, visibleCount]);

  const hasMore = visibleCount < filteredFormulas.length;

  // Auto-load next batch when user scrolls near sentinel
  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_CHUNK_SIZE, filteredFormulas.length));
        }
      },
      { rootMargin: '400px' }
    );
    const target = loadMoreSentinelRef.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, filteredFormulas.length]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_CHUNK_SIZE, filteredFormulas.length));
  };

  const handleShowAll = () => {
    setVisibleCount(filteredFormulas.length);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSelectedSubject('all');
    setSelectedLevel('all');
    setSelectedStage('all');
    setSortBy('default');
    setHasDemoOnly(false);
    setBookmarkedOnly(false);
    setHasSolverOnly(false);
    setSearchParams({});
  };

  const handleCopyLatex = (e, formula) => {
    e.stopPropagation();
    if (formula.formula_latex) {
      navigator.clipboard.writeText(formula.formula_latex);
      setCopiedId(formula.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSortColumn = (columnKey) => {
    if (columnKey === 'title') {
      setSortBy((prev) => (prev === 'name-asc' ? 'name-desc' : 'name-asc'));
    } else if (columnKey === 'subject') {
      setSortBy((prev) => (prev === 'subject-asc' ? 'subject-desc' : 'subject-asc'));
    } else if (columnKey === 'level') {
      setSortBy((prev) => (prev === 'level-asc' ? 'level-desc' : 'level-asc'));
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount = (debouncedQuery ? 1 : 0) +
    (selectedSubject !== 'all' ? 1 : 0) +
    (selectedLevel !== 'all' ? 1 : 0) +
    (selectedStage !== 'all' ? 1 : 0) +
    (hasDemoOnly ? 1 : 0) +
    (hasSolverOnly ? 1 : 0) +
    (bookmarkedOnly ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      
      {/* 1. Page Header & Stats Intelligence Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-black dark:text-white tracking-tight">
                Formula Reference Library
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                {formulas.length} Curated Equations
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Explore {formulas.length} mathematical formulas spanning high school, HSC, university engineering, machine learning, and physics with LaTeX proofs, live visual labs, and dual C & Python code.
            </p>
          </div>

          {/* View Mode Toggle: Grid, Compact, Table */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View (Visual Cards)"
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>

            <button
              onClick={() => setViewMode('compact')}
              title="Compact View (Rapid Study Scanning)"
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Compact</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              title="Table View (Analytical Comparison)"
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Pill Highlights */}
        <div className="flex items-center gap-2.5 flex-wrap text-xs">
          <button
            onClick={() => setHasDemoOnly((prev) => !prev)}
            className={`px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 font-medium cursor-pointer ${
              hasDemoOnly
                ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${hasDemoOnly ? 'fill-white' : 'text-amber-500 fill-amber-500'}`} />
            <span>20 60fps Visual Labs</span>
          </button>

          <button
            onClick={() => setHasSolverOnly((prev) => !prev)}
            className={`px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 font-medium cursor-pointer ${
              hasSolverOnly
                ? 'bg-cyan-500 text-white border-cyan-500 shadow-2xs'
                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
            }`}
          >
            <Calculator className={`w-3.5 h-3.5 ${hasSolverOnly ? 'text-white' : 'text-cyan-500'}`} />
            <span>5 Step Solvers</span>
          </button>

          <button
            onClick={() => setBookmarkedOnly((prev) => !prev)}
            className={`px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 font-medium cursor-pointer ${
              bookmarkedOnly
                ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarkedOnly ? 'fill-white' : 'text-rose-500'}`} />
            <span>Saved Bookmarks ({bookmarks.size})</span>
          </button>
        </div>
      </div>

      {/* 2. Academic Stage Segmented Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
        {[
          { id: 'all', label: '🎓 All Formulas (169)' },
          { id: 'class11', label: '📘 Class 11 STEM (42)' },
          { id: 'class12', label: '📙 Class 12 STEM (48)' },
          { id: 'university', label: '🏛️ University & Multivariable (35)' },
          { id: 'ml', label: '🤖 ML & Vectors (24)' },
          { id: 'physics', label: '⚛️ Physics & Kinematics (38)' },
          { id: 'discrete', label: '🕸️ Discrete Logic (18)' },
        ].map((stage) => (
          <button
            key={stage.id}
            onClick={() => setSelectedStage(stage.id)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedStage === stage.id
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {stage.label}
          </button>
        ))}
      </div>

      {/* 3. Search & Multi-Filter Control Panel */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 shadow-xs space-y-4">
        
        {/* Row 1: Search + Level + Sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, LaTeX, keyword (e.g. Euler, Bayes, Derivative, Matrix)..."
              className="w-full pl-9 pr-14 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-black dark:text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDebouncedQuery('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">
                /
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Level Selector */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white cursor-pointer"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white cursor-pointer"
            >
              <option value="default">Default Order</option>
              <option value="demo">Interactive Labs First</option>
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="subject-asc">Subject (A → Z)</option>
              <option value="level">Difficulty (Beginner First)</option>
              <option value="level-desc">Difficulty (Advanced First)</option>
            </select>
          </div>

        </div>

        {/* Popular Searches Quick Tags */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Popular:</span>
          </span>
          {POPULAR_SEARCHES.map((k) => (
            <button
              key={k}
              onClick={() => {
                setSearchQuery(k);
                setDebouncedQuery(k);
              }}
              className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition-colors cursor-pointer"
            >
              {k}
            </button>
          ))}
        </div>

        {/* Row 2: 12 Subject Filter Pills with Real-Time Dynamic Counts */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedSubject === 'all'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-2xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <span>All Subjects</span>
              <span className="ml-1 text-[10px] opacity-75 font-mono">({subjectCounts.all || formulas.length})</span>
            </button>

            {subjects.map((sub) => {
              const count = subjectCounts[sub.slug] || 0;
              return (
                <button
                  key={sub.id || sub.slug}
                  onClick={() => setSelectedSubject(sub.slug)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    selectedSubject === sub.slug
                      ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-2xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>{sub.icon || '📐'}</span>
                  <span>{sub.name}</span>
                  <span className="text-[10px] opacity-70 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Active Filters & Clear All */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
            <span className="text-zinc-400 text-[11px] font-semibold">Active:</span>

            {debouncedQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px]">
                Search: "{debouncedQuery}"
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setDebouncedQuery('');
                  }}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedStage !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px]">
                Stage: {selectedStage}
                <button onClick={() => setSelectedStage('all')} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedSubject !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px]">
                Subject: {selectedSubject}
                <button onClick={() => setSelectedSubject('all')} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedLevel !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px]">
                Level: {selectedLevel}
                <button onClick={() => setSelectedLevel('all')} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {hasDemoOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px]">
                Has Lab
                <button onClick={() => setHasDemoOnly(false)} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {hasSolverOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 text-[11px]">
                Has Solver
                <button onClick={() => setHasSolverOnly(false)} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {bookmarkedOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px]">
                Bookmarked
                <button onClick={() => setBookmarkedOnly(false)} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline ml-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all</span>
            </button>
          </div>
        )}

      </div>

      {/* 4. Results Intelligence Status Bar */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1 flex-wrap gap-2">
        <span>
          Showing <strong className="text-black dark:text-white font-semibold">{visibleFormulas.length}</strong> of{' '}
          <strong className="text-black dark:text-white font-semibold">{filteredFormulas.length}</strong> matching formulas
          {selectedSubject !== 'all' && ` in ${selectedSubject}`}
        </span>

        {hasMore && (
          <button
            onClick={handleShowAll}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
          >
            Show All {filteredFormulas.length} Formulas
          </button>
        )}
      </div>

      {/* 5. Formulas Content */}
      {filteredFormulas.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl">
            🔍
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-lg text-zinc-900 dark:text-white">
              No formulas match your filters
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Try adjusting your search query, difficulty level, or curriculum stage.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleFormulas.map((formula) => (
            <FormulaCard
              key={formula.id}
              formula={formula}
              onQuickInspect={setInspectFormula}
            />
          ))}
        </div>
      ) : viewMode === 'compact' ? (
        /* Compact / Cheatsheet View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {visibleFormulas.map((f) => (
            <div
              key={f.id}
              onClick={() => setInspectFormula(f)}
              className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-black dark:hover:border-white shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4 group cursor-pointer"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {f.subject_name}
                  </span>
                  <span className="text-[10px] font-semibold uppercase text-zinc-400">
                    {f.level}
                  </span>
                  {f.has_demo && (
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                  )}
                </div>

                <div className="font-heading font-bold text-sm text-zinc-900 dark:text-white group-hover:underline truncate">
                  {f.title}
                </div>

                <div className="font-mono text-xs text-black dark:text-white pt-0.5 overflow-x-auto scrollbar-none">
                  <MathView math={f.formula_latex} display={false} />
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => handleCopyLatex(e, f)}
                  title={copiedId === f.id ? "Copied!" : "Copy LaTeX"}
                  className="p-2 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {copiedId === f.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setInspectFormula(f)}
                  title="Quick Peek"
                  className="p-2 rounded-lg text-cyan-600 dark:text-cyan-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <Link
                  to={`/lesson/${f.slug}`}
                  title="Full Lesson"
                  className="p-2 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Detailed Analytical Sortable Table View */
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase text-[11px] tracking-wider select-none">
                <tr>
                  <th
                    onClick={() => handleSortColumn('title')}
                    className="px-4 py-3.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Formula & Summary</span>
                      {sortBy === 'name-asc' ? (
                        <ArrowUp className="w-3 h-3 text-black dark:text-white" />
                      ) : sortBy === 'name-desc' ? (
                        <ArrowDown className="w-3 h-3 text-black dark:text-white" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSortColumn('subject')}
                    className="px-4 py-3.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Subject</span>
                      {sortBy === 'subject-asc' ? (
                        <ArrowUp className="w-3 h-3 text-black dark:text-white" />
                      ) : sortBy === 'subject-desc' ? (
                        <ArrowDown className="w-3 h-3 text-black dark:text-white" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>

                  <th className="px-4 py-3.5">Governing Equation</th>

                  <th
                    onClick={() => handleSortColumn('level')}
                    className="px-4 py-3.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Difficulty</span>
                      {sortBy === 'level-asc' || sortBy === 'level' ? (
                        <ArrowUp className="w-3 h-3 text-black dark:text-white" />
                      ) : sortBy === 'level-desc' ? (
                        <ArrowDown className="w-3 h-3 text-black dark:text-white" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>

                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {visibleFormulas.map((f) => (
                  <tr
                    key={f.id}
                    onClick={() => setInspectFormula(f)}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-heading font-bold text-zinc-900 dark:text-white group-hover:underline transition-colors">
                        {f.title}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-sm mt-0.5">{f.summary}</p>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-zinc-600 dark:text-zinc-300 text-xs">
                      {f.subject_name}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <MathView math={f.formula_latex} />
                        <button
                          onClick={(e) => handleCopyLatex(e, f)}
                          title={copiedId === f.id ? "Copied!" : "Copy LaTeX"}
                          className="p-1 rounded text-zinc-400 hover:text-black dark:hover:text-white transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          {copiedId === f.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {f.level}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setInspectFormula(f)}
                          title="Quick Peek Formula Details"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        </button>

                        {f.has_demo && (
                          <Link
                            to={`/lab?id=${f.formula_id || f.slug}`}
                            title="Interactive visual lab"
                            className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          >
                            <Zap className="w-3.5 h-3.5 fill-amber-500" />
                          </Link>
                        )}

                        <Link
                          to={`/lesson/${f.slug}`}
                          className="inline-flex items-center gap-1 font-semibold text-black dark:text-white hover:underline text-xs"
                        >
                          <span>Explore</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Progressive Load More & Observer Sentinel */}
      {hasMore && (
        <div className="py-6 text-center space-y-3">
          <div ref={loadMoreSentinelRef} className="h-2" />
          <button
            onClick={handleLoadMore}
            className="px-6 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all shadow-xs cursor-pointer"
          >
            Load Next {Math.min(PAGE_CHUNK_SIZE, filteredFormulas.length - visibleCount)} Formulas
          </button>
        </div>
      )}

      {/* 7. Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-black text-white dark:bg-white dark:text-black shadow-lg hover:opacity-90 transition-all z-40 cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-200"
          title="Back to Top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* 8. Formula Detail Quick Peek Modal */}
      {inspectFormula && (
        <FormulaDetailModal
          formula={inspectFormula}
          onClose={() => setInspectFormula(null)}
        />
      )}

    </div>
  );
}
