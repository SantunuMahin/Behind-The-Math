import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function NeuralNetworkLab() {
  const { isDark } = useTheme();

  const [dataset, setDataset] = useState('circles'); // 'circles' | 'xor' | 'moons' | 'spiral'
  const [activation, setActivation] = useState('tanh'); // 'tanh' | 'relu' | 'sigmoid'
  const [hiddenSize, setHiddenSize] = useState(8);
  const [isTraining, setIsTraining] = useState(false);
  const [epochs, setEpochs] = useState(0);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Neural network weights & biases: Layer 1 (2 -> H), Layer 2 (H -> 1)
  const nnRef = useRef({
    W1: [],
    b1: [],
    W2: [],
    b2: 0,
    dataPoints: [],
  });

  // Activation functions
  const act = (z, fn) => {
    if (fn === 'relu') return Math.max(0, z);
    if (fn === 'sigmoid') return 1 / (1 + Math.exp(-z));
    return Math.tanh(z); // tanh
  };

  const actDeriv = (a, fn) => {
    if (fn === 'relu') return a > 0 ? 1 : 0;
    if (fn === 'sigmoid') return a * (1 - a);
    return 1 - a * a; // tanh derivative
  };

  // Generate synthetic datasets
  const generateData = (type) => {
    const pts = [];
    const count = 120;

    if (type === 'circles') {
      for (let i = 0; i < count; i++) {
        const label = i < count / 2 ? 0 : 1;
        const r = label === 0 ? Math.random() * 0.45 : 0.65 + Math.random() * 0.35;
        const angle = Math.random() * Math.PI * 2;
        pts.push({ x1: r * Math.cos(angle), x2: r * Math.sin(angle), label });
      }
    } else if (type === 'xor') {
      for (let i = 0; i < count; i++) {
        const x1 = (Math.random() - 0.5) * 1.8;
        const x2 = (Math.random() - 0.5) * 1.8;
        const label = (x1 * x2 > 0) ? 1 : 0;
        pts.push({ x1, x2, label });
      }
    } else if (type === 'moons') {
      for (let i = 0; i < count / 2; i++) {
        const theta = (i / (count / 2)) * Math.PI;
        pts.push({
          x1: Math.cos(theta) * 0.65 - 0.2 + (Math.random() - 0.5) * 0.1,
          x2: Math.sin(theta) * 0.65 - 0.1 + (Math.random() - 0.5) * 0.1,
          label: 0,
        });
        pts.push({
          x1: 1 - Math.cos(theta) * 0.65 - 0.2 + (Math.random() - 0.5) * 0.1,
          x2: 1 - Math.sin(theta) * 0.65 - 0.5 + (Math.random() - 0.5) * 0.1,
          label: 1,
        });
      }
    } else if (type === 'spiral') {
      for (let i = 0; i < count / 2; i++) {
        const r = (i / (count / 2)) * 0.9;
        const t1 = 1.75 * i / (count / 2) * 2 * Math.PI;
        pts.push({
          x1: r * Math.sin(t1) + (Math.random() - 0.5) * 0.08,
          x2: r * Math.cos(t1) + (Math.random() - 0.5) * 0.08,
          label: 0,
        });
        const t2 = t1 + Math.PI;
        pts.push({
          x1: r * Math.sin(t2) + (Math.random() - 0.5) * 0.08,
          x2: r * Math.cos(t2) + (Math.random() - 0.5) * 0.08,
          label: 1,
        });
      }
    }
    return pts;
  };

  // Initialize weights
  const initNetwork = (hSize, dType) => {
    const W1 = [];
    const b1 = [];
    for (let i = 0; i < hSize; i++) {
      W1.push([(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2]);
      b1.push((Math.random() - 0.5) * 0.5);
    }
    const W2 = [];
    for (let i = 0; i < hSize; i++) {
      W2.push((Math.random() - 0.5) * 2);
    }
    const b2 = (Math.random() - 0.5) * 0.5;

    nnRef.current = {
      W1,
      b1,
      W2,
      b2,
      dataPoints: generateData(dType),
    };
    setEpochs(0);
  };

  // Forward pass: returns prediction in [0, 1]
  const forward = (x1, x2, net, actFn) => {
    let out = net.b2;
    for (let i = 0; i < net.W1.length; i++) {
      const z = net.W1[i][0] * x1 + net.W1[i][1] * x2 + net.b1[i];
      const a = act(z, actFn);
      out += net.W2[i] * a;
    }
    return 1 / (1 + Math.exp(-out)); // final sigmoid probability
  };

  // 1 Backpropagation training step (SGD)
  const trainStep = (lr = 0.06) => {
    const net = nnRef.current;
    const pts = net.dataPoints;

    for (let p = 0; p < pts.length; p++) {
      const { x1, x2, label } = pts[p];

      // Forward pass with activations saved
      const a1 = [];
      let outSum = net.b2;
      for (let i = 0; i < net.W1.length; i++) {
        const z = net.W1[i][0] * x1 + net.W1[i][1] * x2 + net.b1[i];
        const a = act(z, activation);
        a1.push(a);
        outSum += net.W2[i] * a;
      }
      const pred = 1 / (1 + Math.exp(-outSum));

      // Error gradient
      const dOut = pred - label;

      // Update Layer 2
      for (let i = 0; i < net.W1.length; i++) {
        const dW2 = dOut * a1[i];
        net.W2[i] -= lr * dW2;
      }
      net.b2 -= lr * dOut;

      // Update Layer 1
      for (let i = 0; i < net.W1.length; i++) {
        const dH = dOut * net.W2[i] * actDeriv(a1[i], activation);
        net.W1[i][0] -= lr * dH * x1;
        net.W1[i][1] -= lr * dH * x2;
        net.b1[i] -= lr * dH;
      }
    }

    setEpochs((prev) => prev + 10);
  };

  useEffect(() => {
    initNetwork(hiddenSize, dataset);
  }, [hiddenSize, dataset]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Render coarse heatmap resolution for 60 FPS performance
    const res = 7;
    const net = nnRef.current;

    for (let px = 0; px < width; px += res) {
      for (let py = 0; py < height; py += res) {
        // Map pixel to [-1.1, 1.1]
        const x1 = (px / width) * 2.2 - 1.1;
        const x2 = (1 - py / height) * 2.2 - 1.1;

        const p = forward(x1, x2, net, activation);

        // Color interpolation: Class 0 (Sky Blue) to Class 1 (Rose/Crimson)
        let r, g, b;
        if (p < 0.5) {
          const t = p * 2; // 0 to 1
          r = Math.round(14 + t * 40);
          g = Math.round(165 - t * 40);
          b = Math.round(233 - t * 30);
        } else {
          const t = (p - 0.5) * 2; // 0 to 1
          r = Math.round(244 * t + 80 * (1 - t));
          g = Math.round(63 * t + 120 * (1 - t));
          b = Math.round(94 * t + 160 * (1 - t));
        }

        ctx.fillStyle = isDark
          ? `rgba(${r * 0.45}, ${g * 0.45}, ${b * 0.45}, 0.85)`
          : `rgba(${r}, ${g}, ${b}, 0.28)`;
        ctx.fillRect(px, py, res, res);
      }
    }

    // Coordinate cross axes
    ctx.strokeStyle = isDark ? '#334155' : '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw Data Points
    const pts = net.dataPoints;
    for (let i = 0; i < pts.length; i++) {
      const pt = pts[i];
      const cx = ((pt.x1 + 1.1) / 2.2) * width;
      const cy = (1 - (pt.x2 + 1.1) / 2.2) * height;

      ctx.beginPath();
      ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);

      if (pt.label === 0) {
        ctx.fillStyle = '#0284C7';
        ctx.strokeStyle = '#FFFFFF';
      } else {
        ctx.fillStyle = '#E11D48';
        ctx.strokeStyle = '#FFFFFF';
      }
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
    }
  }, [activation, isDark]);

  useEffect(() => {
    const animate = () => {
      if (isTraining) {
        trainStep();
      }
      renderCanvas();
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isTraining, renderCanvas]);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1424] overflow-hidden shadow-xl transition-colors">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-[#0e172a] border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-rose-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
            🧠
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              Neural Network Decision Boundary Lab
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live non-linear decision boundary heatmaps on complex 2D classification manifolds
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTraining(!isTraining)}
            className="p-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {isTraining ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isTraining ? 'Pause Training' : 'Train Network'}</span>
          </button>
          <button
            type="button"
            onClick={() => initNetwork(hiddenSize, dataset)}
            className="p-1.5 px-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Weights</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Heatmap Canvas Display (6 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center space-y-3">
          <div className="bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner w-full flex justify-center">
            <canvas
              ref={canvasRef}
              width={340}
              height={340}
              className="w-full max-w-[340px] h-auto block rounded-xl"
            />
          </div>
          <div className="flex items-center justify-between w-full text-[11px] px-2 text-slate-500 dark:text-slate-400 font-mono">
            <span>Epochs: <strong>{epochs}</strong></span>
            <span>Blue = Class 0 · Red = Class 1</span>
          </div>
        </div>

        {/* Architecture & Dataset Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Dataset Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              2D Classification Dataset:
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              {[
                { id: 'circles', label: 'Circles' },
                { id: 'xor', label: 'XOR' },
                { id: 'moons', label: 'Moons' },
                { id: 'spiral', label: 'Spiral' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDataset(d.id)}
                  className={`py-1.5 rounded-lg capitalize transition-all ${
                    dataset === d.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activation Function */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Activation Function φ(z):
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              {[
                { id: 'tanh', label: 'Tanh' },
                { id: 'relu', label: 'ReLU' },
                { id: 'sigmoid', label: 'Sigmoid' },
              ].map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setActivation(a.id)}
                  className={`py-1.5 rounded-lg transition-all ${
                    activation === a.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hidden Layer Size */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label>Hidden Neurons: {hiddenSize}</label>
              <span className="text-[10px] text-slate-400">Architecture: [2 → {hiddenSize} → 1]</span>
            </div>
            <input
              type="range"
              min="4"
              max="16"
              step="2"
              value={hiddenSize}
              onChange={(e) => setHiddenSize(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Single Step Training Button */}
          <button
            type="button"
            onClick={() => trainStep(0.12)}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>+ Step 10 Gradient Descent Epochs</span>
          </button>

          {/* Mathematical Identity */}
          <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 text-[11px] space-y-1">
            <span className="font-bold text-purple-800 dark:text-purple-300 block">Universal Approximation Theorem:</span>
            <div className="font-mono text-purple-700 dark:text-purple-300 text-[10px]">
              y = σ(W₂ · φ(W₁ x + b₁) + b₂)
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
              A single hidden layer with non-linear activation functions can approximate any continuous function on compact subsets of ℝⁿ.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
