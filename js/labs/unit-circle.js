/* ============================================================
   BehindTheMath — Trigonometric Unit Circle Explorer (Lab D)
   ============================================================ */

(function () {
  'use strict';

  const PI  = Math.PI;
  const TAU = 2 * PI;

  function initUnitCircleLab() {
    const canvas = document.getElementById('unit-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const waveCanvas = document.getElementById('unit-wave-canvas');
    const waveCtx   = waveCanvas ? waveCanvas.getContext('2d') : null;

    const slider   = document.getElementById('angle-slider');
    const modeBtn  = document.getElementById('angle-mode');
    const playBtn  = document.getElementById('angle-play');
    const resetBtn = document.getElementById('angle-reset');

    const dispAngleDeg = document.getElementById('disp-angle-deg');
    const dispAngleRad = document.getElementById('disp-angle-rad');
    const dispSin      = document.getElementById('disp-sin');
    const dispCos      = document.getElementById('disp-cos');
    const dispTan      = document.getElementById('disp-tan');
    const dispIdentity = document.getElementById('disp-identity');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let angleDeg = 45;
    let useDegrees = true;
    let playing = false;
    let animFrame;
    let playSpeed = 0.8; // degrees per frame

    function getAngleRad() { return angleDeg * PI / 180; }

    function setAngle(deg) {
      angleDeg = ((deg % 360) + 360) % 360;
      if (slider) slider.value = angleDeg;
      draw();
    }

    function drawUnitCircle() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const R  = Math.min(W, H) / 2 - 30;

      const angle = getAngleRad();
      const px    = cx + R * Math.cos(angle);
      const py    = cy - R * Math.sin(angle);

      // Background
      ctx.fillStyle = '#F7FAFC';
      ctx.fillRect(0, 0, W, H);

      // Axes
      ctx.strokeStyle = 'rgba(29,53,87,0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx - R - 20, cy); ctx.lineTo(cx + R + 20, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - R - 20); ctx.lineTo(cx, cy + R + 20); ctx.stroke();

      // Circle
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.strokeStyle = 'rgba(29,53,87,0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Shaded angle arc
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R * 0.18, 0, -angle, angle < 0);
      ctx.strokeStyle = '#F4A261';
      ctx.lineWidth = 2;
      ctx.stroke();

      // cos projection (horizontal, x-axis)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, cy);
      ctx.strokeStyle = '#2A9D8F';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // sin projection (vertical, y-axis)
      ctx.beginPath();
      ctx.moveTo(px, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = '#E63946';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Radius line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = '#1D3557';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Point on circle
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, TAU);
      ctx.fillStyle = '#457B9D';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = '#1D3557';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+x', cx + R + 16, cy + 4);
      ctx.fillText('+y', cx, cy - R - 10);

      // Labels cos/sin at projections
      const cosX = cx + R * Math.cos(angle) / 2;
      ctx.fillStyle = '#2A9D8F';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`cos=${Math.cos(angle).toFixed(3)}`, cosX, cy + 16);

      ctx.fillStyle = '#E63946';
      const sinTextX = px + (Math.cos(angle) > 0 ? 36 : -36);
      const sinTextY = cy - R * Math.sin(angle) / 2;
      ctx.fillText(`sin=${Math.sin(angle).toFixed(3)}`, sinTextX, sinTextY);

      // Angle label
      const labelR = R * 0.28;
      const midAng = angle / 2;
      ctx.fillStyle = '#F4A261';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(
        useDegrees ? `${angleDeg.toFixed(0)}°` : `${getAngleRad().toFixed(2)} rad`,
        cx + labelR * Math.cos(midAng),
        cy - labelR * Math.sin(midAng)
      );

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, TAU);
      ctx.fillStyle = '#1D3557';
      ctx.fill();
    }

    function drawWave() {
      if (!waveCtx || !waveCanvas) return;
      const W = waveCanvas.width, H = waveCanvas.height;
      waveCtx.clearRect(0, 0, W, H);

      waveCtx.fillStyle = '#F7FAFC';
      waveCtx.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const amp = H / 2 - 16;
      const angle = getAngleRad();

      // Axes
      waveCtx.strokeStyle = 'rgba(29,53,87,0.2)';
      waveCtx.lineWidth = 1;
      waveCtx.beginPath(); waveCtx.moveTo(0, cy); waveCtx.lineTo(W, cy); waveCtx.stroke();

      // Sine wave
      waveCtx.beginPath();
      waveCtx.strokeStyle = '#E63946';
      waveCtx.lineWidth = 2;
      for (let px = 0; px <= W; px++) {
        const t = (px / W) * TAU;
        const y = cy - amp * Math.sin(t);
        px === 0 ? waveCtx.moveTo(px, y) : waveCtx.lineTo(px, y);
      }
      waveCtx.stroke();

      // Cosine wave
      waveCtx.beginPath();
      waveCtx.strokeStyle = '#2A9D8F';
      waveCtx.lineWidth = 2;
      for (let px = 0; px <= W; px++) {
        const t = (px / W) * TAU;
        const y = cy - amp * Math.cos(t);
        px === 0 ? waveCtx.moveTo(px, y) : waveCtx.lineTo(px, y);
      }
      waveCtx.stroke();

      // Current position markers
      const sinPx = (angle / TAU) * W;
      const sinPy = cy - amp * Math.sin(angle);
      const cosPy = cy - amp * Math.cos(angle);

      waveCtx.beginPath(); waveCtx.arc(sinPx, sinPy, 5, 0, TAU);
      waveCtx.fillStyle = '#E63946'; waveCtx.fill();

      waveCtx.beginPath(); waveCtx.arc(sinPx, cosPy, 5, 0, TAU);
      waveCtx.fillStyle = '#2A9D8F'; waveCtx.fill();

      // Legend
      waveCtx.font = 'bold 11px Inter, sans-serif';
      waveCtx.fillStyle = '#E63946';
      waveCtx.fillText('— sin θ', 8, 16);
      waveCtx.fillStyle = '#2A9D8F';
      waveCtx.fillText('— cos θ', 8, 30);
    }

    function updateInfo() {
      const angle = getAngleRad();
      const s = Math.sin(angle);
      const c = Math.cos(angle);
      const t = Math.cos(angle);
      const isTanDefined = Math.abs(c) > 0.001;
      const identity = s * s + c * c;

      if (dispAngleDeg) dispAngleDeg.textContent = angleDeg.toFixed(1) + '°';
      if (dispAngleRad) dispAngleRad.textContent = angle.toFixed(4) + ' rad';
      if (dispSin)      dispSin.textContent      = s.toFixed(4);
      if (dispCos)      dispCos.textContent      = c.toFixed(4);
      if (dispTan)      dispTan.textContent      = isTanDefined ? (s / c).toFixed(4) : 'undefined';
      if (dispIdentity) dispIdentity.textContent = identity.toFixed(6) + ' ≈ 1';
    }

    function draw() {
      drawUnitCircle();
      drawWave();
      updateInfo();
    }

    function resizeCanvas(cvs) {
      const p = cvs.parentElement;
      const size = Math.min(p.clientWidth, p.clientHeight, 380);
      cvs.width  = size;
      cvs.height = size;
    }

    function resizeWave() {
      if (!waveCanvas) return;
      const p = waveCanvas.parentElement;
      waveCanvas.width  = p.clientWidth;
      waveCanvas.height = 80;
    }

    function playLoop() {
      if (!playing) return;
      angleDeg = (angleDeg + playSpeed) % 360;
      if (slider) slider.value = angleDeg;
      draw();
      animFrame = requestAnimationFrame(playLoop);
    }

    // Events
    if (slider) slider.addEventListener('input', () => setAngle(parseFloat(slider.value)));

    if (modeBtn) {
      modeBtn.addEventListener('click', () => {
        useDegrees = !useDegrees;
        modeBtn.textContent = useDegrees ? '° Degrees' : 'rad Radians';
        draw();
      });
    }

    if (playBtn && !reducedMotion) {
      playBtn.addEventListener('click', () => {
        playing = !playing;
        playBtn.textContent = playing ? '⏸ Pause' : '▶ Play';
        if (playing) playLoop();
        else cancelAnimationFrame(animFrame);
      });
    } else if (playBtn) {
      playBtn.disabled = true;
      playBtn.title = 'Animation disabled (prefers-reduced-motion)';
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        playing = false;
        if (playBtn) playBtn.textContent = '▶ Play';
        cancelAnimationFrame(animFrame);
        setAngle(45);
      });
    }

    resizeCanvas(canvas);
    resizeWave();
    new ResizeObserver(() => { resizeCanvas(canvas); draw(); }).observe(canvas.parentElement);

    draw();
  }

  document.addEventListener('DOMContentLoaded', initUnitCircleLab);
})();
