import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Share2,
  Printer,
  Copy,
  Check,
  Award,
  Zap,
  Flame,
  Target,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  BookOpen
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import QRCodeView from '../common/QRCodeView';
import StudentAvatar from '../common/StudentAvatar';

export default function ScholarCardModal() {
  const { isScholarCardOpen, setIsScholarCardOpen, profile, practiceScore } = useStudent();
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (isScholarCardOpen) {
      document.body.classList.add('printing-modal');
      return () => {
        document.body.classList.remove('printing-modal');
      };
    }
  }, [isScholarCardOpen]);

  if (!isScholarCardOpen) return null;

  const accuracyPct = practiceScore.attempted > 0
    ? Math.round((practiceScore.correct / practiceScore.attempted) * 100)
    : 100;

  const scholarId = `BTM-2026-${String(profile.xp_points || 425).padStart(4, '0')}-${(profile.display_name || 'SCHOLAR').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'STD'}`;

  const handleCopySummary = () => {
    const text = `🎓 BehindTheMath Verified Scholar Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Student: ${profile.display_name} (${profile.avatar || '∑'})
Scholar ID: ${scholarId}
Institution: ${profile.institution || 'Science & Engineering'}
Rank: Level ${profile.level} · ${profile.level_title}
Target Exam: ${profile.target_exam || 'Higher Mathematics'}
XP Earned: ${profile.xp_points} XP
Active Study Streak: ${profile.study_streak_days} Days 🔥
Deep Focus Log: ${profile.total_focus_minutes || 0} Minutes
Practice Accuracy: ${accuracyPct}% (${practiceScore.correct}/${practiceScore.attempted})
Visual Labs Explored: ${profile.completed_labs?.length || 0} Labs
Verification: https://behindthemath.org/verify/${scholarId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Explore interactive STEM mathematics: https://behindthemath.org`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setIsScholarCardOpen(false)}
    >
      <div
        className="relative w-full max-w-lg max-h-[94vh] overflow-y-auto scrollbar-thin rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-7 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header (Screen-only) */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-black dark:text-white leading-tight">
                Scholar Portfolio ID Badge
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Verifiable student credential and academic milestone passport
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsScholarCardOpen(false)}
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Print Cutout Mark Notice (Print-only) */}
        <div className="hidden print:block text-center text-[10px] text-zinc-600 font-mono tracking-wider uppercase mb-2 scholar-card-print-guide">
          ✂️ BEHINDTHEMATH OFFICIAL STEM SCHOLAR CREDENTIAL · CUT ALONG CARD BORDER
        </div>

        {/* Printable Card Area */}
        <div
          id="printable-scholar-card"
          ref={cardRef}
          className="relative overflow-hidden rounded-3xl border-2 border-zinc-800 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6 sm:p-7 shadow-2xl space-y-5 print:border-2 print:border-black print:bg-white print:text-black print:rounded-2xl print:shadow-none print:p-6"
        >
          {/* Subtle Mathematical Watermark & Shimmer Effect */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px] print:hidden" />
          <div className="absolute -top-16 -right-16 w-52 h-52 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl pointer-events-none print:hidden" />
          <div className="absolute top-2 right-4 text-[10px] font-mono text-zinc-600 dark:text-zinc-600/40 select-none pointer-events-none print:text-zinc-400">
            {"e^{i\\pi} + 1 = 0 · \\nabla \\times \\mathbf{B}"}
          </div>

          {/* Top Row: Brand & Scholar ID */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3 print:border-black/20">
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-sm tracking-wider uppercase text-white print:text-black">
                BehindTheMath
              </span>
              <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-white/10 text-zinc-300 print:bg-black/10 print:text-black">
                SCHOLAR
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-amber-400 print:text-black tracking-wider">
                {scholarId}
              </span>
            </div>
          </div>

          {/* Student Identity Row */}
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center font-bold text-3xl shadow-lg ring-2 ring-white/20 print:ring-1 print:ring-black print:border print:border-black overflow-hidden shrink-0">
                <StudentAvatar avatar={profile.avatar} name={profile.display_name} />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-heading font-extrabold text-xl text-white print:text-black tracking-tight">
                  {profile.display_name || 'Math Scholar'}
                </h4>
                <p className="text-xs text-zinc-300 print:text-zinc-700 font-medium">
                  {profile.institution || 'Science & Engineering Dept'}
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 print:border-black print:text-black print:bg-transparent font-mono">
                    LVL {profile.level}
                  </span>
                  <span className="text-[11px] font-bold text-zinc-300 print:text-black">
                    {profile.level_title}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Stamp / Seal & Live QR */}
            <div className="text-right shrink-0 flex items-center gap-2.5">
              <QRCodeView
                value={`https://behindthemath.org/verify/${scholarId}`}
                size={52}
                includeLabel={true}
                label="Verify"
              />
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 print:border-black/30 flex flex-col items-center justify-center p-1 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-black mb-0.5" />
                <span className="text-[7px] font-mono font-bold tracking-tight text-zinc-300 print:text-black uppercase">
                  VERIFIED
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics Dashboard */}
          <div className="relative z-10 grid grid-cols-4 gap-2 pt-1 border-t border-white/10 text-center print:border-black/20">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 print:border-black/20 print:bg-zinc-50">
              <div className="text-[9px] font-semibold text-zinc-400 print:text-zinc-600 uppercase">XP Points</div>
              <div className="font-mono font-extrabold text-sm sm:text-base text-amber-400 print:text-black">{profile.xp_points}</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 print:border-black/20 print:bg-zinc-50">
              <div className="text-[9px] font-semibold text-zinc-400 print:text-zinc-600 uppercase">Streak</div>
              <div className="font-mono font-extrabold text-sm sm:text-base text-rose-400 print:text-black">{profile.study_streak_days}d</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 print:border-black/20 print:bg-zinc-50">
              <div className="text-[9px] font-semibold text-zinc-400 print:text-zinc-600 uppercase">Focus</div>
              <div className="font-mono font-extrabold text-sm sm:text-base text-zinc-200 print:text-black">{profile.total_focus_minutes || 0}m</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 print:border-black/20 print:bg-zinc-50">
              <div className="text-[9px] font-semibold text-zinc-400 print:text-zinc-600 uppercase">Quiz Acc</div>
              <div className="font-mono font-extrabold text-sm sm:text-base text-emerald-400 print:text-black">{accuracyPct}%</div>
            </div>
          </div>

          {/* Target Exam & Security Watermark Footer */}
          <div className="relative z-10 flex items-center justify-between text-xs pt-2 border-t border-white/10 print:border-black/20">
            <div className="flex items-center gap-1.5 text-zinc-300 print:text-zinc-800">
              <Target className="w-3.5 h-3.5 text-white print:text-black" />
              <span>Target: <strong className="text-white print:text-black">{profile.target_exam || 'HSC Higher Math'}</strong></span>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 print:text-zinc-600">
              Issued {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          {/* Verification Barcode / Security Strip (Print-friendly) */}
          <div className="relative z-10 flex items-center justify-between pt-1 text-[9px] font-mono text-zinc-500 print:text-zinc-500">
            <span>OFFICIAL STEM SCHOLAR RECORD</span>
            <span className="tracking-widest">||| | |||| | | ||| |||| |</span>
            <span>VERIFIED DIGITAL PASSPORT</span>
          </div>
        </div>

        {/* Action Buttons (Screen-only) */}
        <div className="flex items-center justify-end gap-2.5 print:hidden">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black text-white hover:opacity-90 dark:bg-white dark:text-black dark:hover:opacity-90 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
