import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Zap,
  CheckCircle2,
  ArrowRight,
  Coffee,
  Sparkles,
  X,
  RotateCcw,
  Printer,
  ShieldCheck,
  Target,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFocus } from '../../context/FocusContext';
import { useStudent } from '../../context/StudentContext';
import QRCodeView from '../common/QRCodeView';
import StudentAvatar from '../common/StudentAvatar';

export default function FocusCompleteModal() {
  const {
    isCompleteOpen,
    setIsCompleteOpen,
    setIsSetupOpen,
    completedSessionData,
    openBreakStudio
  } = useFocus();

  const { profile } = useStudent();

  useEffect(() => {
    if (isCompleteOpen) {
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899']
      });
    }
  }, [isCompleteOpen]);

  useEffect(() => {
    if (isCompleteOpen) {
      document.body.classList.add('printing-modal');
      return () => {
        document.body.classList.remove('printing-modal');
      };
    }
  }, [isCompleteOpen]);

  // Memoize certificate ID so it remains stable during session
  const certificateId = useMemo(() => {
    if (!completedSessionData) return '';
    const year = new Date().getFullYear();
    const mins = String(completedSessionData.minutes || 25).padStart(3, '0');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BTM-FOC-${year}-${mins}M-${randomHex}`;
  }, [completedSessionData]);

  if (!isCompleteOpen || !completedSessionData) return null;

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-3 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setIsCompleteOpen(false)}
    >
      <div
        className="w-full max-w-xl max-h-[98vh] overflow-y-auto scrollbar-thin rounded-3xl border border-amber-500/30 bg-white dark:bg-zinc-950 p-3 sm:p-3.5 shadow-2xl space-y-2 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 print:hidden" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16 print:hidden" />

        {/* Screen Celebratory Header */}
        <div className="flex items-center justify-between gap-3 relative z-10 print:hidden text-left">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">🏆</span>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h2 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                Focus Block Complete!
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                +{completedSessionData.xp} XP
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                · Session #{completedSessionData.totalSessions || 1}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCompleteOpen(false)}
            className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Official Printable Focus Certificate Section */}
        <div
          id="printable-focus-certificate"
          className="relative overflow-hidden rounded-2xl border-2 border-amber-500/40 dark:border-amber-400/30 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 dark:from-zinc-900/90 dark:via-zinc-950 dark:to-zinc-900/90 p-3.5 sm:p-4 text-left space-y-2 shadow-md print:border-2 print:border-black print:bg-white print:text-black print:rounded-2xl print:shadow-none print:p-8"
        >
          {/* Inner hairline frame for diploma prestige */}
          <div className="absolute inset-1.5 rounded-xl border border-amber-500/20 dark:border-amber-400/10 pointer-events-none print:border-black/20" />

          {/* Genuine mathematical notation watermark in background (Non-interfering) */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl font-serif italic text-amber-600/[0.06] dark:text-amber-400/[0.06] pointer-events-none select-none tracking-wider print:hidden">
            ∫₀^∞ e⁻ˣ² dx = √π / 2
          </div>

          {/* Certificate Header Row - Clean separation on desktop and mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1.5 border-b border-amber-500/20 dark:border-zinc-800/80 gap-1.5 relative z-10 print:border-black/30">
            <div className="flex items-center gap-2">
              <div className="w-5.5 h-5.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30 print:border-black print:text-black shrink-0">
                ∑
              </div>
              <div className="min-w-0">
                <span className="font-heading font-extrabold text-xs tracking-wider uppercase text-amber-900 dark:text-amber-300 print:text-black whitespace-nowrap">
                  BehindTheMath Academy
                </span>
                <div className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono -mt-0.5 print:text-zinc-600 whitespace-nowrap">
                  Official Academic Verification
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 print:border print:border-black print:bg-transparent print:text-black">
                FLOW STATE
              </span>
              <span className="text-[9.5px] font-mono font-bold text-zinc-600 dark:text-zinc-400 print:text-black tracking-tight">
                {certificateId}
              </span>
            </div>
          </div>

          {/* Certificate Title & Recipient */}
          <div className="space-y-1.5 relative z-10">
            <div className="space-y-0.5">
              <h3 className="font-heading font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white print:text-black leading-tight">
                Certificate of Mathematical Focus
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 print:text-zinc-700 leading-snug">
                Conferred for sustained concentration, cognitive flow, and mathematical intuition.
              </p>
            </div>

            {/* Student Avatar + Recipient Badge */}
            <div className="flex items-center justify-between gap-3 pt-0.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-lg border-2 border-amber-500/40 dark:border-amber-400/30 overflow-hidden shrink-0 shadow-2xs">
                  <StudentAvatar
                    avatar={profile.avatar}
                    name={profile.display_name}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 print:text-black truncate">
                    {profile.display_name || 'Math Scholar'}
                  </div>
                  <div className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate">
                    {profile.target_exam || 'Higher Mathematics'}
                  </div>
                </div>
              </div>

              {completedSessionData.isLaser && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold shrink-0">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>100% Laser Flow</span>
                </div>
              )}
            </div>
          </div>


          {/* Full Goal Mastered Showcase (Never truncated!) */}
          {completedSessionData.goal && (
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-400/5 border border-amber-500/20 dark:border-amber-400/15 flex items-start gap-2 relative z-10 text-left">
              <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Focus Domain / Goal Mastered
                </div>
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 break-words leading-tight">
                  {completedSessionData.goal}
                </div>
              </div>
            </div>
          )}

          {/* Certificate Metric Triplets */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono relative z-10">
            <div className="p-1.5 sm:p-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-2xs print:border-black/20 print:bg-zinc-50">
              <div className="text-[8px] sm:text-[9px] text-zinc-400 uppercase font-sans font-semibold">Focus Time</div>
              <div className="font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-white print:text-black mt-0.5">
                {completedSessionData.minutes} Min
              </div>
              <div className="text-[8px] text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
                Block #{completedSessionData.totalSessions || 1}
              </div>
            </div>

            <div className="p-1.5 sm:p-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-2xs print:border-black/20 print:bg-zinc-50">
              <div className="text-[8px] sm:text-[9px] text-zinc-400 uppercase font-sans font-semibold">Scholar XP</div>
              <div className="font-extrabold text-xs sm:text-sm text-amber-600 dark:text-amber-400 print:text-black mt-0.5">
                +{completedSessionData.xp} XP
              </div>
              <div className="text-[8px] text-emerald-600 dark:text-emerald-400 font-sans mt-0.5 flex items-center justify-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>Awarded</span>
              </div>
            </div>

            <div className="p-1.5 sm:p-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-2xs print:border-black/20 print:bg-zinc-50">
              <div className="text-[8px] sm:text-[9px] text-zinc-400 uppercase font-sans font-semibold">Quality</div>
              <div className="font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-white print:text-black mt-0.5 truncate">
                {completedSessionData.isLaser ? '⚡ Laser' : 'Deep Flow'}
              </div>
              <div className="text-[8px] text-zinc-500 dark:text-zinc-400 font-sans mt-0.5 truncate">
                {completedSessionData.isLaser ? '0 switches' : `${completedSessionData.tabSwitches || 0} switches`}
              </div>
            </div>
          </div>

          {/* Certificate Footer: Verification + Official QR */}
          <div className="flex items-center justify-between pt-2 border-t border-amber-500/20 dark:border-zinc-800/80 text-[10px] text-zinc-500 print:border-black/20 print:text-zinc-600 gap-3 relative z-10">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 font-sans text-emerald-600 dark:text-emerald-400 print:text-black font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Verified Study Milestone</span>
              </div>
              <div className="font-mono text-[8px] sm:text-[9px] text-zinc-500 dark:text-zinc-400">
                Issued {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · Cryptographically Certified
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <div className="text-[7px] font-mono text-zinc-400 uppercase tracking-wider">Scan to Verify</div>
                <div className="text-[8px] font-mono font-bold text-zinc-600 dark:text-zinc-300">Public Ledger</div>
              </div>
              <div className="p-1 rounded-lg bg-white border border-zinc-200 dark:border-zinc-700 shadow-2xs shrink-0">
                <QRCodeView
                  value={`https://behindthemath.org/verify/${certificateId}`}
                  size={38}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls (Screen-only) */}
        <div className="space-y-1.5 pt-0.5 relative z-10 text-xs font-bold print:hidden">
          {/* Print Certificate Button */}
          <button
            type="button"
            onClick={handlePrintCertificate}
            className="w-full py-2 px-4 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-400/10 dark:hover:bg-amber-400/20 text-amber-900 dark:text-amber-200 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Print Focus Certificate / Save PDF</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => openBreakStudio({ durationMinutes: 5 })}
              className="py-2 px-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 dark:hover:bg-emerald-900/50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Coffee className="w-3.5 h-3.5 text-emerald-500" />
              <span>5m Mindful Break</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsCompleteOpen(false);
                setIsSetupOpen(true);
              }}
              className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              <span>Next Block</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCompleteOpen(false)}
            className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Return to Formula Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}

