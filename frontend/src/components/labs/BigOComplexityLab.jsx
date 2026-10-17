import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Play, Pause, Zap, BarChart2, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function BigOComplexityLab() {
  const { isDark } = useTheme();

  const [n, setN] = useState(16);
  const [activeTab, setActiveTab] = useState('curves'); // 'curves' | 'race'
  const [isRacing, setIsRacing] = useState(false);
  const [raceProgress, setRaceProgress] = useState({
    binary: 0,
    linear: 0,
    quick: 0,
    bubble: 0,
  });

  const canvasRef = useRef(null);
  const raceAnimRef = useRef(null);

  const complexities = [
    { name: 'O(1)', label: 'Constant', fn: () => 1, color: '#10B981' },
    { name: 'O(log n)', label: 'Logarithmic', fn: (x) => Math.log2(x), color: '#06B6D4' },
    { name: 'O(n)', label: 'Linear', fn: (x) => x, color: '#3B82F6' },
    { name: 'O(n log n)', label: 'Linearithmic', fn: (x) => x * Math.log2(x), color: '#F59E0B' },
    { name: 'O(n²)', label: 'Quadratic', fn: (x) => x * x, color: '#EF4444' },
    { name: 'O(2ⁿ)', label: 'Exponential', fn: (x) => Math.pow(2, Math.min(18, x)), color: '#8B5CF6' },
  ];

  // Algorithm race simulation
  useEffect(() => {
    if (!isRacing) return;

    let startTime = performance.now();
    const linearOps = n;
    const binaryOps = Math.ceil(Math.log2(n));
    const quickOps = Math.ceil(n * Math.log2(n));
    const bubbleOps = n * n;

    const animateRace = (now) => {
      const elapsed = (now - startTime) / 1000; // seconds

      // Speeds scaled relative to theoretical operations
      setRaceProgress({
        binary: Math.min(100, elapsed * 180),
        linear: Math.min(100, elapsed * (180 / Math.max(1, linearOps / binaryOps))),
        quick: Math.min(100, elapsed * (140 / Math.max(1, quickOps / (binaryOps * 4)))),
        bubble: Math.min(100, elapsed * (120 / Math.max(1, bubbleOps / (binaryOps * 8)))),
      });

      if (elapsed < 3) {
        raceAnimRef.current = requestAnimationFrame(animateRace);
      } else {
        setIsRacing(false);
      }
    };

    raceAnimRef.current = requestAnimationFrame(animateRace);
    return () => cancelAnimationFrame(raceAnimRef.current);
  }, [isRacing, n]);

  const startRace = () => {
    setRaceProgress({ binary: 0, linear: 0, quick: 0, bubble: 0 });
    setIsRacing(true);
  };

  // Draw 2D Continuous Growth Curves
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeTab !== 'curves') return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 35;
    const plotW = width - padding * 2;
    const plotH = height - padding * 2;

    ctx.clearRect(0, 0, width, height);

    // Dark/light mode colors
    const bgGrid = isDark ? '#16233B' : '#F1F5F9';
    const axisColor = isDark ? '#334155' : '#CBD5E1';
    const textColor = isDark ? '#94A3B8' : '#64748B';

    // Background Grid
    ctx.strokeStyle = bgGrid;
    ctx.lineWidth = 1;
    for (let x = padding; x <= width - padding; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }
    for (let y = padding; y <= height - padding; y += 30) {
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Scale mappings
    const maxN = 32;
    const maxOps = 300; // Visual clamp for vertical scaling

    const toX = (val) => padding + (val / maxN) * plotW;
    const toY = (val) => height - padding - Math.min(plotH, (val / maxOps) * plotH);

    // Plot each complexity curve
    complexities.forEach((c) => {
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 2.2;
      ctx.beginPath();

      for (let x = 1; x <= maxN; x += 0.5) {
        const yVal = c.fn(x);
        const px = toX(x);
        const py = toY(yVal);
        if (x === 1) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    });

    // Vertical line at current n
    const curX = toX(n);
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(curX, padding);
    ctx.lineTo(curX, height - padding);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dots at current n
    complexities.forEach((c) => {
      const yVal = c.fn(n);
      const px = curX;
      const py = toY(yVal);

      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = textColor;
    ctx.font = '10px sans-serif';
    ctx.fillText('Operations / Time Steps', padding, 20);
    ctx.fillText('Input Size (n)', width - padding - 60, height - 10);
  }, [n, activeTab, isDark]);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] overflow-hidden shadow-xl transition-colors">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-[#0e172a] border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
            ⚡
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              Big-O Computational Complexity & Algorithm Arena
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Interactive 2D growth curves and live algorithm race (Linear vs Binary vs QuickSort)
            </p>
          </div>
        </div>

        {/* View Switcher & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('curves')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === 'curves'
                  ? 'bg-white dark:bg-[#121D33] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              2D Curves
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('race')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === 'race'
                  ? 'bg-white dark:bg-[#121D33] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Algorithm Race
            </button>
          </div>
          <button
            type="button"
            onClick={() => setN(16)}
            className="p-1.5 px-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 space-y-6">
        
        {/* Slider */}
        <div className="space-y-1.5 max-w-xl mx-auto">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
            <label>Input Size n = {n}</label>
            <span className="text-[11px] text-slate-400">Drag to observe explosive exponential growth</span>
          </div>
          <input
            type="range"
            min="2"
            max="32"
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="w-full accent-teal-500 cursor-pointer"
          />
        </div>

        {/* Tab 1: 2D Continuous Curves */}
        {activeTab === 'curves' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 flex justify-center bg-slate-50 dark:bg-[#070c18] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner">
              <canvas
                ref={canvasRef}
                width={560}
                height={280}
                className="w-full h-auto block"
              />
            </div>

            <div className="lg:col-span-4 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Complexity Growth at n = {n}:
              </span>
              <div className="space-y-1.5">
                {complexities.map((item) => {
                  const val = item.fn(n);
                  return (
                    <div
                      key={item.name}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-[#091122] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-bold font-mono text-slate-900 dark:text-white">{item.name}</span>
                        <span className="text-[10px] text-slate-400">({item.label})</span>
                      </div>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {val > 100000 ? val.toExponential(2) : Math.round(val).toLocaleString()} ops
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Algorithm Racing Arena */
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Live Algorithm Speed Race (Array Size n = {n}):
              </span>
              <button
                type="button"
                onClick={startRace}
                disabled={isRacing}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isRacing ? 'Racing...' : 'Start Race'}</span>
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-[#070c18] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              {[
                { name: 'Binary Search', complexity: 'O(log n)', pct: raceProgress.binary, color: '#06B6D4' },
                { name: 'Linear Search', complexity: 'O(n)', pct: raceProgress.linear, color: '#3B82F6' },
                { name: 'QuickSort', complexity: 'O(n log n)', pct: raceProgress.quick, color: '#F59E0B' },
                { name: 'Bubble Sort', complexity: 'O(n²)', pct: raceProgress.bubble, color: '#EF4444' },
              ].map((algo) => (
                <div key={algo.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{algo.name} ({algo.complexity})</span>
                    <span className="text-slate-500">{Math.round(algo.pct)}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${algo.pct}%`, backgroundColor: algo.color }}
                      className="h-full rounded-full transition-all duration-75"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
