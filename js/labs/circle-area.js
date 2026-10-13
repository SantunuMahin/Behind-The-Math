/* ============================================================
   BehindTheMath — Circle Area Explorer (Lab A)
   ============================================================ */

(function () {
  'use strict';

  const PI = Math.PI;

  function initCircleAreaLab() {
    const canvas  = document.getElementById('circle-canvas');
    if (!canvas) return;

    const ctx     = canvas.getContext('2d');
    const slider  = document.getElementById('radius-slider');
    const numInput= document.getElementById('radius-input');
    const resetBtn= document.getElementById('lab-reset');

    // Result display elements
    const dispRadius = document.getElementById('disp-radius');
    const dispDiam   = document.getElementById('disp-diameter');
    const dispCirc   = document.getElementById('disp-circumference');
    const dispArea   = document.getElementById('disp-area');

    let radius = parseFloat(slider ? slider.value : 5);
    let animFrame;
    let targetRadius = radius;
    let displayRadius = radius;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setRadius(r) {
      r = Math.max(0.1, Math.min(20, parseFloat(r) || 0.1));
      targetRadius = r;
      if (slider) slider.value = r;
      if (numInput) numInput.value = r;
      if (reducedMotion) {
        displayRadius = r;
        draw();
        updateResults(r);
      }
    }

    function updateResults(r) {
      const area = PI * r * r;
      const circ = 2 * PI * r;
      if (dispRadius) dispRadius.textContent = r.toFixed(2);
      if (dispDiam)   dispDiam.textContent   = (2 * r).toFixed(2);
      if (dispCirc)   dispCirc.textContent   = circ.toFixed(2);
      if (dispArea)   dispArea.textContent   = area.toFixed(2);
    }

    function draw() {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const maxR = Math.min(W, H) / 2 - 24;
      const scale = maxR / 20; // max slider = 20
      const r = displayRadius * scale;

      // Grid
      ctx.strokeStyle = 'rgba(29,53,87,0.06)';
      ctx.lineWidth = 1;
      const step = scale; // one unit
      for (let x = cx % step; x <= W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = cy % step; y <= H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Axes
      ctx.strokeStyle = 'rgba(29,53,87,0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

      // Area fill
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      gradient.addColorStop(0, 'rgba(168,218,220,0.35)');
      gradient.addColorStop(1, 'rgba(69,123,157,0.15)');
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(r, 1), 0, 2 * PI);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Circumference stroke
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(r, 1), 0, 2 * PI);
      ctx.strokeStyle = '#457B9D';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Radius line
      if (r > 8) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + r, cy);
        ctx.strokeStyle = '#1D3557';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label r
        ctx.fillStyle = '#1D3557';
        ctx.font = `bold 13px 'Inter', sans-serif`;
        ctx.fillText(`r = ${displayRadius.toFixed(1)}`, cx + r / 2 - 14, cy - 8);
      }

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, 2 * PI);
      ctx.fillStyle = '#1D3557';
      ctx.fill();

      updateResults(displayRadius);
    }

    // Smooth animation
    function animate() {
      const diff = targetRadius - displayRadius;
      if (Math.abs(diff) > 0.005) {
        displayRadius += diff * 0.12;
      } else {
        displayRadius = targetRadius;
      }
      draw();
      animFrame = requestAnimationFrame(animate);
    }

    // Resize canvas
    function resize() {
      const parent = canvas.parentElement;
      const size   = Math.min(parent.clientWidth, parent.clientHeight, 400);
      canvas.width  = size;
      canvas.height = size;
      draw();
    }

    // Events
    if (slider) {
      slider.addEventListener('input', () => setRadius(slider.value));
    }
    if (numInput) {
      numInput.addEventListener('input', () => setRadius(numInput.value));
      numInput.addEventListener('blur', () => {
        let v = parseFloat(numInput.value);
        if (isNaN(v) || v < 0.1) { numInput.value = 0.1; setRadius(0.1); return; }
        if (v > 20) { numInput.value = 20; setRadius(20); return; }
        setRadius(v);
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => setRadius(5));
    }

    // Init
    resize();
    new ResizeObserver(resize).observe(canvas.parentElement);
    setRadius(5);

    if (!reducedMotion) {
      animate();
    } else {
      draw();
    }
  }

  document.addEventListener('DOMContentLoaded', initCircleAreaLab);
})();
