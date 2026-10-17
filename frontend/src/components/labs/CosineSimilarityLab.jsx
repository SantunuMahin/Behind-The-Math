import React, { useState, useEffect, useRef } from 'react';
import { Compass, RotateCcw, Sparkles, Brain, CheckCircle2, ArrowRight } from 'lucide-react';
import MathView from '../common/MathView';
import { useTheme } from '../../context/ThemeContext';

export default function CosineSimilarityLab() {
  const { isDark } = useTheme();
  const [uX, setUX] = useState(4.0);
  const [uY, setUY] = useState(2.0);
  const [vX, setVX] = useState(2.0);
  const [vY, setVY] = useState(4.0);

  const canvasRef = useRef(null);

  // Computations
  const dotProduct = uX * vX + uY * vY;
  const magU = Math.sqrt(uX * uX + uY * uY);
  const magV = Math.sqrt(vX * vX + vY * vY);

  const denom = magU * magV;
  const rawCos = denom > 0.0001 ? dotProduct / denom : 0;
  const cosSim = Math.max(-1, Math.min(1, rawCos));
  const angleRad = Math.acos(cosSim);
  const angleDeg = (angleRad * 180) / Math.PI;

  const euclideanDist = Math.sqrt((uX - vX) ** 2 + (uY - vY) ** 2);
  const cosineDist = 1 - cosSim;

  const SEMANTIC_PRESETS = [
    { label: 'Synonyms (Parallel)', u: [4, 2], v: [2, 1], desc: '"excellent" vs "great" (θ ≈ 0°)' },
    { label: 'Related Domain', u: [4, 1], v: [3, 3], desc: '"physicist" vs "quantum" (θ ≈ 30°)' },
    { label: 'Orthogonal (Unrelated)', u: [4, 0], v: [0, 4], desc: '"banana" vs "quantum" (θ = 90°)' },
    { label: 'Opposite (Antonyms)', u: [4, 1], v: [-4, -1], desc: '"love" vs "hate" (θ = 180°)' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const scale = 36; // pixels per unit

    ctx.clearRect(0, 0, width, height);

    // Canvas background
    ctx.fillStyle = isDark ? '#080E1C' : '#F8FAFC';
    ctx.fillRect(0, 0, width, height);

    // Subtle Grid
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
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // Unit circle guide (dashed)
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, scale * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vector Screen Coordinates
    const uScreenX = cx + uX * scale;
    const uScreenY = cy - uY * scale;

    const vScreenX = cx + vX * scale;
    const vScreenY = cy - vY * scale;

    // Euclidean distance segment between arrowheads (dotted)
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(uScreenX, uScreenY);
    ctx.lineTo(vScreenX, vScreenY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Angle theta arc
    const angleU = Math.atan2(-uY, uX);
    const angleV = Math.atan2(-vY, vX);

    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 40, Math.min(angleU, angleV), Math.max(angleU, angleV), false);
    ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(`θ = ${angleDeg.toFixed(1)}°`, cx + 45, cy - 15);

    // Draw Vector U (Emerald)
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(uScreenX, uScreenY);
    ctx.stroke();

    // Vector U Arrowhead
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.moveTo(uScreenX, uScreenY);
    ctx.lineTo(uScreenX - 12 * Math.cos(angleU - Math.PI / 6), uScreenY - 12 * Math.sin(angleU - Math.PI / 6));
    ctx.lineTo(uScreenX - 12 * Math.cos(angleU + Math.PI / 6), uScreenY - 12 * Math.sin(angleU + Math.PI / 6));
    ctx.fill();

    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillText('u', uScreenX + 8, uScreenY - 6);

    // Draw Vector V (Indigo/Blue)
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(vScreenX, vScreenY);
    ctx.stroke();

    // Vector V Arrowhead
    ctx.fillStyle = '#6366F1';
    ctx.beginPath();
    ctx.moveTo(vScreenX, vScreenY);
    ctx.lineTo(vScreenX - 12 * Math.cos(angleV - Math.PI / 6), vScreenY - 12 * Math.sin(angleV - Math.PI / 6));
    ctx.lineTo(vScreenX - 12 * Math.cos(angleV + Math.PI / 6), vScreenY - 12 * Math.sin(angleV + Math.PI / 6));
    ctx.fill();

    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillText('v', vScreenX + 8, vScreenY - 6);

    // Origin dot
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

  }, [uX, uY, vX, vY, angleDeg, isDark]);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider">
            <Brain className="w-4 h-4" />
            <span>Machine Learning & Vector Embeddings</span>
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            Cosine Similarity & Vector Space Metric Lab
          </h3>
        </div>

        <button
          onClick={() => { setUX(4); setUY(2); setVX(2); setVY(4); }}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Vectors</span>
        </button>
      </div>

      {/* Visualizer & Metric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Canvas */}
        <div className="lg:col-span-8 rounded-2xl bg-black border border-slate-200 dark:border-slate-800 p-2 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={640}
            height={420}
            className="w-full h-auto rounded-xl block"
          />

          {/* Metric Bar Badge */}
          <div className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-slate-900/90 backdrop-blur-xs border border-slate-700 text-xs shadow-lg space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Cosine Similarity:</span>
              <span className={`font-mono font-bold text-sm ${cosSim > 0.7 ? 'text-emerald-400' : cosSim > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                {cosSim.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* Readout Panels */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#121D33] border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Vector Similarity Metric</span>
            </h4>

            <div className="p-3 rounded-xl bg-white dark:bg-[#080E1C] border border-slate-200 dark:border-slate-800 text-center font-mono text-sm text-[#1D3557] dark:text-[#A8DADC]">
              <MathView math="\cos(\theta) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|}" />
            </div>

            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Dot Product (u · v):</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{dotProduct.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Vector Norms:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  ||u|| = {magU.toFixed(2)}, ||v|| = {magV.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Angle Between (θ):</span>
                <span className="font-mono font-bold text-amber-500">{angleDeg.toFixed(1)}°</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Euclidean Distance:</span>
                <span className="font-mono font-bold text-rose-500">{euclideanDist.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-300 leading-relaxed">
            <p className="font-semibold mb-1">Why ML uses Cosine Similarity:</p>
            In LLMs and semantic embeddings (e.g. OpenAI ada, BERT, CLIP), word meaning depends on <strong>direction</strong> in latent space rather than vector length. A short essay and a 100-page book discussing "astrophysics" will have different magnitudes but point in the exact same direction (<span className="font-mono font-bold">cos θ ≈ 1.0</span>)!
          </div>

        </div>

      </div>

      {/* Vector Sliders & Presets */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#121D33] border border-slate-200 dark:border-slate-800 space-y-5">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Vector u_x</span>
              <span className="font-mono">{uX.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.2"
              value={uX}
              onChange={(e) => setUX(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Vector u_y</span>
              <span className="font-mono">{uY.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.2"
              value={uY}
              onChange={(e) => setUY(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>Vector v_x</span>
              <span className="font-mono">{vX.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.2"
              value={vX}
              onChange={(e) => setVX(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>Vector v_y</span>
              <span className="font-mono">{vY.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.2"
              value={vY}
              onChange={(e) => setVY(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

        </div>

        {/* Semantic NLP Presets */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-semibold mr-2">NLP Embedding Presets:</span>
          {SEMANTIC_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { setUX(p.u[0]); setUY(p.u[1]); setVX(p.v[0]); setVY(p.v[1]); }}
              className="px-3 py-1 rounded-xl text-xs font-medium bg-white dark:bg-[#080E1C] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors shadow-2xs"
            >
              <span>{p.label}</span>
            </button>
          ))}
        </div>

      </div>

    </div>
  );
}
