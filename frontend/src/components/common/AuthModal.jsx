import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  Mail,
  School,
  Target,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';

const TARGET_EXAMS = [
  'HSC Higher Math 2026',
  'BUET & Engineering Admission',
  'University Engineering Math',
  'Physics & Quantum Mechanics',
  'Machine Learning & AI Mathematics',
  'Discrete Math & Olympiad',
];

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    profile,
    bookmarks
  } = useStudent();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [institution, setInstitution] = useState('');
  const [targetExam, setTargetExam] = useState('HSC Higher Math 2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [migrateProgress, setMigrateProgress] = useState(true);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isLogin) {
        if (!username.trim() || !password) {
          setErrorMsg('Please enter both username/email and password.');
          setIsLoading(false);
          return;
        }
        await login(username.trim(), password);
      } else {
        if (!username.trim()) {
          setErrorMsg('Username is required.');
          setIsLoading(false);
          return;
        }
        if (!password || password.length < 4) {
          setErrorMsg('Password must be at least 4 characters long.');
          setIsLoading(false);
          return;
        }
        await register({
          username: username.trim(),
          email: email.trim(),
          password,
          display_name: displayName.trim() || username.trim(),
          institution: institution.trim(),
          target_exam: targetExam,
        }, migrateProgress);
      }
    } catch (err) {
      console.error('Auth error:', err);
      const data = err.data || {};
      let msg = err.message || 'Authentication failed. Please check your credentials.';
      if (data.username) {
        msg = Array.isArray(data.username) ? data.username[0] : data.username;
      } else if (data.error) {
        msg = data.error;
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setUsername('santunukaysar');
    setPassword('mathscholar2026');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto scrollbar-thin rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl p-5 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-zinc-500/10 via-zinc-400/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-lg shadow-sm">
              ∑
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-black dark:text-white tracking-tight">
                {isLogin ? 'Student Login' : 'Create Free Account'}
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                BehindTheMath Scholar Command Center
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Toggle Pills */}
        <div className="relative z-10 grid grid-cols-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setErrorMsg('');
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              isLogin
                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs font-extrabold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('register');
              setErrorMsg('');
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              !isLogin
                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs font-extrabold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Guest Progress Sync Badge */}
        {!isLogin && (profile.xp_points > 100 || bookmarks.size > 0) && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border border-amber-500/25 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Sync Your Progress</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-mono">
                  {profile.xp_points} XP
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                Your bookmarks ({bookmarks.size}), visual labs ({profile.completed_labs?.length || 0}), and notes will be transferred to your permanent cloud account.
              </p>
              <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={migrateProgress}
                  onChange={(e) => setMigrateProgress(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Include my current guest progress</span>
              </label>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Username {isLogin ? 'or Email' : ''}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isLogin ? 'student or user@school.edu' : 'e.g. math_scholar'}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Display Name (Optional)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Santunu Kaysar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scholar@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Target Exam
                </label>
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white cursor-pointer"
                >
                  {TARGET_EXAMS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Dhaka College"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-black text-white dark:bg-white dark:text-black font-heading font-extrabold text-xs transition-all shadow-md hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In to Scholar Desk' : 'Create Account & Sync Progress'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Fill helper (visible on login tab) */}
        {isLogin && (
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Need a test account?</span>
            <button
              type="button"
              onClick={fillDemoAccount}
              className="text-black dark:text-white font-semibold hover:underline cursor-pointer"
            >
              Fill Demo Scholar
            </button>
          </div>
        )}

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted token sessions · BehindTheMath Cloud</span>
        </div>
      </div>
    </div>
  );
}
