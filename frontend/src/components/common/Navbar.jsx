import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Sun,
  Moon,
  Edit3,
  Menu,
  X,
  ChevronDown,
  Calculator,
  Layers,
  Printer,
  Zap,
  CheckCircle2,
  BookOpen,
  Compass,
  Heart,
  User,
  Target,
  Info,
  Home,
  Coffee,
  LogIn,
  LogOut,
  ShieldCheck,
  GraduationCap,
  Bookmark,
  Trophy
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useStudent } from '../../context/StudentContext';
import { useFocus } from '../../context/FocusContext';
import StudentAvatar from './StudentAvatar';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const {
    setIsSearchOpen,
    setIsScratchpadOpen,
    profile,
    user,
    isAuthenticated,
    openAuthModal,
    logout,
    setIsScholarCardOpen
  } = useStudent();
  const { isFocusActive, secondsRemaining, setIsSetupOpen, setIsHudMinimized, openBreakStudio } = useFocus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const location = useLocation();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setToolsDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setToolsDropdownOpen(false);
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close dropdown and mobile menu on route change
  useEffect(() => {
    setToolsDropdownOpen(false);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Lock body scroll when mobile menu is open on small devices
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isToolActive = ['/solver', '/flashcards', '/cheatsheet'].some((p) =>
    location.pathname.startsWith(p)
  );

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const shortcutLabel = isMac ? '⌘K' : 'Ctrl+K';

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-all duration-200 border-zinc-200/80 bg-white/90 dark:border-zinc-800/80 dark:bg-black/90 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_20px_-3px_rgba(0,0,0,0.4)]">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">

          {/* Left: Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-3 xl:gap-5 shrink-0">
            {/* Brand Logo (Links to Home) */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group py-1 select-none" title="BehindTheMath — Intuition · Visuals · Code">
              {/* Bespoke "Behind The Math" Precision Vector Glyph in High Contrast Monochrome */}
              <div className="relative shrink-0">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0 transition-all duration-300 group-hover:scale-105"
                >
                  <defs>
                    <radialGradient id="btmGlow" cx="23.5" cy="10" r="10" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Squircle Tile with Precision Monochrome Stroke */}
                  <rect x="0.5" y="0.5" width="33" height="33" rx="9" fill="#000000" stroke="#27272A" strokeWidth="1" className="dark:stroke-zinc-700" />

                  {/* Mathematical Coordinate Grid — "Behind" the Math */}
                  <path d="M7 17H27M17 7V27" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.18" strokeDasharray="2 2" />

                  {/* Ambient Glow for Insight Dot */}
                  <circle cx="23.5" cy="10" r="7" fill="url(#btmGlow)" />

                  {/* Geometric Sigma Symbol */}
                  <path
                    d="M23.5 10H11.5L17.5 17L11.5 24H23.5"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Smart Insight Coordinate Point */}
                  <circle cx="23.5" cy="10" r="2.2" fill="#10B981" stroke="#000000" strokeWidth="1" />
                </svg>
              </div>

              {/* Minimal Brand Wordmark & Subtitle */}
              <div className="flex flex-col justify-center">
                <span className="font-heading font-extrabold text-[15.5px] tracking-tight text-black dark:text-white group-hover:opacity-80 transition-opacity leading-none">
                  BehindTheMath
                </span>
                <span className="hidden sm:flex text-[10px] font-medium tracking-tight text-zinc-400 dark:text-zinc-500 leading-none mt-1 items-center gap-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                  <span>Intuition</span>
                  <span className="text-emerald-500 font-bold">·</span>
                  <span>Visuals</span>
                  <span className="text-emerald-500 font-bold">·</span>
                  <span>Code</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0 ml-1">
              <Link
                to="/learn"
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 inline-flex items-center ${isActive('/learn')
                    ? 'text-white dark:text-black font-semibold bg-black dark:bg-white shadow-xs'
                    : 'text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
              >
                <span>Learn</span>
              </Link>

              <Link
                to="/library"
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 inline-flex items-center gap-1.5 ${isActive('/library')
                    ? 'text-white dark:text-black font-semibold bg-black dark:bg-white shadow-xs'
                    : 'text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
              >
                <span>Formulas</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium ${isActive('/library') ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                  169
                </span>
              </Link>

              <Link
                to="/lab"
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 inline-flex items-center gap-1.5 ${isActive('/lab')
                    ? 'text-white dark:text-black font-semibold bg-black dark:bg-white shadow-xs'
                    : 'text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Visual Labs</span>
              </Link>

              <Link
                to="/practice"
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 inline-flex items-center gap-1.5 ${isActive('/practice')
                    ? 'text-white dark:text-black font-semibold bg-black dark:bg-white shadow-xs'
                    : 'text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
              >
                <span>Practice</span>
              </Link>

              <Link
                to="/rankings"
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 inline-flex items-center gap-1.5 ${isActive('/rankings') || isActive('/leaderboard')
                    ? 'text-white dark:text-black font-semibold bg-black dark:bg-white shadow-xs'
                    : 'text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
              >
                <Trophy className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
                <span>Rankings</span>
              </Link>

              {/* Tools Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setToolsDropdownOpen((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 inline-flex items-center gap-1 cursor-pointer ${isToolActive || toolsDropdownOpen
                      ? 'text-white dark:text-black font-semibold bg-black dark:bg-white shadow-xs'
                      : 'text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  aria-expanded={toolsDropdownOpen}
                >
                  <span>Tools</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsDropdownOpen ? 'rotate-180 text-black dark:text-white' : 'text-zinc-400'
                      }`}
                  />
                </button>

                {/* Dropdown Popover */}
                {toolsDropdownOpen && (
                  <div className="absolute top-full mt-2 left-0 w-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                      Interactive Tools
                    </div>

                    <Link
                      to="/solver"
                      onClick={() => setToolsDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-[#457B9D] dark:group-hover:text-[#A8DADC]">
                          Step-by-Step Solver
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                          Algebraic derivations & live calculations
                        </p>
                      </div>
                    </Link>

                    <Link
                      to="/flashcards"
                      onClick={() => setToolsDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-[#457B9D] dark:group-hover:text-[#A8DADC]">
                          Active Recall Flashcards
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                          Spaced repetition (SM-2) memory decks
                        </p>
                      </div>
                    </Link>

                    <Link
                      to="/cheatsheet"
                      onClick={() => setToolsDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                        <Printer className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-[#457B9D] dark:group-hover:text-[#A8DADC]">
                          Exam Cheat Sheet
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                          Printable PDF formula study summaries
                        </p>
                      </div>
                    </Link>

                    <Link
                      to="/rankings"
                      onClick={() => setToolsDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white mt-0.5 shrink-0">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-black dark:group-hover:text-white">
                          Scholar Rankings & Hall of Fame
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                          Global academic honor roll & division tiers
                        </p>
                      </div>
                    </Link>

                    <div className="pt-1.5 mt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        Utilities & Info
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setToolsDropdownOpen(false);
                          setIsScratchpadOpen(true);
                        }}
                        className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors text-left group cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0">
                          <Edit3 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-[#457B9D] dark:group-hover:text-[#A8DADC]">
                            Math Scratchpad
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                            In-browser whiteboard for scratch math
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setToolsDropdownOpen(false);
                          setIsSetupOpen(true);
                        }}
                        className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors text-left group cursor-pointer mt-1"
                      >
                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0">
                          <Target className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-[#457B9D] dark:group-hover:text-[#A8DADC] flex items-center gap-1.5">
                            <span>Deep Focus Study Mode</span>
                            {isFocusActive && (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-indigo-500 text-white font-mono animate-pulse">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                            Anti-distraction timer, tab lock & ambient audio
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setToolsDropdownOpen(false);
                          openBreakStudio({ durationMinutes: 5 });
                        }}
                        className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors text-left group cursor-pointer mt-1"
                      >
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                          <Coffee className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-[#457B9D] dark:group-hover:text-[#A8DADC] flex items-center gap-1.5">
                            <span>Mindful Break & Meditation</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                              New
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                            3m, 5m & 10m breathing guide & healing audio
                          </p>
                        </div>
                      </button>

                      <Link
                        to="/about"
                        onClick={() => setToolsDropdownOpen(false)}
                        className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors group mt-1"
                      >
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mt-0.5 shrink-0">
                          <Info className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-[#457B9D] dark:group-hover:text-[#A8DADC]">
                            About & Credits
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                            Mission, creator notes & architecture
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right: Minimalist & Smart Utility Toolbar */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">

            {/* Smart Command Search Trigger: icon on mobile, responsive bar on desktop */}
            <button
              onClick={() => setIsSearchOpen(true)}
              title={`Search formulas & subjects (${shortcutLabel})`}
              className="flex items-center justify-center lg:justify-between gap-2 h-8.5 w-8.5 lg:w-32 xl:w-44 px-0 lg:px-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium transition-all cursor-pointer group"
              aria-label="Search formulas"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors shrink-0" />
                <span className="hidden lg:inline truncate">Search...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-500 shadow-2xs shrink-0">
                {shortcutLabel}
              </kbd>
            </button>

            {/* Desktop Quick Tool Dock (Scratchpad & Focus Mode) */}
            <div className="hidden xl:flex items-center gap-0.5">
              {/* Scratchpad Whiteboard */}
              <button
                onClick={() => setIsScratchpadOpen(true)}
                title="Math Scratchpad (Whiteboard)"
                className="flex items-center justify-center w-8.5 h-8.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Open Scratchpad"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {/* Focus Mode Study Timer */}
              {isFocusActive ? (
                <button
                  onClick={() => setIsHudMinimized((prev) => !prev)}
                  title={`Focus Mode Active (${formatTime(secondsRemaining)} remaining) - Tap to toggle HUD`}
                  className="flex items-center gap-1.5 h-8.5 px-2.5 rounded-lg border border-black/30 dark:border-white/30 bg-black/5 dark:bg-white/10 text-black dark:text-white font-mono text-xs font-semibold animate-pulse cursor-pointer"
                  aria-label="Toggle Focus HUD"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-ping" />
                  <span>{formatTime(secondsRemaining)}</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsSetupOpen(true)}
                  title="Start Deep Focus Session"
                  className="flex items-center justify-center w-8.5 h-8.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="Start Focus Session"
                >
                  <Target className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Theme Switcher Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              className="flex items-center justify-center w-8.5 h-8.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            <div className="hidden lg:block h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

            {/* Desktop Student Identity Menu with Interactive Popover */}
            <div className="relative hidden lg:block" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-2 h-8.5 pl-1.5 pr-2.5 rounded-xl border transition-all cursor-pointer ${
                  profileDropdownOpen || isActive('/profile')
                    ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white bg-white dark:bg-black text-black dark:text-white'
                }`}
                title="Student Profile & Quick Menu"
                aria-expanded={profileDropdownOpen}
              >
                {/* Avatar squircle with cloud sync dot */}
                <div className="relative shrink-0">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs overflow-hidden ${
                    profileDropdownOpen || isActive('/profile')
                      ? 'bg-white text-black dark:bg-black dark:text-white'
                      : 'bg-black text-white dark:bg-white dark:text-black'
                  }`}>
                    <StudentAvatar avatar={profile.avatar} name={profile.display_name} />
                  </div>
                  {isAuthenticated && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-black pointer-events-none" />
                  )}
                </div>

                {/* Handle / Name on XL screens */}
                <span className="hidden xl:inline text-xs font-bold max-w-[90px] truncate">
                  {profile.display_name.split(' ')[0]}
                </span>

                {/* Streak Badge */}
                <div className={`flex items-center gap-0.5 font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                  profileDropdownOpen || isActive('/profile')
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-amber-600 dark:text-amber-400'
                }`}>
                  <span>🔥</span>
                  <span>{profile.study_streak_days}</span>
                </div>

                {/* Caret */}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    profileDropdownOpen ? 'rotate-180' : 'opacity-60'
                  }`}
                />
              </button>

              {/* Dropdown Popover */}
              {profileDropdownOpen && (
                <div className="absolute top-full mt-2 right-0 w-80 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/98 dark:bg-black/98 backdrop-blur-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Profile Header */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 mb-1">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-lg shadow-xs overflow-hidden">
                          <StudentAvatar avatar={profile.avatar} name={profile.display_name} />
                        </div>
                        {isAuthenticated && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black pointer-events-none" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-heading font-extrabold text-xs text-black dark:text-white truncate flex items-center gap-1.5">
                          <span>{profile.display_name}</span>
                          {isAuthenticated && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                              Cloud
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {isAuthenticated ? `@${user?.username}` : 'Guest Student (Local)'}
                        </div>
                      </div>
                    </div>

                    {/* XP Progress Bar in dropdown */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-900 dark:text-zinc-100 font-bold">
                          Level {profile.level} · {profile.level_title}
                        </span>
                        <span className="text-zinc-500 font-medium">
                          {profile.xp_points} XP
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-black dark:bg-white transition-all duration-300"
                          style={{ width: `${Math.max(5, profile.level_progress_pct)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Menu Items */}
                  <div className="space-y-0.5 pt-1 text-xs">
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 font-medium">
                        <User className="w-4 h-4 text-black dark:text-white" />
                        <span>Student Profile & Heatmap</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">View</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setIsScholarCardOpen(true);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 font-medium">
                        <GraduationCap className="w-4 h-4 text-black dark:text-white" />
                        <span>Scholar Portfolio Card</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 font-bold">ID</span>
                    </button>

                    <Link
                      to="/profile?tab=bookmarks"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 font-medium">
                        <Bookmark className="w-4 h-4 text-black dark:text-white" />
                        <span>Saved Formulas & Desk</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">Desk</span>
                    </Link>
                  </div>

                  {/* Dropdown Auth Action Footer */}
                  <div className="mt-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80">
                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out (@{user?.username})</span>
                      </button>
                    ) : (
                      <div className="p-1 space-y-1.5">
                        <div className="text-[10px] text-zinc-400 px-1 leading-tight">
                          Save formulas and sync your derivations across devices.
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              openAuthModal('login');
                            }}
                            className="py-1.5 text-xs font-bold rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white text-center cursor-pointer transition-colors"
                          >
                            Log In
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              openAuthModal('register');
                            }}
                            className="py-1.5 text-xs font-bold rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-center cursor-pointer transition-all shadow-xs"
                          >
                            Sign Up
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Profile Direct Link (< lg) */}
            <Link
              to="/profile"
              title={`${profile.display_name} · ${profile.study_streak_days}d Streak`}
              className={`lg:hidden flex items-center gap-1 h-8.5 pl-1.5 pr-2 rounded-lg transition-all cursor-pointer ${
                isActive('/profile')
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white'
              }`}
            >
              <div className={`relative w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ${
                isActive('/profile')
                  ? 'bg-white text-black dark:bg-black dark:text-white'
                  : 'bg-black text-white dark:bg-white dark:text-black'
              }`}>
                <StudentAvatar avatar={profile.avatar} name={profile.display_name} />
                {isAuthenticated && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-black pointer-events-none" />
                )}
              </div>
              <div className="flex items-center gap-0.5 font-mono text-[11px] font-bold">
                <span>🔥</span>
                <span>{profile.study_streak_days}</span>
              </div>
            </Link>

            {/* Desktop Auth Login CTA */}
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="hidden lg:inline-flex items-center gap-1 h-8.5 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white text-xs font-semibold transition-colors cursor-pointer"
                title="Sign in to save and sync progress"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}

            {/* Minimal Support CTA (Desktop) */}
            <Link
              to="/support"
              title="Support BehindTheMath (bKash · Nagad · Rocket)"
              className={`hidden lg:inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-[0.98] shrink-0 ${
                isActive('/support') || isActive('/donate')
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 shrink-0 ${
                  isActive('/support') || isActive('/donate') ? 'fill-white text-white' : 'fill-rose-500/80 text-rose-500'
                }`}
              />
              <span>Support</span>
            </Link>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Backdrop & Sheet */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 top-16 bg-black/60 backdrop-blur-xs z-30 lg:hidden animate-in fade-in duration-150"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Sheet */}
            <div className="relative z-40 lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white/98 dark:bg-black/98 backdrop-blur-xl px-4 pt-4 pb-8 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain scrollbar-thin">

              {/* Student Mini Profile Card & Auth Controls in Mobile Menu */}
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-3 shadow-2xs hover:border-black dark:hover:border-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-lg shadow-xs overflow-hidden">
                        <StudentAvatar avatar={profile.avatar} name={profile.display_name} />
                      </div>
                      {isAuthenticated && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black pointer-events-none" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-black dark:text-white flex items-center gap-1.5">
                        <span>{profile.display_name}</span>
                        {isAuthenticated && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                            Synced
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                        Level {profile.level} · {profile.level_title}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-black dark:text-white">
                    <span className="px-2 py-1 rounded-lg bg-zinc-200/60 dark:bg-zinc-900">
                      🔥 {profile.study_streak_days}d
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-zinc-200/60 dark:bg-zinc-900">
                      ⚡ {profile.xp_points} XP
                    </span>
                  </div>
                </Link>

                <div className="flex items-center justify-between gap-2 px-1 text-xs">
                  {isAuthenticated ? (
                    <div className="w-full flex items-center justify-between bg-zinc-100 dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
                        Signed in as <strong>@{user?.username}</strong>
                      </span>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  ) : (
                    <div className="w-full grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          openAuthModal('login');
                        }}
                        className="py-1.5 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <LogIn className="w-3 h-3" />
                        <span>Log In</span>
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          openAuthModal('register');
                        }}
                        className="py-1.5 px-3 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>Sign Up</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Search trigger in mobile drawer */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 text-xs font-medium cursor-pointer hover:border-black dark:hover:border-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-zinc-400" />
                  <span>Search 169 formulas & subjects...</span>
                </span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                  Ctrl+K
                </kbd>
              </button>

              {/* Mobile Deep Focus Mode Action Banner */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (isFocusActive) {
                      setIsHudMinimized(false);
                    } else {
                      setIsSetupOpen(true);
                    }
                  }}
                  className={`w-full py-2.5 px-3.5 rounded-xl flex items-center justify-between transition-all cursor-pointer shadow-xs ${isFocusActive
                      ? 'bg-black text-white dark:bg-white dark:text-black ring-2 ring-zinc-400/40 animate-pulse'
                      : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-black dark:text-white border border-zinc-200 dark:border-zinc-800'
                    }`}
                >
                  <div className="flex items-center gap-2.5 font-bold text-xs">
                    <div className="p-1.5 rounded-lg bg-black/10 dark:bg-white/10 text-black dark:text-white">
                      <Target className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div>{isFocusActive ? 'Focus Session Active' : 'Deep Focus Study Mode'}</div>
                      <div className="text-[10px] font-normal text-zinc-500 dark:text-zinc-400">
                        {isFocusActive ? 'Stay locked into your derivations' : 'Anti-distraction timer & ambient sound'}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg bg-black/10 dark:bg-white/10">
                    {isFocusActive ? formatTime(secondsRemaining) : 'Start ⏳'}
                  </span>
                </button>
              </div>

              {/* Core Curriculum Grid */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block px-1">
                  Core Curriculum
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { to: '/', label: 'Home', icon: Home },
                    { to: '/learn', label: 'Subjects', icon: BookOpen },
                    { to: '/library', label: 'Formulas (169)', icon: Compass },
                    { to: '/lab', label: '20 Visual Labs', icon: Zap },
                    { to: '/practice', label: 'Practice Quiz', icon: CheckCircle2 },
                    { to: '/rankings', label: 'Scholar Rankings', icon: Trophy },
                    { to: '/profile', label: 'Student Profile', icon: User },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${isActive(item.to)
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                            : 'text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60'
                          }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Student Tools Grid */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block px-1">
                  Interactive Student Tools
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    to="/solver"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60"
                  >
                    <Calculator className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 shrink-0" />
                    <span>Step Solver</span>
                  </Link>

                  <Link
                    to="/flashcards"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60"
                  >
                    <Layers className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 shrink-0" />
                    <span>Flashcards (SRS)</span>
                  </Link>

                  <Link
                    to="/cheatsheet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60"
                  >
                    <Printer className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 shrink-0" />
                    <span>Cheat Sheet</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsScratchpadOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 text-left cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 shrink-0" />
                    <span>Scratchpad</span>
                  </button>
                </div>
              </div>

              {/* Mobile Support CTA Banner */}
              <div className="pt-1">
                <Link
                  to="/support"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-rose-500/20 active:scale-[0.99] transition-transform"
                >
                  <Heart className="w-4 h-4 fill-white shrink-0" />
                  <span>Support BehindTheMath (bKash · Nagad · Rocket)</span>
                </Link>
              </div>

              {/* About & Mission Link */}
              <div className="pt-1 text-center">
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#457B9D] dark:hover:text-[#A8DADC] font-medium"
                >
                  About the Project · Credits & Architecture →
                </Link>
              </div>

              <div className="pt-1 text-[11px] text-slate-400 text-center">
                Presented by <strong>Santunu Kaysar</strong> · Intellisoft Innovations
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}
