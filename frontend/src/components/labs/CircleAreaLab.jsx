import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function CircleAreaLab() {
  const { isDark } = useTheme();

  const [radius, setRadius] = useState(6);
  const [polygonSides, setPolygonSides] = useState(12); // Archimedes n-gon
  const [showArchimedes, setShowArchimedes] = useState(true);

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Theme colors
    const bgGrid = isDark ? '#16233B' : '#F1F5F9';
    const axisColor = isDark ? '#334155' : '#CBD5E1';
    const circleStroke = isDark ? '#38BDF8' : '#0284C7';
    const polygonStroke = isDark ? '#F59E0B' : '#D97706';
    const polygonFill = isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(217, 119, 6, 0.2)';

    // Coordinate grid background
    ctx.strokeStyle = bgGrid;
    ctx.lineWidth = 1;
    for (let i = 20; i < width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.stroke();

    // Scale pixel radius
    const pxRadius = Math.min(135, radius * 14);

    // Concentric ring fill effect
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, pxRadius);
    gradient.addColorStop(0, isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(2, 132, 199, 0.15)');
    gradient.addColorStop(1, isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(2, 132, 199, 0.35)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, pxRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Archimedes Inscribed n-gon
    if (showArchimedes && polygonSides >= 3) {
      ctx.fillStyle = polygonFill;
      ctx.strokeStyle = polygonStroke;
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < polygonSides; i++) {
        const theta = (i / polygonSides) * 2 * Math.PI - Math.PI / 2;
        const vx = cx + pxRadius * Math.cos(theta);
        const vy = cy + pxRadius * Math.sin(theta);
        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Vertex dots
      ctx.fillStyle = polygonStroke;
      for (let i = 0; i < polygonSides; i++) {
        const theta = (i / polygonSides) * 2 * Math.PI - Math.PI / 2;
        const vx = cx + pxRadius * Math.cos(theta);
        const vy = cy + pxRadius * Math.sin(theta);
        ctx.beginPath();
        ctx.arc(vx, vy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Circumference boundary
    ctx.strokeStyle = circleStroke;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, pxRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Radius line
    ctx.strokeStyle = isDark ? '#F43F5E' : '#E11D48';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + pxRadius, cy);
    ctx.stroke();

    // Center point
    ctx.fillStyle = isDark ? '#FFFFFF' : '#0F172A';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Radius label
    ctx.fillStyle = isDark ? '#F43F5E' : '#E11D48';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`r = ${radius}`, cx + pxRadius / 2 - 12, cy - 8);
  }, [radius, polygonSides, showArchimedes, isDark]);

  const area = Math.PI * radius * radius;
  const circ = 2 * Math.PI * radius;
  // Archimedes inscribed polygon area: (n / 2) * r^2 * sin(2pi / n)
  const polygonArea = (polygonSides / 2) * radius * radius * Math.sin((2 * Math.PI) / polygonSides);
  const accuracy = (polygonArea / area) * 100;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] overflow-hidden shadow-xl transition-colors">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-[#0e172a] border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
            ⭕
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              Circle Area & Archimedes Polygon Approximation
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Watch inscribed regular n-gons prove A = πr² as n approaches infinity
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setRadius(6);
            setPolygonSides(12);
          }}
          className="p-1.5 px-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Canvas Display (6 cols) */}
        <div className="lg:col-span-6 flex justify-center bg-slate-50 dark:bg-[#070c18] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <canvas
            ref={canvasRef}
            width={340}
            height={340}
            className="w-full max-w-[340px] h-auto block rounded-xl"
          />
        </div>

        {/* Controls & Numerical Proof (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Radius Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label>Radius r: {radius}</label>
              <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">Area = {area.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="2"
              max="9"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Polygon Sides n */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label>Archimedes Polygon Sides n = {polygonSides}</label>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">Polygon Area = {polygonArea.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="3"
              max="48"
              value={polygonSides}
              onChange={(e) => setPolygonSides(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Archimedes Accuracy Callout */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#091122] border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Archimedean Limit Convergence:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{accuracy.toFixed(2)}% Exact</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${accuracy}%` }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-150"
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              By increasing polygon vertices n, the inscribed perimeter approaches 2πr and area approaches πr².
            </p>
          </div>

          {/* Mathematical Identities */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40">
              <span className="font-sans text-[10px] text-slate-500 block">Circumference (2πr)</span>
              <span className="font-bold text-sky-700 dark:text-sky-300">{circ.toFixed(2)} units</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
              <span className="font-sans text-[10px] text-slate-500 block">Exact Area (πr²)</span>
              <span className="font-bold text-amber-700 dark:text-amber-300">{area.toFixed(2)} sq units</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
