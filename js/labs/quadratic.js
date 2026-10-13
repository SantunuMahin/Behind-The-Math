/* ============================================================
   BehindTheMath — Quadratic Function Explorer (Lab C)
   ============================================================ */

(function () {
  'use strict';

  function initQuadraticLab() {
    const canvas = document.getElementById('quad-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderA = document.getElementById('quad-a');
    const sliderB = document.getElementById('quad-b');
    const sliderC = document.getElementById('quad-c');
    const inputA  = document.getElementById('quad-a-num');
    const inputB  = document.getElementById('quad-b-num');
    const inputC  = document.getElementById('quad-c-num');
    const resetBtn = document.getElementById('quad-reset');

    const dispEq     = document.getElementById('quad-equation');
    const dispDisc   = document.getElementById('quad-discriminant');
    const dispVertex = document.getElementById('quad-vertex');
    const dispRoots  = document.getElementById('quad-roots');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let params = { a: 1, b: 0, c: -4 };
    let target = { ...params };
    let display = { ...params };

    function setParam(key, val) {
      const v = parseFloat(val);
      if (isNaN(v)) return;
      target[key] = Math.max(-10, Math.min(10, v));
      syncSliderInput(key, target[key]);
      if (reducedMotion) { display = { ...target }; draw(); }
    }

    function syncSliderInput(key, val) {
      const sliders = { a: sliderA, b: sliderB, c: sliderC };
      const inputs  = { a: inputA,  b: inputB,  c: inputC  };
      if (sliders[key]) sliders[key].value = val;
      if (inputs[key])  inputs[key].value  = val;
    }

    // World-to-canvas transform
    let xRange = [-8, 8], yRange = [-12, 12];

    function wx(x, W) { return (x - xRange[0]) / (xRange[1] - xRange[0]) * W; }
    function wy(y, H) { return H - (y - yRange[0]) / (yRange[1] - yRange[0]) * H; }

    function draw() {
      const W = canvas.width, H = canvas.height;
      const { a, b, c } = display;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#F7FAFC';
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = 'rgba(29,53,87,0.06)';
      ctx.lineWidth = 1;
      for (let x = Math.ceil(xRange[0]); x <= xRange[1]; x++) {
        const px = wx(x, W);
        ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
      }
      for (let y = Math.ceil(yRange[0]); y <= yRange[1]; y += 2) {
        const py = wy(y, H);
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
      }

      // Axes
      ctx.strokeStyle = 'rgba(29,53,87,0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, wy(0, H)); ctx.lineTo(W, wy(0, H)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(wx(0, W), 0); ctx.lineTo(wx(0, W), H); ctx.stroke();

      // Axis labels
      ctx.fillStyle = 'rgba(29,53,87,0.4)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      for (let x = Math.ceil(xRange[0]); x <= xRange[1]; x += 2) {
        if (x === 0) continue;
        ctx.fillText(x, wx(x, W), wy(0, H) + 14);
      }
      ctx.textAlign = 'right';
      for (let y = Math.ceil(yRange[0]); y <= yRange[1]; y += 4) {
        if (y === 0) continue;
        ctx.fillText(y, wx(0, W) - 4, wy(y, H) + 4);
      }

      if (Math.abs(a) < 0.01) {
        // Linear case: y = bx + c
        ctx.strokeStyle = '#A8DADC';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, wy(b * xRange[0] + c, H));
        ctx.lineTo(W, wy(b * xRange[1] + c, H));
        ctx.stroke();

        if (dispEq)     dispEq.textContent     = `y = ${b.toFixed(1)}x + ${c.toFixed(1)}`;
        if (dispDisc)   dispDisc.textContent   = 'Linear (a = 0)';
        if (dispVertex) dispVertex.textContent = '—';
        if (dispRoots)  dispRoots.textContent  = b !== 0 ? `x = ${(-c / b).toFixed(2)}` : 'None (horizontal line)';
        return;
      }

      // Parabola
      ctx.strokeStyle = '#457B9D';
      ctx.lineWidth   = 2.5;
      ctx.beginPath();
      let started = false;
      for (let px = 0; px <= W; px += 1.5) {
        const x = xRange[0] + (px / W) * (xRange[1] - xRange[0]);
        const y = a * x * x + b * x + c;
        const py = wy(y, H);
        if (py < -10 || py > H + 10) { started = false; continue; }
        if (!started) { ctx.moveTo(px, py); started = true; }
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Discriminant & roots
      const disc = b * b - 4 * a * c;
      const vx = -b / (2 * a);
      const vy = a * vx * vx + b * vx + c;

      // Vertex
      const vpx = wx(vx, W), vpy = wy(vy, H);
      if (vpx >= 0 && vpx <= W && vpy >= 0 && vpy <= H) {
        ctx.beginPath();
        ctx.arc(vpx, vpy, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#1D3557';
        ctx.fill();
        ctx.fillStyle = '#1D3557';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`V(${vx.toFixed(1)}, ${vy.toFixed(1)})`, vpx, vpy - 10);
      }

      // Real roots
      if (disc > 0) {
        const r1 = (-b + Math.sqrt(disc)) / (2 * a);
        const r2 = (-b - Math.sqrt(disc)) / (2 * a);
        [r1, r2].forEach(rx => {
          const rpx = wx(rx, W);
          if (rpx >= 0 && rpx <= W) {
            ctx.beginPath();
            ctx.arc(rpx, wy(0, H), 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#2A9D8F';
            ctx.fill();
            ctx.fillStyle = '#2A9D8F';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`x=${rx.toFixed(2)}`, rpx, wy(0, H) - 10);
          }
        });
      } else if (Math.abs(disc) < 0.001) {
        const rx = vx;
        const rpx = wx(rx, W);
        ctx.beginPath();
        ctx.arc(rpx, wy(0, H), 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#F4A261';
        ctx.fill();
      }

      // Update info
      if (dispEq) {
        const bStr = b >= 0 ? `+ ${b.toFixed(1)}x` : `− ${Math.abs(b).toFixed(1)}x`;
        const cStr = c >= 0 ? `+ ${c.toFixed(1)}`  : `− ${Math.abs(c).toFixed(1)}`;
        dispEq.textContent = `y = ${a.toFixed(1)}x² ${bStr} ${cStr}`;
      }
      if (dispDisc) dispDisc.textContent = disc.toFixed(2) + (disc > 0 ? ' (2 real roots)' : disc < 0 ? ' (complex roots)' : ' (1 repeated root)');
      if (dispVertex) dispVertex.textContent = `(${vx.toFixed(2)}, ${vy.toFixed(2)})`;
      if (dispRoots) {
        if (disc > 0) {
          const r1 = (-b + Math.sqrt(disc)) / (2 * a);
          const r2 = (-b - Math.sqrt(disc)) / (2 * a);
          dispRoots.textContent = `x = ${r1.toFixed(2)}, ${r2.toFixed(2)}`;
        } else if (Math.abs(disc) < 0.001) {
          dispRoots.textContent = `x = ${(-b/(2*a)).toFixed(2)} (repeated)`;
        } else {
          dispRoots.textContent = 'No real roots';
        }
      }
    }

    function animate() {
      let dirty = false;
      for (const k of ['a','b','c']) {
        const diff = target[k] - display[k];
        if (Math.abs(diff) > 0.005) { display[k] += diff * 0.15; dirty = true; }
        else display[k] = target[k];
      }
      draw();
      requestAnimationFrame(animate);
    }

    function resize() {
      const p = canvas.parentElement;
      canvas.width  = p.clientWidth;
      canvas.height = Math.min(p.clientWidth * 0.75, 360);
      draw();
    }

    // Bind controls
    [ ['a', sliderA, inputA], ['b', sliderB, inputB], ['c', sliderC, inputC] ].forEach(([k, sl, inp]) => {
      if (sl) sl.addEventListener('input', () => setParam(k, sl.value));
      if (inp) {
        inp.addEventListener('input', () => setParam(k, inp.value));
        inp.addEventListener('blur', () => {
          const v = parseFloat(inp.value);
          setParam(k, isNaN(v) ? 0 : v);
        });
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        target = { a: 1, b: 0, c: -4 };
        syncSliderInput('a', 1); syncSliderInput('b', 0); syncSliderInput('c', -4);
        if (reducedMotion) { display = { ...target }; draw(); }
      });
    }

    resize();
    new ResizeObserver(resize).observe(canvas.parentElement);

    if (!reducedMotion) animate(); else draw();
  }

  document.addEventListener('DOMContentLoaded', initQuadraticLab);
})();
