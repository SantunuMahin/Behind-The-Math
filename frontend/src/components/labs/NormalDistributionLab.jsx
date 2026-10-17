import React, { useState, useMemo } from 'react';
import { RotateCcw, Sparkles, BarChart2 } from 'lucide-react';

// Approximation of the standard normal Cumulative Distribution Function (error function)
function standardNormalCdf(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp(-x * x / 2);
  const prob = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x > 0 ? 1 - prob : prob;
}

export default function NormalDistributionLab() {
  const [mean, setMean] = useState(0);
  const [sigma, setSigma] = useState(1.5);
  const [rangeA, setRangeA] = useState(-1.5);
  const [rangeB, setRangeB] = useState(1.5);

  const reset = () => {
    setMean(0);
    setSigma(1.5);
    setRangeA(-1.5);
    setRangeB(1.5);
  };

  // Dimensions of SVG plot
  const width = 580;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  const plotWidth = width - 2 * paddingX;
  const plotHeight = height - 2 * paddingY;

  // Domain range [-10, 10]
  const minX = -10;
  const maxX = 10;
  const maxDensity = 1 / (0.5 * Math.sqrt(2 * Math.PI)); // Max possible peak height when sigma=0.5

  const toSvgX = (x) => paddingX + ((x - minX) / (maxX - minX)) * plotWidth;
  const toSvgY = (y) => height - paddingY - (y / maxDensity) * plotHeight;

  // Gaussian PDF
  const pdf = (x, m, s) => {
    return (1 / (s * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - m) / s, 2));
  };

  // Generate points for full curve and shaded area
  const { pathData, shadedPathData, probability } = useMemo(() => {
    const points = [];
    const step = 0.1;
    for (let x = minX; x <= maxX; x += step) {
      const y = pdf(x, mean, sigma);
      points.push(`${toSvgX(x)},${toSvgY(y)}`);
    }
    const path = `M ${points.join(' L ')}`;

    // Shaded area between min(rangeA, rangeB) and max(rangeA, rangeB)
    const lower = Math.min(rangeA, rangeB);
    const upper = Math.max(rangeA, rangeB);

    const shadedPoints = [];
    shadedPoints.push(`${toSvgX(lower)},${toSvgY(0)}`);
    for (let x = lower; x <= upper; x += 0.05) {
      const y = pdf(x, mean, sigma);
      shadedPoints.push(`${toSvgX(x)},${toSvgY(y)}`);
    }
    shadedPoints.push(`${toSvgX(upper)},${toSvgY(pdf(upper, mean, sigma))}`);
    shadedPoints.push(`${toSvgX(upper)},${toSvgY(0)}`);
    const shadedPath = `M ${shadedPoints.join(' L ')} Z`;

    // Probability calculation: P(lower <= X <= upper)
    const z1 = (lower - mean) / sigma;
    const z2 = (upper - mean) / sigma;
    const prob = Math.max(0, standardNormalCdf(z2) - standardNormalCdf(z1));

    return { pathData: path, shadedPathData: shadedPath, probability: prob };
  }, [mean, sigma, rangeA, rangeB]);

  const peakHeight = (1 / (sigma * Math.sqrt(2 * Math.PI))).toFixed(3);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#121D33] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Normal (Gaussian) Distribution & Empirical Rule
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore how mean $\mu$ shifts the center and standard deviation $\sigma$ flattens or sharpens the bell curve
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

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* SVG Bell Curve Visualization */}
        <div className="lg:col-span-7 flex flex-col items-center bg-slate-50 dark:bg-[#091122] rounded-xl border border-slate-200 dark:border-slate-800/80 p-3 overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
            {/* Horizontal Grid lines */}
            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1={paddingX} y1={toSvgY(maxDensity * 0.5)} x2={width - paddingX} y2={toSvgY(maxDensity * 0.5)} stroke="#E2E8F0" strokeDasharray="3 3" />
            
            {/* Center Mean Axis Marker */}
            <line x1={toSvgX(mean)} y1={paddingY} x2={toSvgX(mean)} y2={height - paddingY} stroke="#457B9D" strokeDasharray="4 4" strokeWidth="1.5" />
            
            {/* Shaded Cumulative Probability Area */}
            <path d={shadedPathData} fill="rgba(69, 123, 157, 0.35)" />

            {/* Gaussian Curve Outline */}
            <path d={pathData} fill="none" stroke="#1D3557" strokeWidth="3" className="dark:stroke-[#A8DADC]" />

            {/* X-axis tick labels */}
            {[-8, -4, 0, 4, 8].map((val) => (
              <g key={val}>
                <line x1={toSvgX(val)} y1={height - paddingY} x2={toSvgX(val)} y2={height - paddingY + 5} stroke="#94A3B8" />
                <text x={toSvgX(val)} y={height - paddingY + 16} fontSize="10" textAnchor="middle" fill="#64748B">
                  {val}
                </text>
              </g>
            ))}

            {/* Mean marker label */}
            <text x={toSvgX(mean)} y={paddingY - 8} fontSize="11" fontWeight="bold" textAnchor="middle" fill="#1D3557" className="dark:fill-[#A8DADC]">
              μ = {mean}
            </text>
          </svg>

          {/* Empirical Rule Badges */}
          <div className="flex items-center gap-2 mt-2 flex-wrap justify-center text-[11px]">
            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold">
              ±1σ: 68.27%
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
              ±2σ: 95.45%
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-semibold">
              ±3σ: 99.73%
            </span>
          </div>
        </div>

        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Mean Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Mean Center (μ)</span>
              <span className="font-mono text-[#1D3557] dark:text-[#A8DADC]">{mean.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={mean}
              onChange={(e) => setMean(parseFloat(e.target.value))}
              className="w-full accent-[#1D3557] dark:accent-[#A8DADC] cursor-pointer"
            />
          </div>

          {/* Standard Deviation Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Std Deviation Spread (σ)</span>
              <span className="font-mono text-[#1D3557] dark:text-[#A8DADC]">{sigma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.5"
              step="0.05"
              value={sigma}
              onChange={(e) => setSigma(parseFloat(e.target.value))}
              className="w-full accent-[#1D3557] dark:accent-[#A8DADC] cursor-pointer"
            />
          </div>

          {/* Shaded Interval Range Sliders */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#091122] border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Shaded Integration Interval $[a, b]$
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block">Lower limit (a)</label>
                <input
                  type="range"
                  min="-6"
                  max="6"
                  step="0.1"
                  value={rangeA}
                  onChange={(e) => setRangeA(parseFloat(e.target.value))}
                  className="w-full accent-[#457B9D] cursor-pointer"
                />
                <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">{rangeA.toFixed(1)}</span>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Upper limit (b)</label>
                <input
                  type="range"
                  min="-6"
                  max="6"
                  step="0.1"
                  value={rangeB}
                  onChange={(e) => setRangeB(parseFloat(e.target.value))}
                  className="w-full accent-[#457B9D] cursor-pointer"
                />
                <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">{rangeB.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Computed Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                Calculated P(a ≤ X ≤ b)
              </span>
              <span className="font-mono font-bold text-lg text-emerald-800 dark:text-emerald-200">
                {(probability * 100).toFixed(2)}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 block">
                Peak Density f(μ)
              </span>
              <span className="font-mono font-bold text-lg text-blue-800 dark:text-blue-200">
                {peakHeight}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Takeaway Insight */}
      <div className="p-4 rounded-xl bg-[#F1FAEE] dark:bg-slate-800/60 border border-[#A8DADC]/60 dark:border-slate-700 text-xs text-[#1D3557] dark:text-[#A8DADC] leading-relaxed flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 shrink-0 text-[#E63946] mt-0.5" />
        <div>
          <span className="font-bold">Statistical Principle:</span> The total area under the entire Gaussian probability density curve is always strictly <strong>1.00 (100%)</strong>. Increasing $\sigma$ spreads data outwards and reduces peak height, while decreasing $\sigma$ concentrates probability sharply near the mean $\mu$.
        </div>
      </div>

    </div>
  );
}
