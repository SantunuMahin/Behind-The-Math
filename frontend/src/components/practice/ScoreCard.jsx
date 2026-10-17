import React, { useState } from 'react';
import {
  RotateCcw,
  Trophy,
  CheckCircle2,
  Target,
  Flame,
  Zap,
  Sparkles,
  Award,
  TrendingUp,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';

export default function ScoreCard({ totalQuestions = 0, currentTopic = 'All Topics' }) {
  const { practiceScore, resetScore } = useStudent();
  const { correct = 0, attempted = 0, streak = 0, bestStreak = 0 } = practiceScore || {};

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const sessionXp = correct * 20 + (bestStreak >= 3 ? 50 : 0);
  const progressPct = totalQuestions > 0 ? Math.min(100, Math.round((attempted / totalQuestions) * 100)) : 0;

  // Active combo multiplier based on streak
  const comboMultiplier = streak >= 5 ? 2.0 : streak >= 3 ? 1.5 : streak >= 2 ? 1.25 : 1.0;

  // Academic standing tier based on BOTH volume and accuracy
  const getBadgeTier = () => {
    if (attempted === 0) {
      return {
        label: 'Unrated · Ready',
        subtitle: 'Solve 3 questions to unlock standing',
        color: 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800',
        dotColor: 'bg-zinc-400 dark:bg-zinc-600',
        icon: Target,
      };
    }
    if (attempted < 3) {
      const remaining = 3 - attempted;
      return {
        label: `Calibrating (${attempted}/3)`,
        subtitle: `${remaining} more question${remaining > 1 ? 's' : ''} to establish tier`,
        color: 'text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-850 border-zinc-300 dark:border-zinc-700',
        dotColor: 'bg-amber-400 animate-pulse',
        icon: Sparkles,
      };
    }
    if (accuracy < 60) {
      return {
        label: 'Axiom Apprentice',
        subtitle: 'Foundations stage · Review derivations & retry',
        color: 'text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700',
        dotColor: 'bg-zinc-500',
        icon: Target,
      };
    }
    if (accuracy < 80 || attempted < 8) {
      return {
        label: 'Gauss Scholar',
        subtitle: attempted < 8 ? `Reach 8 solved for Euler Tier (${attempted}/8)` : 'Solid mathematical rigor (≥60%)',
        color: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60',
        dotColor: 'bg-sky-500',
        icon: Award,
      };
    }
    if (accuracy < 90 || attempted < 15) {
      return {
        label: 'Euler Master',
        subtitle: attempted < 15 ? `Reach 15 solved for Fields Tier (${attempted}/15)` : 'High-level derivation mastery (≥80%)',
        color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
        dotColor: 'bg-emerald-500',
        icon: Trophy,
      };
    }
    return {
      label: 'Fields Medalist Tier',
      subtitle: 'Elite tier unlocked (≥90% precision over 15+ problems)',
      color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/70 shadow-xs',
      dotColor: 'bg-amber-500 animate-pulse',
      icon: Trophy,
    };
  };

  const badge = getBadgeTier();
  const BadgeIcon = badge.icon;

  // Next milestone calculation
  const getNextMilestone = () => {
    if (totalQuestions === 0) return null;
    const m25 = Math.ceil(totalQuestions * 0.25);
    const m50 = Math.ceil(totalQuestions * 0.5);
    const m75 = Math.ceil(totalQuestions * 0.75);
    const m100 = totalQuestions;

    if (attempted < m25) return { target: m25, name: 'Bronze Milestone (25%)', xp: 30 };
    if (attempted < m50) return { target: m50, name: 'Silver Milestone (50%)', xp: 60 };
    if (attempted < m75) return { target: m75, name: 'Gold Milestone (75%)', xp: 100 };
    if (attempted < m100) return { target: m100, name: 'Grand Mastery (100%)', xp: 200 };
    return { target: m100, name: 'All Problems Conquered! 🎉', xp: 0 };
  };

  const nextMilestone = getNextMilestone();

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md p-5 sm:p-7 shadow-xs relative overflow-hidden space-y-6">
      {/* Background mathematical coordinate grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.045] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* 1. Header Bar: Academic Tier Badge, Session XP & Quick Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 border-b border-zinc-100 dark:border-zinc-900 pb-5">
        
        {/* Tier & Qualification Subtitle */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`p-2.5 rounded-2xl border ${badge.color} flex items-center justify-center shadow-xs`}>
              <BadgeIcon className="w-5 h-5" />
            </div>
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-zinc-950 ${badge.dotColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-sm sm:text-base text-zinc-950 dark:text-white tracking-tight">
                {badge.label}
              </span>
              {attempted >= 15 && accuracy >= 90 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black">
                  Top 1%
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {badge.subtitle}
            </p>
          </div>
        </div>

        {/* Right Action Cluster: Session XP ticker + Reset button */}
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          
          {/* XP pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs shadow-xs">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>+{sessionXp} XP</span>
          </div>

          {/* Reset Session Control */}
          {showResetConfirm ? (
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-2xl">
              <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 px-2">
                Reset score?
              </span>
              <button
                onClick={() => {
                  resetScore();
                  setShowResetConfirm(false);
                }}
                className="px-2.5 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-2.5 py-1 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Reset practice session metrics"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

        </div>

      </div>

      {/* 2. Four Balanced Luxury Stat Capsules */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10">
        
        {/* Capsule 1: Correct Solved */}
        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-850 bg-zinc-50/60 dark:bg-zinc-900/40 hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Solved
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-black font-mono text-2xl sm:text-3xl text-zinc-950 dark:text-white leading-none">
            {correct}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 font-medium flex items-center gap-1">
            <span>{attempted > 0 ? `${((correct / attempted) * 100).toFixed(0)}% success` : 'No solves yet'}</span>
          </div>
        </div>

        {/* Capsule 2: Attempted Questions */}
        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-850 bg-zinc-50/60 dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Attempted
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:scale-110 transition-transform">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-black font-mono text-2xl sm:text-3xl text-zinc-950 dark:text-white leading-none flex items-baseline gap-1">
            <span>{attempted}</span>
            {totalQuestions > 0 && (
              <span className="text-xs font-normal text-zinc-400">/ {totalQuestions}</span>
            )}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
            {totalQuestions > 0 ? `${progressPct}% of library explored` : 'Self-paced session'}
          </div>
        </div>

        {/* Capsule 3: Accuracy Precision */}
        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-850 bg-zinc-50/60 dark:bg-zinc-900/40 hover:border-amber-500/30 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Accuracy
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-black font-mono text-2xl sm:text-3xl text-zinc-950 dark:text-white leading-none">
            {attempted > 0 ? `${accuracy}%` : '—'}
          </div>
          <div className="text-[11px] mt-2 font-medium">
            {attempted === 0 ? (
              <span className="text-zinc-400">Needs 1st answer</span>
            ) : accuracy >= 90 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">✨ Flawless</span>
            ) : accuracy >= 75 ? (
              <span className="text-sky-600 dark:text-sky-400 font-bold">🎯 High Precision</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">📈 Developing</span>
            )}
          </div>
        </div>

        {/* Capsule 4: Active Streak & Combo Multiplier */}
        <div className={`p-4 rounded-2xl border transition-all group ${
          streak >= 3
            ? 'border-orange-500/40 dark:border-orange-500/30 bg-orange-50/40 dark:bg-orange-950/20'
            : 'border-zinc-200/80 dark:border-zinc-850 bg-zinc-50/60 dark:bg-zinc-900/40 hover:border-orange-500/25'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Streak
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
              streak >= 3
                ? 'bg-orange-500 text-white shadow-xs animate-pulse'
                : 'bg-orange-500/10 border border-orange-500/20 text-orange-500'
            }`}>
              <Flame className={`w-4 h-4 ${streak > 0 ? 'fill-current' : ''}`} />
            </div>
          </div>
          <div className="font-heading font-black font-mono text-2xl sm:text-3xl text-zinc-950 dark:text-white leading-none flex items-baseline gap-2">
            <span>{streak}</span>
            {comboMultiplier > 1 && (
              <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white leading-none">
                {comboMultiplier}× XP
              </span>
            )}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 font-medium flex items-center justify-between">
            <span>Best: {bestStreak || streak} in-a-row</span>
            {streak >= 3 && <span className="text-orange-500 font-bold">ON FIRE 🔥</span>}
          </div>
        </div>

      </div>

      {/* 3. Milestone Progress Bar */}
      {totalQuestions > 0 && (
        <div className="pt-2 relative z-10 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span>Progress:</span>
              <strong className="text-zinc-950 dark:text-white font-mono font-bold">
                {attempted} of {totalQuestions}
              </strong>
              <span className="text-zinc-400 font-normal">answered</span>
            </span>

            <span className="font-mono font-bold text-zinc-950 dark:text-white">
              {progressPct}%
            </span>
          </div>

          {/* Progress track with milestone markers */}
          <div className="relative pt-1 pb-1">
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-200/60 dark:border-zinc-800/80">
              <div
                className="h-full bg-gradient-to-r from-zinc-800 to-black dark:from-zinc-200 dark:to-white rounded-full transition-all duration-500 ease-out shadow-xs"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Milestone node pips (25%, 50%, 75%) */}
            <div className="absolute top-1/2 -translate-y-1/2 left-[25%] -translate-x-1/2 pointer-events-none">
              <div className={`w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-950 transition-colors ${
                progressPct >= 25 ? 'bg-black dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'
              }`} />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 left-[50%] -translate-x-1/2 pointer-events-none">
              <div className={`w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-950 transition-colors ${
                progressPct >= 50 ? 'bg-black dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'
              }`} />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 left-[75%] -translate-x-1/2 pointer-events-none">
              <div className={`w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-950 transition-colors ${
                progressPct >= 75 ? 'bg-black dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'
              }`} />
            </div>
          </div>

          {/* Milestone target footnote */}
          {nextMilestone && nextMilestone.xp > 0 && (
            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Next Milestone:</span>
                <strong className="text-zinc-900 dark:text-zinc-200">{nextMilestone.name}</strong>
                <span className="text-zinc-400">({nextMilestone.target - attempted} questions to go)</span>
              </div>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                +{nextMilestone.xp} Bonus XP
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
