import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Minimize2,
  Edit3,
  X,
  Check,
  Plus,
  Zap,
  Coffee,
  RotateCcw,
  Wind
} from 'lucide-react';
import { useFocus, SOUNDSCAPES } from '../../context/FocusContext';
import { useStudent } from '../../context/StudentContext';

const MATH_QUOTES = [
  { quote: 'Mathematics is the music of reason.', author: 'James Joseph Sylvester' },
  { quote: 'Pure mathematics is, in its way, the poetry of logical ideas.', author: 'Albert Einstein' },
  { quote: 'Nature is written in mathematical language.', author: 'Galileo Galilei' },
  { quote: 'An equation for me has no meaning unless it expresses a thought of God.', author: 'Srinivasa Ramanujan' },
  { quote: 'In mathematics the art of proposing a question must be held of higher value than solving it.', author: 'Georg Cantor' },
];

export default function ZenStudySanctum() {
  const {
    isFocusActive,
    isPaused,
    focusDuration,
    secondsRemaining,
    focusGoal,
    ambientSound,
    ambientVolume,
    updateAmbientVolume,
    toggleAmbientSound,
    sessionTasks,
    toggleTask,
    addTask,
    sessionPhase,
    currentCycle,
    totalCycles,
    isZenSanctumOpen,
    setIsZenSanctumOpen,
    isBreathingGuideActive,
    setIsBreathingGuideActive,
    pauseFocusSession,
    resumeFocusSession,
    startBreatherSession,
    startNextCycle,
    setIsEmergencyExitOpen,
  } = useFocus();

  const { setIsScratchpadOpen } = useStudent();
  const [newTaskInput, setNewTaskInput] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [soundDropdownOpen, setSoundDropdownOpen] = useState(false);

  // 4-4-4-4 Box Breathing Cycle State: 0: Inhale (4s), 1: Hold (4s), 2: Exhale (4s), 3: Rest (4s)
  const [breathPhase, setBreathPhase] = useState(0);
  const [breathSeconds, setBreathSeconds] = useState(4);

  // Rotate quotes occasionally
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MATH_QUOTES.length);
    }, 45000);
    return () => clearInterval(quoteInterval);
  }, []);

  // Box Breathing 16s Loop
  useEffect(() => {
    if (!isZenSanctumOpen || !isBreathingGuideActive || isPaused) return;

    const interval = setInterval(() => {
      setBreathSeconds((prevSec) => {
        if (prevSec <= 1) {
          setBreathPhase((prevPhase) => (prevPhase + 1) % 4);
          return 4;
        }
        return prevSec - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isZenSanctumOpen, isBreathingGuideActive, isPaused]);

  if (!isFocusActive || !isZenSanctumOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPct = Math.min(100, Math.max(0, ((focusDuration - secondsRemaining) / focusDuration) * 100));
  const strokeDashoffset = 100 - progressPct;

  const breathLabels = [
    { title: 'Breathe In...', sub: 'Deep belly expansion', scale: 'scale-125', color: 'from-amber-400/30 to-amber-500/10' },
    { title: 'Hold Breath', sub: 'Calm mental stillness', scale: 'scale-125', color: 'from-indigo-400/30 to-indigo-500/10' },
    { title: 'Slow Exhale...', sub: 'Release all tension', scale: 'scale-90', color: 'from-rose-400/30 to-rose-500/10' },
    { title: 'Rest & Empty', sub: 'Reset awareness', scale: 'scale-90', color: 'from-emerald-400/30 to-emerald-500/10' },
  ];

  const currentBreath = breathLabels[breathPhase];

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskInput.trim()) {
      addTask(newTaskInput.trim());
      setNewTaskInput('');
    }
  };

  const completedTasks = sessionTasks.filter((t) => t.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050811] text-white selection:bg-amber-500/30 select-none animate-in fade-in duration-300 overflow-hidden font-sans">
      
      {/* 1. Deep Atmospheric Gradient & Dynamic Radial Aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[600px] sm:h-[850px] rounded-full blur-[140px] opacity-25 transition-all duration-1000 ${
            sessionPhase === 'break'
              ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500'
              : 'bg-gradient-to-tr from-amber-600 via-orange-600 to-indigo-600'
          }`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />
      </div>

      {/* 2. Top Header Bar */}
      <header className="relative z-20 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/20">
        
        {/* Left Branding & Phase Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-[#090d1a] rounded-[10px] flex items-center justify-center font-serif font-black text-amber-400 text-base">
              Σ
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-white">
                Study Sanctum
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  sessionPhase === 'break'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {sessionPhase === 'break' ? 'Breather ☕' : `Block ${currentCycle} of ${totalCycles}`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              {focusGoal}
            </p>
          </div>
        </div>

        {/* Right Top Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Box Breathing Guide Toggle */}
          <button
            type="button"
            onClick={() => setIsBreathingGuideActive((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isBreathingGuideActive
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-sm'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle 4-4-4-4 Box Breathing Guide"
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Breathing Orb</span>
          </button>

          {/* Math Scratchpad Quick-Launch */}
          <button
            type="button"
            onClick={() => setIsScratchpadOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Open Scratchpad Whiteboard for Math Proofs"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Scratchpad</span>
          </button>

          {/* Ambient Sound Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSoundDropdownOpen((prev) => !prev)}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                ambientSound !== 'off'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Change Ambient Focus Sound"
            >
              {ambientSound !== 'off' ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline capitalize">{ambientSound}</span>
            </button>

            {/* Sound Dropdown Menu */}
            {soundDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/15 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl z-30 space-y-1 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Synthesized Soundscapes
                </div>
                {SOUNDSCAPES.map((snd) => (
                  <button
                    key={snd.id}
                    type="button"
                    onClick={() => {
                      toggleAmbientSound(snd.id);
                      setSoundDropdownOpen(false);
                    }}
                    className={`w-full p-2 rounded-xl text-left transition-all flex items-start gap-2 cursor-pointer ${
                      ambientSound === snd.id
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                        : 'hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <div className="text-xs">{snd.label}</div>
                  </button>
                ))}

                {/* Volume slider */}
                {ambientSound !== 'off' && (
                  <div className="p-2 pt-2 border-t border-white/10 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Volume</span>
                      <span className="font-mono">{Math.round(ambientVolume * 100 * 4)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.02"
                      max="0.28"
                      step="0.01"
                      value={ambientVolume}
                      onChange={(e) => updateAmbientVolume(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Minimize / Return to Website */}
          <button
            type="button"
            onClick={() => setIsZenSanctumOpen(false)}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
            title="Collapse to Compact HUD (Esc / Z)"
            aria-label="Collapse to Compact HUD"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. Main Centerpiece (Timer & Breathing Guide) */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8 space-y-6 sm:space-y-8">
        
        {/* Glowing Circular Timer Ring */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          
          {/* Subtle Outer Pulse Ring */}
          <div
            className={`absolute inset-0 rounded-full border border-amber-500/20 animate-ping opacity-20 pointer-events-none duration-1000 ${
              isPaused ? 'hidden' : ''
            }`}
          />

          {/* SVG Progress Circle */}
          <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_25px_rgba(245,158,11,0.25)]" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-white/10"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className={`transition-all duration-1000 ease-linear ${
                sessionPhase === 'break' ? 'text-emerald-400' : 'text-amber-500'
              }`}
              strokeWidth="4"
              strokeDasharray="276.46"
              strokeDashoffset={(strokeDashoffset / 100) * 276.46}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Center Content: Either Breathing Orb or Big Digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            
            {isBreathingGuideActive && !isPaused ? (
              <div className="space-y-1.5 transition-all duration-1000">
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-tr ${currentBreath.color} border border-white/20 backdrop-blur-md flex flex-col items-center justify-center shadow-xl transition-all duration-1000 ease-in-out ${currentBreath.scale}`}
                >
                  <span className="text-[10px] font-mono font-bold text-white/80">
                    {breathSeconds}s
                  </span>
                  <span className="font-heading font-extrabold text-xs sm:text-sm text-white tracking-wide">
                    {currentBreath.title}
                  </span>
                </div>
                <div className="pt-2">
                  <div className="font-mono font-black text-2xl sm:text-3xl text-white tracking-tight">
                    {formattedTime}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    {currentBreath.sub}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="font-mono font-black text-4xl sm:text-6xl text-white tracking-tighter drop-shadow-md">
                  {formattedTime}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-amber-300 truncate max-w-[220px]">
                  {isPaused ? 'Session Paused' : focusGoal}
                </div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  {Math.round(progressPct)}% Completed
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Center Control Action Buttons */}
        <div className="flex items-center gap-3">
          
          {/* Play / Pause Toggle */}
          {isPaused ? (
            <button
              type="button"
              onClick={resumeFocusSession}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Resume Focus</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={pauseFocusSession}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-sm backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Pause className="w-4 h-4" />
              <span>Pause Timer</span>
            </button>
          )}

          {/* Breather or Next Block Action */}
          {sessionPhase === 'work' ? (
            <button
              type="button"
              onClick={() => startBreatherSession(5)}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Take a 5-minute breather break"
            >
              <Coffee className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startNextCycle}
              className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              title="Start next work cycle"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resume Work Block</span>
            </button>
          )}

          {/* Emergency Forfeit Button */}
          <button
            type="button"
            onClick={() => setIsEmergencyExitOpen(true)}
            className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-colors cursor-pointer"
            title="Forfeit / Exit Session Early"
          >
            <X className="w-4 h-4" />
          </button>

        </div>

        {/* Motivational Mathematical Thought */}
        <div className="max-w-md text-center px-4 pt-1 animate-fade-in">
          <p className="text-xs sm:text-sm text-slate-300 italic font-serif leading-relaxed">
            "{MATH_QUOTES[quoteIndex].quote}"
          </p>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-1 block">
            — {MATH_QUOTES[quoteIndex].author}
          </span>
        </div>

      </main>

      {/* 4. Bottom Collapsible Session Task Dock */}
      <footer className="relative z-20 px-4 sm:px-8 py-3.5 border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto space-y-2.5">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Session Milestones ({completedTasks}/{sessionTasks.length})</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                +{completedTasks * 15} XP Bonus
              </span>
            </div>

            {/* Quick Keyboard Reference */}
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span>[Space] Pause</span>
              <span>•</span>
              <span>[Z] Toggle Sanctum</span>
              <span>•</span>
              <span>[M] Sound</span>
            </div>
          </div>

          {/* Task Chips Row */}
          <div className="flex items-center gap-2 flex-wrap max-h-24 overflow-y-auto">
            {sessionTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => toggleTask(t.id)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                  t.completed
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200 line-through opacity-80'
                    : 'bg-white/5 border-white/10 text-slate-200 hover:border-amber-500/40 hover:bg-white/10'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                    t.completed ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-slate-500'
                  }`}
                >
                  {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="truncate max-w-[200px]">{t.text}</span>
              </div>
            ))}

            {/* Quick Add Form */}
            <form onSubmit={handleAddTask} className="inline-flex items-center gap-1.5">
              <input
                type="text"
                placeholder="+ Add task..."
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 w-28 sm:w-36 transition-all"
              />
            </form>
          </div>

        </div>
      </footer>

    </div>
  );
}
