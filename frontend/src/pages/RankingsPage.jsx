import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Crown,
  Award,
  Sparkles,
  Flame,
  Clock,
  Target,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Zap,
  TrendingUp,
  Share2,
  Calendar,
  Layers,
  Printer,
  X,
  Copy,
  Check,
  LocateFixed,
  HelpCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { COMMUNITY_STATS, ACADEMIC_DIVISIONS, TOP_SCHOLARS } from '../data/rankingsData';
import MathView from '../components/common/MathView';
import ScholarInspectModal from '../components/rankings/ScholarInspectModal';
import StudentAvatar from '../components/common/StudentAvatar';

export default function RankingsPage() {
  const { profile, practiceScore, setIsScholarCardOpen } = useStudent();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [timeframe, setTimeframe] = useState('all-time'); // 'all-time' | 'season' | 'week' | 'today'

  // Interactive Sorting
  const [sortColumn, setSortColumn] = useState('xp'); // 'rank' | 'name' | 'streak' | 'focus' | 'accuracy' | 'xp'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'

  // Mobile View Switcher: 'both' | 'podium' | 'table'
  const [mobileTab, setMobileTab] = useState('both');

  // Modal inspection state
  const [inspectedScholar, setInspectedScholar] = useState(null);

  // User Row Highlight & Toast
  const [highlightUserRow, setHighlightUserRow] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const userRowRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  // Compute active user's dynamic XP based on timeframe
  const userXp = useMemo(() => {
    const rawXp = profile.xp_points || 425;
    if (timeframe === 'season') return Math.round(rawXp * 0.82);
    if (timeframe === 'week') return Math.min(rawXp, Math.max(85, Math.round(rawXp * 0.32)));
    if (timeframe === 'today') return Math.min(rawXp, Math.max(35, (profile.total_focus_minutes || 0) > 0 ? 60 : 35));
    return rawXp;
  }, [profile.xp_points, profile.total_focus_minutes, timeframe]);

  // Integrated scholars list (incorporating active user with timeframe-scaled metrics)
  const allScholarsWithUser = useMemo(() => {
    // 1. Map scholars with timeframe scaling
    const rawList = TOP_SCHOLARS.map((s) => {
      let scaledXp = s.xp;
      let scaledStreak = s.streak;
      let scaledFocus = s.focusHours;

      if (timeframe === 'season') {
        scaledXp = Math.round(s.xp * 0.72);
      } else if (timeframe === 'week') {
        scaledXp = Math.round(s.xp * 0.16 + s.streak * 35);
        scaledStreak = Math.min(7, s.streak);
        scaledFocus = Math.max(1, Math.round(s.focusHours * 0.18));
      } else if (timeframe === 'today') {
        scaledXp = Math.round(s.xp * 0.035 + (s.streak % 5) * 20);
        scaledStreak = Math.min(1, s.streak);
        scaledFocus = Math.max(0.5, Math.round(s.focusHours * 0.04 * 10) / 10);
      }

      return {
        ...s,
        xp: scaledXp,
        streak: scaledStreak,
        focusHours: scaledFocus,
      };
    });

    // 2. Active user representation
    const userAsScholar = {
      id: 'current-user',
      movement: 'up',
      movementValue: 2,
      name: profile.display_name || 'You (Math Scholar)',
      handle: 'you',
      avatar: profile.avatar || '∑',
      institution: profile.institution || 'Science & Engineering Dept',
      country: 'Global',
      countryCode: 'INT',
      division:
        userXp >= 12000
          ? 'fields'
          : userXp >= 7500
          ? 'euler'
          : userXp >= 4000
          ? 'gauss'
          : userXp >= 1800
          ? 'newton'
          : 'axiom',
      divisionTitle: profile.level_title || 'Formula Scholar',
      title: profile.level_title || 'Formula Scholar',
      specialization: profile.target_exam || 'Higher Mathematics',
      signatureFormula: 'e^{i\\pi} + 1 = 0',
      xp: userXp,
      streak: profile.study_streak_days || 7,
      focusHours: Math.round(((profile.total_focus_minutes || 50) / 60) * 10) / 10,
      quizAccuracy:
        practiceScore.attempted > 0
          ? Math.round((practiceScore.correct / practiceScore.attempted) * 100)
          : 100,
      formulasMastered: profile.completed_labs?.length || 5,
      verified: true,
      bio:
        profile.bio ||
        'Continuous dedication to quantitative modeling, derivation proofs, and physical mathematical intuition.',
      recentBadges: profile.unlocked_badges || ['First Step', 'Streak Pioneer'],
      isCurrentUser: true,
    };

    // Filter out if user already exists by name, then insert user
    const list = [...rawList];
    const existingIndex = list.findIndex(
      (s) => s.name.toLowerCase() === (profile.display_name || '').toLowerCase()
    );
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...userAsScholar };
    } else {
      list.push(userAsScholar);
    }

    // Default primary sort by XP to establish true base ranks
    list.sort((a, b) => b.xp - a.xp);
    return list.map((s, idx) => ({ ...s, rank: idx + 1 }));
  }, [userXp, profile, practiceScore, timeframe]);

  // Compute active user's true base rank
  const userRank = useMemo(() => {
    const userObj = allScholarsWithUser.find((s) => s.isCurrentUser);
    return userObj ? userObj.rank : allScholarsWithUser.length;
  }, [allScholarsWithUser]);

  // Difference in XP to reach next rank
  const xpToNextRank = useMemo(() => {
    if (userRank <= 1) return 0;
    const scholarAhead = allScholarsWithUser.find((s) => s.rank === userRank - 1);
    if (!scholarAhead) return 0;
    return Math.max(1, scholarAhead.xp - userXp + 1);
  }, [userRank, allScholarsWithUser, userXp]);

  const scholarAhead = useMemo(() => {
    if (userRank <= 1) return null;
    return allScholarsWithUser.find((s) => s.rank === userRank - 1);
  }, [userRank, allScholarsWithUser]);

  // Filtered roster for podium and table
  const filteredScholars = useMemo(() => {
    let result = allScholarsWithUser.filter((s) => {
      // Division filter
      if (selectedDivision !== 'all' && s.division !== selectedDivision) {
        return false;
      }

      // Discipline filter
      if (selectedDiscipline !== 'all') {
        const textToMatch = `${s.specialization} ${s.title} ${s.bio}`.toLowerCase();
        if (
          selectedDiscipline === 'calculus' &&
          !textToMatch.includes('calculus') &&
          !textToMatch.includes('derivative') &&
          !textToMatch.includes('pde')
        )
          return false;
        if (
          selectedDiscipline === 'linear-algebra' &&
          !textToMatch.includes('linear') &&
          !textToMatch.includes('matrix') &&
          !textToMatch.includes('vector') &&
          !textToMatch.includes('eigen')
        )
          return false;
        if (
          selectedDiscipline === 'physics' &&
          !textToMatch.includes('physics') &&
          !textToMatch.includes('quantum') &&
          !textToMatch.includes('relativity') &&
          !textToMatch.includes('orbit')
        )
          return false;
        if (
          selectedDiscipline === 'cs-ai' &&
          !textToMatch.includes('ai') &&
          !textToMatch.includes('optimization') &&
          !textToMatch.includes('complexity') &&
          !textToMatch.includes('algorithm')
        )
          return false;
        if (
          selectedDiscipline === 'statistics' &&
          !textToMatch.includes('probability') &&
          !textToMatch.includes('bayes') &&
          !textToMatch.includes('stochastic')
        )
          return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesInst = s.institution.toLowerCase().includes(q);
        const matchesSpec = s.specialization.toLowerCase().includes(q);
        const matchesHandle = s.handle?.toLowerCase().includes(q);
        const matchesDiv = s.divisionTitle?.toLowerCase().includes(q);
        if (!matchesName && !matchesInst && !matchesSpec && !matchesHandle && !matchesDiv)
          return false;
      }

      return true;
    });

    // Custom Column Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortColumn === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortColumn === 'streak') {
        comparison = a.streak - b.streak;
      } else if (sortColumn === 'focus') {
        comparison = a.focusHours - b.focusHours;
      } else if (sortColumn === 'accuracy') {
        comparison = a.quizAccuracy - b.quizAccuracy;
      } else if (sortColumn === 'rank') {
        comparison = a.rank - b.rank;
      } else {
        // Default 'xp'
        comparison = a.xp - b.xp;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [
    allScholarsWithUser,
    selectedDivision,
    selectedDiscipline,
    searchQuery,
    sortColumn,
    sortDirection,
  ]);

  // Top 3 Podium Scholars from the filtered list (or fallback to top 3 global)
  const topThree = useMemo(() => {
    return filteredScholars.slice(0, 3);
  }, [filteredScholars]);

  // Table Scholars (if podium is shown, we show the full roster so users can search all rows)
  const tableScholars = useMemo(() => {
    return filteredScholars;
  }, [filteredScholars]);

  // Handle column header click for sorting
  const handleSortClick = (columnKey) => {
    if (sortColumn === columnKey) {
      // Toggle direction
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortColumn(columnKey);
      setSortDirection(columnKey === 'name' || columnKey === 'rank' ? 'asc' : 'desc');
    }
  };

  // Scroll smoothly to active user's row in the table
  const scrollToMyPosition = () => {
    // If current filters hide the user, clear them to reveal user's row
    if (selectedDivision !== 'all') setSelectedDivision('all');
    if (selectedDiscipline !== 'all') setSelectedDiscipline('all');
    if (searchQuery) setSearchQuery('');

    setTimeout(() => {
      const el = document.getElementById('scholar-row-current-user');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightUserRow(true);
        showToast(`Navigated to your standing at Rank #${userRank}!`);
        setTimeout(() => setHighlightUserRow(false), 3000);
      } else {
        showToast(`You are ranked #${userRank} on the leaderboard!`);
      }
    }, 150);
  };

  // Copy shareable badge
  const handleShareStanding = () => {
    const shareText = `🎓 BehindTheMath Season 42: I'm currently Rank #${userRank} (${userXp.toLocaleString()} XP, ${profile.study_streak_days || 7}d streak) on the Mathematical Hall of Fame! https://behindthemath.org/rankings`;
    navigator.clipboard.writeText(shareText);
    showToast('Copied your rank achievement badge to clipboard!');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDivision('all');
    setSelectedDiscipline('all');
    setSortColumn('xp');
    setSortDirection('desc');
    showToast('Filters reset to default.');
  };

  const handlePrintLeaderboard = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black shadow-2xl font-bold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Grand Hero Banner with Monochromatic Grid Texture */}
      <section className="relative border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-zinc-50 via-white to-zinc-50/50 dark:from-zinc-950 dark:via-black dark:to-zinc-950/50 pt-10 sm:pt-14 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Mathematical Dot Coordinate Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-25"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-gradient-to-b from-zinc-300/20 dark:from-white/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto space-y-6 text-center">
          {/* Header Badges */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-zinc-300 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xs text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-zinc-700 dark:text-zinc-300">
              Season #{COMMUNITY_STATS.currentSeason} Active
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="font-mono text-zinc-500 dark:text-zinc-400">
              Closes in {COMMUNITY_STATS.seasonEndsIn}
            </span>
          </div>

          {/* Main Title & Value Proposition */}
          <div className="space-y-3">
            <h1 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl tracking-tight text-black dark:text-white">
              Mathematical Hall of Fame
            </h1>
            <p className="max-w-2xl mx-auto text-xs sm:text-base md:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
              Celebrating conceptual intuition, rigorous derivation proofs, and daily problem-solving dedication across mathematics and theoretical STEM.
            </p>
          </div>

          {/* Live Community Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-4xl mx-auto pt-2 font-mono">
            <div className="p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 shadow-2xs space-y-0.5">
              <div className="text-[10px] sm:text-[11px] text-zinc-500 uppercase tracking-wider">
                Active Scholars
              </div>
              <div className="font-extrabold text-lg sm:text-2xl text-black dark:text-white">
                {COMMUNITY_STATS.totalScholars.toLocaleString()}+
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 shadow-2xs space-y-0.5">
              <div className="text-[10px] sm:text-[11px] text-zinc-500 uppercase tracking-wider">
                Focus Hours
              </div>
              <div className="font-extrabold text-lg sm:text-2xl text-black dark:text-white">
                {COMMUNITY_STATS.focusHoursWorldwide.toLocaleString()}h
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 shadow-2xs space-y-0.5">
              <div className="text-[10px] sm:text-[11px] text-zinc-500 uppercase tracking-wider">
                Formulas Mastered
              </div>
              <div className="font-extrabold text-lg sm:text-2xl text-black dark:text-white">
                {COMMUNITY_STATS.formulasMastered.toLocaleString()}+
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 shadow-2xs space-y-0.5">
              <div className="text-[10px] sm:text-[11px] text-zinc-500 uppercase tracking-wider">
                Weekly XP
              </div>
              <div className="font-extrabold text-lg sm:text-2xl text-black dark:text-white">
                {COMMUNITY_STATS.weeklyXpDistributed.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 pt-2 print:hidden flex-wrap">
            <button
              onClick={() => setIsScholarCardOpen(true)}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs shadow-sm hover:opacity-90 transition-all cursor-pointer active:scale-95"
            >
              <GraduationCap className="w-4 h-4" />
              <span>My Scholar Card</span>
            </button>

            <Link
              to="/practice"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-semibold text-xs text-zinc-800 dark:text-zinc-200 transition-colors shadow-2xs active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Practice &amp; Earn XP</span>
            </Link>

            <button
              onClick={handlePrintLeaderboard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer active:scale-95"
              title="Print Official Honor Roll"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Honor Roll</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Your Live Standing Banner */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20 print:hidden">
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-black dark:border-white/80 bg-white dark:bg-zinc-950 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Identity & Rank */}
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-2xl flex items-center justify-center shadow-md ring-2 ring-black/10 shrink-0 overflow-hidden">
              <StudentAvatar avatar={profile.avatar} name={profile.display_name} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase">
                  YOUR CURRENT STANDING
                </span>
                <span className="text-xs font-mono font-extrabold text-black dark:text-white px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  RANK #{userRank}
                </span>
                {scholarAhead && (
                  <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                    ({xpToNextRank} XP to overtake #{userRank - 1})
                  </span>
                )}
              </div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-black dark:text-white leading-snug truncate">
                {profile.display_name || 'Santunu Math Scholar'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {profile.institution || 'Science & Engineering Dept'} · {profile.level_title || 'Level Scholar'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar & Action Buttons */}
          <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-5 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pt-3 md:pt-0 md:pl-5 font-mono text-center flex-wrap">
            <div>
              <div className="text-[10px] text-zinc-400 uppercase">XP Score</div>
              <div className="font-black text-base sm:text-lg text-black dark:text-white">
                {userXp.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-400 uppercase">Streak</div>
              <div className="font-black text-base sm:text-lg text-rose-500 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-rose-500" />
                <span>{profile.study_streak_days || 7}d</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-[10px] text-zinc-400 uppercase">League</div>
              <div className="font-bold text-xs text-zinc-700 dark:text-zinc-300 truncate max-w-[110px]">
                {profile.level_title || 'Scholar'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollToMyPosition}
                className="px-3 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
                title="Scroll to your row in the leaderboard"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>Find My Rank</span>
              </button>

              <button
                type="button"
                onClick={handleShareStanding}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                title="Share your standing badge"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Body Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* 3A. Timeframe Segmented Switcher (All-Time, Season, Weekly, Daily) */}
        <section className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800 print:hidden">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full sm:w-auto">
            {[
              { id: 'all-time', label: 'All-Time Legends', icon: Trophy },
              { id: 'season', label: 'Season #42 League', icon: Layers },
              { id: 'week', label: 'Weekly Sprint', icon: Flame },
              { id: 'today', label: 'Today Standings', icon: Clock },
            ].map((t) => {
              const Icon = t.icon;
              const active = timeframe === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTimeframe(t.id)}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-amber-500' : 'text-zinc-400'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Podium / Table View Switcher */}
          <div className="flex sm:hidden items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-xs font-bold w-full justify-center">
            <button
              onClick={() => setMobileTab('both')}
              className={`flex-1 py-1.5 rounded-lg text-center ${
                mobileTab === 'both' ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs' : 'text-zinc-500'
              }`}
            >
              Show All
            </button>
            <button
              onClick={() => setMobileTab('podium')}
              className={`flex-1 py-1.5 rounded-lg text-center ${
                mobileTab === 'podium' ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs' : 'text-zinc-500'
              }`}
            >
              Podium
            </button>
            <button
              onClick={() => setMobileTab('table')}
              className={`flex-1 py-1.5 rounded-lg text-center ${
                mobileTab === 'table' ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs' : 'text-zinc-500'
              }`}
            >
              Table ({filteredScholars.length})
            </button>
          </div>
        </section>

        {/* 3B. The Podium of Champions (Top 3 Scholars) */}
        {topThree.length > 0 && mobileTab !== 'table' && (
          <section className="space-y-6">
            <div className="text-center space-y-1">
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
                THE MATHEMATICAL TRIUMVIRATE · {timeframe.toUpperCase().replace('-', ' ')}
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-black dark:text-white">
                Global Leaders of Season #{COMMUNITY_STATS.currentSeason}
              </h2>
            </div>

            {/* Podium Arrangement: #2 (Left), #1 (Center, Elevated), #3 (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-4">
              {/* RANK 2: Silver Luminary (Left) */}
              {topThree[1] && (
                <div
                  onClick={() => setInspectedScholar(topThree[1])}
                  className="order-2 md:order-1 relative p-6 rounded-3xl border-2 border-zinc-300 dark:border-zinc-700 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/80 dark:to-zinc-950 shadow-md space-y-4 hover:border-black dark:hover:border-white transition-all cursor-pointer group hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-black bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 flex items-center gap-1.5 shadow-2xs">
                      <span>🥈</span>
                      <span>#2 SILVER</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                      {topThree[1].countryCode}
                    </span>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-black text-3xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform overflow-hidden ring-2 ring-zinc-300 dark:ring-zinc-700">
                      <StudentAvatar avatar={topThree[1].avatar} name={topThree[1].name} />
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-lg text-black dark:text-white flex items-center justify-center gap-1.5">
                        <span>{topThree[1].name}</span>
                        {topThree[1].verified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {topThree[1].institution}
                      </p>
                    </div>
                  </div>

                  {/* Signature formula snippet */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center font-mono text-xs overflow-x-hidden">
                    <MathView math={topThree[1].signatureFormula} />
                  </div>

                  {/* Score strip */}
                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center font-mono text-xs">
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase">XP</span>
                      <strong className="font-bold text-black dark:text-white">
                        {topThree[1].xp.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase">Streak</span>
                      <strong className="font-bold text-rose-500">{topThree[1].streak}d</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase">Focus</span>
                      <strong className="font-bold text-black dark:text-white">{topThree[1].focusHours}h</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* RANK 1: Grandmaster Crown (Center, Tall & Majestic) */}
              {topThree[0] && (
                <div
                  onClick={() => setInspectedScholar(topThree[0])}
                  className="order-1 md:order-2 relative p-7 rounded-3xl border-2 border-black dark:border-white bg-gradient-to-b from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-black dark:to-zinc-950 shadow-2xl space-y-5 hover:scale-[1.02] transition-all cursor-pointer group"
                >
                  {/* Crown Ribbon */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>🥇 RANK 1 · GRAND CHAMPION</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-mono font-bold text-zinc-500 uppercase">
                      {topThree[0].divisionTitle}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-500 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                      {topThree[0].countryCode}
                    </span>
                  </div>

                  <div className="text-center space-y-2.5">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-black text-white dark:bg-white dark:text-black font-black text-4xl flex items-center justify-center shadow-xl ring-4 ring-black/10 dark:ring-white/20 group-hover:scale-105 transition-transform overflow-hidden">
                      <StudentAvatar avatar={topThree[0].avatar} name={topThree[0].name} />
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-xl text-black dark:text-white flex items-center justify-center gap-1.5">
                        <span>{topThree[0].name}</span>
                        {topThree[0].verified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                      </h3>
                      <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                        {topThree[0].institution}
                      </p>
                      <p className="text-[11px] text-zinc-400">{topThree[0].specialization}</p>
                    </div>
                  </div>

                  {/* Signature formula showcase */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center font-mono text-xs sm:text-sm overflow-x-hidden shadow-2xs">
                    <MathView math={topThree[0].signatureFormula} />
                  </div>

                  {/* Score strip */}
                  <div className="grid grid-cols-4 gap-1 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-center font-mono text-xs">
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase">Total XP</span>
                      <strong className="font-black text-sm text-black dark:text-white">
                        {topThree[0].xp.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase">Streak</span>
                      <strong className="font-bold text-rose-500">{topThree[0].streak}d</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase">Focus</span>
                      <strong className="font-bold text-black dark:text-white">{topThree[0].focusHours}h</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase">Accuracy</span>
                      <strong className="font-bold text-emerald-600 dark:text-emerald-400">
                        {topThree[0].quizAccuracy}%
                      </strong>
                    </div>
                  </div>

                  <div className="text-center pt-1">
                    <span className="text-[11px] font-semibold text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-colors flex items-center justify-center gap-1">
                      <span>Inspect Scholar Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              )}

              {/* RANK 3: Bronze Vanguard (Right) */}
              {topThree[2] && (
                <div
                  onClick={() => setInspectedScholar(topThree[2])}
                  className="order-3 relative p-6 rounded-3xl border-2 border-zinc-300 dark:border-zinc-700 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/80 dark:to-zinc-950 shadow-md space-y-4 hover:border-black dark:hover:border-white transition-all cursor-pointer group hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-black bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 flex items-center gap-1.5 shadow-2xs">
                      <span>🥉</span>
                      <span>#3 BRONZE</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                      {topThree[2].countryCode}
                    </span>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-black text-3xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform overflow-hidden ring-2 ring-zinc-300 dark:ring-zinc-700">
                      <StudentAvatar avatar={topThree[2].avatar} name={topThree[2].name} />
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-lg text-black dark:text-white flex items-center justify-center gap-1.5">
                        <span>{topThree[2].name}</span>
                        {topThree[2].verified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {topThree[2].institution}
                      </p>
                    </div>
                  </div>

                  {/* Signature formula snippet */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center font-mono text-xs overflow-x-hidden">
                    <MathView math={topThree[2].signatureFormula} />
                  </div>

                  {/* Score strip */}
                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center font-mono text-xs">
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase">XP</span>
                      <strong className="font-bold text-black dark:text-white">
                        {topThree[2].xp.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase">Streak</span>
                      <strong className="font-bold text-rose-500">{topThree[2].streak}d</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase">Focus</span>
                      <strong className="font-bold text-black dark:text-white">{topThree[2].focusHours}h</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3C. Academic Division Filter Pills Bar */}
        <section className="space-y-3 pt-2 print:hidden">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
              Academic Divisions
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              {filteredScholars.length} scholars found
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-medium">
            {ACADEMIC_DIVISIONS.map((div) => {
              const active = selectedDivision === div.id;
              return (
                <button
                  key={div.id}
                  onClick={() => setSelectedDivision(div.id)}
                  className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs scale-[1.02]'
                      : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <span>{div.name}</span>
                  {div.minXp > 0 && (
                    <span className={`text-[10px] font-mono ${active ? 'opacity-80' : 'text-zinc-400'}`}>
                      ({div.minXp.toLocaleString()}+ XP)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* 3D. Search, Disciplines & Dynamic Toolbar */}
        <section className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4 shadow-2xs print:hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input with Clear Button */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scholars by name, university, or specialization..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-black dark:text-white placeholder:text-zinc-400 outline-none focus:border-black dark:focus:border-white transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Disciplines Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs pb-1 lg:pb-0">
              {[
                { id: 'all', label: 'All Fields' },
                { id: 'calculus', label: 'Calculus' },
                { id: 'linear-algebra', label: 'Linear Algebra' },
                { id: 'physics', label: 'Physics' },
                { id: 'cs-ai', label: 'CS & AI' },
                { id: 'statistics', label: 'Probability' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedDiscipline(sub.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-xs font-medium ${
                    selectedDiscipline === sub.id
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-semibold shadow-2xs'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0 text-xs">
              <span className="text-zinc-400 text-xs font-mono">Sort:</span>
              <select
                value={sortColumn}
                onChange={(e) => {
                  setSortColumn(e.target.value);
                  setSortDirection('desc');
                }}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-black dark:text-white outline-none cursor-pointer"
              >
                <option value="xp">Total XP Points</option>
                <option value="streak">Study Streak</option>
                <option value="focus">Deep Focus Hours</option>
                <option value="accuracy">Quiz Accuracy</option>
                <option value="rank">Leaderboard Rank</option>
                <option value="name">Scholar Name</option>
              </select>

              <button
                type="button"
                onClick={() => setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                title={`Sort ${sortDirection === 'desc' ? 'Ascending' : 'Descending'}`}
              >
                {sortDirection === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </section>

        {/* 3E. The Main Leaderboard Table */}
        {mobileTab !== 'podium' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-xl text-black dark:text-white flex items-center gap-2">
                <span>Academic Honor Roll</span>
                <span className="text-xs font-mono font-normal text-zinc-400">
                  ({filteredScholars.length} scholars listed)
                </span>
              </h3>

              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Verified Live Roster</span>
              </div>
            </div>

            {/* Empty State */}
            {filteredScholars.length === 0 ? (
              <div className="p-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto text-xl">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-base text-black dark:text-white">
                  No scholars match your filters
                </h4>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  We couldn't find any scholars matching &ldquo;{searchQuery || selectedDivision}&rdquo;. Try broadening your search or resetting filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950 shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono text-[11px] uppercase tracking-wider select-none">
                      <tr>
                        {/* Rank header */}
                        <th
                          onClick={() => handleSortClick('rank')}
                          className="px-4 py-3.5 w-16 text-center cursor-pointer hover:text-black dark:hover:text-white transition-colors"
                        >
                          <div className="inline-flex items-center gap-1">
                            <span>Rank</span>
                            {sortColumn === 'rank' && (
                              sortDirection === 'desc' ? <ArrowDown className="w-3 h-3 text-black dark:text-white" /> : <ArrowUp className="w-3 h-3 text-black dark:text-white" />
                            )}
                          </div>
                        </th>

                        {/* Scholar header */}
                        <th
                          onClick={() => handleSortClick('name')}
                          className="px-4 py-3.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors"
                        >
                          <div className="inline-flex items-center gap-1">
                            <span>Scholar &amp; Institution</span>
                            {sortColumn === 'name' && (
                              sortDirection === 'desc' ? <ArrowDown className="w-3 h-3 text-black dark:text-white" /> : <ArrowUp className="w-3 h-3 text-black dark:text-white" />
                            )}
                          </div>
                        </th>

                        <th className="px-4 py-3.5 hidden md:table-cell">Specialization</th>

                        {/* Streak header */}
                        <th
                          onClick={() => handleSortClick('streak')}
                          className="px-4 py-3.5 text-center w-24 cursor-pointer hover:text-black dark:hover:text-white transition-colors"
                        >
                          <div className="inline-flex items-center justify-center gap-1">
                            <span>Streak</span>
                            {sortColumn === 'streak' && (
                              sortDirection === 'desc' ? <ArrowDown className="w-3 h-3 text-black dark:text-white" /> : <ArrowUp className="w-3 h-3 text-black dark:text-white" />
                            )}
                          </div>
                        </th>

                        {/* Focus header */}
                        <th
                          onClick={() => handleSortClick('focus')}
                          className="px-4 py-3.5 text-center w-24 hidden sm:table-cell cursor-pointer hover:text-black dark:hover:text-white transition-colors"
                        >
                          <div className="inline-flex items-center justify-center gap-1">
                            <span>Focus</span>
                            {sortColumn === 'focus' && (
                              sortDirection === 'desc' ? <ArrowDown className="w-3 h-3 text-black dark:text-white" /> : <ArrowUp className="w-3 h-3 text-black dark:text-white" />
                            )}
                          </div>
                        </th>

                        {/* Accuracy header */}
                        <th
                          onClick={() => handleSortClick('accuracy')}
                          className="px-4 py-3.5 text-center w-28 hidden lg:table-cell cursor-pointer hover:text-black dark:hover:text-white transition-colors"
                        >
                          <div className="inline-flex items-center justify-center gap-1">
                            <span>Accuracy</span>
                            {sortColumn === 'accuracy' && (
                              sortDirection === 'desc' ? <ArrowDown className="w-3 h-3 text-black dark:text-white" /> : <ArrowUp className="w-3 h-3 text-black dark:text-white" />
                            )}
                          </div>
                        </th>

                        {/* XP header */}
                        <th
                          onClick={() => handleSortClick('xp')}
                          className="px-4 py-3.5 text-right w-28 cursor-pointer hover:text-black dark:hover:text-white transition-colors"
                        >
                          <div className="inline-flex items-center justify-end gap-1 w-full">
                            <span>Total XP</span>
                            {sortColumn === 'xp' && (
                              sortDirection === 'desc' ? <ArrowDown className="w-3 h-3 text-black dark:text-white" /> : <ArrowUp className="w-3 h-3 text-black dark:text-white" />
                            )}
                          </div>
                        </th>

                        <th className="px-4 py-3.5 text-center w-20 print:hidden">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-sans">
                      {tableScholars.map((scholar) => {
                        const isUser = scholar.isCurrentUser;
                        return (
                          <tr
                            key={scholar.id}
                            id={isUser ? 'scholar-row-current-user' : undefined}
                            ref={isUser ? userRowRef : undefined}
                            onClick={() => setInspectedScholar(scholar)}
                            className={`transition-all duration-300 cursor-pointer group ${
                              isUser
                                ? highlightUserRow
                                  ? 'bg-emerald-500/15 dark:bg-emerald-500/20 ring-2 ring-emerald-500 font-semibold'
                                  : 'bg-zinc-100/90 dark:bg-zinc-900/90 font-semibold border-l-4 border-l-black dark:border-l-white'
                                : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40'
                            }`}
                          >
                            {/* Rank Column */}
                            <td className="px-4 py-3.5 text-center font-mono">
                              <div className="flex flex-col items-center justify-center">
                                <span
                                  className={`text-sm font-black ${
                                    scholar.rank === 1
                                      ? 'text-amber-500'
                                      : scholar.rank === 2
                                      ? 'text-zinc-400'
                                      : scholar.rank === 3
                                      ? 'text-amber-700'
                                      : 'text-black dark:text-white'
                                  }`}
                                >
                                  #{scholar.rank}
                                </span>
                                {/* Movement indicator */}
                                <span className="text-[10px] text-zinc-400 flex items-center">
                                  {scholar.movement === 'up' && (
                                    <span className="text-emerald-500 flex items-center font-bold">
                                      ▲{scholar.movementValue}
                                    </span>
                                  )}
                                  {scholar.movement === 'down' && (
                                    <span className="text-rose-400 flex items-center font-bold">
                                      ▼{scholar.movementValue}
                                    </span>
                                  )}
                                  {scholar.movement === 'stable' && (
                                    <span className="text-zinc-400">•</span>
                                  )}
                                </span>
                              </div>
                            </td>

                            {/* Scholar Identity Column */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white font-extrabold text-base flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shrink-0 overflow-hidden">
                                  <StudentAvatar avatar={scholar.avatar} name={scholar.name} />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-heading font-bold text-sm text-black dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors truncate">
                                      {scholar.name}
                                    </span>
                                    {isUser && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-black text-white dark:bg-white dark:text-black">
                                        YOU
                                      </span>
                                    )}
                                    {scholar.verified && (
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    )}
                                  </div>
                                  <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                    {scholar.institution}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Specialization */}
                            <td className="px-4 py-3.5 hidden md:table-cell">
                              <div className="text-xs text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[220px]">
                                {scholar.specialization}
                              </div>
                              <div className="text-[10px] font-mono text-zinc-400">
                                {scholar.divisionTitle}
                              </div>
                            </td>

                            {/* Streak */}
                            <td className="px-4 py-3.5 text-center font-mono">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
                                <Flame className="w-3 h-3 fill-rose-500" />
                                <span>{scholar.streak}d</span>
                              </span>
                            </td>

                            {/* Focus Hours */}
                            <td className="px-4 py-3.5 text-center font-mono text-xs hidden sm:table-cell text-zinc-700 dark:text-zinc-300">
                              {scholar.focusHours}h
                            </td>

                            {/* Quiz Accuracy */}
                            <td className="px-4 py-3.5 text-center font-mono text-xs hidden lg:table-cell">
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {scholar.quizAccuracy}%
                              </span>
                            </td>

                            {/* XP Points */}
                            <td className="px-4 py-3.5 text-right font-mono font-extrabold text-sm text-black dark:text-white whitespace-nowrap">
                              {scholar.xp.toLocaleString()}
                            </td>

                            {/* Action Column */}
                            <td className="px-4 py-3.5 text-center print:hidden">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInspectedScholar(scholar);
                                }}
                                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                                title="Inspect Scholar Card"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 3F. Promotion Zone & League Rules */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 print:hidden">
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black dark:text-white">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Weekly League Promotion Rules</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              The top 10 scholars every Sunday at 23:59 UTC earn permanent promotion to the next academic division, verified physical certificate credentials, and +500 Scholar XP points.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verifiable Academic Honor Roll</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every rank on BehindTheMath is cryptographically verifiable via digital passport QR codes, preventing tampering and honoring authentic dedication to mathematics.
            </p>
          </div>
        </section>
      </main>

      {/* 4. Interactive Scholar Inspect Modal */}
      {inspectedScholar && (
        <ScholarInspectModal
          scholar={inspectedScholar}
          onClose={() => setInspectedScholar(null)}
        />
      )}
    </div>
  );
}
