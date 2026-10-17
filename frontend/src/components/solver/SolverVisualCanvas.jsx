import React, { useRef, useEffect } from 'react';

/**
 * Interactive visual canvas that plots geometric figures, parabolas,
 * tangent lines, vector projections, and distributions for each solver strategy.
 */
export default function SolverVisualCanvas({ slug, inputs = {}, calculatedValues = {} }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement.clientWidth || 400;
    const height = 220;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Draw subtle coordinate grid background
    ctx.strokeStyle = '#88888812';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const isDark = document.documentElement.classList.contains('dark');
    const mainStroke = isDark ? '#ffffff' : '#000000';
    const accentColor = '#f59e0b'; // amber-500
    const secondaryColor = isDark ? '#a1a1aa' : '#71717a';

    // 1. Quadratic Equation Plot
    if (slug === 'quadratic-equation') {
      const a = parseFloat(inputs.a) || 1;
      const b = parseFloat(inputs.b) || -5;
      const c = parseFloat(inputs.c) || 6;

      const cx = width / 2;
      const cy = height * 0.65;
      const scaleX = 22;
      const scaleY = 12;

      // Axes
      ctx.strokeStyle = isDark ? '#3f3f46' : '#e4e4e7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      // Parabola Curve
      ctx.strokeStyle = mainStroke;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let px = 0; px <= width; px += 2) {
        const x = (px - cx) / scaleX;
        const y = a * x * x + b * x + c;
        const py = cy - y * scaleY;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Vertex
      const vx = -b / (2 * a);
      const vy = a * vx * vx + b * vx + c;
      const pvx = cx + vx * scaleX;
      const pvy = cy - vy * scaleY;

      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(pvx, pvy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Roots if real
      if (calculatedValues.type === 'two_real') {
        const x1 = calculatedValues.x1;
        const x2 = calculatedValues.x2;
        [x1, x2].forEach((root) => {
          const rx = cx + root * scaleX;
          ctx.fillStyle = '#10b981'; // emerald
          ctx.beginPath();
          ctx.arc(rx, cy, 4.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      ctx.fillStyle = secondaryColor;
      ctx.font = '11px monospace';
      ctx.fillText(`Vertex: (${vx.toFixed(2)}, ${vy.toFixed(2)})`, 15, 25);
      ctx.fillText(`y = ${a}x² + ${b}x + ${c}`, 15, 42);
    }

    // 2. Circle Area Plot
    else if (slug === 'circle-area') {
      const r = Math.max(0.5, parseFloat(inputs.r) || 5);
      const cx = width / 2;
      const cy = height / 2;
      const radiusPx = Math.min(width * 0.35, height * 0.38, r * 15);

      // Shaded Area
      ctx.fillStyle = isDark ? '#ffffff0f' : '#0000000a';
      ctx.beginPath();
      ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
      ctx.fill();

      // Circumference
      ctx.strokeStyle = mainStroke;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
      ctx.stroke();

      // Center Dot
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();

      // Radius Line
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radiusPx, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = mainStroke;
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`r = ${r}`, cx + radiusPx / 2 - 10, cy - 8);
      ctx.fillText(`A = πr² ≈ ${calculatedValues.area || 0}`, 15, 25);
      ctx.fillText(`C = 2πr ≈ ${calculatedValues.circumference || 0}`, 15, 42);
    }

    // 3. Pythagorean Theorem Triangle Plot
    else if (slug === 'pythagorean-theorem') {
      const a = Math.max(0.5, parseFloat(inputs.a) || 3);
      const b = Math.max(0.5, parseFloat(inputs.b) || 4);
      const c = calculatedValues.hypotenuse || Math.sqrt(a * a + b * b);

      const maxLeg = Math.max(a, b);
      const scale = Math.min((width * 0.5) / maxLeg, (height * 0.6) / maxLeg);

      const startX = width * 0.25;
      const startY = height * 0.75;
      const p1 = { x: startX, y: startY };
      const p2 = { x: startX + a * scale, y: startY };
      const p3 = { x: startX, y: startY - b * scale };

      // Right angle square marker
      const sq = 12;
      ctx.strokeStyle = isDark ? '#52525b' : '#d4d4d8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(startX, startY - sq, sq, sq);

      // Triangle fill
      ctx.fillStyle = isDark ? '#ffffff0a' : '#00000008';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fill();

      // Triangle borders
      ctx.strokeStyle = mainStroke;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Hypotenuse highlight
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.stroke();

      ctx.fillStyle = mainStroke;
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`a = ${a}`, (p1.x + p2.x) / 2 - 10, p1.y + 18);
      ctx.fillText(`b = ${b}`, p1.x - 28, (p1.y + p3.y) / 2);
      ctx.fillStyle = accentColor;
      ctx.fillText(`c = ${c}`, (p2.x + p3.x) / 2 + 10, (p2.y + p3.y) / 2);
      ctx.fillText(`θ = ${calculatedValues.angle_deg || 0}°`, 15, 25);
    }

    // 4. 2x2 Linear System Intersecting Lines
    else if (slug === 'linear-system-2x2') {
      const a1 = parseFloat(inputs.a1) || 2;
      const b1 = parseFloat(inputs.b1) || 3;
      const c1 = parseFloat(inputs.c1) || 8;
      const a2 = parseFloat(inputs.a2) || 1;
      const b2 = parseFloat(inputs.b2) || -1;
      const c2 = parseFloat(inputs.c2) || -1;

      const cx = width / 2;
      const cy = height / 2;
      const scale = 20;

      // Axes
      ctx.strokeStyle = isDark ? '#3f3f46' : '#e4e4e7';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      // Line 1: a1*x + b1*y = c1 -> y = (c1 - a1*x)/b1
      if (Math.abs(b1) > 1e-6) {
        ctx.strokeStyle = '#3b82f6'; // blue
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let px = 0; px <= width; px += 20) {
          const x = (px - cx) / scale;
          const y = (c1 - a1 * x) / b1;
          const py = cy - y * scale;
          if (px === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Line 2: a2*x + b2*y = c2 -> y = (c2 - a2*x)/b2
      if (Math.abs(b2) > 1e-6) {
        ctx.strokeStyle = '#ec4899'; // pink
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let px = 0; px <= width; px += 20) {
          const x = (px - cx) / scale;
          const y = (c2 - a2 * x) / b2;
          const py = cy - y * scale;
          if (px === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Intersection Point
      if (calculatedValues.x !== undefined && calculatedValues.y !== undefined) {
        const ix = cx + calculatedValues.x * scale;
        const iy = cy - calculatedValues.y * scale;

        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(ix, iy, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = mainStroke;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`Intersection: (${calculatedValues.x}, ${calculatedValues.y})`, 15, 25);
      }
    }

    // 5. Derivative & Tangent Line Plot
    else if (slug === 'derivative-polynomial') {
      const a = parseFloat(inputs.a) || 1;
      const b = parseFloat(inputs.b) || -4;
      const c = parseFloat(inputs.c) || 3;
      const x0 = parseFloat(inputs.x0) || 2;

      const cx = width / 2;
      const cy = height * 0.7;
      const scaleX = 22;
      const scaleY = 12;

      // Curve
      ctx.strokeStyle = mainStroke;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px <= width; px += 4) {
        const x = (px - cx) / scaleX;
        const y = a * x * x + b * x + c;
        const py = cy - y * scaleY;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Tangent point
      const y0 = a * x0 * x0 + b * x0 + c;
      const m = 2 * a * x0 + b;
      const px0 = cx + x0 * scaleX;
      const py0 = cy - y0 * scaleY;

      // Tangent Line
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const tanRange = 3;
      const xA = x0 - tanRange;
      const yA = y0 + m * (xA - x0);
      const xB = x0 + tanRange;
      const yB = y0 + m * (xB - x0);
      ctx.moveTo(cx + xA * scaleX, cy - yA * scaleY);
      ctx.lineTo(cx + xB * scaleX, cy - yB * scaleY);
      ctx.stroke();

      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(px0, py0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = mainStroke;
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`Tangent slope m = ${m.toFixed(2)} at x₀ = ${x0}`, 15, 25);
    }

    // 6. Definite Integral Shaded Area
    else if (slug === 'definite-integral') {
      const A = parseFloat(inputs.a_coeff) || 3;
      const B = parseFloat(inputs.b_coeff) || 2;
      const C = parseFloat(inputs.c_coeff) || 1;
      const lower = parseFloat(inputs.lower) || 0;
      const upper = parseFloat(inputs.upper) || 2;

      const cx = width * 0.25;
      const cy = height * 0.75;
      const scaleX = 35;
      const scaleY = 10;

      // Shaded area under curve
      ctx.fillStyle = isDark ? '#f59e0b20' : '#f59e0b30';
      ctx.beginPath();
      ctx.moveTo(cx + lower * scaleX, cy);
      for (let x = lower; x <= upper; x += 0.05) {
        const y = A * x * x + B * x + C;
        ctx.lineTo(cx + x * scaleX, cy - y * scaleY);
      }
      ctx.lineTo(cx + upper * scaleX, cy);
      ctx.closePath();
      ctx.fill();

      // Curve
      ctx.strokeStyle = mainStroke;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let px = 0; px <= width; px += 4) {
        const x = (px - cx) / scaleX;
        const y = A * x * x + B * x + C;
        const py = cy - y * scaleY;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.fillStyle = accentColor;
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`Area = ${calculatedValues.integral || 0} units²`, 15, 25);
      ctx.fillText(`Limits: [${lower}, ${upper}]`, 15, 42);
    }

    // 7. Normal Distribution Bell Curve
    else if (slug === 'normal-zscore') {
      const z = calculatedValues.z || 1.0;
      const cx = width / 2;
      const cy = height * 0.75;
      const scaleX = 40;
      const scaleY = 160;

      // Bell curve: f(z) = (1/sqrt(2pi)) * exp(-z^2 / 2)
      const normPdf = (t) => (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * t * t);

      // Shaded area to left of Z
      ctx.fillStyle = isDark ? '#3b82f630' : '#3b82f620';
      ctx.beginPath();
      ctx.moveTo(cx - 3.5 * scaleX, cy);
      for (let t = -3.5; t <= Math.min(3.5, z); t += 0.05) {
        ctx.lineTo(cx + t * scaleX, cy - normPdf(t) * scaleY);
      }
      ctx.lineTo(cx + Math.min(3.5, z) * scaleX, cy);
      ctx.closePath();
      ctx.fill();

      // Bell Curve
      ctx.strokeStyle = mainStroke;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let t = -3.5; t <= 3.5; t += 0.05) {
        const px = cx + t * scaleX;
        const py = cy - normPdf(t) * scaleY;
        if (t === -3.5) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Z marker line
      const zPx = cx + z * scaleX;
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(zPx, cy);
      ctx.lineTo(zPx, cy - normPdf(z) * scaleY);
      ctx.stroke();

      ctx.fillStyle = accentColor;
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`Z = ${z.toFixed(2)} (Percentile: ${calculatedValues.percentile || 0}%)`, 15, 25);
    }

    // 8. Default Vector or General Canvas
    else {
      ctx.fillStyle = secondaryColor;
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Interactive Geometric Model Active', width / 2, height / 2);
    }
  }, [slug, inputs, calculatedValues]);

  return (
    <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 p-3 relative overflow-hidden">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 px-1">
        <span>Geometric Vector Plot</span>
        <span className="text-amber-500 font-mono">Live Simulation</span>
      </div>
      <canvas ref={canvasRef} className="w-full rounded-xl block" />
    </div>
  );
}
