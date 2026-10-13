/* ============================================================
   BehindTheMath — Derivative as Slope Explorer (Lab E)
   ============================================================ */

(function () {
  'use strict';

  function initDerivativeLab() {
    const canvas = document.getElementById('deriv-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const fnSelect = document.getElementById('deriv-fn');
    const xSlider  = document.getElementById('deriv-x');
    const xInput   = document.getElementById('deriv-x-num');
    const hSlider  = document.getElementById('deriv-h');
    const showSec  = document.getElementById('deriv-show-secant');
    const resetBtn = document.getElementById('deriv-reset');

    const dispFn     = document.getElementById('disp-fn');
    const dispX      = document.getElementById('disp-x');
    const dispFx     = document.getElementById('disp-fx');
    const dispDeriv  = document.getElementById('disp-deriv');
    const dispExact  = document.getElementById('disp-exact-deriv');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Available functions
    const FUNCTIONS = {
      'x2': {
        label: 'f(x) = x²',
        f: x => x * x,
        df: x => 2 * x,
        dfLabel: "f'(x) = 2x",
        xRange: [-5, 5], yRange: [-2, 26]
      },
      'sinx': {
        label: 'f(x) = sin(x)',
        f: x => Math.sin(x),
        df: x => Math.cos(x),
        dfLabel: "f'(x) = cos(x) [radians]",
        xRange: [-7, 7], yRange: [-1.5, 1.5]
      },
      'x': {
        label: 'f(x) = x',
        f: x => x,
        df: _ => 1,
        dfLabel: "f'(x) = 1",
        xRange: [-5, 5], yRange: [-5, 5]
      }
    };

    let currentFn = 'x2';
    let xVal = 2;
    let hVal = 1;
    let showSecant = true;

    function getFn() { return FUNCTIONS[currentFn]; }

    function numerical_deriv(f, x, h = 0.0001) {
      return (f(x + h) - f(x - h)) / (2 * h);
    }

    function wx(x, W) {
      const fn = getFn();
      const [xMin, xMax] = fn.xRange;
      return (x - xMin) / (xMax - xMin) * W;
    }
    function wy(y, H) {
      const fn = getFn();
      const [yMin, yMax] = fn.yRange;
      return H - (y - yMin) / (yMax - yMin) * H;
    }

    function draw() {
      const W = canvas.width, H = canvas.height;
      const fn = getFn();
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = '#F7FAFC';
      ctx.fillRect(0, 0, W, H);

      const [xMin, xMax] = fn.xRange;
      const [yMin, yMax] = fn.yRange;

      // Grid
      ctx.strokeStyle = 'rgba(29,53,87,0.06)';
      ctx.lineWidth = 1;
      for (let x = Math.ceil(xMin); x <= xMax; x++) {
        const px = wx(x, W);
        ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
      }
      for (let y = Math.ceil(yMin); y <= yMax; y += (yMax - yMin) > 10 ? 4 : 0.5) {
        const py = wy(y, H);
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
      }

      // Axes
      ctx.strokeStyle = 'rgba(29,53,87,0.3)';
      ctx.lineWidth = 1.5;
      const ax0 = wx(0, W), ay0 = wy(0, H);
      if (ax0 >= 0 && ax0 <= W) {
        ctx.beginPath(); ctx.moveTo(ax0, 0); ctx.lineTo(ax0, H); ctx.stroke();
      }
      if (ay0 >= 0 && ay0 <= H) {
        ctx.beginPath(); ctx.moveTo(0, ay0); ctx.lineTo(W, ay0); ctx.stroke();
      }

      // Function curve
      ctx.strokeStyle = '#457B9D';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      let started = false;
      for (let px = 0; px <= W; px += 1.5) {
        const x = xMin + (px / W) * (xMax - xMin);
        const y = fn.f(x);
        const py = wy(y, H);
        if (py < -20 || py > H + 20) { started = false; continue; }
        started ? ctx.lineTo(px, py) : (ctx.moveTo(px, py), started = true);
      }
      ctx.stroke();

      const x0 = xVal;
      const y0 = fn.f(x0);
      const slope = numerical_deriv(fn.f, x0);

      // Tangent line
      const tangentExt = (xMax - xMin) * 0.5;
      const tx1 = x0 - tangentExt, ty1 = y0 + slope * (tx1 - x0);
      const tx2 = x0 + tangentExt, ty2 = y0 + slope * (tx2 - x0);
      ctx.strokeStyle = '#1D3557';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wx(tx1, W), wy(ty1, H));
      ctx.lineTo(wx(tx2, W), wy(ty2, H));
      ctx.stroke();

      // Secant line
      if (showSecant && Math.abs(hVal) > 0.01) {
        const x1 = x0 + hVal;
        const y1 = fn.f(x1);
        const secSlope = (y1 - y0) / (x1 - x0);
        const sx1 = x0 - tangentExt, sy1 = y0 + secSlope * (sx1 - x0);
        const sx2 = x0 + tangentExt, sy2 = y0 + secSlope * (sx2 - x0);
        ctx.strokeStyle = 'rgba(244,162,97,0.8)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(wx(sx1, W), wy(sy1, H));
        ctx.lineTo(wx(sx2, W), wy(sy2, H));
        ctx.stroke();
        ctx.setLineDash([]);

        // Mark second point
        ctx.beginPath();
        ctx.arc(wx(x1, W), wy(y1, H), 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#F4A261';
        ctx.fill();
      }

      // Point of tangency
      ctx.beginPath();
      ctx.arc(wx(x0, W), wy(y0, H), 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#E63946';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Update info
      if (dispFn)    dispFn.textContent    = fn.label;
      if (dispX)     dispX.textContent     = x0.toFixed(2);
      if (dispFx)    dispFx.textContent    = y0.toFixed(4);
      if (dispDeriv) dispDeriv.textContent = slope.toFixed(4);
      if (dispExact) dispExact.textContent = fn.dfLabel + ' = ' + fn.df(x0).toFixed(4);
    }

    function setX(x) {
      const fn = getFn();
      const [xMin, xMax] = fn.xRange;
      xVal = Math.max(xMin + 0.1, Math.min(xMax - 0.1, parseFloat(x) || 0));
      if (xSlider) xSlider.value = xVal;
      if (xInput)  xInput.value  = xVal;
      draw();
    }

    function resize() {
      const p = canvas.parentElement;
      canvas.width  = p.clientWidth;
      canvas.height = Math.min(p.clientWidth * 0.7, 360);
      draw();
    }

    // Events
    if (fnSelect) {
      fnSelect.addEventListener('change', () => {
        currentFn = fnSelect.value;
        const fn = getFn();
        const cx = (fn.xRange[0] + fn.xRange[1]) / 4;
        if (xSlider) {
          xSlider.min = fn.xRange[0];
          xSlider.max = fn.xRange[1];
        }
        setX(cx);
      });
    }

    if (xSlider) xSlider.addEventListener('input', () => setX(xSlider.value));
    if (xInput)  {
      xInput.addEventListener('input', () => setX(xInput.value));
      xInput.addEventListener('blur',  () => setX(xInput.value));
    }

    if (hSlider) {
      hSlider.addEventListener('input', () => {
        hVal = parseFloat(hSlider.value) || 0.01;
        draw();
      });
    }

    if (showSec) {
      showSec.addEventListener('change', () => { showSecant = showSec.checked; draw(); });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (fnSelect) fnSelect.value = 'x2';
        currentFn = 'x2';
        setX(2);
        if (hSlider) hSlider.value = 1;
        hVal = 1;
        if (showSec) showSec.checked = true;
        showSecant = true;
        draw();
      });
    }

    resize();
    new ResizeObserver(resize).observe(canvas.parentElement);
  }

  document.addEventListener('DOMContentLoaded', initDerivativeLab);
})();
