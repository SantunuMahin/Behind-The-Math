import React, { useState } from 'react';
import {
  Clock,
  Target,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  Zap,
  Sparkles,
  Shield,
  Flame,
  Check,
  Headphones,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useFocus } from '../../context/FocusContext';

const PRESET_DURATIONS = [
  { minutes: 15, label: '15m Sprint', xp: 60, icon: '⚡' },
  { minutes: 25, label: '25m Pomodoro', xp: 100, recommended: true, icon: '🔥' },
  { minutes: 45, label: '45m Deep Flow', xp: 180, icon: '🧠' },
  { minutes: 60, label: '60m Marathon', xp: 240, icon: '🏆' },
];

const QUICK_GOALS = [
  'Calculus & Derivations',
  'Physics & Mechanics',
  'Linear Algebra',
  'Rapid-Fire Quiz'
];

export default function FocusSetupModal() {
  const {
    isSetupOpen,
    setIsSetupOpen,
    startFocusSession,
    isPreviewingAudio,
    togglePreviewAudio,
  } = useFocus();

  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [isCustom, setIsCustom] = useState(false);
  const [goal, setGoal] = useState('Calculus & Derivations');
  const [sound, setSound] = useState('piano');
  const [fullscreen, setFullscreen] = useState(false);

  if (!isSetupOpen) return null;

  const currentDuration = isCustom ? Number(customMinutes) || 25 : selectedMinutes;
  const estimatedXp = Math.max(50, currentDuration * 4);

  const handleStart = (e) => {
    e.preventDefault();
    startFocusSession({
      durationMinutes: currentDuration,
      goal,
      sound,
      openZenSanctum: fullscreen,
    });
  };

  const soundOptions = [
    { id: 'piano', label: 'Study Piano', emoji: '🎹' },
    { id: 'rain', label: 'Soft Rain', emoji: '🌧️' },
    { id: 'binaural', label: 'Alpha Waves', emoji: '🧘' },
    { id: 'zen432', label: '432Hz Zen', emoji: '🕉️' },
    { id: 'brown', label: 'Brown Noise', emoji: '🌊' },
    { id: 'off', label: 'Pure Silence', emoji: '🔇' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl relative overflow-hidden flex flex-col my-auto max-h-[92vh]">

        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        {/* 1. Modal Header */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 shrink-0 relative z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shadow-xs">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-lg sm:text-xl text-zinc-950 dark:text-white tracking-tight">
                  Schedule Focus Mode
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                  DEEP FLOW
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Silence distractions, lock in study time, and earn quantitative mastery.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSetupOpen(false)}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Close Focus Setup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Compact Ergonomic Body (Fits without vertical clipping) */}
        <form
          id="focus-form"
          onSubmit={handleStart}
          className="p-5 sm:p-6 space-y-4 relative z-10 text-xs overflow-y-auto"
        >

          {/* Section 1: Study Duration Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>1. Duration & Structure</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCustom((prev) => !prev)}
                className="text-[11px] text-zinc-500 hover:text-black dark:hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sliders className="w-3 h-3" />
                <span>{isCustom ? 'Standard Presets' : 'Custom Slider'}</span>
              </button>
            </div>

            {!isCustom ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_DURATIONS.map((preset) => {
                  const isSelected = selectedMinutes === preset.minutes;
                  return (
                    <button
                      key={preset.minutes}
                      type="button"
                      onClick={() => setSelectedMinutes(preset.minutes)}
                      className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-black dark:border-white bg-zinc-950 text-white dark:bg-zinc-900 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {preset.recommended && (
                        <span className={`absolute -top-1.5 right-2 px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider ${
                          isSelected ? 'bg-amber-400 text-black' : 'bg-amber-500 text-white'
                        }`}>
                          Popular
                        </span>
                      )}
                      <div className="text-base">{preset.icon}</div>
                      <div className={`font-bold text-xs mt-0.5 ${isSelected ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                        {preset.label}
                      </div>
                      <div className="text-[10px] font-mono font-bold text-amber-400 mt-0.5">
                        +{preset.xp} XP
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-600 dark:text-zinc-300">Custom Duration:</span>
                  <span className="font-mono text-amber-500 font-bold text-sm">
                    {customMinutes} Minutes ({estimatedXp} XP)
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="180"
                  step="5"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Number(e.target.value))}
                  className="w-full accent-black dark:accent-white cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>5m</span>
                  <span>25m</span>
                  <span>45m</span>
                  <span>90m</span>
                  <span>180m</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Session Goal */}
          <div className="space-y-1.5">
            <span className="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-500" />
              <span>2. Session Goal (What will you master?)</span>
            </span>
            <div className="relative">
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Master Stokes Theorem & Practice Derivations"
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white outline-none focus:ring-1 focus:ring-black dark:focus:ring-white font-medium text-xs transition-all"
                required
              />
            </div>

            {/* Quick Goal Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] text-zinc-400 font-medium">Suggestions:</span>
              {QUICK_GOALS.map((qGoal) => (
                <button
                  key={qGoal}
                  type="button"
                  onClick={() => setGoal(qGoal)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-colors cursor-pointer ${
                    goal === qGoal
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold'
                      : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {qGoal}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Ambient Sound Selector (Compact 3x2 Grid) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-amber-500" />
                <span>3. Ambient Soundscape</span>
              </span>
              {sound !== 'off' && (
                <button
                  type="button"
                  onClick={() => togglePreviewAudio(sound)}
                  className={`text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                    isPreviewingAudio
                      ? 'text-rose-500 animate-pulse'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {isPreviewingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isPreviewingAudio ? 'Stop Preview' : 'Test Audio (6s)'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {soundOptions.map((s) => {
                const isSelected = sound === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSound(s.id)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-black dark:border-white bg-zinc-950 text-white dark:bg-zinc-850 ring-1 ring-black dark:ring-white'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm shrink-0">{s.emoji}</span>
                      <span className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                        {s.label}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Compact Focus Safeguards & Fullscreen */}
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 text-xs">
              <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="font-medium text-[11px]">Distraction shield active · Departure warning on leave</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={fullscreen}
                onChange={(e) => setFullscreen(e.target.checked)}
                className="rounded accent-black dark:accent-white w-3.5 h-3.5 cursor-pointer"
              />
              <span className="font-medium text-zinc-600 dark:text-zinc-300 text-[11px] flex items-center gap-1">
                <Maximize2 className="w-3 h-3 text-zinc-400" />
                <span>Fullscreen</span>
              </span>
            </label>
          </div>

        </form>

        {/* 3. Modal Sticky Footer (Always 100% visible, perfectly proportioned) */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-zinc-100 dark:border-zinc-850 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm shrink-0 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">Session Reward</span>
            <div className="text-xs font-mono font-bold text-amber-500 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-amber-500" />
              <span>+{estimatedXp} XP Focus Bonus</span>
            </div>
          </div>

          <button
            type="submit"
            form="focus-form"
            className="w-auto min-w-[220px] py-2.5 px-6 rounded-2xl bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Start Focus Session ({currentDuration} min) →</span>
          </button>
        </div>

      </div>
    </div>
  );
}
