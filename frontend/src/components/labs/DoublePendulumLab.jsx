import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function DoublePendulumLab() {
  const { isDark } = useTheme();

  // Pendulum Parameters
  const [l1, setL1] = useState(100); // Length rod 1
  const [l2, setL2] = useState(100); // Length rod 2
  const m1 = 10; // Mass 1
  const [m2, setM2] = useState(10); // Mass 2
  const gravity = 9.8;
  const [isPlaying, setIsPlaying] = useState(true);
  const [showShadow, setShowShadow] = useState(true); // Butterfly effect comparison

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // State: [theta1, theta2, omega1, omega2]
  const stateRef = useRef({
    p1: { t1: Math.PI / 2, t2: Math.PI / 2, w1: 0, w2: 0 },
    p2: { t1: Math.PI / 2 + 0.001, t2: Math.PI / 2, w1: 0, w2: 0 }, // 0.001 rad difference
    trail1: [],
    trail2: [],
  });

  const PRESETS = [
    { label: 'Right Angles (Classic Chaos)', t1: Math.PI / 2, t2: Math.PI / 2 },
    { label: 'Inverted (Extreme Energy)', t1: Math.PI * 0.99, t2: Math.PI * 0.99 },
    { label: 'Small Angle (Harmonic)', t1: 0.2, t2: 0.2 },
    { label: 'Opposite Initial (Twist)', t1: Math.PI * 0.7, t2: -Math.PI * 0.7 },
  ];

  const resetToAngles = (t1, t2) => {
    stateRef.current = {
      p1: { t1, t2, w1: 0, w2: 0 },
      p2: { t1: t1 + 0.001, t2, w1: 0, w2: 0 },
      trail1: [],
      trail2: [],
    };
    setIsPlaying(true);
  };

  const reset = () => {
    resetToAngles(Math.PI / 2, Math.PI / 2);
  };

  // Derivatives calculation for double pendulum
  const derivatives = (t1, t2, w1, w2, l1Val, l2Val, m1Val, m2Val, gVal) => {
    const delta = t1 - t2;
    const mu = 1 + m1Val / m2Val;

    const num1 = gVal * (Math.sin(t2) * Math.cos(delta) - mu * Math.sin(t1)) -
      (l2Val * w2 * w2 + l1Val * w1 * w1 * Math.cos(delta)) * Math.sin(delta);
    const den1 = l1Val * (mu - Math.cos(delta) * Math.cos(delta));
    const alpha1 = num1 / den1;

    const num2 = gVal * mu * (Math.sin(t1) * Math.cos(delta) - Math.sin(t2)) +
      (mu * l1Val * w1 * w1 + l2Val * w2 * w2 * Math.cos(delta)) * Math.sin(delta);
    const den2 = l2Val * (mu - Math.cos(delta) * Math.cos(delta));
    const alpha2 = num2 / den2;

    return [w1, w2, alpha1, alpha2];
  };

  // 4th Order Runge-Kutta numerical integration
  const rk4Step = (p, dt, l1Val, l2Val, m1Val, m2Val, gVal) => {
    const { t1, t2, w1, w2 } = p;

    const [k1_t1, k1_t2, k1_w1, k1_w2] = derivatives(t1, t2, w1, w2, l1Val, l2Val, m1Val, m2Val, gVal);

    const [k2_t1, k2_t2, k2_w1, k2_w2] = derivatives(
      t1 + 0.5 * dt * k1_t1,
      t2 + 0.5 * dt * k1_t2,
      w1 + 0.5 * dt * k1_w1,
      w2 + 0.5 * dt * k1_w2,
      l1Val, l2Val, m1Val, m2Val, gVal
    );

    const [k3_t1, k3_t2, k3_w1, k3_w2] = derivatives(
      t1 + 0.5 * dt * k2_t1,
      t2 + 0.5 * dt * k2_t2,
      w1 + 0.5 * dt * k2_w1,
      w2 + 0.5 * dt * k2_w2,
      l1Val, l2Val, m1Val, m2Val, gVal
    );

    const [k4_t1, k4_t2, k4_w1, k4_w2] = derivatives(
      t1 + dt * k3_t1,
      t2 + dt * k3_t2,
      w1 + dt * k3_w1,
      w2 + dt * k3_w2,
      l1Val, l2Val, m1Val, m2Val, gVal
    );

    return {
      t1: t1 + (dt / 6) * (k1_t1 + 2 * k2_t1 + 2 * k3_t1 + k4_t1),
      t2: t2 + (dt / 6) * (k1_t2 + 2 * k2_t2 + 2 * k3_t2 + k4_t2),
      w1: (w1 + (dt / 6) * (k1_w1 + 2 * k2_w1 + 2 * k3_w1 + k4_w1)) * 0.9999, // negligible air damping
      w2: (w2 + (dt / 6) * (k1_w2 + 2 * k2_w2 + 2 * k3_w2 + k4_w2)) * 0.9999,
    };
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const originX = width / 2;
    const originY = height * 0.38;

    ctx.clearRect(0, 0, width, height);

    // Grid & Theme colors
    const bgGrid = isDark ? '#16233B' : '#F1F5F9';
    const rodColor = isDark ? '#94A3B8' : '#475569';
    const bob1Color = isDark ? '#38BDF8' : '#0284C7';
    const bob2Color = isDark ? '#F43F5E' : '#E11D48';
    const shadowColor = isDark ? '#34D399' : '#059669';

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

    // Pivot mount
    ctx.fillStyle = isDark ? '#334155' : '#94A3B8';
    ctx.beginPath();
    ctx.arc(originX, originY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Coordinates for primary pendulum (P1)
    const { p1, p2 } = stateRef.current;
    const x1 = originX + l1 * Math.sin(p1.t1);
    const y1 = originY + l1 * Math.cos(p1.t1);
    const x2 = x1 + l2 * Math.sin(p1.t2);
    const y2 = y1 + l2 * Math.cos(p1.t2);

    // Save trail point
    if (isPlaying) {
      stateRef.current.trail1.push({ x: x2, y: y2 });
      if (stateRef.current.trail1.length > 250) stateRef.current.trail1.shift();
    }

    // Coordinates for shadow pendulum (P2 - Butterfly effect)
    let s_x1 = 0, s_y1 = 0, s_x2 = 0, s_y2 = 0;
    if (showShadow) {
      s_x1 = originX + l1 * Math.sin(p2.t1);
      s_y1 = originY + l1 * Math.cos(p2.t1);
      s_x2 = s_x1 + l2 * Math.sin(p2.t2);
      s_y2 = s_y1 + l2 * Math.cos(p2.t2);

      if (isPlaying) {
        stateRef.current.trail2.push({ x: s_x2, y: s_y2 });
        if (stateRef.current.trail2.length > 250) stateRef.current.trail2.shift();
      }
    }

    // Draw Shadow Trail & Pendulum (Emerald)
    if (showShadow) {
      if (stateRef.current.trail2.length > 1) {
        ctx.strokeStyle = isDark ? 'rgba(52, 211, 153, 0.4)' : 'rgba(5, 150, 105, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i < stateRef.current.trail2.length; i++) {
          const pt = stateRef.current.trail2[i];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      ctx.strokeStyle = isDark ? 'rgba(52, 211, 153, 0.35)' : 'rgba(5, 150, 105, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(s_x1, s_y1);
      ctx.lineTo(s_x2, s_y2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = shadowColor;
      ctx.beginPath();
      ctx.arc(s_x2, s_y2, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Primary Trail (Glowing Rose)
    if (stateRef.current.trail1.length > 1) {
      ctx.strokeStyle = isDark ? 'rgba(244, 63, 94, 0.7)' : 'rgba(225, 29, 72, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < stateRef.current.trail1.length; i++) {
        const pt = stateRef.current.trail1[i];
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }

    // Draw Primary Rods
    ctx.strokeStyle = rodColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Bob 1
    ctx.fillStyle = bob1Color;
    ctx.beginPath();
    ctx.arc(x1, y1, Math.max(6, Math.sqrt(m1) * 2.2), 0, Math.PI * 2);
    ctx.fill();

    // Bob 2 (Chaotic Attractor)
    ctx.fillStyle = bob2Color;
    ctx.shadowColor = bob2Color;
    ctx.shadowBlur = isDark ? 10 : 4;
    ctx.beginPath();
    ctx.arc(x2, y2, Math.max(7, Math.sqrt(m2) * 2.4), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Divergence Distance Readout
    if (showShadow) {
      const divergenceDist = Math.hypot(x2 - s_x2, y2 - s_y2);
      ctx.fillStyle = divergenceDist > 50 ? (isDark ? '#F43F5E' : '#E11D48') : (isDark ? '#34D399' : '#059669');
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`Trajectory Divergence: Δd = ${divergenceDist.toFixed(1)} px`, 20, 30);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
      ctx.fillText('Initial Angle Difference: Δθ = 0.001° (Butterfly Effect)', 20, 46);
    }
  }, [isDark, isPlaying, l1, l2, m1, m2, showShadow]);

  useEffect(() => {
    let lastTime = performance.now();

    const animate = (now) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;

      if (isPlaying) {
        // Run multiple substeps for high numerical accuracy
        const subSteps = 8;
        const subDt = (dt * 1.5) / subSteps;
        for (let step = 0; step < subSteps; step++) {
          stateRef.current.p1 = rk4Step(stateRef.current.p1, subDt, l1, l2, m1, m2, gravity);
          if (showShadow) {
            stateRef.current.p2 = rk4Step(stateRef.current.p2, subDt, l1, l2, m1, m2, gravity);
          }
        }
      }

      renderCanvas();
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, l1, l2, m1, m2, gravity, showShadow, renderCanvas]);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] overflow-hidden shadow-xl transition-colors">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-[#0e172a] border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
            ⚡
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              Double Pendulum & Chaos Theory Lab
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Lagrangian dynamics solved via RK4 showing deterministic chaos and the Butterfly Effect
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

      {/* Main Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Canvas Display (7 cols) */}
        <div className="lg:col-span-8 flex justify-center bg-slate-50 dark:bg-[#070c18] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-inner">
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="w-full h-auto block"
          />
        </div>

        {/* Parameters & Presets (5 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Chaos Presets:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => resetToAngles(p.t1, p.t2)}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-left bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-400 transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rod Lengths Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label>Rod Lengths: L₁={l1}px, L₂={l2}px</label>
            </div>
            <input
              type="range"
              min="60"
              max="140"
              value={l1}
              onChange={(e) => {
                setL1(Number(e.target.value));
                setL2(Number(e.target.value));
              }}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Masses Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label>Bob Mass Ratio m₂/m₁: {(m2 / m1).toFixed(1)}</label>
            </div>
            <input
              type="range"
              min="2"
              max="25"
              value={m2}
              onChange={(e) => setM2(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Butterfly Effect Comparison Toggle */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070c18] border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Butterfly Effect Shadow
              </span>
              <input
                type="checkbox"
                checked={showShadow}
                onChange={(e) => setShowShadow(e.target.checked)}
                className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
              />
            </label>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Spawns an identical green pendulum with an infinitesimally small angle difference (0.001°). Watch them start aligned and rapidly explode into totally different orbits.
            </p>
          </div>

          {/* Mathematical Identity */}
          <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-[11px] space-y-1">
            <span className="font-bold text-rose-800 dark:text-rose-300 block">Lyapunov Exponent & Chaos:</span>
            <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
              Sensitivity to initial conditions: separation Δ(t) ≈ Δ₀ e^(λt) where λ &gt; 0 is the positive Lyapunov exponent.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
