import React, { useState, useEffect, useRef } from 'react';
import { Compass, RotateCcw, Sparkles, AlertTriangle, Eye } from 'lucide-react';
import MathView from '../common/MathView';
import { useTheme } from '../../context/ThemeContext';

export default function SnellsLawLab() {
  const { isDark } = useTheme();
  const [n1, setN1] = useState(1.00); // Air
  const [n2, setN2] = useState(1.52); // Glass
  const [theta1Deg, setTheta1Deg] = useState(45);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const pulseRef = useRef(0);

  const MATERIAL_PRESETS = [
    { name: 'Air', n: 1.00 },
    { name: 'Water', n: 1.33 },
    { name: 'Crown Glass', n: 1.52 },
    { name: 'Flint Glass', n: 1.66 },
    { name: 'Diamond', n: 2.42 },
  ];

  // Calculations
  const theta1Rad = (theta1Deg * Math.PI) / 180;
  const sinTheta2 = (n1 / n2) * Math.sin(theta1Rad);
  const isTIR = sinTheta2 > 1.0; // Total Internal Reflection
  const theta2Rad = isTIR ? 0 : Math.asin(sinTheta2);
  const theta2Deg = isTIR ? 0 : (theta2Rad * 180) / Math.PI;

  const criticalAngleDeg = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : null;

  // Animation and Canvas Drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      pulseRef.current = (pulseRef.current + 0.015) % 1;
      const laserPulse = pulseRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Medium 1 background (top)
      ctx.fillStyle = isDark ? '#060B17' : '#F8FAFC';
      ctx.fillRect(0, 0, width, cy);

      // Medium 2 background (bottom)
      const blueIntensity = Math.min(0.35, (isDark ? 0.15 : 0.05) + (n2 - 1) * 0.12);
      ctx.fillStyle = isDark
        ? `rgba(56, 189, 248, ${blueIntensity})`
        : `rgba(69, 123, 157, ${blueIntensity})`;
      ctx.fillRect(0, cy, width, cy);

      // Grid dots
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)';
      for (let x = 20; x < width; x += 30) {
        for (let y = 20; y < height; y += 30) {
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }

      // Boundary interface line
      ctx.strokeStyle = isDark ? '#38BDF8' : '#1D3557';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();

      // Normal line (vertical dashed line)
      ctx.strokeStyle = isDark ? '#475569' : '#94A3B8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(cx, 15);
      ctx.lineTo(cx, height - 15);
      ctx.stroke();
      ctx.setLineDash([]);

      // Normal label
      ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('Normal (90°)', cx + 8, 30);

    // Ray Parameters
    const rayLength = Math.min(width, height) * 0.42;

    // Incident Ray (from top-left down to center)
    const incidentStartX = cx - rayLength * Math.sin(theta1Rad);
    const incidentStartY = cy - rayLength * Math.cos(theta1Rad);

    // Draw incident beam
    ctx.strokeStyle = '#E63946';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(incidentStartX, incidentStartY);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    // Incident pulse
    const pulseIncidentX = incidentStartX + (cx - incidentStartX) * laserPulse;
    const pulseIncidentY = incidentStartY + (cy - incidentStartY) * laserPulse;
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(pulseIncidentX, pulseIncidentY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#E63946';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Reflected Ray (top-right)
    const reflectEndX = cx + rayLength * Math.sin(theta1Rad);
    const reflectEndY = cy - rayLength * Math.cos(theta1Rad);
    ctx.strokeStyle = isTIR ? '#E63946' : 'rgba(230, 57, 70, 0.35)';
    ctx.lineWidth = isTIR ? 3.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(reflectEndX, reflectEndY);
    ctx.stroke();

    // Refracted Ray (bottom-right) if not TIR
    if (!isTIR) {
      const refractEndX = cx + rayLength * Math.sin(theta2Rad);
      const refractEndY = cy + rayLength * Math.cos(theta2Rad);

      ctx.strokeStyle = '#2A9D8F';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(refractEndX, refractEndY);
      ctx.stroke();

      // Refracted pulse
      const pulseRefractX = cx + (refractEndX - cx) * laserPulse;
      const pulseRefractY = cy + (refractEndY - cy) * laserPulse;
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(pulseRefractX, pulseRefractY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2A9D8F';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Angle theta2 arc
      ctx.strokeStyle = '#2A9D8F';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 45, Math.PI / 2 - theta2Rad, Math.PI / 2, false);
      ctx.stroke();

      ctx.fillStyle = '#2A9D8F';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(`θ₂ = ${theta2Deg.toFixed(1)}°`, cx + 20, cy + 60);
    }

    // Angle theta1 arc
    ctx.strokeStyle = '#E63946';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 45, -Math.PI / 2, -Math.PI / 2 + theta1Rad, false);
    ctx.stroke();

    ctx.fillStyle = '#E63946';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(`θ₁ = ${theta1Deg}°`, cx - 65, cy - 50);

    // Center boundary contact ring
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    animFrameRef.current = requestAnimationFrame(render);
  };

  animFrameRef.current = requestAnimationFrame(render);
  return () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  };
}, [n1, n2, theta1Deg, theta1Rad, theta2Rad, theta2Deg, isTIR, isDark]);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Title & Badge */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E63946] uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Optics & Wave Physics Simulator</span>
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            Snell's Law of Refraction & Total Internal Reflection
          </h3>
        </div>
        <button
          onClick={() => { setN1(1.00); setN2(1.52); setTheta1Deg(45); }}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Lab</span>
        </button>
      </div>

      {/* Main Grid: Canvas & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Canvas Visualizer */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900/5 dark:bg-black/30 border border-slate-200 dark:border-slate-800 p-3 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={640}
            height={400}
            className="w-full h-auto rounded-xl bg-slate-50 dark:bg-[#080E1C] block"
          />

          {/* Medium Overlay Labels */}
          <div className="absolute top-6 left-6 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border border-slate-200 dark:border-slate-700 text-xs shadow-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">Medium 1: </span>
            <span className="font-mono text-[#E63946] font-bold">n₁ = {n1.toFixed(2)}</span>
          </div>

          <div className="absolute bottom-6 left-6 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border border-slate-200 dark:border-slate-700 text-xs shadow-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">Medium 2: </span>
            <span className="font-mono text-[#2A9D8F] font-bold">n₂ = {n2.toFixed(2)}</span>
          </div>

          {/* TIR Alert Banner */}
          {isTIR && (
            <div className="absolute top-6 right-6 px-3 py-2 rounded-xl bg-rose-500/90 text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>TOTAL INTERNAL REFLECTION (TIR)</span>
            </div>
          )}
        </div>

        {/* Live Mathematical Metrics */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#121D33] dark:to-[#0B1324] border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Governing Identity</span>
            </h4>

            <div className="p-3 rounded-xl bg-white dark:bg-[#080E1C] border border-slate-200 dark:border-slate-800 text-center font-mono text-sm text-[#1D3557] dark:text-[#A8DADC]">
              <MathView math="n_1 \sin\theta_1 = n_2 \sin\theta_2" />
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Incident Angle (θ₁):</span>
                <span className="font-mono font-bold text-[#E63946]">{theta1Deg}°</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Refracted Angle (θ₂):</span>
                <span className="font-mono font-bold text-[#2A9D8F]">
                  {isTIR ? 'None (TIR)' : `${theta2Deg.toFixed(2)}°`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Ratio (n₁ / n₂):</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {(n1 / n2).toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Critical Angle (θ_c):</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {criticalAngleDeg ? `${criticalAngleDeg.toFixed(1)}°` : 'N/A (n₁ ≤ n₂)'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
            <p className="font-semibold mb-1 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Physical Intuition:</span>
            </p>
            When light enters an optically denser medium (higher <span className="font-mono font-bold">n</span>), it slows down and bends <strong>towards</strong> the normal. When moving into a rarer medium (lower <span className="font-mono font-bold">n</span>) past <span className="font-mono font-bold">θ_c</span>, refraction ceases and 100% of light undergoes <strong>Total Internal Reflection</strong>.
          </div>
        </div>

      </div>

      {/* Interactive Controls */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#121D33] border border-slate-200 dark:border-slate-800 space-y-5">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Incident Angle Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Incident Angle (θ₁)</span>
              <span className="font-mono text-[#E63946]">{theta1Deg}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="85"
              step="1"
              value={theta1Deg}
              onChange={(e) => setTheta1Deg(parseFloat(e.target.value))}
              className="w-full accent-[#E63946] cursor-pointer"
            />
          </div>

          {/* Medium 1 Refractive Index */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Medium 1 Index (n₁)</span>
              <span className="font-mono text-slate-900 dark:text-white">{n1.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1.00"
              max="2.42"
              step="0.01"
              value={n1}
              onChange={(e) => setN1(parseFloat(e.target.value))}
              className="w-full accent-[#1D3557] cursor-pointer"
            />
            {/* Presets */}
            <div className="flex gap-1 flex-wrap pt-1">
              {MATERIAL_PRESETS.map((m) => (
                <button
                  key={`m1-${m.name}`}
                  onClick={() => setN1(m.n)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors ${
                    Math.abs(n1 - m.n) < 0.01
                      ? 'bg-[#1D3557] text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Medium 2 Refractive Index */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Medium 2 Index (n₂)</span>
              <span className="font-mono text-slate-900 dark:text-white">{n2.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1.00"
              max="2.42"
              step="0.01"
              value={n2}
              onChange={(e) => setN2(parseFloat(e.target.value))}
              className="w-full accent-[#2A9D8F] cursor-pointer"
            />
            {/* Presets */}
            <div className="flex gap-1 flex-wrap pt-1">
              {MATERIAL_PRESETS.map((m) => (
                <button
                  key={`m2-${m.name}`}
                  onClick={() => setN2(m.n)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors ${
                    Math.abs(n2 - m.n) < 0.01
                      ? 'bg-[#2A9D8F] text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
