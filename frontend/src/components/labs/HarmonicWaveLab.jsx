import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function HarmonicWaveLab() {
  const { isDark } = useTheme();

  const [waveMode, setWaveMode] = useState('single'); // 'single' | 'standing' | 'interference'
  const [amplitude, setAmplitude] = useState(40);
  const [frequency, setFrequency] = useState(1.2);
  const [wavelength, setWavelength] = useState(160);
  const [phase, setPhase] = useState(0); // Phase shift for interference mode
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showParticles, setShowParticles] = useState(true);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const timeRef = useRef(0);

  const reset = () => {
    setAmplitude(40);
    setFrequency(1.2);
    setWavelength(160);
    setPhase(0);
    setSpeed(1);
    setIsPlaying(true);
    timeRef.current = 0;
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Dynamic theme colors
    const bgGrid = isDark ? '#16233B' : '#F1F5F9';
    const axisColor = isDark ? '#334155' : '#CBD5E1';
    const wavePrimary = isDark ? '#38BDF8' : '#0284C7';
    const waveResult = isDark ? '#34D399' : '#059669';

    // Grid
    ctx.strokeStyle = bgGrid;
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Equilibrium axis
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    const k = (2 * Math.PI) / wavelength;
    const omega = 2 * Math.PI * frequency;
    const t = timeRef.current;

    // 1. Single Traveling Wave Mode
    if (waveMode === 'single') {
      ctx.strokeStyle = wavePrimary;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const y = centerY - amplitude * Math.sin(k * x - omega * t);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Transverse oscillator particles along the wave string
      if (showParticles) {
        ctx.fillStyle = isDark ? '#FBBF24' : '#D97706';
        for (let x = 40; x < width; x += 40) {
          const y = centerY - amplitude * Math.sin(k * x - omega * t);
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();

          // Particle vertical guideline
          ctx.strokeStyle = isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(217, 119, 6, 0.2)';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(x, centerY - amplitude);
          ctx.lineTo(x, centerY + amplitude);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    } else if (waveMode === 'standing') {
      // 2. Standing Wave Mode: 2A sin(kx) cos(omega t)
      ctx.strokeStyle = waveResult;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const y = centerY - (amplitude * 1.5) * Math.sin(k * x) * Math.cos(omega * t);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Nodes (zero displacement) & Antinodes (max displacement)
      const halfLambda = wavelength / 2;
      for (let x = 0; x < width; x += halfLambda) {
        // Node marker
        ctx.fillStyle = isDark ? '#F43F5E' : '#E11D48';
        ctx.beginPath();
        ctx.arc(x, centerY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '9px sans-serif';
        ctx.fillText('Node', x - 10, centerY + 14);
      }
    } else if (waveMode === 'interference') {
      // 3. Two Wave Superposition & Interference
      const phaseRad = (phase * Math.PI) / 180;

      // Wave 1 (Forward - Blue)
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(2, 132, 199, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y1 = centerY - amplitude * Math.sin(k * x - omega * t);
        if (x === 0) ctx.moveTo(x, y1);
        else ctx.lineTo(x, y1);
      }
      ctx.stroke();

      // Wave 2 (Forward with Phase Shift - Rose)
      ctx.strokeStyle = isDark ? 'rgba(244, 63, 94, 0.45)' : 'rgba(225, 29, 72, 0.45)';
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y2 = centerY - amplitude * Math.sin(k * x - omega * t + phaseRad);
        if (x === 0) ctx.moveTo(x, y2);
        else ctx.lineTo(x, y2);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Resultant Superposition Wave (Emerald)
      ctx.strokeStyle = waveResult;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const yRes =
          centerY -
          (amplitude * Math.sin(k * x - omega * t) +
            amplitude * Math.sin(k * x - omega * t + phaseRad));
        if (x === 0) ctx.moveTo(x, yRes);
        else ctx.lineTo(x, yRes);
      }
      ctx.stroke();
    }

    // Telemetry text
    ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
    ctx.font = 'bold 11px monospace';
    const waveSpeed = frequency * wavelength;
    ctx.fillText(`Wave Speed v = f · λ = ${waveSpeed.toFixed(0)} px/s`, 20, 26);
    ctx.fillText(`Period T = ${(1 / frequency).toFixed(2)} s`, 20, 42);
  }, [amplitude, frequency, isDark, phase, showParticles, waveMode, wavelength]);

  useEffect(() => {
    let lastTime = performance.now();

    const animate = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        timeRef.current += dt * speed;
      }

      renderCanvas();
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, speed, renderCanvas]);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] overflow-hidden shadow-xl transition-colors">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-[#0e172a] border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
            🌊
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              Harmonic Wave Motion & Interference Lab
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Explore traveling harmonic waves, standing wave nodes, and constructive/destructive interference
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 px-3 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            type="button"
            onClick={reset}
            className="p-1.5 px-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Canvas Display (7 cols) */}
        <div className="lg:col-span-8 flex justify-center bg-slate-50 dark:bg-[#070c18] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner">
          <canvas
            ref={canvasRef}
            width={640}
            height={280}
            className="w-full h-auto block"
          />
        </div>

        {/* Parameters & Modes (5 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Wave Mode Selector */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Simulation Mode:
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              {[
                { id: 'single', label: 'Traveling' },
                { id: 'standing', label: 'Standing' },
                { id: 'interference', label: 'Interference' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setWaveMode(m.id)}
                  className={`py-1 rounded-lg capitalize transition-all ${
                    waveMode === m.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-2.5">
            {/* Amplitude */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                <label>Amplitude A: {amplitude} px</label>
              </div>
              <input
                type="range"
                min="10"
                max="65"
                value={amplitude}
                onChange={(e) => setAmplitude(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Wavelength */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                <label>Wavelength λ: {wavelength} px</label>
              </div>
              <input
                type="range"
                min="80"
                max="280"
                value={wavelength}
                onChange={(e) => setWavelength(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Frequency */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                <label>Frequency f: {frequency.toFixed(1)} Hz</label>
              </div>
              <input
                type="range"
                min="0.4"
                max="3.0"
                step="0.1"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Phase shift (active in interference mode) */}
            {waveMode === 'interference' && (
              <div className="space-y-1 animate-in fade-in">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <label>Phase Difference Δφ: {phase}°</label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {phase === 0 ? 'Constructive' : phase === 180 ? 'Destructive Cancellation!' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={phase}
                  onChange={(e) => setPhase(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Particle Toggle */}
          {waveMode === 'single' && (
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showParticles}
                onChange={(e) => setShowParticles(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>Highlight Transverse Oscillating Particles</span>
            </label>
          )}

          {/* Mathematical Identity */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070c18] border border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1">
            <span className="font-sans font-bold text-slate-800 dark:text-slate-200 block">General Wave Equation:</span>
            <div className="text-blue-600 dark:text-blue-400 font-bold">
              {waveMode === 'single' && 'y(x, t) = A · sin(kx - ωt)'}
              {waveMode === 'standing' && 'y(x, t) = 2A · sin(kx) · cos(ωt)'}
              {waveMode === 'interference' && 'y = A sin(kx - ωt) + A sin(kx - ωt + φ)'}
            </div>
            <p className="font-sans text-[10px] text-slate-500 dark:text-slate-400">
              k = 2π/λ (wave number), ω = 2πf (angular frequency).
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
