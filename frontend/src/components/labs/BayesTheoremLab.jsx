import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Sparkles, HelpCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function BayesTheoremLab() {
  const { isDark } = useTheme();

  // Probability Parameters (in percentages)
  const [prevalence, setPrevalence] = useState(1.0); // P(D) 1%
  const [sensitivity, setSensitivity] = useState(98.0); // P(+ | D) 98%
  const [falsePositiveRate, setFalsePositiveRate] = useState(5.0); // P(+ | ~D) 5%

  const canvasRef = useRef(null);

  // Compute Bayes theorem probabilities for 10,000 people
  const totalPopulation = 10000;
  const pD = prevalence / 100;
  const pNotD = 1 - pD;
  const pPosGivenD = sensitivity / 100;
  const pPosGivenNotD = falsePositiveRate / 100;

  // Expected counts in 10,000 population
  const totalSick = Math.round(totalPopulation * pD);
  const totalHealthy = totalPopulation - totalSick;

  const truePositives = Math.round(totalSick * pPosGivenD);
  const falseNegatives = totalSick - truePositives;

  const falsePositives = Math.round(totalHealthy * pPosGivenNotD);
  const trueNegatives = totalHealthy - falsePositives;

  const totalTestedPositive = truePositives + falsePositives;
  const posteriorProbability =
    totalTestedPositive > 0 ? (truePositives / totalTestedPositive) * 100 : 0;

  const PRESETS = [
    { label: 'Rare Disease (1% Prev, 5% FP)', p: 1.0, sens: 98.0, fp: 5.0 },
    { label: 'Rapid Antigen (5% Prev, 2% FP)', p: 5.0, sens: 95.0, fp: 2.0 },
    { label: 'Routine Mammogram (0.8% Prev, 9% FP)', p: 0.8, sens: 90.0, fp: 9.0 },
    { label: 'High Prevalence Epidemic (20%)', p: 20.0, sens: 98.0, fp: 3.0 },
  ];

  const reset = () => {
    setPrevalence(1.0);
    setSensitivity(98.0);
    setFalsePositiveRate(5.0);
  };

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

    // Draw 100 x 100 dot matrix representing 10,000 individuals
    const cols = 100;
    const rows = 100;
    const dotSpacing = width / cols;
    const dotRadius = dotSpacing * 0.38;

    let sickCount = totalSick;
    let truePosCount = truePositives;
    let falsePosCount = falsePositives;

    for (let i = 0; i < totalPopulation; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * dotSpacing + dotSpacing / 2;
      const y = row * dotSpacing + dotSpacing / 2;

      let dotColor = isDark ? '#1E293B' : '#E2E8F0'; // Default healthy & negative

      if (i < totalSick) {
        // Sick individual
        if (i < truePositives) {
          dotColor = '#EF4444'; // True Positive (Sick & Positive)
        } else {
          dotColor = isDark ? '#475569' : '#94A3B8'; // False Negative (Sick but Negative)
        }
      } else {
        // Healthy individual
        if (i - totalSick < falsePositives) {
          dotColor = '#F59E0B'; // False Positive (Healthy but Tested Positive!)
        } else {
          dotColor = isDark ? '#0F1E36' : '#E2E8F0'; // True Negative
        }
      }

      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [prevalence, sensitivity, falsePositiveRate, isDark, totalSick, truePositives, falsePositives]);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] overflow-hidden shadow-xl transition-colors">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-[#0e172a] border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
            🎲
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              Bayes' Theorem & Diagnostic Probability Matrix
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Interactive 10,000-person population matrix demystifying false positive paradoxes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={reset}
          className="p-1.5 px-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Dot Matrix Canvas (6 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center space-y-3">
          <div className="bg-slate-50 dark:bg-[#070c18] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner w-full flex justify-center">
            <canvas
              ref={canvasRef}
              width={340}
              height={340}
              className="w-full max-w-[340px] h-auto block rounded-xl"
            />
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>True Positives ({truePositives})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>False Positives ({falsePositives})</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Healthy & Neg ({trueNegatives})</span>
            </span>
          </div>
        </div>

        {/* Calculation & Sliders (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Big Posterior Probability Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-transparent border border-rose-200 dark:border-rose-900/50 space-y-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Posterior Probability P(Disease | Tested Positive):
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-black text-3xl sm:text-4xl text-rose-600 dark:text-rose-400">
                {posteriorProbability.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                ({truePositives} out of {totalTestedPositive} positive tests)
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
              {posteriorProbability < 50
                ? `Counter-intuitively, despite ${sensitivity}% test accuracy, if you test positive, you only have a ${posteriorProbability.toFixed(1)}% chance of actually being sick because the disease is rare!`
                : `Because prevalence is high, a positive test results in a high confidence (${posteriorProbability.toFixed(1)}%) of actual infection.`}
            </p>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Screening Scenarios:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setPrevalence(p.p);
                    setSensitivity(p.sens);
                    setFalsePositiveRate(p.fp);
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-left bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all truncate"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-3">
            {/* Prevalence P(D) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                <label>Disease Prevalence P(D): {prevalence.toFixed(1)}%</label>
                <span className="text-[10px] text-slate-400">{totalSick} in 10,000 sick</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="25"
                step="0.1"
                value={prevalence}
                onChange={(e) => setPrevalence(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Sensitivity P(+ | D) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                <label>Test Sensitivity P(+ | D): {sensitivity.toFixed(1)}%</label>
                <span className="text-[10px] text-slate-400">Catches {truePositives} sick cases</span>
              </div>
              <input
                type="range"
                min="80"
                max="99.9"
                step="0.1"
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* False Positive Rate P(+ | ~D) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                <label>False Positive Rate P(+ | ¬D): {falsePositiveRate.toFixed(1)}%</label>
                <span className="text-[10px] text-slate-400">Falsely alarms {falsePositives} healthy people</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="15"
                step="0.5"
                value={falsePositiveRate}
                onChange={(e) => setFalsePositiveRate(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Mathematical Equation */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070c18] border border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1">
            <span className="font-sans font-bold text-slate-800 dark:text-slate-200 block">Bayes Theorem:</span>
            <div className="text-rose-600 dark:text-rose-300 font-bold">
              P(D|+) = [P(+|D) · P(D)] / P(+)
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-[10px]">
              = ({pPosGivenD.toFixed(3)} × {pD.toFixed(3)}) / [({pPosGivenD.toFixed(3)} × {pD.toFixed(3)}) + ({pPosGivenNotD.toFixed(3)} × {pNotD.toFixed(3)})]
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
