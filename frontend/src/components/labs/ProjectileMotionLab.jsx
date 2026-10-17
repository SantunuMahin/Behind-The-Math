import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Rocket, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ProjectileMotionLab() {
  const { isDark } = useTheme();
  const [angleDeg, setAngleDeg] = useState(45);
  const [v0, setV0] = useState(25);
  const [gravity, setGravity] = useState(9.8);
  const [simTime, setSimTime] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);

  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const angleRad = (angleDeg * Math.PI) / 180;
  const vx0 = v0 * Math.cos(angleRad);
  const vy0 = v0 * Math.sin(angleRad);

  // Guard against non-positive gravity division by zero
  const safeGravity = Math.max(0.1, gravity);

  // Time of flight (landing at y = 0)
  const totalFlightTime = (2 * vy0) / safeGravity;
  const maxHeight = Math.pow(vy0, 2) / (2 * safeGravity);
  const maxRange = vx0 * totalFlightTime;

  const reset = () => {
    setIsLaunching(false);
    setSimTime(0);
    setAngleDeg(45);
    setV0(25);
    setGravity(9.8);
  };

  const launch = () => {
    setSimTime(0);
    setIsLaunching(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const groundY = height - 35;
    const originX = 40;

    // Scaling factors (pixels per meter)
    const scaleX = Math.min(6, (width - 70) / Math.max(10, maxRange));
    const scaleY = Math.min(6, (groundY - 30) / Math.max(5, maxHeight * 1.2));

    ctx.clearRect(0, 0, width, height);

    const arcColor = isDark ? '#334155' : '#CBD5E1';
    const traceColor = isDark ? '#38BDF8' : '#0284C7';
    const launcherColor = isDark ? '#E2E8F0' : '#1D3557';

    // 1. Sky & Ground
    ctx.fillStyle = isDark ? '#065F46' : '#10B981';
    ctx.fillRect(0, groundY, width, height - groundY);
    ctx.fillStyle = isDark ? '#047857' : '#059669';
    ctx.fillRect(0, groundY, width, 4);

    // 2. Trajectory Arc (Full theoretical path)
    ctx.strokeStyle = arcColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(originX, groundY);

    const stepT = totalFlightTime / 60;
    for (let t = 0; t <= totalFlightTime; t += stepT) {
      const px = originX + vx0 * t * scaleX;
      const py = groundY - (vy0 * t - 0.5 * gravity * t * t) * scaleY;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Current Projectile Position
    const curT = Math.min(simTime, totalFlightTime);
    const curX = originX + vx0 * curT * scaleX;
    const curY = groundY - (vy0 * curT - 0.5 * gravity * curT * curT) * scaleY;

    // Traced path up to current time
    ctx.strokeStyle = traceColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(originX, groundY);
    for (let t = 0; t <= curT; t += stepT) {
      const px = originX + vx0 * t * scaleX;
      const py = groundY - (vy0 * t - 0.5 * gravity * t * t) * scaleY;
      ctx.lineTo(px, py);
    }
    ctx.stroke();

    // 4. Projectile Ball & Glow
    ctx.fillStyle = '#E63946';
    ctx.beginPath();
    ctx.arc(curX, curY, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. Velocity Vectors (Vx and Vy)
    if (curT < totalFlightTime) {
      const curVy = vy0 - gravity * curT;
      const vecScale = 1.2;

      // Vx horizontal vector (Emerald)
      ctx.strokeStyle = '#2A9D8F';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(curX, curY);
      ctx.lineTo(curX + vx0 * vecScale, curY);
      ctx.stroke();

      // Vy vertical vector (Coral)
      ctx.strokeStyle = '#E63946';
      ctx.beginPath();
      ctx.moveTo(curX, curY);
      ctx.lineTo(curX, curY - curVy * vecScale);
      ctx.stroke();
    }

    // Cannon / Launcher
    ctx.save();
    ctx.translate(originX, groundY);
    ctx.rotate(-angleRad);
    ctx.fillStyle = launcherColor;
    ctx.fillRect(0, -5, 20, 10);
    ctx.restore();

    // Advance simulation time
    if (isLaunching) {
      if (simTime < totalFlightTime) {
        animRef.current = requestAnimationFrame(() => {
          setSimTime((prev) => prev + 0.02);
        });
      } else {
        setIsLaunching(false);
      }
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [angleDeg, v0, gravity, simTime, isLaunching, totalFlightTime, maxHeight, maxRange, vx0, vy0, angleRad, isDark]);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#121D33] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Projectile Motion & Kinematics Trajectory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Analyze trajectory parabolas, velocity vectors, flight time, and optimal 45° range launch angle
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={launch}
            disabled={isLaunching}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Shot</span>
          </button>

          <button
            onClick={reset}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 text-xs flex items-center gap-1 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Animated Trajectory Canvas */}
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
                <span>Horizontal Velocity vx (Constant)</span>
              </span>
              <span className="flex items-center gap-1 ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E63946] inline-block" />
                <span>Vertical Velocity vy (Accelerated)</span>
              </span>
            </span>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              Elapsed: {simTime.toFixed(2)}s / {totalFlightTime.toFixed(2)}s
            </span>
          </div>
        </div>

        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Launch Angle Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Launch Angle (θ)</span>
              <span className="font-mono text-[#1D3557] dark:text-[#A8DADC]">{angleDeg}°</span>
            </div>
            <input
              type="range"
              min="10"
              max="85"
              value={angleDeg}
              onChange={(e) => {
                setAngleDeg(parseInt(e.target.value));
                setSimTime(0);
              }}
              className="w-full accent-[#1D3557] dark:accent-[#A8DADC] cursor-pointer"
            />
          </div>

          {/* Initial Velocity Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Initial Velocity (v₀)</span>
              <span className="font-mono text-[#1D3557] dark:text-[#A8DADC]">{v0} m/s</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              value={v0}
              onChange={(e) => {
                setV0(parseInt(e.target.value));
                setSimTime(0);
              }}
              className="w-full accent-[#1D3557] dark:accent-[#A8DADC] cursor-pointer"
            />
          </div>

          {/* Gravity Selector */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Gravitational Acceleration (g)</span>
              <span className="font-mono text-[#1D3557] dark:text-[#A8DADC]">{gravity} m/s²</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {[
                { label: 'Earth (9.8)', g: 9.8 },
                { label: 'Moon (1.6)', g: 1.6 },
                { label: 'Mars (3.7)', g: 3.7 },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setGravity(item.g);
                    setSimTime(0);
                  }}
                  className={`py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                    gravity === item.g
                      ? 'bg-black text-white dark:bg-white dark:text-black font-semibold border-black dark:border-white'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry Readouts */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#091122] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Range
              </span>
              <span className="font-mono font-bold text-sm text-[#1D3557] dark:text-[#A8DADC]">
                {maxRange.toFixed(1)} m
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#091122] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Peak Height
              </span>
              <span className="font-mono font-bold text-sm text-[#1D3557] dark:text-[#A8DADC]">
                {maxHeight.toFixed(1)} m
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#091122] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Flight Time
              </span>
              <span className="font-mono font-bold text-sm text-[#1D3557] dark:text-[#A8DADC]">
                {totalFlightTime.toFixed(2)} s
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Takeaway Insight */}
      <div className="p-4 rounded-xl bg-[#F1FAEE] dark:bg-slate-800/60 border border-[#A8DADC]/60 dark:border-slate-700 text-xs text-[#1D3557] dark:text-[#A8DADC] leading-relaxed flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 shrink-0 text-[#E63946] mt-0.5" />
        <div>
          <span className="font-bold">Kinematic Principle:</span> Horizontal motion and vertical motion are completely independent. The horizontal velocity component vx remains constant throughout the flight, while vertical velocity vy decreases continuously by g until reaching 0 at maximum altitude. On level terrain, an angle of exactly <strong>45°</strong> maximizes total range R = (v₀² sin(2θ)) / g.
        </div>
      </div>

    </div>
  );
}
