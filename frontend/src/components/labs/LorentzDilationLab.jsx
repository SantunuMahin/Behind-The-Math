import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import MathView from '../common/MathView';

export default function LorentzDilationLab() {
  const { isDark } = useTheme();
  const [beta, setBeta] = useState(0.80); // v/c
  const [isPlaying, setIsPlaying] = useState(true);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const timeRef = useRef(0);

  // Relativistic calculations
  const gamma = 1 / Math.sqrt(Math.max(0.001, 1 - beta * beta));

  const PRESETS = [
    { label: 'Newtonian (0.0c)', val: 0.0 },
    { label: 'Near Earth (0.5c)', val: 0.5 },
    { label: 'Relativistic (0.8c)', val: 0.8 },
    { label: 'CERN Beam (0.95c)', val: 0.95 },
    { label: 'Ultra (0.99c)', val: 0.99 },
  ];

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = isDark ? '#060B17' : '#0F172A';
    ctx.fillRect(0, 0, width, height);

    // Subtle starfield dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let x = 15; x < width; x += 40) {
      for (let y = 15; y < height; y += 40) {
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Mid divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // -----------------------------------------------------------------
    // TOP FRAME: Rest Frame (Proper Time Delta t_0)
    // -----------------------------------------------------------------
    const topCenterY = height / 4;
    const mirrorDist = 60; // L
    const clockX = 140;

    // Mirrors
    ctx.fillStyle = '#64748B';
    ctx.fillRect(clockX - 35, topCenterY - mirrorDist - 4, 70, 8); // Top mirror
    ctx.fillRect(clockX - 35, topCenterY + mirrorDist - 4, 70, 8); // Bottom mirror

    // Light bounce phase
    // T_0 period is normalized to 2 seconds
    const phase0 = (timeRef.current % 2) / 2; // 0 to 1
    const photon0Y =
      phase0 < 0.5
        ? (topCenterY + mirrorDist) - (phase0 * 2) * (2 * mirrorDist)
        : (topCenterY - mirrorDist) + ((phase0 - 0.5) * 2) * (2 * mirrorDist);

    // Vertical guide line
    ctx.strokeStyle = 'rgba(230, 57, 70, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(clockX, topCenterY - mirrorDist);
    ctx.lineTo(clockX, topCenterY + mirrorDist);
    ctx.stroke();
    ctx.setLineDash([]);

    // Photon 0
    ctx.fillStyle = '#E63946';
    ctx.shadowColor = '#E63946';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(clockX, photon0Y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Label Frame 1
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('Frame S₀: Observer at Rest (Proper Time)', 30, 30);
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Photon travels vertical distance 2L at speed c', 30, 48);

    // -----------------------------------------------------------------
    // BOTTOM FRAME: Moving Frame at speed v = beta * c
    // -----------------------------------------------------------------
    const botCenterY = (3 * height) / 4;

    // Moving clock horizontal travel
    // Period in moving frame is dilated by gamma!
    const dilatedPeriod = 2 * gamma;
    const phaseM = (timeRef.current % dilatedPeriod) / dilatedPeriod;

    // Zigzag travel width
    const travelWidth = width * 0.7;
    const startX = 60;
    const currentClockX = startX + phaseM * travelWidth;

    // Draw previous path trace (zigzag)
    ctx.strokeStyle = 'rgba(42, 157, 143, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, botCenterY + mirrorDist);
    ctx.lineTo(startX + travelWidth * 0.5, botCenterY - mirrorDist);
    ctx.lineTo(startX + travelWidth, botCenterY + mirrorDist);
    ctx.stroke();

    // Moving mirrors
    ctx.fillStyle = '#457B9D';
    ctx.fillRect(currentClockX - 30, botCenterY - mirrorDist - 4, 60, 8);
    ctx.fillRect(currentClockX - 30, botCenterY + mirrorDist - 4, 60, 8);

    // Moving photon position along the diagonal hypotenuse
    const photonMY =
      phaseM < 0.5
        ? (botCenterY + mirrorDist) - (phaseM * 2) * (2 * mirrorDist)
        : (botCenterY - mirrorDist) + ((phaseM - 0.5) * 2) * (2 * mirrorDist);

    // Moving Photon
    ctx.fillStyle = '#2A9D8F';
    ctx.shadowColor = '#2A9D8F';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(currentClockX, photonMY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Velocity arrow
    if (beta > 0.05) {
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentClockX + 35, botCenterY);
      ctx.lineTo(currentClockX + 65, botCenterY);
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(currentClockX + 70, botCenterY);
      ctx.lineTo(currentClockX + 60, botCenterY - 4);
      ctx.lineTo(currentClockX + 60, botCenterY + 4);
      ctx.fill();

      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`v = ${beta.toFixed(2)}c`, currentClockX + 35, botCenterY - 8);
    }

    // Label Frame 2
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(`Frame S: Moving at v = ${beta.toFixed(2)}c (Dilated Time)`, 30, height / 2 + 30);
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Photon must travel diagonal hypotenuse 2D > 2L at invariant speed c', 30, height / 2 + 48);

    // -----------------------------------------------------------------
    // INSET GRAPH: Gamma(beta) curve
    // -----------------------------------------------------------------
    const graphW = 180;
    const graphH = 90;
    const graphX = width - graphW - 25;
    const graphY = 30;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(graphX, graphY, graphW, graphH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.strokeRect(graphX, graphY, graphW, graphH);

    // Plot Gamma curve
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px <= graphW; px += 2) {
      const bVal = (px / graphW) * 0.99;
      const gVal = 1 / Math.sqrt(1 - bVal * bVal);
      const py = graphY + graphH - Math.min(graphH - 6, ((gVal - 1) / 5) * (graphH - 12) + 6);
      if (px === 0) ctx.moveTo(graphX + px, py);
      else ctx.lineTo(graphX + px, py);
    }
    ctx.stroke();

    // Plot current operating point on Gamma curve
    const currentPx = (beta / 0.99) * graphW;
    const currentPy = graphY + graphH - Math.min(graphH - 6, ((gamma - 1) / 5) * (graphH - 12) + 6);
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(graphX + currentPx, currentPy, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.fillText('γ(v/c) Factor Curve', graphX + 8, graphY + 16);
  }, [beta, gamma, isDark]);

  useEffect(() => {
    let lastTime = performance.now();

    const animate = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        timeRef.current += dt * 1.5;
      }

      renderCanvas();
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, renderCanvas]);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Special Relativity & Spacetime Invariance</span>
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            Relativistic Lorentz Transformation & Time Dilation
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-xs"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Resume'}</span>
          </button>
          <button
            onClick={() => { setBeta(0.8); timeRef.current = 0; }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Visualizer & Readout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Canvas */}
        <div className="lg:col-span-8 rounded-2xl bg-black border border-slate-200 dark:border-slate-800 p-2 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={640}
            height={420}
            className="w-full h-auto rounded-xl block"
          />
        </div>

        {/* Math & Metric Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#121D33] border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Time Dilation Formula</span>
            </h4>

            <div className="p-3 rounded-xl bg-white dark:bg-[#080E1C] border border-slate-200 dark:border-slate-800 text-center font-mono text-sm text-[#1D3557] dark:text-[#A8DADC]">
              <MathView math="\Delta t = \gamma \Delta t_0 = \frac{\Delta t_0}{\sqrt{1 - v^2/c^2}}" />
            </div>

            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Speed Velocity (v):</span>
                <span className="font-mono font-bold text-amber-500">{(beta * 100).toFixed(0)}% of c ({beta.toFixed(2)}c)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Lorentz Factor (γ):</span>
                <span className="font-mono font-bold text-sky-400">{gamma.toFixed(3)}x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Stationary 1 Hour equals:</span>
                <span className="font-mono font-bold text-emerald-400">{(1 * gamma).toFixed(2)} Hours</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-300 leading-relaxed">
            <p className="font-semibold mb-1">Einstein's Postulate:</p>
            Because the speed of light <span className="font-mono font-bold">c</span> is exactly constant in all reference frames, the photon in the moving frame must traverse a longer diagonal path. Therefore, less time ticks on the moving clock relative to the stationary observer.
          </div>

        </div>

      </div>

      {/* Controls */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#121D33] border border-slate-200 dark:border-slate-800 space-y-4">
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Relativistic Velocity Ratio (β = v / c)</span>
            <span className="font-mono text-amber-500 font-bold">{beta.toFixed(2)} c</span>
          </div>
          <input
            type="range"
            min="0.00"
            max="0.99"
            step="0.01"
            value={beta}
            onChange={(e) => setBeta(parseFloat(e.target.value))}
            className="w-full accent-[#E63946] cursor-pointer"
          />
        </div>

        {/* Velocity Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 font-medium mr-2">Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setBeta(p.val)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                Math.abs(beta - p.val) < 0.02
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

      </div>

    </div>
  );
}
