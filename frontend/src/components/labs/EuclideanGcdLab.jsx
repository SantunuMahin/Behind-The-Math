import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function EuclideanGcdLab() {
  const { isDark } = useTheme();

  const [a, setA] = useState(64);
  const [b, setB] = useState(24);

  const canvasRef = useRef(null);

  // Guard safe non-zero integer values
  const safeA = Math.max(1, Math.abs(a || 1));
  const safeB = Math.max(1, Math.abs(b || 1));

  // Compute step-by-step division and rectangle tile geometry
  let tempA = safeA;
  let tempB = safeB;
  const steps = [];
  const tiles = []; // { x, y, size, color }

  let curX = 0;
  let curY = 0;
  let horizontal = true;

  const TILE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  let colorIdx = 0;
  while (tempB > 0) {
    const q = Math.floor(tempA / tempB);
    const r = tempA % tempB;
    steps.push({ a: tempA, b: tempB, q, r });

    // Geometric tile generation
    const tileSize = tempB;
    for (let i = 0; i < q; i++) {
      tiles.push({
        x: curX,
        y: curY,
        size: tileSize,
        color: TILE_COLORS[colorIdx % TILE_COLORS.length],
      });
      if (horizontal) {
        curX += tileSize;
      } else {
        curY += tileSize;
      }
    }

    horizontal = !horizontal;
    tempA = tempB;
    tempB = r;
    colorIdx++;
  }

  const gcd = tempA;
  const lcm = gcd > 0 ? (safeA * safeB) / gcd : 0;

  // Render geometric rectangle tiling on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Canvas background
    ctx.fillStyle = isDark ? '#070C18' : '#F8FAFC';
    ctx.fillRect(0, 0, width, height);

    // Scale rectangle to fit inside canvas with padding
    const padding = 20;
    const maxDrawW = width - padding * 2;
    const maxDrawH = height - padding * 2;
    const scale = Math.min(maxDrawW / a, maxDrawH / b);

    const rectW = a * scale;
    const rectH = b * scale;
    const startX = (width - rectW) / 2;
    const startY = (height - rectH) / 2;

    // Draw full outer A x B rectangle boundary
    ctx.strokeStyle = isDark ? '#94A3B8' : '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, rectW, rectH);

    // Draw geometric square tiles
    tiles.forEach((tile) => {
      const tx = startX + tile.x * scale;
      const ty = startY + tile.y * scale;
      const tSize = tile.size * scale;

      ctx.fillStyle = tile.color;
      ctx.globalAlpha = isDark ? 0.45 : 0.6;
      ctx.fillRect(tx, ty, tSize, tSize);
      ctx.globalAlpha = 1.0;

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(tx, ty, tSize, tSize);

      // Label square tile size
      if (tSize > 18) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${tile.size}`, tx + tSize / 2, ty + tSize / 2);
      }
    });

    // Outer dimensions
    ctx.fillStyle = isDark ? '#E2E8F0' : '#1E293B';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Width a = ${a}`, width / 2, startY - 6);
    ctx.textAlign = 'right';
    ctx.fillText(`b = ${b}`, startX - 6, startY + rectH / 2);
  }, [a, b, isDark, gcd]);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] overflow-hidden shadow-xl transition-colors">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-[#0e172a] border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
            🔢
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              Euclidean Algorithm & Geometric Square Tiling
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Watch an a × b rectangle be tiled by progressively smaller squares until the final tile reveals gcd(a, b)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setA(64);
            setB(24);
          }}
          className="p-1.5 px-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Geometric Tiling Canvas (6 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center space-y-2">
          <div className="bg-slate-50 dark:bg-[#070c18] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner w-full flex justify-center">
            <canvas
              ref={canvasRef}
              width={340}
              height={260}
              className="w-full max-w-[340px] h-auto block rounded-xl"
            />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
            Final smallest square tile dimension equals the exact greatest common divisor: <strong className="text-emerald-500">gcd = {gcd}</strong>
          </p>
        </div>

        {/* Division Steps & Sliders (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Sliders */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Side a = {a}</label>
              <input
                type="range"
                min="6"
                max="120"
                value={a}
                onChange={(e) => setA(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Side b = {b}</label>
              <input
                type="range"
                min="4"
                max="90"
                value={b}
                onChange={(e) => setB(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Division Steps Log */}
          <div className="space-y-1.5 bg-slate-50 dark:bg-[#091122] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-200 dark:border-slate-800">
              <span>Euclidean Division Steps</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">GCD = {gcd}</span>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {steps.map((st, i) => (
                <div
                  key={i}
                  className="p-1.5 px-2.5 rounded-lg bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800 text-xs font-mono flex items-center justify-between"
                >
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Step {i + 1}:</span>
                  <span>
                    {st.a} = {st.b} × {st.q} + <strong className="text-rose-500">{st.r}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Identity */}
          <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 text-[11px] space-y-1">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Fundamental Identity:</span>
            <div className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">
              a · b = gcd(a, b) · lcm(a, b)
            </div>
            <div className="font-mono text-slate-600 dark:text-slate-400 text-[10px]">
              {a} · {b} = {a * b} = {gcd} · {lcm}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
