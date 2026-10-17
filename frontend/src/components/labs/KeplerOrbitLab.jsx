import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Rocket } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function KeplerOrbitLab() {
  const { isDark } = useTheme();

  const [starMass, setStarMass] = useState(1000);
  const [showVectors, setShowVectors] = useState(true);
  const [showEqualAreas, setShowEqualAreas] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const simSpeed = 1;

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Orbit state: planet position and velocity
  const orbitRef = useRef({
    x: 0,
    y: -140,
    vx: 2.65,
    vy: 0,
    trail: [],
    sectors: [], // Equal area sectors
    lastSectorTime: 0,
  });

  const PRESETS = [
    { label: 'Circular (e = 0.0)', y: -130, vx: 2.77, vy: 0 },
    { label: 'Elliptical (e = 0.45)', y: -160, vx: 2.1, vy: 0 },
    { label: 'Halley Comet (e = 0.78)', y: -190, vx: 1.45, vy: 0 },
    { label: 'Escape Trajectory (e > 1)', y: -120, vx: 4.2, vy: 0 },
  ];

  const setPreset = (p) => {
    orbitRef.current = {
      x: 0,
      y: p.y,
      vx: p.vx,
      vy: p.vy,
      trail: [],
      sectors: [],
      lastSectorTime: 0,
    };
    setIsPlaying(true);
  };

  const reset = () => {
    setPreset(PRESETS[1]); // default to elliptical
  };

  // Instant velocity boost (burn engines)
  const applyThrust = (dv) => {
    const curSpeed = Math.hypot(orbitRef.current.vx, orbitRef.current.vy);
    if (curSpeed > 0.01) {
      orbitRef.current.vx += (orbitRef.current.vx / curSpeed) * dv;
      orbitRef.current.vy += (orbitRef.current.vy / curSpeed) * dv;
    }
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Deep space background
    ctx.fillStyle = isDark ? '#050914' : '#F8FAFC';
    ctx.fillRect(0, 0, width, height);

    // Starfield dots
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(15, 23, 42, 0.08)';
    for (let i = 25; i < width; i += 45) {
      for (let j = 20; j < height; j += 45) {
        ctx.fillRect(i, j, 1, 1);
      }
    }

    // Grid center crosses
    ctx.strokeStyle = isDark ? '#16233B' : '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.stroke();

    const { x, y, vx, vy, trail, sectors } = orbitRef.current;
    const px = cx + x;
    const py = cy + y;
    const r = Math.hypot(x, y);
    const speed = Math.hypot(vx, vy);

    // Kepler 2nd Law Equal Area Swept Wedges
    if (showEqualAreas && sectors.length >= 2) {
      for (let i = 0; i < sectors.length - 1; i += 2) {
        const pA = sectors[i];
        const pB = sectors[i + 1];
        ctx.fillStyle = isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.15)';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + pA.x, cy + pA.y);
        ctx.lineTo(cx + pB.x, cy + pB.y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(2, 132, 199, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Orbit Trail
    if (trail.length > 1) {
      ctx.strokeStyle = isDark ? 'rgba(167, 139, 250, 0.6)' : 'rgba(124, 58, 237, 0.5)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i < trail.length; i++) {
        const tx = cx + trail[i].x;
        const ty = cy + trail[i].y;
        if (i === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.stroke();
    }

    // Vector from Star to Planet (Radius vector r)
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.setLineDash([]);

    // Central Star (Glow)
    const starGlow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 32);
    starGlow.addColorStop(0, '#FDE047');
    starGlow.addColorStop(0.4, '#F59E0B');
    starGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = starGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();

    // Planet / Satellite
    ctx.fillStyle = isDark ? '#38BDF8' : '#0284C7';
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = isDark ? 8 : 4;
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Vectors: Velocity (Green) and Acceleration (Rose)
    if (showVectors) {
      // Velocity vector (v)
      const vScale = 18;
      ctx.strokeStyle = isDark ? '#34D399' : '#059669';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + vx * vScale, py + vy * vScale);
      ctx.stroke();

      // Velocity label
      ctx.fillStyle = isDark ? '#34D399' : '#059669';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('v', px + vx * vScale + 4, py + vy * vScale + 4);

      // Gravitational Acceleration vector (inward toward star)
      const aScale = 2800 / (r * r);
      const ax = (-x / r) * aScale;
      const ay = (-y / r) * aScale;

      ctx.strokeStyle = isDark ? '#F43F5E' : '#E11D48';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + ax, py + ay);
      ctx.stroke();

      ctx.fillStyle = isDark ? '#F43F5E' : '#E11D48';
      ctx.fillText('a_g', px + ax - 14, py + ay - 4);
    }

    // Telemetry HUD
    ctx.fillStyle = isDark ? '#E2E8F0' : '#1E293B';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`Distance r: ${(r * 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })} km`, 20, 26);
    ctx.fillText(`Speed |v|: ${(speed * 10).toFixed(1)} km/s`, 20, 42);

    ctx.font = '10px sans-serif';
    ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
  }, [isDark, showEqualAreas, showVectors]);

  useEffect(() => {
    let lastTime = performance.now();

    const animate = (now) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;

      if (isPlaying) {
        // Run Verlet integration substeps for stability
        const subSteps = 10;
        const subDt = (dt * 20 * simSpeed) / subSteps;
        const G_M = starMass;

        for (let s = 0; s < subSteps; s++) {
          const { x, y } = orbitRef.current;
          const r = Math.hypot(x, y);

          if (r > 15) {
            const ax = (-G_M * x) / (r * r * r);
            const ay = (-G_M * y) / (r * r * r);

            // Velocity Verlet / Euler step
            orbitRef.current.vx += ax * subDt;
            orbitRef.current.vy += ay * subDt;
            orbitRef.current.x += orbitRef.current.vx * subDt;
            orbitRef.current.y += orbitRef.current.vy * subDt;
          }
        }

        // Record trail points
        orbitRef.current.trail.push({ x: orbitRef.current.x, y: orbitRef.current.y });
        if (orbitRef.current.trail.length > 300) orbitRef.current.trail.shift();

        // Kepler's 2nd Law sector record every fixed interval
        orbitRef.current.lastSectorTime += dt * simSpeed;
        if (orbitRef.current.lastSectorTime > 0.8) {
          orbitRef.current.lastSectorTime = 0;
          if (showEqualAreas) {
            orbitRef.current.sectors.push({
              x: orbitRef.current.x,
              y: orbitRef.current.y,
              time: Date.now(),
            });
            if (orbitRef.current.sectors.length > 8) orbitRef.current.sectors.shift();
          }
        }
      }

      renderCanvas();
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, simSpeed, starMass, showEqualAreas, renderCanvas]);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] overflow-hidden shadow-xl transition-colors">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-[#0e172a] border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
            🪐
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              Kepler's Laws & Gravitational Orbit Lab
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Newtonian 2-body orbital mechanics demonstrating elliptical orbits and Kepler's 2nd Law
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
        <div className="lg:col-span-8 flex justify-center bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-inner">
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="w-full h-auto block"
          />
        </div>

        {/* Orbit Controls (5 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Orbital Presets */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Orbital Trajectories:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPreset(p)}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-left bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-400 transition-all truncate"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Thruster Burn / Rocket Boost */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Spacecraft Thrusters (Δv):</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => applyThrust(0.35)}
                className="py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>+ Prograde Burn</span>
              </button>
              <button
                type="button"
                onClick={() => applyThrust(-0.35)}
                className="py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
              >
                <Rocket className="w-3.5 h-3.5 rotate-180" />
                <span>- Retrograde Burn</span>
              </button>
            </div>
          </div>

          {/* Star Mass Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label>Central Star Mass (M): {starMass}</label>
            </div>
            <input
              type="range"
              min="500"
              max="2000"
              value={starMass}
              onChange={(e) => setStarMass(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Visual Toggles */}
          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showVectors}
                onChange={(e) => setShowVectors(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span>Velocity (v) & Force (a)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showEqualAreas}
                onChange={(e) => setShowEqualAreas(e.target.checked)}
                className="rounded accent-sky-500"
              />
              <span>Equal Area Wedges</span>
            </label>
          </div>

          {/* Mathematical Identity */}
          <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 text-[11px] space-y-1">
            <span className="font-bold text-amber-800 dark:text-amber-300 block">Kepler's Harmonic Law:</span>
            <div className="font-mono text-amber-700 dark:text-amber-300 font-bold">
              T² = (4π² / GM) · a³
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
              Orbital period squared is strictly proportional to the cube of the semi-major axis.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
