import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Award,
  Flame,
  Zap,
  Target,
  BookOpen,
  Bookmark,
  FileText,
  Calculator,
  Compass,
  CheckCircle2,
  Edit2,
  Trash2,
  ArrowRight,
  TrendingUp,
  Layers,
  GraduationCap,
  Calendar,
  X,
  LogIn,
  LogOut,
  ShieldCheck,
  Share2,
  Search,
  RefreshCw,
  Key,
  Download,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Clock,
  Play,
  Printer,
  Trophy,
  Camera,
  Upload
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { useFocus } from '../context/FocusContext';
import { formulasApi, authApi } from '../api/formulasApi';
import MathView from '../components/common/MathView';
import QRCodeView from '../components/common/QRCodeView';
import StudentAvatar from '../components/common/StudentAvatar';
import AvatarCustomizerModal from '../components/student_tools/AvatarCustomizerModal';



const BADGES = [
  {
    id: 'first_step',
    title: 'First Step',
    icon: '🎯',
    description: 'Solve your first practice quiz problem correctly',
    criteria: '1 correct quiz answer',
  },
  {
    id: 'streak_3',
    title: 'Fire Starter',
    icon: '🔥',
    description: 'Maintain a 3-day continuous mathematical study streak',
    criteria: '3-day study streak',
  },
  {
    id: 'streak_7',
    title: 'Flame Archmage',
    icon: '⚡',
    description: 'Maintain an uninterrupted 7-day daily study streak',
    criteria: '7-day study streak',
  },
  {
    id: 'lab_explorer',
    title: 'Lab Explorer',
    icon: '🔬',
    description: 'Interact with and explore 3 visual 60 FPS canvas labs',
    criteria: 'Explore 3 visual labs',
  },
  {
    id: 'bookmarker',
    title: 'Formula Curator',
    icon: '🔖',
    description: 'Save 5 or more formulas to your personal study desk',
    criteria: 'Bookmark 5 formulas',
  },
  {
    id: 'century_club',
    title: 'Century Club',
    icon: '⚡',
    description: 'Earn 500 XP through active learning and derivations',
    criteria: 'Reach 500 XP',
  },
  {
    id: 'active_recaller',
    title: 'Active Recaller',
    icon: '🧠',
    description: 'Review SM-2 spaced repetition cards to reinforce memory',
    criteria: 'Review flashcard decks',
  },
  {
    id: 'solver_pro',
    title: 'Derivation Solver',
    icon: '🧮',
    description: 'Compute parameters using the step-by-step solver engine',
    criteria: 'Use algebraic solver',
  },
  {
    id: 'focus_master',
    title: 'Focus Master',
    icon: '🧘',
    description: 'Complete 3 deep mathematical focus sessions without interruption',
    criteria: '3 completed focus sessions',
  },
  {
    id: 'euler_scholar',
    title: 'Euler Scholar',
    icon: '🎓',
    description: 'Achieve Level 5 in overall mathematical intuition',
    criteria: 'Reach Level 5 (1,000 XP)',
  },
  {
    id: 'gauss_master',
    title: 'Gauss Master',
    icon: '🏛️',
    description: 'Achieve Level 7 in overall mathematical intuition',
    criteria: 'Reach Level 7 (1,400 XP)',
  },
  {
    id: 'polymath',
    title: 'Grand Archmage',
    icon: '👑',
    description: 'Unlock mastery across all core mathematical fields',
    criteria: 'Reach Level 10 (2,000 XP)',
  },
];

const TARGET_EXAM_OPTIONS = [
  'HSC Higher Math 2026',
  'BUET & Engineering Admission',
  'University Engineering Math',
  'Physics & Quantum Mechanics',
  'Machine Learning & AI Mathematics',
  'Discrete Math & Olympiad',
];

const ALL_VISUAL_LABS = [
  { slug: 'fourier-series', title: 'Fourier Series & Epicycle Decomposition', subject: 'Signals & Waves', icon: '🌀' },
  { slug: 'double-pendulum', title: 'Double Pendulum & Chaos Theory', subject: 'Physics & Dynamics', icon: '⚡' },
  { slug: 'kepler-orbit', title: 'Keplerian Orbital Mechanics & Vis-Viva', subject: 'Physics & Astronomy', icon: '🪐' },
  { slug: 'bayes-theorem', title: "Bayes' Theorem & Diagnostic Probability", subject: 'Probability & Stats', icon: '🎲' },
  { slug: 'neural-network', title: 'Neural Network Decision Boundary & Perceptron', subject: 'Machine Learning', icon: '🧠' },
  { slug: 'big-o', title: 'Big-O Algorithmic Growth & Racing Arena', subject: 'Algorithms & CS', icon: '⚡' },
  { slug: 'circle-area', title: 'Circle Area & Archimedes Polygon Limits', subject: 'Geometry & Trig', icon: '⭕' },
  { slug: 'euclidean-gcd', title: 'Euclidean GCD Algorithm & Square Tiling', subject: 'Number Theory', icon: '🧱' },
  { slug: 'harmonic-wave', title: 'Harmonic Wave, Standing Waves & Interference', subject: 'Signals & Waves', icon: '🌊' },
  { slug: 'unit-circle', title: 'Unit Circle Trigonometry & Phasors', subject: 'Geometry & Trig', icon: '📐' },
  { slug: 'derivative', title: 'Derivative & Secant-to-Tangent Slope', subject: 'Calculus', icon: '📈' },
  { slug: 'pythagorean', title: 'Pythagorean Theorem & Geometric Squares', subject: 'Geometry & Trig', icon: '📐' },
  { slug: 'quadratic', title: 'Quadratic Function, Parabola & Roots', subject: 'Algebra', icon: '📊' },
  { slug: 'matrix-transform', title: '2D Linear Matrix Transformations & Determinant', subject: 'Linear Algebra', icon: '🔲' },
  { slug: 'projectile-motion', title: 'Projectile Motion & Kinematics Ballistics', subject: 'Physics & Kinematics', icon: '🚀' },
  { slug: 'snells-law', title: 'Snell’s Law & Total Internal Reflection', subject: 'Optics & Physics', icon: '💡' },
  { slug: 'lorentz-dilation', title: 'Lorentz Factor & Relativistic Time Dilation', subject: 'Modern Physics', icon: '⏱️' },
  { slug: 'lagrange-multipliers', title: 'Lagrange Multipliers Constrained Optimization', subject: 'Calculus', icon: '🎯' },
  { slug: 'cosine-similarity', title: 'Cosine Similarity & High-Dimensional Embeddings', subject: 'Machine Learning', icon: '🧭' },
  { slug: 'normal-dist', title: 'Normal (Gaussian) Distribution & Empirical Rule', subject: 'Probability & Stats', icon: '🔔' },
];

export default function ProfilePage() {
  const {
    profile,
    updateProfile,
    bookmarks,
    toggleBookmark,
    notes,
    saveNote,
    practiceScore,
    user,
    isAuthenticated,
    openAuthModal,
    logout,
    logActivity,
    setIsScholarCardOpen
  } = useStudent();

  const { setIsSetupOpen } = useFocus();

  // Active study desk tab
  const [activeTab, setActiveTab] = useState('bookmarks'); // 'bookmarks' | 'notes' | 'flashcards' | 'labs' | 'mastery' | 'settings'

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Edit form state
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [institution, setInstitution] = useState(profile.institution || '');
  const [targetExam, setTargetExam] = useState(profile.target_exam || '');
  const [targetExamDate, setTargetExamDate] = useState(profile.target_exam_date || '2026-06-15');
  const [bio, setBio] = useState(profile.bio || '');
  const [dailyGoal, setDailyGoal] = useState(profile.daily_goal_formulas || 5);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ msg: '', isError: false });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Bookmarks filter & search
  const [bookmarkedFormulas, setBookmarkedFormulas] = useState([]);
  const [bookmarkSearch, setBookmarkSearch] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');

  // Notes inline editing & search
  const [notesSearch, setNotesSearch] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteEditContent, setNoteEditContent] = useState('');

  // Badges filter
  const [badgeFilter, setBadgeFilter] = useState('all'); // 'all' | 'unlocked' | 'locked'

  // Copied LaTeX feedback
  const [copiedFormulaId, setCopiedFormulaId] = useState(null);

  // Reset data confirm
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  useEffect(() => {
    setDisplayName(profile.display_name || '');
    setInstitution(profile.institution || '');
    setTargetExam(profile.target_exam || '');
    setTargetExamDate(profile.target_exam_date || '2026-06-15');
    setBio(profile.bio || '');
    setDailyGoal(profile.daily_goal_formulas || 5);
  }, [profile]);

  useEffect(() => {
    const loadFormulas = async () => {
      try {
        const list = await formulasApi.getFormulas();
        const filtered = list.filter((f) => bookmarks.has(f.id) || bookmarks.has(f.formula_id));
        setBookmarkedFormulas(filtered);
      } catch (e) {
        console.warn('Failed loading bookmarked formulas:', e);
      }
    };
    loadFormulas();
  }, [bookmarks]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      display_name: displayName,
      institution,
      target_exam: targetExam,
      target_exam_date: targetExamDate,
      bio,
      daily_goal_formulas: Number(dailyGoal) || 5,
    });
    setIsEditModalOpen(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ msg: '', isError: false });

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ msg: 'New passwords do not match.', isError: true });
      return;
    }
    if (newPassword.length < 4) {
      setPasswordStatus({ msg: 'Password must be at least 4 characters.', isError: true });
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordStatus({ msg: 'Password updated successfully!', isError: false });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.data?.error || err.message || 'Failed to update password.';
      setPasswordStatus({ msg, isError: true });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleIncrementDailyGoal = () => {
    logActivity('daily_goal_increment');
  };

  const handleCopyLatex = (formula) => {
    if (formula?.latex_formula) {
      navigator.clipboard.writeText(formula.latex_formula);
      setCopiedFormulaId(formula.id);
      setTimeout(() => setCopiedFormulaId(null), 2000);
    }
  };

  const handleExportData = () => {
    const data = {
      profile,
      bookmarks: Array.from(bookmarks),
      notes,
      practiceScore,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BehindTheMath_Scholar_${profile.display_name.replace(/\s+/g, '_')}_Data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    localStorage.removeItem('btm_student_profile');
    localStorage.removeItem('btm_bookmarks');
    localStorage.removeItem('btm_notes');
    localStorage.removeItem('btm_practice_score');
    window.location.reload();
  };

  const accuracyPct = practiceScore.attempted > 0
    ? Math.round((practiceScore.correct / practiceScore.attempted) * 100)
    : 100;

  const scholarId = `BTM-2026-${String(profile.xp_points || 425).padStart(4, '0')}-${(profile.display_name || 'SCHOLAR').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'STD'}`;

  const handlePrintTranscript = () => {
    window.print();
  };

  // Countdown Calculation
  const daysUntilExam = useMemo(() => {
    if (!profile.target_exam_date) return null;
    const target = new Date(profile.target_exam_date);
    const today = new Date();
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [profile.target_exam_date]);

  // Activity Heatmap generation (Last 12 weeks = 84 days)
  const heatmapData = useMemo(() => {
    const days = [];
    const now = new Date();
    const activityMap = profile.daily_activity_map || {};

    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const count = activityMap[iso] || 0;
      days.push({
        date: iso,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count,
      });
    }
    return days;
  }, [profile.daily_activity_map]);

  const activeDaysCount = useMemo(() => {
    const map = profile.daily_activity_map || {};
    return Object.values(map).filter((c) => c > 0).length;
  }, [profile.daily_activity_map]);

  // Filtered bookmarks
  const filteredBookmarks = useMemo(() => {
    return bookmarkedFormulas.filter((f) => {
      const matchesSearch = bookmarkSearch === '' ||
        f.title.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
        (f.summary && f.summary.toLowerCase().includes(bookmarkSearch.toLowerCase()));
      const matchesSubject = selectedSubjectFilter === 'all' ||
        (f.subject_name && f.subject_name.toLowerCase() === selectedSubjectFilter.toLowerCase());
      return matchesSearch && matchesSubject;
    });
  }, [bookmarkedFormulas, bookmarkSearch, selectedSubjectFilter]);

  // Unique bookmark subjects
  const bookmarkSubjects = useMemo(() => {
    const set = new Set();
    bookmarkedFormulas.forEach((f) => {
      if (f.subject_name) set.add(f.subject_name);
    });
    return Array.from(set);
  }, [bookmarkedFormulas]);

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return Object.entries(notes).filter(([formulaId, text]) => {
      if (!notesSearch) return true;
      return (
        formulaId.toLowerCase().includes(notesSearch.toLowerCase()) ||
        text.toLowerCase().includes(notesSearch.toLowerCase())
      );
    });
  }, [notes, notesSearch]);

  // Filtered badges
  const filteredBadges = useMemo(() => {
    const unlocked = profile.unlocked_badges || [];
    return BADGES.filter((b) => {
      const isUnlocked = unlocked.includes(b.id);
      if (badgeFilter === 'unlocked') return isUnlocked;
      if (badgeFilter === 'locked') return !isUnlocked;
      return true;
    });
  }, [profile.unlocked_badges, badgeFilter]);

  // Today activity count
  const todayIso = new Date().toISOString().split('T')[0];
  const todayActivityCount = profile.daily_activity_map?.[todayIso] || 0;
  const dailyGoalPct = Math.min(100, Math.round((todayActivityCount / (profile.daily_goal_formulas || 5)) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      <div className="print:hidden space-y-8">
      {/* 1. Cloud Sync Ribbon & Quick Identity Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1424] shadow-xs">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full shrink-0 ${isAuthenticated ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20' : 'bg-amber-400 ring-4 ring-amber-400/20'}`} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                {isAuthenticated ? (
                  <>Cloud Synced Account (@{user?.username})</>
                ) : (
                  <>Guest Student Mode (Local Browser Storage)</>
                )}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                {isAuthenticated ? 'Active Cloud Session' : 'Device Only'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isAuthenticated
                ? 'All XP, bookmarks, notes, and simulation completions are synced in real-time.'
                : 'Sign in to access your personal formulas and derivations from any mobile device or PC.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {isAuthenticated ? (
            <button
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold transition-all shadow-sm hover:opacity-90 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In / Sign Up</span>
            </button>
          )}

          <button
            onClick={() => setIsScholarCardOpen(true)}
            title="Export or share your verified student report card"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
            <span>Scholar Card</span>
          </button>

          <Link
            to="/rankings"
            title="View Global Scholar Rankings & Academic Honor Roll"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
            <span>Global Rankings</span>
          </Link>

          <button
            onClick={handlePrintTranscript}
            title="Print or export official BehindTheMath academic transcript PDF"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold transition-all hover:opacity-90 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Transcript / PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Scholar Banner & Countdown Hub */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-8 shadow-xs">
        {/* Subtle Ambient Mathematical Coordinate Gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-zinc-500/10 via-zinc-400/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Identity Column: Balanced center on mobile, left on desktop */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
            {/* Interactive Student Avatar with Camera Badge */}
            <div className="relative group shrink-0">
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                title="Click to customize your student avatar & photo (< 500 KB)"
                className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-3xl sm:text-4xl shadow-md transition-transform group-hover:scale-105 cursor-pointer overflow-hidden ring-2 ring-black/5 dark:ring-white/10"
              >
                <StudentAvatar avatar={profile.avatar} name={profile.display_name} />
              </button>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                title="Change Photo (< 500 KB)"
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 shadow-md hover:scale-110 hover:text-black dark:hover:text-white transition-all cursor-pointer z-10"
                aria-label="Upload photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scholar Metadata */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-black dark:text-white tracking-tight">
                  {profile.display_name || 'Math Scholar'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700">
                  {profile.target_exam || 'HSC Higher Math'}
                </span>
                {isAuthenticated && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Verified
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                {profile.institution || 'Science & Engineering Learner'}
              </p>

              {profile.bio && (
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed pt-0.5">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Quick Action Dock: Full width on mobile, auto on desktop */}
          <div className="flex items-center justify-center sm:justify-start gap-2.5 w-full sm:w-auto pt-1 sm:pt-0 flex-wrap">
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="flex-1 sm:flex-initial justify-center min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>Change Photo</span>
            </button>

            <button
              onClick={() => setIsSetupOpen(true)}
              className="flex-1 sm:flex-initial justify-center min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Start Focus Mode</span>
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 sm:flex-initial justify-center min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Level Progression & Widgets Strip: Responsive grid on mobile & desktop */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-center">
          
          {/* Level Progress */}
          <div className="space-y-2 p-3 sm:p-0 rounded-2xl bg-slate-50/60 dark:bg-slate-900/30 sm:bg-transparent sm:dark:bg-transparent border border-slate-200/50 dark:border-slate-800/50 sm:border-0">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md font-extrabold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px]">
                  Level {profile.level}
                </span>
                <span className="font-bold text-slate-900 dark:text-white max-w-[190px] sm:max-w-none truncate leading-tight">
                  {profile.level_title}
                </span>
              </div>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] shrink-0">
                {profile.xp_points} / {profile.next_level_xp} XP
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500"
                style={{ width: `${Math.max(5, profile.level_progress_pct)}%` }}
              />
            </div>
          </div>

          {/* Exam Target Countdown Widget */}
          <div className="p-3.5 rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-base shrink-0">
                ⏳
              </div>
              <div className="min-w-0">
                <div className="font-heading font-extrabold text-base text-slate-900 dark:text-white leading-tight truncate">
                  {daysUntilExam !== null ? `${daysUntilExam} Days Left` : 'Exam Set'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {profile.target_exam}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shrink-0"
            >
              Set Date
            </button>
          </div>

          {/* 7-Day Flame Streak */}
          <div className="bg-slate-50 dark:bg-[#10192e] p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-lg">
                🔥
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-white leading-none">
                  {profile.study_streak_days}d Streak
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Active Habit</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <div
                  key={idx}
                  className={`w-5.5 h-6.5 sm:w-5 sm:h-6 rounded flex items-center justify-center text-[9px] font-bold ${
                    idx < Math.min(7, profile.study_streak_days)
                      ? 'bg-rose-500 text-white'
                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 3. Performance Metrics Grid (5 Key Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total XP */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1424] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Scholar XP</span>
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            {profile.xp_points}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Active learning power</span>
          </div>
        </div>

        {/* Deep Focus */}
        <div className="p-4 rounded-2xl border border-indigo-200/70 dark:border-indigo-900/40 bg-indigo-50/25 dark:bg-indigo-950/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">Deep Focus</span>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            {profile.total_focus_minutes || 0}m
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center justify-between">
            <span>{profile.completed_focus_sessions || 0} sessions</span>
            <button
              onClick={() => setIsSetupOpen(true)}
              className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Start →
            </button>
          </div>
        </div>

        {/* Quiz Accuracy */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1424] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Quiz Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            {accuracyPct}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {practiceScore.correct} of {practiceScore.attempted} solved
          </div>
        </div>

        {/* Visual Labs Explored */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1424] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Visual Labs</span>
            <Sparkles className="w-4 h-4 text-[#457B9D] dark:text-[#A8DADC]" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            {profile.completed_labs?.length || 0} / {ALL_VISUAL_LABS.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Canvas simulations run
          </div>
        </div>

        {/* Saved Desk Formulas */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1424] shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Desk Bookmarks</span>
            <Bookmark className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            {bookmarks.size}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Formulas & {Object.keys(notes).length} notes
          </div>
        </div>
      </div>

      {/* 4. 12-Week Interactive Study Activity Heatmap */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1424] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              Mathematical Consistency Heatmap
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span><strong>{activeDaysCount}</strong> Active Study Days</span>
            <span>•</span>
            <span>Today: <strong>{todayActivityCount}</strong> Activities</span>
            <button
              onClick={handleIncrementDailyGoal}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
            >
              +1 Log Activity
            </button>
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="sm:hidden flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
          <span className="flex items-center gap-1.5 font-medium">
            <span>←</span>
            <span>Swipe to view 12-week study streak</span>
            <span>→</span>
          </span>
          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">84 Days</span>
        </div>

        {/* Grid Heatmap with Day Labels */}
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="min-w-[650px] space-y-2">
            <div className="flex items-start gap-2">
              {/* Day Labels on Left */}
              <div className="grid grid-rows-7 gap-1.5 text-[9px] font-mono text-slate-400 pr-1 select-none pt-0.5 shrink-0">
                <span className="h-3.5 leading-3.5">Mon</span>
                <span className="h-3.5 leading-3.5 opacity-0">Tue</span>
                <span className="h-3.5 leading-3.5">Wed</span>
                <span className="h-3.5 leading-3.5 opacity-0">Thu</span>
                <span className="h-3.5 leading-3.5">Fri</span>
                <span className="h-3.5 leading-3.5 opacity-0">Sat</span>
                <span className="h-3.5 leading-3.5">Sun</span>
              </div>

              {/* 12-Week Grid */}
              <div className="grid grid-flow-col grid-rows-7 gap-1.5 flex-1">
                {heatmapData.map((d) => {
                  let cellClass = 'bg-slate-100 dark:bg-slate-800/80';
                  if (d.count >= 6) cellClass = 'bg-emerald-500 shadow-xs shadow-emerald-500/40 text-white';
                  else if (d.count >= 4) cellClass = 'bg-emerald-400 dark:bg-emerald-500/90';
                  else if (d.count >= 2) cellClass = 'bg-emerald-300 dark:bg-emerald-700';
                  else if (d.count === 1) cellClass = 'bg-emerald-200 dark:bg-emerald-900/60';

                  return (
                    <div
                      key={d.date}
                      title={`${d.date} (${d.dayName}): ${d.count} mathematical study activities`}
                      className={`w-3.5 h-3.5 rounded-sm transition-all hover:scale-125 cursor-pointer ${cellClass}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 pl-8">
              <span>84 Days Recorded (Past 12 Weeks)</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 dark:bg-slate-800" />
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-200 dark:bg-emerald-900/60" />
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-300 dark:bg-emerald-700" />
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-500" />
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Unlockable Achievement Badges */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1424] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              Mathematical Milestones & Badges
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400">
              {profile.unlocked_badges?.length || 0} / {BADGES.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setBadgeFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                badgeFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All ({BADGES.length})
            </button>
            <button
              onClick={() => setBadgeFilter('unlocked')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                badgeFilter === 'unlocked'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Unlocked ({profile.unlocked_badges?.length || 0})
            </button>
            <button
              onClick={() => setBadgeFilter('locked')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                badgeFilter === 'locked'
                  ? 'bg-slate-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Locked ({BADGES.length - (profile.unlocked_badges?.length || 0)})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredBadges.map((badge) => {
            const isUnlocked = profile.unlocked_badges?.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  isUnlocked
                    ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#10192e]/40 opacity-60'
                }`}
              >
                <div className="text-2xl shrink-0 p-1.5 rounded-xl bg-white dark:bg-[#121D33] shadow-2xs">
                  {badge.icon}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {badge.title}
                    </span>
                    {isUnlocked && (
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {badge.description}
                  </p>
                  <div className="text-[10px] font-mono font-medium text-slate-400 pt-1">
                    {badge.criteria}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Comprehensive Multi-Tab Study Desk */}
      <div className="space-y-4">
        
        {/* Desk Tabs Navigation */}
        <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto scrollbar-none text-xs -mx-4 px-4 sm:mx-0 sm:px-0">
          
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'bookmarks'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Desk ({bookmarks.size})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'notes'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Formula Notes ({Object.keys(notes).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('labs')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'labs'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Completed Labs ({profile.completed_labs?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('mastery')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'mastery'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Knowledge Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'settings'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Settings & Security</span>
          </button>

          <Link
            to="/flashcards"
            className="px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 ml-auto whitespace-nowrap shrink-0"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>SRS Flashcards →</span>
          </Link>
        </div>

        {/* Tab 1: Saved Formulas */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            
            {/* Search & Subject Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter saved formulas..."
                  value={bookmarkSearch}
                  onChange={(e) => setBookmarkSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c1424] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                />
              </div>

              {bookmarkSubjects.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                  <button
                    onClick={() => setSelectedSubjectFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      selectedSubjectFilter === 'all'
                        ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    All
                  </button>
                  {bookmarkSubjects.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubjectFilter(sub)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        selectedSubjectFilter === sub
                          ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filteredBookmarks.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white dark:bg-[#0c1424] rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
                <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="font-heading font-bold text-base text-slate-800 dark:text-slate-200">
                  {bookmarks.size === 0 ? 'No Saved Formulas Yet' : 'No Formulas Match Your Filter'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the bookmark icon on any formula card in the library to pin formulas to your personal study desk.
                </p>
                <Link
                  to="/library"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs shadow-xs"
                >
                  <span>Browse 169 Formulas</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookmarks.map((f) => (
                  <div
                    key={f.id}
                    className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1424] shadow-xs flex flex-col justify-between space-y-3 group hover:border-[#457B9D]/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {f.subject_name || 'Mathematics'}
                        </span>
                        <button
                          onClick={() => toggleBookmark(f.id)}
                          title="Remove from saved desk"
                          className="text-rose-500 hover:text-rose-700 cursor-pointer text-xs"
                        >
                          Remove
                        </button>
                      </div>

                      <Link
                        to={`/lesson/${f.slug}`}
                        className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-[#457B9D] dark:group-hover:text-[#A8DADC] transition-colors mt-2 block"
                      >
                        {f.title}
                      </Link>

                      {f.latex_formula && (
                        <div className="my-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#10192e] border border-slate-100 dark:border-slate-800/80 font-mono text-xs text-indigo-700 dark:text-sky-300 overflow-x-auto scrollbar-none flex items-center justify-between gap-2">
                          <code className="truncate">{f.latex_formula}</code>
                          <button
                            type="button"
                            onClick={() => handleCopyLatex(f)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 cursor-pointer"
                            title="Copy LaTeX"
                          >
                            {copiedFormulaId === f.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {f.summary}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        {f.level}
                      </span>
                      <Link
                        to={`/lesson/${f.slug}`}
                        className="inline-flex items-center gap-1 font-bold text-black dark:text-white hover:underline"
                      >
                        <span>Interactive Lesson</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Formula Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search your notes..."
                  value={notesSearch}
                  onChange={(e) => setNotesSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0c1424] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                />
              </div>
            </div>

            {filteredNotes.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white dark:bg-[#0c1424] rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="font-heading font-bold text-base text-slate-800 dark:text-slate-200">
                  No Notes Written
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Open any formula lesson detail page to write personal memory tricks, derivation notes, or exam warnings.
                </p>
                <Link
                  to="/library"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs shadow-xs"
                >
                  <span>Explore Formulas</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNotes.map(([formulaId, noteText]) => (
                  <div
                    key={formulaId}
                    className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1424] shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wide">
                        Formula Note: {formulaId}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingNoteId(formulaId);
                            setNoteEditContent(noteText);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          title="Edit note"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => saveNote(formulaId, '')}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {editingNoteId === formulaId ? (
                      <div className="space-y-2">
                        <textarea
                          value={noteEditContent}
                          onChange={(e) => setNoteEditContent(e.target.value)}
                          rows={3}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#121D33] text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#457B9D]"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              saveNote(formulaId, noteEditContent);
                              setEditingNoteId(null);
                            }}
                            className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-[#10192e] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        {noteText}
                      </p>
                    )}

                    <div className="pt-1">
                      <Link
                        to={`/lesson/${formulaId}`}
                        className="text-xs font-semibold text-[#457B9D] dark:text-[#A8DADC] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Open Lesson Page</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Completed Visual Labs */}
        {activeTab === 'labs' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  60 FPS Visual Canvas Simulations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Each visual lab grants +50 XP and unlocks intuitive physical derivations.
                </p>
              </div>
              <Link
                to="/lab"
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Open Visual Lab</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {ALL_VISUAL_LABS.map((lab) => {
                const isCompleted = profile.completed_labs?.includes(lab.slug);
                return (
                  <div
                    key={lab.slug}
                    className={`p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                      isCompleted
                        ? 'border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-[#0c1424]'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1424] opacity-80'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-2xl">{lab.icon}</span>
                        {isCompleted ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Completed ✓
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Available
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          {lab.subject}
                        </div>
                        <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                          {lab.title}
                        </h4>
                      </div>
                    </div>

                    <Link
                      to={`/lab?tab=${lab.slug}`}
                      className="inline-flex items-center justify-between w-full pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs font-bold text-black dark:text-white hover:underline"
                    >
                      <span>{isCompleted ? 'Rerun Simulation' : 'Launch Simulation'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Knowledge Radar */}
        {activeTab === 'mastery' && (
          <div className="p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1424] shadow-xs space-y-6">
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Curriculum Topic Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estimated intuition mastery based on visual labs explored and quiz questions solved.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { subject: 'Calculus & Derivatives', pct: 88, color: 'bg-emerald-500' },
                { subject: 'Geometry & Trigonometry', pct: 92, color: 'bg-blue-500' },
                { subject: 'Physics & Relativity', pct: 75, color: 'bg-purple-500' },
                { subject: 'Linear Algebra & ML', pct: 70, color: 'bg-amber-500' },
                { subject: 'Discrete Math & Graphs', pct: 65, color: 'bg-rose-500' },
                { subject: 'Statistics & Probability', pct: 80, color: 'bg-teal-500' },
              ].map((item) => (
                <div key={item.subject} className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10192e] border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{item.subject}</span>
                    <span className="text-slate-500 font-mono font-bold">{item.pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Settings & Security */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Profile Preferences */}
            <div className="p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1424] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                    Study Preferences
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs font-bold text-[#457B9D] dark:text-[#A8DADC] hover:underline cursor-pointer"
                >
                  Edit Profile
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#10192e] border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Target Academic Exam</span>
                  <span className="font-bold text-slate-900 dark:text-white">{profile.target_exam || 'Not Set'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#10192e] border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Target Exam Date</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{profile.target_exam_date || '2026-06-15'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#10192e] border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Daily Formula Goal</span>
                  <span className="font-bold text-slate-900 dark:text-white">{profile.daily_goal_formulas || 5} formulas / day</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#10192e] border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Institution</span>
                  <span className="font-bold text-slate-900 dark:text-white">{profile.institution || 'Dhaka College'}</span>
                </div>
              </div>

              {/* Data Export Button */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={handleExportData}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Scholar Data (JSON)</span>
                </button>

                <button
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                >
                  Reset Progress
                </button>
              </div>
            </div>

            {/* Account Security (Password change for logged in users, or login banner for guests) */}
            <div className="p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1424] shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Account Security
                </h3>
              </div>

              {isAuthenticated ? (
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Change password for account <strong>@{user?.username}</strong>
                  </p>

                  {passwordStatus.msg && (
                    <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      passwordStatus.isError
                        ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
                        : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
                    }`}>
                      <span>{passwordStatus.msg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#121D33] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#121D33] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Confirm New
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#121D33] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-500/20 space-y-3">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    Unlock Permanent Cloud Sync
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    You are studying in local guest mode. Create a free password-protected student account to backup your study desk and progress permanently.
                  </p>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="w-full py-2 px-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Create Free Student Account
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* 7. Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] p-5 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Edit Scholar Profile
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name / Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#121D33] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  School, College or University
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#121D33] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Exam
                  </label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#121D33] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                  >
                    {TARGET_EXAM_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Exam Date
                  </label>
                  <input
                    type="date"
                    value={targetExamDate}
                    onChange={(e) => setTargetExamDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#121D33] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Daily Formula Study Goal
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#121D33] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Short Bio / Academic Ambition
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#121D33] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Avatar Customizer Modal (Handles Photo Upload & Compression < 500 KB + Math Emblems) */}
      <AvatarCustomizerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={profile.avatar}
        displayName={profile.display_name}
        onAvatarUpdated={(newAvatar) => updateProfile({ avatar: newAvatar })}
      />

      {/* 9. Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto text-xl">
              <LogOut className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Confirm Log Out
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to log out from <strong>@{user?.username}</strong>? You will switch back to local guest mode.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutConfirmOpen(false);
                  logout();
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto text-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Reset Local Progress?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This will reset your local bookmarks, notes, and activity cache on this device.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* ============================================================ */}
      {/* OFFICIAL PRINTABLE ACADEMIC TRANSCRIPT (Print-Only Document) */}
      {/* ============================================================ */}
      <div id="printable-academic-transcript" className="hidden print:block text-black bg-white space-y-6">
        
        {/* Institutional Header & Seal */}
        <div className="flex items-start justify-between border-b-2 border-black pb-4">
          <div className="space-y-1">
            <div className="text-xl font-black tracking-wider uppercase font-heading">
              BEHIND THE MATH ACADEMY
            </div>
            <div className="text-xs font-serif italic text-zinc-700">
              Understand the formula · Explore the relationship · See the math behind it
            </div>
            <div className="text-[10px] font-mono text-zinc-600">
              Verified Digital STEM Dossier & Interactive Learning Record
            </div>
          </div>
          <div className="text-right">
            <div className="border border-black px-3 py-1 font-mono font-bold text-xs uppercase inline-block">
              OFFICIAL TRANSCRIPT
            </div>
            <div className="text-[9px] font-mono text-zinc-600 mt-1">
              Ref: TR-2026-{scholarId}
            </div>
            <div className="text-[9px] font-mono text-zinc-600">
              Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Student Profile Identity Grid */}
        <div className="grid grid-cols-2 gap-4 border border-black p-4 text-xs">
          <div className="space-y-1">
            <div><strong>Student Name:</strong> {profile.display_name || 'Math Scholar'}</div>
            <div><strong>Institution:</strong> {profile.institution || 'Science & Engineering'}</div>
            <div><strong>Scholar ID:</strong> <span className="font-mono font-bold">{scholarId}</span></div>
            <div><strong>Target Examination:</strong> {profile.target_exam || 'Higher Mathematics'}</div>
          </div>
          <div className="space-y-1 text-right">
            <div><strong>Academic Level:</strong> Level {profile.level} ({profile.level_title})</div>
            <div><strong>Academic Standing:</strong> {profile.xp_points} Scholar XP</div>
            <div><strong>Study Consistency:</strong> {profile.study_streak_days}-Day Unbroken Streak</div>
            <div><strong>Target Date:</strong> {profile.target_exam_date || '2026-06-15'} {daysUntilExam !== null ? `(${daysUntilExam} Days Left)` : ''}</div>
          </div>
        </div>

        {/* 1. Quantitative Performance Analytics Table */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider font-mono">
            1. Quantitative Academic Milestones & Mastery Metrics
          </div>
          <table className="print-table text-xs">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Metric Assessment</th>
                <th style={{ width: '25%' }}>Accumulated Value</th>
                <th style={{ width: '20%' }}>Standard Benchmark</th>
                <th style={{ width: '20%' }}>Evaluation Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Scholar XP Earned</td>
                <td className="font-mono font-bold">{profile.xp_points} XP</td>
                <td>Continuous</td>
                <td>Active Scholar</td>
              </tr>
              <tr>
                <td>Uninterrupted Study Streak</td>
                <td className="font-mono font-bold">{profile.study_streak_days} Consecutive Days</td>
                <td>&ge; 7 Days Target</td>
                <td>{profile.study_streak_days >= 7 ? 'Mastery Level' : 'In Progress'}</td>
              </tr>
              <tr>
                <td>Deep Focus Sessions Logged</td>
                <td className="font-mono font-bold">{profile.total_focus_minutes || 0} Minutes ({profile.completed_focus_sessions || 0} Blocks)</td>
                <td>Distraction-Free Flow</td>
                <td>Certified</td>
              </tr>
              <tr>
                <td>Practice Quiz Solving Accuracy</td>
                <td className="font-mono font-bold">{accuracyPct}% ({practiceScore.correct}/{practiceScore.attempted} Solved)</td>
                <td>&ge; 80% Proficiency</td>
                <td>{accuracyPct >= 80 ? 'Distinction' : 'Proficient'}</td>
              </tr>
              <tr>
                <td>Interactive 60 FPS Visual Labs Explored</td>
                <td className="font-mono font-bold">{profile.completed_labs?.length || 0} Simulations Run</td>
                <td>STEM Laboratory</td>
                <td>{profile.completed_labs?.length >= 5 ? 'Advanced Laboratory' : 'Competent'}</td>
              </tr>
              <tr>
                <td>Curated Formula Desk Bookmarks</td>
                <td className="font-mono font-bold">{bookmarks.size} Active Bookmarks</td>
                <td>Core Curriculum</td>
                <td>Curated</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Curated Mathematical Formula Desk Portfolio */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider font-mono">
            2. Verified Mathematical Formula Desk Portfolio
          </div>
          {bookmarkedFormulas.length === 0 ? (
            <div className="text-xs italic text-zinc-500 border border-black p-3">
              No specific formulas bookmarked on desk at time of transcript generation.
            </div>
          ) : (
            <table className="print-table text-xs">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Subject Domain</th>
                  <th style={{ width: '38%' }}>Formula Title & Concept</th>
                  <th style={{ width: '40%' }}>Mathematical Theorem (KaTeX)</th>
                </tr>
              </thead>
              <tbody>
                {bookmarkedFormulas.slice(0, 12).map((f) => (
                  <tr key={f.id} className="print-break-inside-avoid">
                    <td className="font-medium">{f.subject_name || 'Mathematics'}</td>
                    <td className="font-bold">{f.title}</td>
                    <td className="font-mono text-[11px]">
                      {f.latex_formula ? (
                        <MathView math={f.latex_formula} display={false} />
                      ) : (
                        f.title
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 3. Scholar Mathematical Field Notes (if any) */}
        {Object.keys(notes).length > 0 && (
          <div className="space-y-2 print-break-inside-avoid">
            <div className="text-xs font-bold uppercase tracking-wider font-mono">
              3. Scholar Mathematical Field Notes & Derivation Insights
            </div>
            <table className="print-table text-xs">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Formula Reference</th>
                  <th style={{ width: '70%' }}>Student Insight / Annotation</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(notes).slice(0, 6).map(([formulaId, text]) => (
                  <tr key={formulaId}>
                    <td className="font-mono font-semibold">{formulaId}</td>
                    <td className="italic">{text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Institutional Verification, Sign-off & Barcode */}
        <div className="pt-6 border-t-2 border-black space-y-4 print-break-inside-avoid">
          <div className="grid grid-cols-3 gap-6 text-xs">
            <div className="flex items-start gap-2">
              <QRCodeView
                value={`https://behindthemath.org/verify/${scholarId}`}
                size={54}
                includeLabel={true}
                label="Verify"
              />
              <div>
                <div className="font-bold uppercase tracking-wider text-[9px] text-zinc-600">Verification Seal</div>
                <div className="mt-1 border border-black p-1.5 font-mono text-[8px] leading-tight">
                  DIGITALLY SIGNED<br />
                  SHA256: BTM-{scholarId}<br />
                  BEHINDTHEMATH.ORG
                </div>
              </div>
            </div>
            <div>
              <div className="font-bold uppercase tracking-wider text-[10px] text-zinc-600">Official Certification</div>
              <p className="text-[10px] text-zinc-700 mt-2 leading-relaxed">
                This transcript certifies self-directed learning, mathematical derivation analysis, and focus discipline undertaken on BehindTheMath.
              </p>
            </div>
            <div className="text-right">
              <div className="font-bold uppercase tracking-wider text-[10px] text-zinc-600">Registrar Sign-off</div>
              <div className="mt-4 border-b border-black w-36 ml-auto" />
              <div className="text-[9px] font-mono mt-1 text-zinc-600">
                BehindTheMath Academic Committee
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 pt-2 border-t border-zinc-300">
            <span>BehindTheMath Open-Source STEM Educational Platform</span>
            <span className="tracking-widest">||| |||| | ||||| || ||| |||| | ||</span>
            <span>Verify: https://behindthemath.org/verify/{scholarId}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
