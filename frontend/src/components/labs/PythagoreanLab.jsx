import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Shapes } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function PythagoreanLab() {
  const { isDark } = useTheme();
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [showSquares, setShowSquares] = useState(true);
  const canvasRef = useRef(null);

  const c = Math.hypot(a, b);
  const area = 0.5 * a * b;
  const angleDeg = (Math.atan2(b, a) * 180) / Math.PI;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9';
    const textColor = isDark ? '#E2E8F0' : '#1E293B';
    const legAColor = isDark ? '#38BDF8' : '#0284C7';
    const legBColor = isDark ? '#A78BFA' : '#7C3AED';
    const hypotColor = '#F43F5E';

    // Grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Dynamic scale to fit triangle and squares
    const maxDimension = Math.max(a, b, 5);
    const scale = showSquares ? Math.min(22, 140 / maxDimension) : Math.min(28, 200 / maxDimension);
    
    // Origin for triangle
    const ox = showSquares ? 100 : 70;
    const oy = showSquares ? height - 90 : height - 60;

    const ax = ox + a * scale;
    const ay = oy;

    const bx = ox;
    const by = oy - b * scale;

    // Geometric Squares Proof
    if (showSquares) {
      // Square on leg a (downward)
      ctx.fillStyle = isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.15)';
      ctx.strokeStyle = legAColor;
      ctx.lineWidth = 1.5;
      ctx.fillRect(ox, oy, a * scale, a * scale);
      ctx.strokeRect(ox, oy, a * scale, a * scale);

      // Label a^2
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = legAColor;
      ctx.textAlign = 'center';
      ctx.fillText(`a² = ${(a * a).toFixed(1)}`, ox + (a * scale) / 2, oy + (a * scale) / 2 + 4);

      // Square on leg b (leftward)
      ctx.fillStyle = isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(124, 58, 237, 0.15)';
      ctx.strokeStyle = legBColor;
      ctx.fillRect(ox - b * scale, by, b * scale, b * scale);
      ctx.strokeRect(ox - b * scale, by, b * scale, b * scale);

      // Label b^2
      ctx.fillStyle = legBColor;
      ctx.fillText(`b² = ${(b * b).toFixed(1)}`, ox - (b * scale) / 2, by + (b * scale) / 2 + 4);

      // Square on hypotenuse c (projected outward from triangle)
      // Vector from A(ax, ay) to B(bx, by) is (dx, dy)
      const dx = bx - ax;
      const dy = by - ay;
      // Perpendicular vector pointing outward: (dy, -dx)
      const p1x = bx + dy;
      const p1y = by - dx;
      const p2x = ax + dy;
      const p2y = ay - dx;

      ctx.fillStyle = isDark ? 'rgba(244, 63, 94, 0.15)' : 'rgba(244, 63, 94, 0.15)';
      ctx.strokeStyle = hypotColor;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.lineTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Label c^2
      ctx.fillStyle = hypotColor;
      const centerCx = (ax + bx + p1x + p2x) / 4;
      const centerCy = (ay + by + p1y + p2y) / 4;
      ctx.fillText(`c² = ${(c * c).toFixed(1)}`, centerCx, centerCy + 4);
    }

    // Triangle fill
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(69, 123, 157, 0.18)';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.closePath();
    ctx.fill();

    // Right angle marker
    const markerSize = 12;
    ctx.strokeStyle = isDark ? '#94A3B8' : '#64748B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ox, oy - markerSize);
    ctx.lineTo(ox + markerSize, oy - markerSize);
    ctx.lineTo(ox + markerSize, oy);
    ctx.stroke();

    // Triangle sides
    // Leg a
    ctx.strokeStyle = legAColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ax, ay);
    ctx.stroke();

    // Leg b
    ctx.strokeStyle = legBColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(bx, by);
    ctx.stroke();

    // Hypotenuse c
    ctx.strokeStyle = hypotColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();

    // Side Labels
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = legAColor;
    ctx.fillText(`a = ${a.toFixed(1)}`, ox + (a * scale) / 2, oy - 6);

    ctx.fillStyle = legBColor;
    ctx.textAlign = 'right';
    ctx.fillText(`b = ${b.toFixed(1)}`, ox + 14, oy - (b * scale) / 2);

    ctx.fillStyle = hypotColor;
    ctx.textAlign = 'left';
    ctx.fillText(`c = ${c.toFixed(2)}`, (ox + ax) / 2 + 10, (oy + by) / 2 - 10);
  }, [a, b, c, showSquares, isDark]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121D33] overflow-hidden shadow-md">
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">📐</span>
          <span className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200">
            Right-Triangle Pythagorean Theorem & Geometric Proof
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSquares(!showSquares)}
            className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              showSquares
                ? 'bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Shapes className="w-3.5 h-3.5" />
            <span>{showSquares ? 'Hide Squares' : 'Show Geometric Squares'}</span>
          </button>
          <button
            onClick={() => {
              setA(3);
              setB(4);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset (3-4-5)</span>
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex justify-center bg-slate-50 dark:bg-[#091122] p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <canvas ref={canvasRef} width={340} height={320} className="max-w-full h-auto" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
              <label>Leg a (Base)</label>
              <span className="font-mono text-[#1D3557] dark:text-[#A8DADC] text-base">{a.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={a}
              onChange={(e) => setA(parseFloat(e.target.value))}
              className="w-full accent-[#1D3557] dark:accent-[#A8DADC] cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
              <label>Leg b (Height)</label>
              <span className="font-mono text-[#457B9D] dark:text-[#A8DADC] text-base">{b.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={b}
              onChange={(e) => setB(parseFloat(e.target.value))}
              className="w-full accent-[#457B9D] dark:accent-[#A8DADC] cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0c1629] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Square a² + b²</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {(a * a).toFixed(2)} + {(b * b).toFixed(2)} = {(a * a + b * b).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Hypotenuse c = √(a² + b²)</span>
              <span className="font-mono font-bold text-red-600 dark:text-red-400 text-sm">
                {c.toFixed(3)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Angle θ = arctan(b/a)</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {angleDeg.toFixed(1)}°
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Triangle Area (½ab)</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {area.toFixed(2)} sq units
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
