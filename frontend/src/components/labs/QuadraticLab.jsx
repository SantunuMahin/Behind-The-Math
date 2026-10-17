import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function QuadraticLab() {
  const { isDark } = useTheme();
  const [a, setA] = useState(1);
  const [b, setB] = useState(-5);
  const [c, setC] = useState(6);
  const canvasRef = useRef(null);

  const disc = b * b - 4 * a * c;
  const h = -b / (2 * a);
  const k = c - (b * b) / (4 * a);

  let rootsText = '';
  let root1 = null;
  let root2 = null;

  if (disc > 0) {
    root1 = (-b + Math.sqrt(disc)) / (2 * a);
    root2 = (-b - Math.sqrt(disc)) / (2 * a);
    rootsText = `Two Real Roots: x₁ = ${root1.toFixed(2)}, x₂ = ${root2.toFixed(2)}`;
  } else if (Math.abs(disc) < 1e-9) {
    root1 = -b / (2 * a);
    rootsText = `One Repeated Real Root: x = ${root1.toFixed(2)}`;
  } else {
    const real = (-b / (2 * a)).toFixed(2);
    const imag = (Math.sqrt(-disc) / (2 * a)).toFixed(2);
    rootsText = `Complex Roots: ${real} ± ${Math.abs(imag)}i`;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Coordinate space: [-6, 8] on x, [-10, 14] on y
    const minX = -6;
    const maxX = 8;
    const minY = -10;
    const maxY = 14;

    const toCanvasX = (x) => ((x - minX) / (maxX - minX)) * width;
    const toCanvasY = (y) => height - ((y - minY) / (maxY - minY)) * height;

    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : '#E2E8F0';
    const axisColor = isDark ? '#475569' : '#94A3B8';
    const curveColor = isDark ? '#38BDF8' : '#1D3557';
    const vertexColor = '#F43F5E';
    const rootColor = '#10B981';

    // Grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let x = Math.ceil(minX); x <= maxX; x++) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(x), 0);
      ctx.lineTo(toCanvasX(x), height);
      ctx.stroke();
    }
    for (let y = Math.ceil(minY); y <= maxY; y += 2) {
      ctx.beginPath();
      ctx.moveTo(0, toCanvasY(y));
      ctx.lineTo(width, toCanvasY(y));
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;

    // X axis (y = 0)
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(0));
    ctx.lineTo(width, toCanvasY(0));
    ctx.stroke();

    // Y axis (x = 0)
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), 0);
    ctx.lineTo(toCanvasX(0), height);
    ctx.stroke();

    // Axis of symmetry
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = isDark ? '#FBBF24' : '#F59E0B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(toCanvasX(h), 0);
    ctx.lineTo(toCanvasX(h), height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Parabola Curve
    ctx.strokeStyle = curveColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    let started = false;
    for (let px = 0; px <= width; px += 2) {
      const x = minX + (px / width) * (maxX - minX);
      const y = a * x * x + b * x + c;
      const cy = toCanvasY(y);
      if (!started) {
        ctx.moveTo(px, cy);
        started = true;
      } else {
        ctx.lineTo(px, cy);
      }
    }
    ctx.stroke();

    // Vertex point
    ctx.fillStyle = vertexColor;
    ctx.beginPath();
    ctx.arc(toCanvasX(h), toCanvasY(k), 5, 0, 2 * Math.PI);
    ctx.fill();

    // Roots points
    if (root1 !== null && disc >= 0) {
      ctx.fillStyle = rootColor;
      ctx.beginPath();
      ctx.arc(toCanvasX(root1), toCanvasY(0), 5.5, 0, 2 * Math.PI);
      ctx.fill();

      if (root2 !== null && disc > 0) {
        ctx.beginPath();
        ctx.arc(toCanvasX(root2), toCanvasY(0), 5.5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }, [a, b, c, disc, h, k, root1, root2, isDark]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121D33] overflow-hidden shadow-md">
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">📈</span>
          <span className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200">
            Quadratic Function & Parabola Explorer
          </span>
        </div>
        <button
          onClick={() => {
            setA(1);
            setB(-5);
            setC(6);
          }}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex justify-center bg-slate-50 dark:bg-[#091122] p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <canvas ref={canvasRef} width={340} height={320} className="max-w-full h-auto" />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                a = {a}
              </label>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.5"
                value={a}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setA(val === 0 ? 0.5 : val);
                }}
                className="w-full accent-[#1D3557] cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                b = {b}
              </label>
              <input
                type="range"
                min="-8"
                max="8"
                step="0.5"
                value={b}
                onChange={(e) => setB(parseFloat(e.target.value))}
                className="w-full accent-[#457B9D] cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                c = {c}
              </label>
              <input
                type="range"
                min="-8"
                max="8"
                step="0.5"
                value={c}
                onChange={(e) => setC(parseFloat(e.target.value))}
                className="w-full accent-[#E63946] cursor-pointer"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0c1629] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-sm font-heading font-bold text-slate-800 dark:text-white">
              f(x) = {a}x² {b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}x {c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Discriminant Δ = b² - 4ac</span>
              <span className={`font-mono font-bold ${disc >= 0 ? 'text-emerald-600' : 'text-purple-600'}`}>
                {disc.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Vertex (h, k)</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                ({h.toFixed(2)}, {k.toFixed(2)})
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-[#121D33] border border-slate-200/80 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-200">
              {rootsText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
