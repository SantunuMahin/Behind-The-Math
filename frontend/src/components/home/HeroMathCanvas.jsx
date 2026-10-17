import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Sliders, Sparkles, Compass, TrendingUp, Layers } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function HeroMathCanvas() {
  const { theme } = useTheme();
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Active Tab: 'unit-circle' | 'parabola' | 'derivative'
  const [activeTab, setActiveTab] = useState('unit-circle');
  const [isPlaying, setIsPlaying] = useState(true);

  // Mode 1: Unit Circle State
  const [angleDeg, setAngleDeg] = useState(45);

  // Mode 2: Parabola State (y = ax^2 + bx + c)
  const [paramA, setParamA] = useState(1);
  const [paramB, setParamB] = useState(-2);
  const [paramC, setParamC] = useState(-1);

  // Mode 3: Derivative Secant State (f(x) = x^2 / 2)
  const [pointX, setPointX] = useState(1.2);
  const [stepH, setStepH] = useState(0.8);

  const isDark = theme === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  // Main Draw Function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Colors according to theme
    const bg = isDark ? '#09090b' : '#fafafa';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
    const axisColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
    const textColor = isDark ? '#a1a1aa' : '#71717a';
    const accentCyan = '#06b6d4';
    const accentEmerald = '#10b981';
    const accentAmber = '#f59e0b';
    const accentRose = '#f43f5e';
    const accentViolet = '#8b5cf6';

    ctx.clearRect(0, 0, width, height);

    // Background fill
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    const gridSize = 24;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // ==========================================
    // TAB 1: UNIT CIRCLE & SYNCHRONIZED SINE WAVE
    // ==========================================
    if (activeTab === 'unit-circle') {
      const circleCenterX = width * 0.28;
      const circleCenterY = height * 0.52;
      const radius = Math.min(width * 0.2, 75);

      // Circle Axes
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(circleCenterX - radius - 18, circleCenterY);
      ctx.lineTo(circleCenterX + radius + 18, circleCenterY);
      ctx.moveTo(circleCenterX, circleCenterY - radius - 18);
      ctx.lineTo(circleCenterX, circleCenterY + radius + 18);
      ctx.stroke();

      // The Unit Circle
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(circleCenterX, circleCenterY, radius, 0, Math.PI * 2);
      ctx.stroke();

      const rad = (angleDeg * Math.PI) / 180;
      const px = circleCenterX + radius * Math.cos(rad);
      const py = circleCenterY - radius * Math.sin(rad);

      // Cosine projection (horizontal green)
      ctx.strokeStyle = accentEmerald;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(circleCenterX, circleCenterY);
      ctx.lineTo(px, circleCenterY);
      ctx.stroke();

      // Sine projection (vertical cyan)
      ctx.strokeStyle = accentCyan;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(px, circleCenterY);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Rotating Radius Vector
      ctx.strokeStyle = isDark ? '#ffffff' : '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(circleCenterX, circleCenterY);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Angle Arc
      ctx.strokeStyle = accentAmber;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(circleCenterX, circleCenterY, 22, -rad, 0, false);
      ctx.stroke();

      // Rotating Point Dot
      ctx.fillStyle = isDark ? '#ffffff' : '#000000';
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // ------------------------------------------
      // Sine Wave on Right Side
      // ------------------------------------------
      const waveStartX = width * 0.58;
      const waveEndX = width - 16;
      const waveWidth = waveEndX - waveStartX;

      // Wave Axis
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(waveStartX, circleCenterY);
      ctx.lineTo(waveEndX, circleCenterY);
      ctx.stroke();

      // Connecting guideline from circle point to wave
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = isDark ? 'rgba(6, 182, 212, 0.5)' : 'rgba(6, 182, 212, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(waveStartX, py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Sine Wave
      ctx.strokeStyle = accentCyan;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const waveCycles = 1.5;
      for (let x = 0; x <= waveWidth; x += 2) {
        const theta = rad - (x / waveWidth) * (waveCycles * 2 * Math.PI);
        const y = circleCenterY - radius * Math.sin(theta);
        if (x === 0) ctx.moveTo(waveStartX + x, y);
        else ctx.lineTo(waveStartX + x, y);
      }
      ctx.stroke();

      // Wavefront dot
      ctx.fillStyle = accentCyan;
      ctx.beginPath();
      ctx.arc(waveStartX, py, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Text labels
      ctx.font = '10px Inter, monospace';
      ctx.fillStyle = textColor;
      ctx.fillText('θ = ' + Math.round(angleDeg) + '°', circleCenterX - 18, circleCenterY - radius - 24);
      ctx.fillText('sin(θ) Waveform →', waveStartX, circleCenterY - radius - 16);
    }

    // ==========================================
    // TAB 2: PARABOLA & DISCRIMINANT (y = ax² + bx + c)
    // ==========================================
    else if (activeTab === 'parabola') {
      const originX = width * 0.5;
      const originY = height * 0.55;
      const scaleX = width * 0.08;
      const scaleY = height * 0.08;

      // Axes
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(20, originY);
      ctx.lineTo(width - 20, originY);
      ctx.moveTo(originX, 15);
      ctx.lineTo(originX, height - 15);
      ctx.stroke();

      // Draw Parabola Curve
      ctx.strokeStyle = isDark ? '#ffffff' : '#09090b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      let started = false;
      const step = 0.05;
      for (let xMath = -5; xMath <= 5; xMath += step) {
        const yMath = paramA * xMath * xMath + paramB * xMath + paramC;
        const px = originX + xMath * scaleX;
        const py = originY - yMath * scaleY;

        if (py >= -20 && py <= height + 20) {
          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else {
            ctx.lineTo(px, py);
          }
        }
      }
      ctx.stroke();

      // Vertex calculation: h = -b / (2a), k = c - b^2 / (4a)
      if (Math.abs(paramA) > 0.001) {
        const h = -paramB / (2 * paramA);
        const k = paramA * h * h + paramB * h + paramC;
        const vx = originX + h * scaleX;
        const vy = originY - k * scaleY;

        // Vertex Dot
        ctx.fillStyle = accentViolet;
        ctx.beginPath();
        ctx.arc(vx, vy, 5, 0, Math.PI * 2);
        ctx.fill();

        // Vertex label
        ctx.font = '10px Inter, monospace';
        ctx.fillStyle = accentViolet;
        ctx.fillText(`Vertex (${h.toFixed(1)}, ${k.toFixed(1)})`, vx + 8, vy - 6);
      }

      // Roots calculation: Δ = b² - 4ac
      const disc = paramB * paramB - 4 * paramA * paramC;
      if (disc >= 0 && Math.abs(paramA) > 0.001) {
        const r1 = (-paramB - Math.sqrt(disc)) / (2 * paramA);
        const r2 = (-paramB + Math.sqrt(disc)) / (2 * paramA);

        [r1, r2].forEach((r) => {
          const rx = originX + r * scaleX;
          const ry = originY;
          ctx.fillStyle = accentEmerald;
          ctx.beginPath();
          ctx.arc(rx, ry, 5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Discriminant Badge overlay in corner
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = textColor;
      ctx.fillText(`y = ${paramA >= 0 ? '' : '-'}${Math.abs(paramA)}x² ${paramB >= 0 ? '+ ' : '- '}${Math.abs(paramB)}x ${paramC >= 0 ? '+ ' : '- '}${Math.abs(paramC)}`, 20, 26);
    }

    // ==========================================
    // TAB 3: DERIVATIVE SECANT-TO-TANGENT LIMIT
    // ==========================================
    else if (activeTab === 'derivative') {
      const originX = width * 0.28;
      const originY = height * 0.82;
      const scaleX = width * 0.14;
      const scaleY = height * 0.16;

      // Axes
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(20, originY);
      ctx.lineTo(width - 20, originY);
      ctx.moveTo(originX, 15);
      ctx.lineTo(originX, height - 15);
      ctx.stroke();

      // Curve: f(x) = x^2 / 2
      const f = (x) => (x * x) / 2;
      const df = (x) => x; // Derivative f'(x) = x

      ctx.strokeStyle = isDark ? '#ffffff' : '#09090b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      let started = false;
      for (let xMath = -0.5; xMath <= 3.8; xMath += 0.05) {
        const yMath = f(xMath);
        const px = originX + xMath * scaleX;
        const py = originY - yMath * scaleY;
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      // Point P (x0, f(x0))
      const x0 = pointX;
      const y0 = f(x0);
      const px0 = originX + x0 * scaleX;
      const py0 = originY - y0 * scaleY;

      // Point Q (x0 + h, f(x0 + h))
      const x1 = x0 + stepH;
      const y1 = f(x1);
      const px1 = originX + x1 * scaleX;
      const py1 = originY - y1 * scaleY;

      // Secant slope: m_sec = (y1 - y0) / (x1 - x0)
      const mSec = (y1 - y0) / (x1 - x0);
      // True tangent slope: m_tan = df(x0)
      const mTan = df(x0);

      // Draw True Tangent Line (solid emerald)
      ctx.strokeStyle = accentEmerald;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const tanSpan = 1.8;
      const txStart = x0 - tanSpan;
      const tyStart = y0 - mTan * tanSpan;
      const txEnd = x0 + tanSpan;
      const tyEnd = y0 + mTan * tanSpan;
      ctx.moveTo(originX + txStart * scaleX, originY - tyStart * scaleY);
      ctx.lineTo(originX + txEnd * scaleX, originY - tyEnd * scaleY);
      ctx.stroke();

      // Draw Secant Line (dashed amber)
      if (Math.abs(stepH) > 0.05) {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = accentAmber;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const secSpan = 1.8;
        const sxStart = x0 - secSpan;
        const syStart = y0 - mSec * secSpan;
        const sxEnd = x0 + secSpan + stepH;
        const syEnd = y0 + mSec * (secSpan + stepH);
        ctx.moveTo(originX + sxStart * scaleX, originY - syStart * scaleY);
        ctx.lineTo(originX + sxEnd * scaleX, originY - syEnd * scaleY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Point P Dot
      ctx.fillStyle = accentEmerald;
      ctx.beginPath();
      ctx.arc(px0, py0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Point Q Dot
      if (Math.abs(stepH) > 0.05) {
        ctx.fillStyle = accentAmber;
        ctx.beginPath();
        ctx.arc(px1, py1, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Labels
      ctx.font = '10px Inter, monospace';
      ctx.fillStyle = accentEmerald;
      ctx.fillText(`P (${x0.toFixed(1)}, ${y0.toFixed(1)})`, px0 - 20, py0 - 10);
      if (Math.abs(stepH) > 0.05) {
        ctx.fillStyle = accentAmber;
        ctx.fillText(`Q (x+h)`, px1 + 6, py1 - 6);
      }
    }
  }, [activeTab, angleDeg, paramA, paramB, paramC, pointX, stepH, isDark]);

  // Animation Loop (smooth rotation / oscillation when playing)
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying) {
        if (activeTab === 'unit-circle') {
          setAngleDeg((prev) => (prev + dt * 45) % 360);
        } else if (activeTab === 'parabola') {
          // Subtle gentle sway of linear term
          setParamB((prev) => -2 + Math.sin(time * 0.001) * 1.5);
        } else if (activeTab === 'derivative') {
          // Shrink and expand h towards 0
          setStepH((prev) => {
            const h = 0.5 + 0.45 * Math.sin(time * 0.0015);
            return Math.max(0.05, h);
          });
        }
      }

      draw();
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, activeTab, draw]);

  // Resize canvas to match container width
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      draw();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  // Derived math calculations for display
  const rad = (angleDeg * Math.PI) / 180;
  const sinVal = Math.sin(rad);
  const cosVal = Math.cos(rad);
  const discVal = paramB * paramB - 4 * paramA * paramC;
  const secantSlope = ((pointX + stepH) ** 2 / 2 - pointX ** 2 / 2) / stepH;
  const tangentSlope = pointX;

  return (
    <div className="w-full rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-xl overflow-hidden flex flex-col">
      {/* Top Controls Header */}
      <div className="p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('unit-circle')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'unit-circle'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Unit Circle</span>
          </button>

          <button
            onClick={() => setActiveTab('parabola')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'parabola'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Parabola</span>
          </button>

          <button
            onClick={() => setActiveTab('derivative')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'derivative'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Derivative Limit</span>
          </button>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause auto-animation' : 'Resume auto-animation'}
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="hidden sm:inline">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
              <span className="hidden sm:inline">Play</span>
            </>
          )}
        </button>
      </div>

      {/* Live Canvas Area */}
      <div className="relative w-full h-[230px] sm:h-[260px] bg-zinc-50 dark:bg-zinc-950">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Micro Status Badge */}
        <div className="absolute top-2.5 right-2.5 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 dark:bg-white/10 text-white text-[10px] font-mono backdrop-blur-xs border border-white/10">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>60 FPS Live Canvas</span>
          </span>
        </div>
      </div>

      {/* Interactive Controls & Live Formula Readouts */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
        {/* TAB 1 CONTROLS */}
        {activeTab === 'unit-circle' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <span>Angle θ:</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400">{Math.round(angleDeg)}°</span>
                <span className="text-[10px] text-zinc-400 font-mono">({rad.toFixed(2)} rad)</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                sin²θ + cos²θ = <strong className="text-black dark:text-white">{(sinVal ** 2 + cosVal ** 2).toFixed(3)}</strong>
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="360"
              value={angleDeg}
              onChange={(e) => {
                setIsPlaying(false);
                setAngleDeg(parseFloat(e.target.value));
              }}
              className="w-full accent-cyan-500 cursor-pointer"
            />

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="block text-[10px] text-zinc-400 uppercase font-bold tracking-wider">sin(θ)</span>
                <span className="font-mono text-xs font-semibold text-cyan-600 dark:text-cyan-400">{sinVal.toFixed(3)}</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="block text-[10px] text-zinc-400 uppercase font-bold tracking-wider">cos(θ)</span>
                <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">{cosVal.toFixed(3)}</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="block text-[10px] text-zinc-400 uppercase font-bold tracking-wider">tan(θ)</span>
                <span className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {Math.abs(cosVal) < 0.001 ? '∞' : Math.tan(rad).toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 CONTROLS */}
        {activeTab === 'parabola' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Discriminant Δ = <strong className="font-mono text-black dark:text-white">{discVal.toFixed(1)}</strong>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  discVal > 0.05
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : discVal < -0.05
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {discVal > 0.05 ? '2 Real Roots' : discVal < -0.05 ? 'Complex Roots' : '1 Double Root'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1 font-mono">
                  <span>a: {paramA.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.2"
                  value={paramA}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setParamA(parseFloat(e.target.value) || 0.1);
                  }}
                  className="w-full accent-black dark:accent-white cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-mono">
                  <span>b: {paramB.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  step="0.2"
                  value={paramB}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setParamB(parseFloat(e.target.value));
                  }}
                  className="w-full accent-violet-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-mono">
                  <span>c: {paramC.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  step="0.2"
                  value={paramC}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setParamC(parseFloat(e.target.value));
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3 CONTROLS */}
        {activeTab === 'derivative' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <span>Difference Interval h:</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">→ {stepH.toFixed(2)}</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                True f'(x) = <strong className="text-emerald-600 dark:text-emerald-400">{tangentSlope.toFixed(2)}</strong>
              </span>
            </div>

            <input
              type="range"
              min="0.05"
              max="1.5"
              step="0.02"
              value={stepH}
              onChange={(e) => {
                setIsPlaying(false);
                setStepH(parseFloat(e.target.value));
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />

            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-zinc-500 dark:text-zinc-400">Secant Slope:</span>
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{secantSlope.toFixed(3)}</span>
              </div>
              <span className="text-zinc-400 font-mono">→</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-zinc-500 dark:text-zinc-400">Limit f'(x):</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{tangentSlope.toFixed(3)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
