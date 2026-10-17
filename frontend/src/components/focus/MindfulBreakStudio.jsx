import React, { useState, useEffect, useRef, useId } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  X,
  Maximize2,
  Minimize2,
  Sparkles,
  Wind,
  Coffee,
  ArrowRight,
  Eye,
  Activity,
  Bell
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFocus, BREAK_SOUNDSCAPES } from '../../context/FocusContext';

const MINDFUL_QUOTES = [
  {
    quote: 'Rest is not lost time. It is the subconscious compiling understanding.',
    author: 'Cognitive Science of Mathematics',
  },
  {
    quote: 'Every great mathematical discovery came after the thinker stepped away from the blackboard.',
    author: 'Henri Poincaré',
  },
  {
    quote: 'Like a complex integral, clarity appears when you change your frame of reference.',
    author: 'BehindTheMath Wisdom',
  },
  {
    quote: 'Your brain reorganizes and solidifies neural synapses during quiet pauses, not panic.',
    author: 'Neurobiology of Learning',
  },
  {
    quote: 'Breathe in clarity. Exhale the friction. The mathematical insight is already forming.',
    author: 'Mindful Study',
  },
  {
    quote: 'Be patient with the problem. Deep intuition is always non-linear.',
    author: 'Richard Feynman',
  },
];

const ERGONOMIC_EXERCISES = [
  {
    id: 'eye20',
    title: '20-20-20 Eye Relief',
    desc: 'Look at an object at least 20 feet away to relax your optic ciliary muscles.',
    duration: 20,
    icon: Eye,
  },
  {
    id: 'neck',
    title: 'Neck & Shoulder Release',
    desc: 'Drop shoulders down. Gently tilt your head left for 10s, then right for 10s.',
    duration: 25,
    icon: Activity,
  },
  {
    id: 'wrist',
    title: 'Wrist & Finger Reset',
    desc: 'Interlace fingers, gently push palms outward, and trace figure-eight motions.',
    duration: 20,
    icon: Wind,
  },
];

export default function MindfulBreakStudio() {
  const {
    isBreakModalOpen,
    closeBreakStudio,
    breakDuration,
    breakSecondsRemaining,
    isBreakTimerRunning,
    toggleBreakTimer,
    setBreakDurationMinutes,
    breakSoundscape,
    changeBreakSoundscape,
    breakBreathingTechnique,
    setBreakBreathingTechnique,
    breakVisualMode,
    setBreakVisualMode,
    isBreakCompleted,
    ambientVolume,
    updateAmbientVolume,
    playBowlChime,
    startNextCycle,
  } = useFocus();

  const [activeTab, setActiveTab] = useState('affirmations'); // 'affirmations' | 'ergonomics'
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [soundDropdownOpen, setSoundDropdownOpen] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState(null);
  const [exerciseCountdown, setExerciseCountdown] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Unique accessible IDs
  const headerId = useId();
  const volumeSliderId = useId();

  // Canvas visualizer reference
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const containerRef = useRef(null);

  // Breathing Phase State
  // Techniques:
  // 'box': Inhale 4s, Hold 4s, Exhale 4s, Rest 4s (total 16s)
  // 'relax478': Inhale 4s, Hold 7s, Exhale 8s, Rest 1s (total 20s)
  const [breathPhaseIndex, setBreathPhaseIndex] = useState(0);
  const [breathPhaseSecondsRemaining, setBreathPhaseSecondsRemaining] = useState(4);

  // Rotate quotes periodically
  useEffect(() => {
    if (!isBreakModalOpen) return;
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MINDFUL_QUOTES.length);
    }, 28000);
    return () => clearInterval(interval);
  }, [isBreakModalOpen]);

  // Breathing cycle timer
  useEffect(() => {
    if (!isBreakModalOpen || !isBreakTimerRunning || isBreakCompleted) return;

    const phases =
      breakBreathingTechnique === 'relax478'
        ? [
            { name: 'Inhale', duration: 4 },
            { name: 'Hold', duration: 7 },
            { name: 'Exhale', duration: 8 },
            { name: 'Rest', duration: 1 },
          ]
        : [
            { name: 'Inhale', duration: 4 },
            { name: 'Hold', duration: 4 },
            { name: 'Exhale', duration: 4 },
            { name: 'Rest', duration: 4 },
          ];

    const interval = setInterval(() => {
      setBreathPhaseSecondsRemaining((prevSec) => {
        if (prevSec <= 1) {
          const nextIndex = (breathPhaseIndex + 1) % phases.length;
          setBreathPhaseIndex(nextIndex);
          return phases[nextIndex].duration;
        }
        return prevSec - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreakModalOpen, isBreakTimerRunning, isBreakCompleted, breakBreathingTechnique, breathPhaseIndex]);

  // Reset phase seconds when technique changes
  useEffect(() => {
    setBreathPhaseIndex(0);
    setBreathPhaseSecondsRemaining(4);
  }, [breakBreathingTechnique]);

  // Exercise countdown handler
  useEffect(() => {
    if (!activeExerciseId || exerciseCountdown === null) return;
    if (exerciseCountdown <= 0) {
      setActiveExerciseId(null);
      setExerciseCountdown(null);
      playBowlChime();
      return;
    }
    const timer = setTimeout(() => {
      setExerciseCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [activeExerciseId, exerciseCountdown, playBowlChime]);

  // Confetti on break completion
  useEffect(() => {
    if (isBreakCompleted) {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#10B981', '#38BDF8', '#818CF8', '#F59E0B'],
      });
    }
  }, [isBreakCompleted]);

  // Generative HTML5 Canvas Visualizer (60 FPS)
  useEffect(() => {
    if (!isBreakModalOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // Stardust particles generator
    const particles = Array.from({ length: 48 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    let t = 0;

    const render = () => {
      t += 0.015;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // MODE 1: KINETIC LISSAJOUS MATH WAVES
      if (breakVisualMode === 'kineticMath') {
        ctx.save();
        ctx.translate(centerX, centerY);

        const curvesCount = 5;
        for (let c = 0; c < curvesCount; c++) {
          const curveOffset = c * 0.4;
          const a = 3;
          const b = 2;
          const delta = t * 0.7 + curveOffset;

          const radiusX = Math.min(width, height) * 0.36;
          const radiusY = Math.min(width, height) * 0.36;

          ctx.beginPath();
          for (let theta = 0; theta <= Math.PI * 2; theta += 0.02) {
            const x = radiusX * Math.sin(a * theta + delta);
            const y = radiusY * Math.sin(b * theta);
            if (theta === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }

          const opacity = 0.15 + (c / curvesCount) * 0.4;
          ctx.strokeStyle = c % 2 === 0 ? `rgba(56, 189, 248, ${opacity})` : `rgba(16, 185, 129, ${opacity})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }
        ctx.restore();
      }

      // MODE 2: SACRED GEOMETRIC MANDALA
      else if (breakVisualMode === 'mandala') {
        ctx.save();
        ctx.translate(centerX, centerY);

        const rings = 4;
        const petals = 8;
        const breathScale = 1 + 0.15 * Math.sin(t * 0.8);

        for (let r = 1; r <= rings; r++) {
          const radius = (r * (Math.min(width, height) * 0.075)) * breathScale;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.12 * (rings - r + 1)})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Interlocking sacred geometry petals
          ctx.beginPath();
          for (let p = 0; p < petals; p++) {
            const angle = (p * Math.PI * 2) / petals + t * 0.15 * (r % 2 === 0 ? 1 : -1);
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            ctx.arc(px, py, radius * 0.45, 0, Math.PI * 2);
          }
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.08 * (rings - r + 1)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      }

      // MODE 3: COSMIC STARDUST
      else {
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.pulse += 0.02;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          const currentAlpha = Math.max(0.1, p.alpha + Math.sin(p.pulse) * 0.2);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(168, 218, 220, ${currentAlpha})`;
          ctx.fill();
        });

        // Delicate connecting stardust lines
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - dist / 80) * 0.12})`;
              ctx.stroke();
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isBreakModalOpen, breakVisualMode]);

  // Keyboard shortcut listener (Space = pause/play, Esc = exit)
  useEffect(() => {
    if (!isBreakModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        toggleBreakTimer();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeBreakStudio();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBreakModalOpen, toggleBreakTimer, closeBreakStudio]);

  if (!isBreakModalOpen) return null;

  const minutesRemaining = Math.floor(breakSecondsRemaining / 60);
  const secondsRemaining = breakSecondsRemaining % 60;
  const formattedCountdown = `${String(minutesRemaining).padStart(2, '0')}:${String(secondsRemaining).padStart(2, '0')}`;

  const progressPct = Math.min(100, Math.max(0, ((breakDuration - breakSecondsRemaining) / breakDuration) * 100));
  const strokeDashoffset = 100 - progressPct;

  const phases =
    breakBreathingTechnique === 'relax478'
      ? [
          { name: 'Inhale deeply', tip: 'Slow, deep nasal intake', color: 'text-emerald-400', glow: 'from-emerald-500/20 to-teal-500/5', scale: 'scale-115' },
          { name: 'Hold & observe', tip: 'Keep chest still and mind quiet', color: 'text-amber-400', glow: 'from-amber-500/20 to-yellow-500/5', scale: 'scale-115' },
          { name: 'Exhale fully', tip: 'Gentle release through parted lips', color: 'text-sky-400', glow: 'from-sky-500/20 to-indigo-500/5', scale: 'scale-90' },
          { name: 'Rest at ease', tip: 'Zero tension or effort', color: 'text-slate-400', glow: 'from-slate-500/10 to-transparent', scale: 'scale-95' },
        ]
      : [
          { name: 'Inhale through nose', tip: 'Fill lungs with fresh energy', color: 'text-emerald-400', glow: 'from-emerald-500/20 to-teal-500/5', scale: 'scale-115' },
          { name: 'Hold with stillness', tip: 'Notice the quiet spaces between thoughts', color: 'text-amber-400', glow: 'from-amber-500/20 to-yellow-500/5', scale: 'scale-115' },
          { name: 'Exhale smoothly', tip: 'Release mental tension and fatigue', color: 'text-sky-400', glow: 'from-sky-500/20 to-indigo-500/5', scale: 'scale-90' },
          { name: 'Rest in peace', tip: 'Neutral pause before the next breath', color: 'text-slate-400', glow: 'from-slate-500/10 to-transparent', scale: 'scale-95' },
        ];

  const currentPhase = phases[breathPhaseIndex] || phases[0];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleStartExercise = (ex) => {
    if (activeExerciseId === ex.id) {
      setActiveExerciseId(null);
      setExerciseCountdown(null);
    } else {
      setActiveExerciseId(ex.id);
      setExerciseCountdown(ex.duration);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300 select-none overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headerId}
    >
      <div className="w-full h-full sm:max-w-4xl sm:h-auto sm:max-h-[92vh] sm:rounded-3xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/98 via-[#0b162c]/98 to-[#070d1b]/98 text-white shadow-2xl flex flex-col overflow-hidden relative">

        {/* Ambient background glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header Bar: Brand, Duration Pills, Soundscape, Controls */}
        <header className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0 relative z-20 bg-slate-950/40 backdrop-blur-md">
          {/* Left: Brand & Status */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id={headerId} className="font-heading font-extrabold text-sm sm:text-base text-white tracking-tight">
                  Mindful Break Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  +25 XP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Recharging neural focus through guided breathing & healing resonance
              </p>
            </div>
          </div>

          {/* Center/Right Controls: Duration Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Preset Durations */}
            <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
              {[
                { label: '3m', mins: 3, title: 'Micro Reset' },
                { label: '5m', mins: 5, title: 'Classic Pomodoro Breather' },
                { label: '10m', mins: 10, title: 'Deep Meditation' },
                { label: '15m', mins: 15, title: 'Full Refresh' },
              ].map((preset) => (
                <button
                  key={preset.mins}
                  type="button"
                  onClick={() => setBreakDurationMinutes(preset.mins)}
                  title={preset.title}
                  className={`px-2.5 py-1 rounded-lg font-mono font-semibold transition-all cursor-pointer ${
                    Math.round(breakDuration / 60) === preset.mins
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Soundscape Selector Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSoundDropdownOpen((prev) => !prev)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Select Meditative Healing Audio"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline max-w-[120px] truncate">
                  {BREAK_SOUNDSCAPES.find((s) => s.id === breakSoundscape)?.label.split(' ')[0] || 'Audio'}
                </span>
              </button>

              {soundDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-slate-800 bg-[#0c1527]/98 backdrop-blur-xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Healing Audio Soundscape
                  </div>

                  <div className="space-y-1 mt-1">
                    {BREAK_SOUNDSCAPES.map((snd) => (
                      <button
                        key={snd.id}
                        type="button"
                        onClick={() => {
                          changeBreakSoundscape(snd.id);
                          setSoundDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl transition-colors cursor-pointer flex items-start gap-2.5 ${
                          breakSoundscape === snd.id
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="text-sm mt-0.5">{snd.label.slice(-2)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-white leading-tight">
                            {snd.label.slice(0, -3)}
                          </div>
                          <div className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">
                            {snd.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Volume Slider & Manual Bowl Strike */}
                  <div className="p-2.5 mt-1 pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <label htmlFor={volumeSliderId} className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
                        <span>Volume</span>
                      </label>
                      <span className="font-mono">{Math.round(ambientVolume * 100)}%</span>
                    </div>
                    <input
                      id={volumeSliderId}
                      type="range"
                      min="0"
                      max="0.4"
                      step="0.01"
                      value={ambientVolume}
                      onChange={(e) => updateAmbientVolume(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />

                    <button
                      type="button"
                      onClick={playBowlChime}
                      className="w-full py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-[11px] font-medium text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      title="Strike the Tibetan singing bowl"
                    >
                      <Bell className="w-3 h-3 text-amber-400" />
                      <span>Strike Singing Bowl (Recenter)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors hidden sm:inline-flex"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Exit Break */}
            <button
              type="button"
              onClick={closeBreakStudio}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 cursor-pointer transition-colors"
              title="Close Break Studio (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 2. Main Studio Stage */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-between gap-6 relative z-10">

          {/* Sub-toolbar: Visualizer Style & Breathing Mode Toggle */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
            {/* Visual Mode Selector */}
            <div className="flex items-center bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
              {[
                { id: 'mandala', label: 'Sacred Mandala' },
                { id: 'kineticMath', label: 'Harmonic Waves' },
                { id: 'stars', label: 'Cosmic Stardust' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setBreakVisualMode(m.id)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer text-[11px] ${
                    breakVisualMode === m.id
                      ? 'bg-slate-800 text-white font-semibold shadow-2xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Breathing Method Toggle */}
            <div className="flex items-center bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
              <button
                type="button"
                onClick={() => setBreakBreathingTechnique('box')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer text-[11px] ${
                  breakBreathingTechnique === 'box'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Box Breathing: 4s Inhale, 4s Hold, 4s Exhale, 4s Rest"
              >
                Box 4-4-4-4
              </button>
              <button
                type="button"
                onClick={() => setBreakBreathingTechnique('relax478')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer text-[11px] ${
                  breakBreathingTechnique === 'relax478'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="4-7-8 Pranayama: 4s Inhale, 7s Hold, 8s Exhale"
              >
                Deep Calm 4-7-8
              </button>
            </div>
          </div>

          {/* Center Centerpiece: Breathing Halo & Math Wave Canvas */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-auto">
            {/* Background 60 FPS Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none rounded-full"
            />

            {/* Glowing Breathing Halo Circle */}
            <div
              className={`absolute inset-4 rounded-full bg-gradient-to-tr ${currentPhase.glow} blur-2xl transition-transform duration-1000 ease-in-out pointer-events-none ${
                isBreakTimerRunning && !isBreakCompleted ? currentPhase.scale : 'scale-100'
              }`}
            />

            {/* Circular Progress Border */}
            <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-800/80"
                strokeWidth="2.5"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-emerald-400 transition-all duration-1000 ease-linear"
                strokeWidth="3"
                strokeDasharray="276.46"
                strokeDashoffset={(strokeDashoffset / 100) * 276.46}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inside Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-20">
              {isBreakCompleted ? (
                <div className="space-y-2 animate-in zoom-in-95 duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center text-2xl">
                    ✨
                  </div>
                  <div className="font-heading font-extrabold text-xl text-white">
                    Recharged!
                  </div>
                  <div className="text-xs text-emerald-400 font-medium">
                    +25 Mindful XP Awarded
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono font-semibold tracking-wider uppercase text-slate-400">
                    Remaining Break
                  </div>
                  <div className="font-heading font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
                    {formattedCountdown}
                  </div>

                  {/* Dynamic Phase Cues */}
                  <div className="pt-1 space-y-0.5">
                    <div className={`font-heading font-bold text-base sm:text-lg transition-colors duration-500 ${currentPhase.color}`}>
                      {currentPhase.name} ({breathPhaseSecondsRemaining}s)
                    </div>
                    <div className="text-[11px] text-slate-400 max-w-[180px] mx-auto leading-tight">
                      {currentPhase.tip}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timer Play / Pause Controls & Manual Restart */}
          <div className="flex items-center gap-3 relative z-20">
            {isBreakCompleted ? (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setBreakDurationMinutes(5)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Take Another 5m</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeBreakStudio();
                    startNextCycle();
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-emerald-500/25"
                >
                  <span>Start Next Study Block</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={toggleBreakTimer}
                  className={`px-5 py-2.5 rounded-2xl font-heading font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md ${
                    isBreakTimerRunning
                      ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  {isBreakTimerRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Breath</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Resume Breath</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setBreakDurationMinutes(Math.round(breakDuration / 60))}
                  className="p-2.5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 3. Bottom Dock: Motivational Affirmations & Ergonomic Stretches */}
          <div className="w-full max-w-xl rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 space-y-3 relative z-20">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('affirmations')}
                  className={`pb-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'affirmations'
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mindset Affirmation</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('ergonomics')}
                  className={`pb-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'ergonomics'
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Desk Ergonomics & Stretches</span>
                </button>
              </div>

              {activeTab === 'affirmations' && (
                <button
                  type="button"
                  onClick={() => setQuoteIndex((prev) => (prev + 1) % MINDFUL_QUOTES.length)}
                  className="text-[10px] text-slate-400 hover:text-slate-200 font-mono cursor-pointer"
                >
                  Next Quote →
                </button>
              )}
            </div>

            {/* Tab 1: Dynamic Affirmation */}
            {activeTab === 'affirmations' && (
              <div className="text-center space-y-1 py-1">
                <p className="text-xs sm:text-sm font-medium text-slate-200 italic leading-relaxed">
                  "{MINDFUL_QUOTES[quoteIndex].quote}"
                </p>
                <div className="text-[10px] font-mono text-emerald-400/80">
                  — {MINDFUL_QUOTES[quoteIndex].author}
                </div>
              </div>
            )}

            {/* Tab 2: Ergonomic Quick Resets */}
            {activeTab === 'ergonomics' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {ERGONOMIC_EXERCISES.map((ex) => {
                  const Icon = ex.icon;
                  const isActive = activeExerciseId === ex.id;
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => handleStartExercise(ex)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-500/15 text-white'
                          : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                          {isActive && exerciseCountdown !== null ? `${exerciseCountdown}s` : `${ex.duration}s`}
                        </span>
                      </div>
                      <div className="font-semibold text-xs mt-1 text-white">{ex.title}</div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-2">{ex.desc}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
