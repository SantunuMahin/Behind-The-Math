import React, { useState, useEffect, useRef } from 'react';
import { Target, RotateCcw, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import MathView from '../common/MathView';
import { useTheme } from '../../context/ThemeContext';

export default function LagrangeMultipliersLab() {
  const { isDark } = useTheme();
  const [c, setC] = useState(4); // Constraint line x + y = c
  const [tOffset, setToffset] = useState(1.2); // Offset along line from optimal tangency point

  const canvasRef = useRef(null);

  // Optimal point is at (c/2, c/2)
  const xOpt = c / 2;
  const yOpt = c / 2;
  const lambdaOpt = c; // grad f = (2x, 2y) = (c, c) = c * (1, 1)

  // Current probe point on constraint line
  const xProbe = xOpt + tOffset;
  const yProbe = yOpt - tOffset;

  // Objective function f(x, y) = x^2 + y^2
  const fVal = xProbe * xProbe + yProbe * yProbe;
  const fOptVal = xOpt * xOpt + yOpt * yOpt;

  // Gradient vectors
  // grad f = (2x, 2y)
  const gradFx = 2 * xProbe;
  const gradFy = 2 * yProbe;
  // grad g = (1, 1)
  const gradGx = 1;
  const gradGy = 1;

  // Alignment: cross product (2x*1 - 2y*1) = 2(x - y) = 4 * tOffset
  const alignmentError = Math.abs(2 * (xProbe - yProbe));
  const isOptimal = alignmentError < 0.15;
  const alignmentPercent = Math.max(0, Math.min(100, Math.round(100 * Math.exp(-alignmentError * 0.4))));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const scale = 32; // pixels per mathematical unit

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = isDark ? '#080E1C' : '#F8FAFC';
    ctx.fillRect(0, 0, width, height);

    // Coordinate Grid
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // Contour circles of f(x, y) = x^2 + y^2 = r^2
    const contourRadii = [1, 2, 3, 4, 5, 6, 7];
    contourRadii.forEach((r) => {
      ctx.strokeStyle = 'rgba(69, 123, 157, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
      ctx.stroke();

      // Contour level label
      ctx.fillStyle = 'rgba(168, 218, 220, 0.4)';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`f=${r * r}`, cx + r * scale * 0.7 + 2, cy - r * scale * 0.7 - 2);
    });

    // Optimal contour circle passing through tangency point
    const rOpt = Math.sqrt(fOptVal);
    ctx.strokeStyle = '#2A9D8F';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, rOpt * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Constraint line: x + y = c  =>  y = -x + c
    // In screen coordinates: xScreen = cx + x * scale, yScreen = cy - y * scale
    ctx.strokeStyle = '#E63946';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const xMinMath = -8;
    const xMaxMath = 8;
    const yAtMin = -xMinMath + c;
    const yAtMax = -xMaxMath + c;
    ctx.moveTo(cx + xMinMath * scale, cy - yAtMin * scale);
    ctx.lineTo(cx + xMaxMath * scale, cy - yAtMax * scale);
    ctx.stroke();

    // Constraint line label
    ctx.fillStyle = '#E63946';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(`g(x,y): x + y = ${c}`, cx + 2 * scale, cy - (-2 + c) * scale - 12);

    // Tangency / Optimal Point
    const optScreenX = cx + xOpt * scale;
    const optScreenY = cy - yOpt * scale;
    ctx.fillStyle = '#2A9D8F';
    ctx.beginPath();
    ctx.arc(optScreenX, optScreenY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Current Probe Point
    const probeScreenX = cx + xProbe * scale;
    const probeScreenY = cy - yProbe * scale;
    ctx.fillStyle = isOptimal ? '#10B981' : '#F59E0B';
    ctx.beginPath();
    ctx.arc(probeScreenX, probeScreenY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Gradient Vector: grad f = (2x, 2y)
    const vecScale = 12;
    const gradFScreenX = probeScreenX + (gradFx * vecScale);
    const gradFScreenY = probeScreenY - (gradFy * vecScale);

    ctx.strokeStyle = '#38BDF8'; // Sky blue
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(probeScreenX, probeScreenY);
    ctx.lineTo(gradFScreenX, gradFScreenY);
    ctx.stroke();

    // Arrowhead for grad f
    ctx.fillStyle = '#38BDF8';
    const angleF = Math.atan2(-(gradFy), gradFx);
    ctx.beginPath();
    ctx.moveTo(gradFScreenX, gradFScreenY);
    ctx.lineTo(gradFScreenX - 10 * Math.cos(angleF - Math.PI / 6), gradFScreenY + 10 * Math.sin(angleF - Math.PI / 6));
    ctx.lineTo(gradFScreenX - 10 * Math.cos(angleF + Math.PI / 6), gradFScreenY + 10 * Math.sin(angleF + Math.PI / 6));
    ctx.fill();

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('∇f', gradFScreenX + 6, gradFScreenY - 4);

    // Gradient Vector: grad g = (1, 1) scaled
    const gradGScreenX = probeScreenX + (gradGx * 28);
    const gradGScreenY = probeScreenY - (gradGy * 28);

    ctx.strokeStyle = '#F43F5E'; // Red/Pink
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(probeScreenX, probeScreenY);
    ctx.lineTo(gradGScreenX, gradGScreenY);
    ctx.stroke();

    // Arrowhead for grad g
    ctx.fillStyle = '#F43F5E';
    const angleG = Math.atan2(-gradGy, gradGx);
    ctx.beginPath();
    ctx.moveTo(gradGScreenX, gradGScreenY);
    ctx.lineTo(gradGScreenX - 8 * Math.cos(angleG - Math.PI / 6), gradGScreenY + 8 * Math.sin(angleG - Math.PI / 6));
    ctx.lineTo(gradGScreenX - 8 * Math.cos(angleG + Math.PI / 6), gradGScreenY + 8 * Math.sin(angleG + Math.PI / 6));
    ctx.fill();

    ctx.fillStyle = '#F43F5E';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('λ∇g', gradGScreenX + 6, gradGScreenY - 4);

  }, [c, tOffset, xOpt, yOpt, xProbe, yProbe, fOptVal, gradFx, gradFy, isOptimal, isDark]);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#2A9D8F] uppercase tracking-wider">
            <Target className="w-4 h-4" />
            <span>Multivariable Calculus & ML Optimization</span>
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            Lagrange Multipliers & Constrained Tangency Lab
          </h3>
        </div>
        <button
          onClick={() => { setC(4); setToffset(0); }}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Snap to Optimum</span>
        </button>
      </div>

      {/* Main Grid: Visualizer & Equations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Canvas */}
        <div className="lg:col-span-8 rounded-2xl bg-black/40 border border-slate-200 dark:border-slate-800 p-3 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={640}
            height={420}
            className="w-full h-auto rounded-xl block"
          />

          {/* Alignment Status Banner */}
          <div className="absolute top-6 left-6 px-3.5 py-2 rounded-xl bg-slate-900/90 backdrop-blur-xs border border-slate-700 text-xs shadow-lg flex items-center gap-3">
            <span className="text-slate-400">Gradient Collinearity:</span>
            <div className="w-20 bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${
                  isOptimal ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                style={{ width: `${alignmentPercent}%` }}
              />
            </div>
            <span className={`font-mono font-bold ${isOptimal ? 'text-emerald-400' : 'text-amber-400'}`}>
              {alignmentPercent}%
            </span>
          </div>

          {isOptimal && (
            <div className="absolute top-6 right-6 px-3.5 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>OPTIMUM FOUND: ∇f ∥ ∇g</span>
            </div>
          )}
        </div>

        {/* Readout Panels */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#121D33] border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Lagrangian System</span>
            </h4>

            <div className="p-3 rounded-xl bg-white dark:bg-[#080E1C] border border-slate-200 dark:border-slate-800 text-center font-mono text-sm text-[#1D3557] dark:text-[#A8DADC]">
              <MathView math="\nabla f(x, y) = \lambda \nabla g(x, y)" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Objective f(x,y):</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {fVal.toFixed(2)} (Min: {fOptVal.toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Current Point (x, y):</span>
                <span className="font-mono font-bold text-amber-500">
                  ({xProbe.toFixed(2)}, {yProbe.toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Optimal Point:</span>
                <span className="font-mono font-bold text-emerald-500">
                  ({xOpt.toFixed(2)}, {yOpt.toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Lagrange Multiplier λ:</span>
                <span className="font-mono font-bold text-indigo-400">
                  λ* = {lambdaOpt.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed">
            <p className="font-semibold mb-1">Visual Insight:</p>
            At non-optimal points, the gradient <span className="font-mono font-bold text-sky-500">∇f</span> has a component along the constraint line, meaning you can still decrease <span className="font-mono font-bold">f</span> by moving along the line. Only where the contour curve is <strong>tangent</strong> to the constraint does <span className="font-mono font-bold">∇f</span> point in the exact same direction as <span className="font-mono font-bold">∇g</span>!
          </div>
        </div>

      </div>

      {/* Sliders */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#121D33] border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Constraint Constant Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Constraint Constant c in (x + y = c)</span>
            <span className="font-mono text-[#E63946]">{c.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="6.0"
            step="0.2"
            value={c}
            onChange={(e) => setC(parseFloat(e.target.value))}
            className="w-full accent-[#E63946] cursor-pointer"
          />
        </div>

        {/* Position on Constraint Line */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Position along Constraint Line (Offset t)</span>
            <span className="font-mono text-amber-500">{tOffset.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-3.0"
            max="3.0"
            step="0.05"
            value={tOffset}
            onChange={(e) => setToffset(parseFloat(e.target.value))}
            className="w-full accent-[#F59E0B] cursor-pointer"
          />
        </div>

      </div>

    </div>
  );
}
