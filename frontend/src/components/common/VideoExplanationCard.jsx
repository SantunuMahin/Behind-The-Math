import React, { useState } from 'react';
import { Play, ExternalLink, Search, Tv, Sparkles, CheckCircle2, QrCode } from 'lucide-react';
import QRCodeView from './QRCodeView';

export default function VideoExplanationCard({ formula }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showScreenQr, setShowScreenQr] = useState(false);

  if (!formula) return null;

  const youtubeId = formula.video_youtube_id || formula.video?.youtubeId;
  const videoTitle = formula.video_title || formula.video?.title || `${formula.title} Visual Explanation`;
  const videoChannel = formula.video_channel || formula.video?.channel || 'Educational STEM Channel';
  
  // Construct targeted search URLs for fallbacks and deep learning
  const searchQuery = encodeURIComponent(`${formula.title} visual math derivation explanation`);
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
  const khanSearchUrl = `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(formula.title)}`;
  const threeBlueOneBrownSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent('3Blue1Brown ' + formula.title)}`;
  
  const directVideoUrl = formula.video_url || formula.video?.url || (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : youtubeSearchUrl);

  return (
    <section className="space-y-3 print-break-inside-avoid avoid-break">
      {/* 1. SCREEN VIEW (Interactive Player & Thumbnail) */}
      <div className="print:hidden space-y-3">
        {/* Section Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <Tv className="w-4 h-4" />
            </div>
            <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
              Visual Video Explanation
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowScreenQr((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121D33] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              title="Show QR code to watch on mobile phone"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-500" />
              <span>{showScreenQr ? 'Hide Mobile QR' : 'Watch on Phone (QR)'}</span>
            </button>

            <a
              href={youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121D33] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search YouTube</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* Optional Screen QR Code Popover */}
        {showScreenQr && (
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-md flex items-center justify-between gap-4 animate-in fade-in duration-150">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Scan with Mobile Camera
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Point your mobile phone camera at this QR code to watch the {videoTitle} video lesson immediately.
              </p>
              <a
                href={directVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-red-600 dark:text-red-400 hover:underline inline-block pt-1 truncate max-w-xs"
              >
                {directVideoUrl}
              </a>
            </div>
            <QRCodeView value={directVideoUrl} size={96} includeLabel={true} label="Mobile Link" />
          </div>
        )}

        {/* Main Video Box (Screen-only) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md bg-slate-900 transition-all">
          {youtubeId ? (
            <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
              {!isPlaying ? (
                <div
                  onClick={() => setIsPlaying(true)}
                  className="group relative w-full h-full cursor-pointer overflow-hidden flex items-center justify-center select-none"
                >
                  {/* Video Thumbnail */}
                  <img
                    src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                    alt={videoTitle}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    onError={(e) => {
                      e.target.src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
                    }}
                  />

                  {/* Dark Vignette / Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                  {/* Centered Glowing Red Play Button */}
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-600/40 group-hover:scale-110 transition-all active:scale-95">
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white translate-x-0.5" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold tracking-wide border border-white/10 group-hover:bg-black/90 transition-colors">
                      Click to Play Visual Explanation
                    </span>
                  </div>

                  {/* Top Channel Badge */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-medium border border-white/10 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span>{videoChannel}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                  title={videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-none"
                />
              )}
            </div>
          ) : (
            /* High-Quality Fallback Hub when direct embed is not available */
            <div className="p-8 sm:p-12 text-center space-y-6 bg-gradient-to-b from-slate-900 to-slate-950 text-white">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center">
                <Tv className="w-7 h-7" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
                  Curated Video Masterclasses for {formula.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Explore comprehensive lectures, physical geometric derivations, and step-by-step visual proofs curated across top mathematics educators.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={youtubeSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Lectures on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={khanSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-2"
                >
                  <span>Khan Academy Search</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>

                <a
                  href={threeBlueOneBrownSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-2"
                >
                  <span>3Blue1Brown Library</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>
              </div>
            </div>
          )}

          {/* Video Card Footer / Metadata Bar */}
          <div className="p-4 bg-slate-50 dark:bg-[#121D33] border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>{videoTitle}</span>
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-600 dark:text-slate-400">{videoChannel}</span>
                <span>•</span>
                <span>100% Free Educational Content</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={directVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRINT-ONLY VIEW (Crisp QR Code & Video Reference Badge) */}
      <div className="hidden print:block border-2 border-black rounded-xl p-4 bg-white text-black space-y-3 print-break-inside-avoid">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black text-white uppercase tracking-wider">
                VIDEO MASTERCLASS
              </span>
              <span className="text-[10px] font-mono text-zinc-600 font-semibold">
                {videoChannel}
              </span>
            </div>

            <h3 className="font-heading font-black text-sm text-black leading-snug">
              {videoTitle}
            </h3>

            <p className="text-[11px] text-zinc-700 leading-normal">
              Physical visual derivation & step-by-step mathematical walkthrough.
            </p>

            <div className="pt-1 space-y-1">
              <div className="text-[10px] text-zinc-800 font-medium">
                📱 <strong>Scan with mobile camera</strong> to watch the full visual explanation directly on YouTube:
              </div>
              <div className="font-mono text-[9px] text-zinc-600 break-all">
                {directVideoUrl}
              </div>
            </div>
          </div>

          <div className="shrink-0 text-center">
            <QRCodeView value={directVideoUrl} size={105} includeLabel={true} label="Scan to Watch" />
          </div>
        </div>
      </div>
    </section>
  );
}

