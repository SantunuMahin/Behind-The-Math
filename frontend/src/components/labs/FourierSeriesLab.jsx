import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function FourierSeriesLab() {
  const { isDark } = useTheme();

  const [waveType, setWaveType] = useState('square'); // 'square' | 'sawtooth' | 'triangle' | 'pulse'
  const [harmonics, setHarmonics] = useState(5); // 1 to 25
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showCircles, setShowCircles] = useState(true);
  const [showVectors, setShowVectors] = useState(true);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const timeRef = useRef(0);
  const wavePointsRef = useRef([]);

  const PRESETS = [
    { label: 'Square Wave (N=5)', type: 'square', n: 5 },
    { label: 'Square Wave (N=21)', type: 'square', n: 21 },
    { label: 'Sawtooth (N=10)', type: 'sawtooth', n: 10 },
    { label: 'Triangle Wave (N=7)', type: 'triangle', n: 7 },
  ];

  const reset = () => {
    timeRef.current = 0;
    wavePointsRef.current = [];
    setIsPlaying(true);
  };

  useEffect(() => {
    wavePointsRef.current = [];
  }, [waveType, harmonics]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Color definitions based on theme
    const bgGrid = isDark ? '#16233B' : '#F1F5F9';
    const axisColor = isDark ? '#334155' : '#CBD5E1';
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const circleColor = isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(2, 132, 199, 0.25)';
    const vectorColor = isDark ? '#38BDF8' : '#0284C7';
    const waveColor = isDark ? '#F43F5E' : '#E11D48';
    const connectLineColor = isDark ? 'rgba(244, 63, 94, 0.4)' : 'rgba(225, 29, 72, 0.4)';

    // Coordinate Grid
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

    // Midline & Oscilloscope divider
    const centerY = height / 2;
    const epicycleOriginX = 140;
    const waveStartX = 300;

    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(waveStartX, 20);
    ctx.lineTo(waveStartX, height - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Compute Epicycles
    let x = epicycleOriginX;
    let y = centerY;
    const t = timeRef.current;
    const baseRadius = 60;

    for (let i = 0; i < harmonics; i++) {
      const prevX = x;
      const prevY = y;
      let n = 0;
      let radius = 0;

      if (waveType === 'square') {
        n = i * 2 + 1; // 1, 3, 5, 7, ...
        radius = baseRadius * (4 / (n * Math.PI));
      } else if (waveType === 'sawtooth') {
        n = i + 1; // 1, 2, 3, 4, ...
        radius = baseRadius * (2 / (n * Math.PI)) * (n % 2 === 0 ? -1 : 1);
      } else if (waveType === 'triangle') {
        n = i * 2 + 1; // 1, 3, 5, 7, ...
        radius = baseRadius * (8 / ((n * n) * (Math.PI * Math.PI))) * (i % 2 === 0 ? 1 : -1);
      } else if (waveType === 'pulse') {
        n = i + 1;
        radius = baseRadius * (1.5 / Math.sqrt(n));
      }

      x += radius * Math.cos(n * t);
      y += radius * Math.sin(n * t);

      // Draw Epicycle Circle
      if (showCircles) {
        ctx.strokeStyle = circleColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(prevX, prevY, Math.abs(radius), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Radius Vector
      if (showVectors) {
        ctx.strokeStyle = vectorColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.fillStyle = vectorColor;
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Add current point to wave trajectory
    if (isPlaying) {
      wavePointsRef.current.unshift(y);
      if (wavePointsRef.current.length > width - waveStartX) {
        wavePointsRef.current.pop();
      }
    }

    // Line connecting the tip of final epicycle to the rolling wave
    ctx.strokeStyle = connectLineColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(waveStartX, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Final epicycle tip dot
    ctx.fillStyle = waveColor;
    ctx.shadowColor = waveColor;
    ctx.shadowBlur = isDark ? 8 : 4;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Render rolling synthesized waveform
    if (wavePointsRef.current.length > 1) {
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < wavePointsRef.current.length; i++) {
        const wx = waveStartX + i;
        const wy = wavePointsRef.current[i];
        if (i === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
    }

    // Labels
    ctx.fillStyle = textColor;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Phasor Epicycles (Frequency Domain)', 20, 30);
    ctx.fillText('Synthesized Wave (Time Domain)', waveStartX + 15, 30);

    ctx.font = '10px monospace';
    ctx.fillText(`Harmonics N = ${harmonics}`, 20, height - 15);
    ctx.fillText(`Waveform: ${waveType.toUpperCase()}`, waveStartX + 15, height - 15);
  }, [harmonics, isDark, isPlaying, showCircles, showVectors, waveType]);

  useEffect(() => {
    let lastTime = performance.now();

    const animate = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        timeRef.current += dt * speed * 1.5;
      }

      renderCanvas();
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, speed, renderCanvas]);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] overflow-hidden shadow-xl transition-colors">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-[#0e172a] border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
            🌀
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              Fourier Series & Epicycle Synthesizer
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Watch rotating circular harmonics synthesize square, sawtooth, and triangle waves
            </p>
          </div>
        </div>

        {/* Action Buttons */}
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

      {/* Main Content Layout */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Canvas Oscilloscope Viewport (7 cols) */}
        <div className="lg:col-span-8 flex justify-center bg-slate-50 dark:bg-[#070c18] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-inner">
          <canvas
            ref={canvasRef}
            width={640}
            height={320}
            className="w-full h-auto block"
          />
        </div>

        {/* Controls & Math Insights (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Presets */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Quick Presets:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setWaveType(p.type);
                    setHarmonics(p.n);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-left transition-all border ${
                    waveType === p.type && harmonics === p.n
                      ? 'bg-sky-500/15 border-sky-400 text-sky-700 dark:text-sky-300'
                      : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Waveform Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
              <span>Waveform Function:</span>
              <span className="capitalize font-mono text-sky-600 dark:text-sky-400 font-bold">{waveType}</span>
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              {['square', 'sawtooth', 'triangle', 'pulse'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setWaveType(type)}
                  className={`py-1 rounded-lg font-bold capitalize transition-all ${
                    waveType === type
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Harmonics */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label>Harmonic Order N: {harmonics}</label>
              <span className="text-[10px] text-slate-400">{harmonics === 1 ? 'Fundamental' : `${harmonics} sine components`}</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              value={harmonics}
              onChange={(e) => setHarmonics(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Speed slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label>Animation Speed: {speed.toFixed(1)}x</label>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Visual Toggles */}
          <div className="flex items-center gap-3 pt-1 text-xs text-slate-600 dark:text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showCircles}
                onChange={(e) => setShowCircles(e.target.checked)}
                className="rounded accent-sky-500"
              />
              <span>Epicycle Circles</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showVectors}
                onChange={(e) => setShowVectors(e.target.checked)}
                className="rounded accent-sky-500"
              />
              <span>Phasor Vectors</span>
            </label>
          </div>

          {/* Mathematical Formula Identity */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070c18] border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Fourier Synthesis Equation:</span>
            <div className="font-mono text-sky-600 dark:text-sky-300 font-bold">
              {waveType === 'square' && 'f(t) = (4/π) ∑ [sin((2k-1)ωt) / (2k-1)]'}
              {waveType === 'sawtooth' && 'f(t) = (2/π) ∑ [(-1)^(k+1) sin(kωt) / k]'}
              {waveType === 'triangle' && 'f(t) = (8/π²) ∑ [(-1)^k sin((2k+1)ωt) / (2k+1)²]'}
              {waveType === 'pulse' && 'f(t) = ∑ [A_n cos(nωt) + B_n sin(nωt)]'}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px]">
              Gibbs phenomenon overshoot is observable near sharp step discontinuities as N increases.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
