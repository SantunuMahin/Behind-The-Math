import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Award,
  Sparkles,
  Flame,
  Clock,
  Target,
  Share2,
  Check,
  GraduationCap,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import MathView from '../common/MathView';
import QRCodeView from '../common/QRCodeView';
import StudentAvatar from '../common/StudentAvatar';

export default function ScholarInspectModal({ scholar, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!scholar) return null;

  const handleShare = () => {
    const text = `🎓 Verified STEM Scholar on BehindTheMath: ${scholar.name} (${scholar.institution}) — Rank #${scholar.rank} with ${scholar.xp.toLocaleString()} XP!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scholarId = `BTM-2026-${scholar.countryCode || 'INT'}-${String(scholar.rank).padStart(3, '0')}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto scrollbar-thin rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-6 text-black dark:text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                OFFICIAL ACADEMIC CREDENTIAL
              </div>
              <h3 className="font-heading font-extrabold text-base text-black dark:text-white leading-tight">
                Scholar Profile & Milestone Passport
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scholar Card Showcase */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-zinc-800 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white p-6 space-y-5 shadow-xl">
          {/* Subtle math watermark */}
          <div className="absolute top-2 right-4 text-[9px] font-mono text-zinc-700/60 select-none pointer-events-none">
            {"\\mathcal{F}(\\omega) = \\int_{-\\infty}^\\infty f(t)e^{-i\\omega t}dt"}
          </div>

          {/* Top Row: Rank & Scholar ID */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-xs uppercase tracking-wider text-white">
                BehindTheMath
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white/10 text-zinc-300">
                HONOR ROLL
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                RANK #{scholar.rank}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {scholarId}
              </span>
            </div>
          </div>

          {/* Identity & Verification */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white text-black font-extrabold text-3xl flex items-center justify-center shadow-lg ring-2 ring-white/20 shrink-0 overflow-hidden">
                <StudentAvatar avatar={scholar.avatar} name={scholar.name} />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-black text-xl text-white tracking-tight">
                    {scholar.name}
                  </h4>
                  {scholar.verified && (
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" title="Verified STEM Scholar" />
                  )}
                </div>
                <p className="text-xs text-zinc-300 font-medium">
                  {scholar.institution}
                </p>
                <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/10 text-white font-mono uppercase">
                    {scholar.divisionTitle}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {scholar.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification QR Code */}
            <div className="shrink-0 text-center">
              <QRCodeView
                value={`https://behindthemath.org/scholar/${scholar.id}`}
                size={54}
                includeLabel={true}
                label="Verify"
              />
            </div>
          </div>

          {/* Academic Bio */}
          {scholar.bio && (
            <p className="text-xs text-zinc-400 leading-relaxed pt-1 border-t border-white/10">
              {scholar.bio}
            </p>
          )}

          {/* Signature Governing Equation */}
          {scholar.signatureFormula && (
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                <span>Specialization: {scholar.specialization}</span>
                <span>Signature Formula</span>
              </div>
              <div className="py-1 text-center font-mono text-xs sm:text-sm text-white overflow-x-auto scrollbar-none">
                <MathView math={scholar.signatureFormula} display={true} />
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4 gap-2 pt-1 border-t border-white/10 text-center font-mono">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[8px] uppercase tracking-wider text-zinc-400">Total XP</div>
              <div className="font-extrabold text-sm sm:text-base text-amber-400">
                {scholar.xp.toLocaleString()}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[8px] uppercase tracking-wider text-zinc-400">Streak</div>
              <div className="font-extrabold text-sm sm:text-base text-rose-400 flex items-center justify-center gap-0.5">
                <Flame className="w-3 h-3 text-rose-400" />
                <span>{scholar.streak}d</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[8px] uppercase tracking-wider text-zinc-400">Focus Hours</div>
              <div className="font-extrabold text-sm sm:text-base text-zinc-200">
                {scholar.focusHours}h
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[8px] uppercase tracking-wider text-zinc-400">Accuracy</div>
              <div className="font-extrabold text-sm sm:text-base text-emerald-400">
                {scholar.quizAccuracy}%
              </div>
            </div>
          </div>

          {/* Recent Badges Strip */}
          {scholar.recentBadges && scholar.recentBadges.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px]">
              <span className="text-zinc-500 font-mono text-[9px] uppercase">Badges:</span>
              {scholar.recentBadges.map((b, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-zinc-200 font-semibold flex items-center gap-1"
                >
                  <Award className="w-2.5 h-2.5 text-amber-400" />
                  <span>{b}</span>
                </span>
              ))}
            </div>
          )}

          {/* Barcode Strip */}
          <div className="flex items-center justify-between pt-1 text-[8px] font-mono text-zinc-500 border-t border-white/10">
            <span>OFFICIAL STEM SCHOLAR RECORD</span>
            <span className="tracking-widest">|||| | ||| || |||| | | ||||</span>
            <span>VERIFIED DIGITAL PASSPORT</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Country: <strong>{scholar.country}</strong> · Division: <strong>{scholar.divisionTitle}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Share Profile'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
