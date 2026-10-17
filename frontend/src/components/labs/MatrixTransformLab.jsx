import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Grid as GridIcon, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function MatrixTransformLab() {
  const { isDark } = useTheme();
  const [a, setA] = useState(1);
  const [b, setB] = useState(0.5);
  const [c, setC] = useState(0);
  const [d, setD] = useState(1);

  const canvasRef = useRef(null);

  const applyPreset = (preset) => {
    switch (preset) {
      case 'identity':
        setA(1); setB(0); setC(0); setD(1);
        break;
      case 'rot45': {
        const rad = Math.PI / 4;
        setA(parseFloat(Math.cos(rad).toFixed(2)));
        setB(parseFloat((-Math.sin(rad)).toFixed(2)));
        setC(parseFloat(Math.sin(rad).toFixed(2)));
        setD(parseFloat(Math.cos(rad).toFixed(2)));
        break;
      }
      case 'shearX':
        setA(1); setB(1); setC(0); setD(1);
        break;
      case 'scale':
        setA(1.5); setB(0); setC(0); setD(0.7);
        break;
      case 'reflect':
        setA(-1); setB(0); setC(0); setD(1);
        break;
      case 'singular':
        setA(1); setB(2); setC(1); setD(2);
        break;
      default:
        break;
    }
  };

  const reset = () => {
    setA(1); setB(0.5); setC(0); setD(1);
  };

  const det = a * d - b * c;
  const isSingular = Math.abs(det) < 0.001;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const originX = width / 2;
    const originY = height / 2;
    const scale = 36; // pixels per unit

    ctx.clearRect(0, 0, width, height);

    const baseGridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9';
    const axisColor = isDark ? '#475569' : '#94A3B8';
    const transformedGridColor = isDark ? 'rgba(56, 189, 248, 0.22)' : 'rgba(69, 123, 157, 0.25)';

    // 1. Draw untransformed faded grid
    ctx.strokeStyle = baseGridColor;
    ctx.lineWidth = 1;
    for (let x = -6; x <= 6; x++) {
      ctx.beginPath();
      ctx.moveTo(originX + x * scale, 0);
      ctx.lineTo(originX + x * scale, height);
      ctx.stroke();
    }
    for (let y = -6; y <= 6; y++) {
      ctx.beginPath();
      ctx.moveTo(0, originY - y * scale);
      ctx.lineTo(width, originY - y * scale);
      ctx.stroke();
    }

    // 2. Transformed Grid Lines
    ctx.strokeStyle = transformedGridColor;
    ctx.lineWidth = 1.2;

    const gridExtent = 5;
    for (let u = -gridExtent; u <= gridExtent; u++) {
      // Line of constant u: (u, -gridExtent) to (u, gridExtent)
      const x1 = a * u + b * -gridExtent;
      const y1 = c * u + d * -gridExtent;
      const x2 = a * u + b * gridExtent;
      const y2 = c * u + d * gridExtent;

      ctx.beginPath();
      ctx.moveTo(originX + x1 * scale, originY - y1 * scale);
      ctx.lineTo(originX + x2 * scale, originY - y2 * scale);
      ctx.stroke();

      // Line of constant v: (-gridExtent, v) to (gridExtent, v)
      const x3 = a * -gridExtent + b * u;
      const y3 = c * -gridExtent + d * u;
      const x4 = a * gridExtent + b * u;
      const y4 = c * gridExtent + d * u;

      ctx.beginPath();
      ctx.moveTo(originX + x3 * scale, originY - y3 * scale);
      ctx.lineTo(originX + x4 * scale, originY - y4 * scale);
      ctx.stroke();
    }

    // 3. Shaded Unit Square Parallelogram Area
    // Vertices: (0, 0), (a, c), (a + b, c + d), (b, d)
    ctx.fillStyle = det >= 0 ? 'rgba(42, 157, 143, 0.35)' : 'rgba(230, 57, 70, 0.35)';
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + a * scale, originY - c * scale);
    ctx.lineTo(originX + (a + b) * scale, originY - (c + d) * scale);
    ctx.lineTo(originX + b * scale, originY - d * scale);
    ctx.closePath();
    ctx.fill();

    // 4. Main Coordinate Axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Helper to draw vector arrow
    const drawArrow = (vx, vy, color, label) => {
      const targetX = originX + vx * scale;
      const targetY = originY - vy * scale;

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      // Arrow head
      const angle = Math.atan2(originY - targetY, targetX - originX);
      const headLen = 9;
      ctx.beginPath();
      ctx.moveTo(targetX, targetY);
      ctx.lineTo(
        targetX - headLen * Math.cos(angle - Math.PI / 6),
        targetY + headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        targetX - headLen * Math.cos(angle + Math.PI / 6),
        targetY + headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(label, targetX + 8 * Math.cos(angle), targetY - 8 * Math.sin(angle));
    };

    // Draw transformed basis vectors: i-hat (a, c) and j-hat (b, d)
    drawArrow(a, c, '#2A9D8F', 'î (a, c)');
    drawArrow(b, d, '#E63946', 'ĵ (b, d)');

  }, [a, b, c, d, det, isDark]);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#121D33] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <GridIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              2D Linear Transformation & Grid Warp
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Watch coordinate space stretch, shear, and rotate under 2x2 matrix transformation M
            </p>
          </div>
        </div>

        <button
          onClick={reset}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 text-xs flex items-center gap-1 font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Visualized Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center bg-slate-50 dark:bg-[#091122] rounded-xl border border-slate-200 dark:border-slate-800/80 p-3 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={580}
            height={260}
            className="w-full h-auto block rounded-lg select-none"
          />

          <div className="flex items-center justify-between w-full mt-2 text-[11px] text-slate-500 px-2 flex-wrap gap-2">
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2A9D8F] inline-block" />
                <span className="font-semibold">Transformed î</span>
              </span>
              <span className="flex items-center gap-1 ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E63946] inline-block" />
                <span className="font-semibold">Transformed ĵ</span>
              </span>
            </span>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              Unit Area = |det| = {Math.abs(det).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Matrix Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Quick Presets */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Transformation Presets
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {[
                { id: 'identity', label: 'Identity' },
                { id: 'rot45', label: '45° Rotation' },
                { id: 'shearX', label: 'X-Shear' },
                { id: 'scale', label: 'Scaling' },
                { id: 'reflect', label: 'Y-Reflect' },
                { id: 'singular', label: 'Singular' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-center transition-colors truncate font-medium text-[11px]"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2x2 Matrix Input Grid */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#091122] border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
              Matrix Components: [[a, b], [c, d]]
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-mono text-[#2A9D8F] font-bold">a: {a.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={a}
                  onChange={(e) => setA(parseFloat(e.target.value))}
                  className="w-full accent-[#2A9D8F] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-mono text-[#E63946] font-bold">b: {b.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={b}
                  onChange={(e) => setB(parseFloat(e.target.value))}
                  className="w-full accent-[#E63946] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-mono text-[#2A9D8F] font-bold">c: {c.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={c}
                  onChange={(e) => setC(parseFloat(e.target.value))}
                  className="w-full accent-[#2A9D8F] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-mono text-[#E63946] font-bold">d: {d.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={d}
                  onChange={(e) => setD(parseFloat(e.target.value))}
                  className="w-full accent-[#E63946] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Determinant & Geometric Readout */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border ${
              isSingular
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
            }`}>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Determinant (ad - bc)
              </span>
              <span className="font-mono font-bold text-lg text-slate-900 dark:text-white">
                {det.toFixed(2)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                Invertibility Status
              </span>
              <span className="font-semibold text-xs text-blue-900 dark:text-blue-200 mt-1 block">
                {isSingular ? '⚠️ Singular (Collapses space)' : '✓ Invertible (Bijective)'}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Takeaway Insight */}
      <div className="p-4 rounded-xl bg-[#F1FAEE] dark:bg-slate-800/60 border border-[#A8DADC]/60 dark:border-slate-700 text-xs text-[#1D3557] dark:text-[#A8DADC] leading-relaxed flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 shrink-0 text-[#E63946] mt-0.5" />
        <div>
          <span className="font-bold">Linear Algebra Geometric Essence:</span> A 2×2 matrix simply tracks where the two unit basis vectors land: î → (a, c) and ĵ → (b, d). The determinant det(M) is the signed area scaling factor of the shaded parallelogram. If det = 0, the 2D plane collapses onto a 1D line!
        </div>
      </div>

    </div>
  );
}
