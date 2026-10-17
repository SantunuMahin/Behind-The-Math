import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function DerivativeLab() {
  const { isDark } = useTheme();
  const [fnType, setFnType] = useState('quadratic');
  const [xVal, setXVal] = useState(1.5);
  const [hVal, setHVal] = useState(1.0);
  const canvasRef = useRef(null);

  const getF = (x) => {
    switch (fnType) {
      case 'quadratic':
        return x * x;
      case 'sine':
        return Math.sin(x) * 2;
      case 'cubic':
        return 0.2 * Math.pow(x, 3);
      default:
        return x * x;
    }
  };

  const getFPrime = (x) => {
    switch (fnType) {
      case 'quadratic':
        return 2 * x;
      case 'sine':
        return 2 * Math.cos(x);
      case 'cubic':
        return 0.6 * x * x;
      default:
        return 2 * x;
    }
  };

  const fx = getF(xVal);
  const fxh = getF(xVal + hVal);
  const secantSlope = Math.abs(hVal) > 1e-6 ? (fxh - fx) / hVal : getFPrime(xVal);
  const tangentSlope = getFPrime(xVal);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const minX = -3;
    const maxX = 5;
    const minY = -4;
    const maxY = 10;

    const toCanvasX = (x) => ((x - minX) / (maxX - minX)) * width;
    const toCanvasY = (y) => height - ((y - minY) / (maxY - minY)) * height;

    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : '#E2E8F0';
    const axisColor = isDark ? '#475569' : '#94A3B8';
    const curveColor = isDark ? '#38BDF8' : '#1D3557';
    const tangentColor = isDark ? '#34D399' : '#059669';
    const secantColor = '#EF4444';

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
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(0));
    ctx.lineTo(width, toCanvasY(0));
    ctx.moveTo(toCanvasX(0), 0);
    ctx.lineTo(toCanvasX(0), height);
    ctx.stroke();

    // Plot Curve f(x)
    ctx.strokeStyle = curveColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    let started = false;
    for (let px = 0; px <= width; px += 2) {
      const x = minX + (px / width) * (maxX - minX);
      const y = getF(x);
      const cy = toCanvasY(y);
      if (!started) {
        ctx.moveTo(px, cy);
        started = true;
      } else {
        ctx.lineTo(px, cy);
      }
    }
    ctx.stroke();

    // Plot True Tangent Line (dashed)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = tangentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const x1 = minX;
    const y1 = fx + tangentSlope * (x1 - xVal);
    const x2 = maxX;
    const y2 = fx + tangentSlope * (x2 - xVal);
    ctx.moveTo(toCanvasX(x1), toCanvasY(y1));
    ctx.lineTo(toCanvasX(x2), toCanvasY(y2));
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot Secant Line (Coral / Red)
    ctx.strokeStyle = secantColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const sy1 = fx + secantSlope * (x1 - xVal);
    const sy2 = fx + secantSlope * (x2 - xVal);
    ctx.moveTo(toCanvasX(x1), toCanvasY(sy1));
    ctx.lineTo(toCanvasX(x2), toCanvasY(sy2));
    ctx.stroke();

    // Point (x, f(x))
    ctx.fillStyle = curveColor;
    ctx.beginPath();
    ctx.arc(toCanvasX(xVal), toCanvasY(fx), 5, 0, 2 * Math.PI);
    ctx.fill();

    // Point (x+h, f(x+h))
    ctx.fillStyle = secantColor;
    ctx.beginPath();
    ctx.arc(toCanvasX(xVal + hVal), toCanvasY(fxh), 5, 0, 2 * Math.PI);
    ctx.fill();
  }, [fnType, xVal, hVal, fx, fxh, secantSlope, tangentSlope, isDark]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121D33] overflow-hidden shadow-md">
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">📐</span>
          <span className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200">
            Derivative & Secant-to-Tangent Slope Explorer
          </span>
        </div>
        <button
          onClick={() => {
            setFnType('quadratic');
            setXVal(1.5);
            setHVal(1.0);
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
          <div className="flex gap-2">
            {[
              { id: 'quadratic', label: 'f(x) = x²' },
              { id: 'sine', label: 'f(x) = 2 sin(x)' },
              { id: 'cubic', label: 'f(x) = 0.2x³' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFnType(item.id)}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-mono font-medium transition-colors ${
                  fnType === item.id
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
              <label>Point x = {xVal.toFixed(2)}</label>
              <span className="font-mono text-slate-500 text-xs">f(x) = {fx.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-2"
              max="3"
              step="0.1"
              value={xVal}
              onChange={(e) => setXVal(parseFloat(e.target.value))}
              className="w-full accent-[#1D3557] cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
              <label>Step interval h = {hVal.toFixed(3)}</label>
              <span className="text-xs text-red-600 font-bold">Drag towards 0 to see snap!</span>
            </div>
            <input
              type="range"
              min="0.02"
              max="2.0"
              step="0.02"
              value={hVal}
              onChange={(e) => setHVal(parseFloat(e.target.value))}
              className="w-full accent-[#E63946] cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
              <span className="text-red-700 dark:text-red-400 font-semibold block mb-0.5">Secant Slope [f(x+h)-f(x)]/h</span>
              <span className="font-mono font-bold text-red-900 dark:text-red-200 text-base">
                {secantSlope.toFixed(3)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold block mb-0.5">True Tangent Slope f'(x)</span>
              <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200 text-base">
                {tangentSlope.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
