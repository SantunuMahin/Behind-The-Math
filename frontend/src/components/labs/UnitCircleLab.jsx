import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function UnitCircleLab() {
  const { isDark } = useTheme();
  const [angleDeg, setAngleDeg] = useState(45);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    let animId;
    if (isPlaying) {
      const step = () => {
        setAngleDeg((prev) => (prev + 1) % 360);
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const rad = (angleDeg * Math.PI) / 180;
  const cosVal = Math.cos(rad);
  const sinVal = Math.sin(rad);
  const tanVal = Math.abs(cosVal) > 1e-4 ? Math.tan(rad) : NaN;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Dynamic theme colors
    const bgGrid = isDark ? '#16233B' : '#F1F5F9';
    const axisColor = isDark ? '#334155' : '#E2E8F0';
    const radiusColor = isDark ? '#F1FAEE' : '#1D3557';

    // Left Unit circle center
    const circleR = 75;
    const cx = 110;
    const cy = height / 2;

    // Unit circle background & grid
    ctx.strokeStyle = bgGrid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - circleR - 20, cy);
    ctx.lineTo(cx + circleR + 20, cy);
    ctx.moveTo(cx, cy - circleR - 20);
    ctx.lineTo(cx, cy + circleR + 20);
    ctx.stroke();

    // The circle
    ctx.strokeStyle = '#457B9D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, circleR, 0, 2 * Math.PI);
    ctx.stroke();

    // Coordinates on circle
    const px = cx + cosVal * circleR;
    const py = cy - sinVal * circleR;

    // Radius line
    ctx.strokeStyle = radiusColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Triangle projections (cos in blue, sin in coral)
    ctx.strokeStyle = '#457B9D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, cy);
    ctx.stroke();

    ctx.strokeStyle = '#E63946';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Center point and end point
    ctx.fillStyle = '#E63946';
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, 2 * Math.PI);
    ctx.fill();

    // Wave drawing on the right
    const waveStartX = 230;
    const waveEndX = width - 15;
    const waveWidth = waveEndX - waveStartX;

    // Sine wave axis
    ctx.strokeStyle = axisColor;
    ctx.beginPath();
    ctx.moveTo(waveStartX, cy);
    ctx.lineTo(waveEndX, cy);
    ctx.stroke();

    // Connecting horizontal guide line from circle to wave
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(230, 57, 70, 0.4)';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(waveStartX, py);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Sine Wave
    ctx.strokeStyle = '#E63946';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= waveWidth; x += 2) {
      const theta = rad - (x / waveWidth) * 2 * Math.PI;
      const y = cy - Math.sin(theta) * circleR;
      if (x === 0) ctx.moveTo(waveStartX + x, y);
      else ctx.lineTo(waveStartX + x, y);
    }
    ctx.stroke();

    // Current point on wave
    ctx.fillStyle = '#E63946';
    ctx.beginPath();
    ctx.arc(waveStartX, py, 4.5, 0, 2 * Math.PI);
    ctx.fill();
  }, [angleDeg, rad, cosVal, sinVal]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121D33] overflow-hidden shadow-md">
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔄</span>
          <span className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200">
            Trigonometric Unit Circle & Sine Wave
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:opacity-90 text-xs flex items-center gap-1 font-medium"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Trace'}</span>
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setAngleDeg(45);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex justify-center bg-slate-50 dark:bg-[#091122] p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <canvas ref={canvasRef} width={420} height={260} className="max-w-full h-auto" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
              <label>Angle θ: {angleDeg}°</label>
              <span className="font-mono text-slate-500 text-xs">{(rad / Math.PI).toFixed(2)}π rad</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={angleDeg}
              onChange={(e) => {
                setIsPlaying(false);
                setAngleDeg(parseInt(e.target.value, 10));
              }}
              className="w-full accent-[#E63946] cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c1629] border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">cos θ (x)</span>
              <span className="font-mono font-bold text-[#457B9D] dark:text-[#A8DADC] text-sm">
                {cosVal.toFixed(3)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c1629] border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">sin θ (y)</span>
              <span className="font-mono font-bold text-red-600 dark:text-red-400 text-sm">
                {sinVal.toFixed(3)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c1629] border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">tan θ (y/x)</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-200 text-sm">
                {isNaN(tanVal) ? '∞' : tanVal.toFixed(3)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span className="font-semibold">Pythagorean Identity Verification:</span>
            <span className="font-mono font-bold">
              sin²θ + cos²θ = {(sinVal * sinVal + cosVal * cosVal).toFixed(4)} = 1.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
