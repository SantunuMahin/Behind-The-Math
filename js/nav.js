/* ============================================================
   BehindTheMath — Navigation & Layout JS
   ============================================================ */

(function () {
  'use strict';

  // ── Sticky header shadow ──────────────────────────────────
  function initStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const observer = new IntersectionObserver(
      ([entry]) => header.classList.toggle('scrolled', !entry.isIntersecting),
      { threshold: 0 }
    );
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;pointer-events:none';
    document.body.prepend(sentinel);
    observer.observe(sentinel);
  }

  // ── Mobile nav ────────────────────────────────────────────
  function initMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const nav       = document.getElementById('mobile-nav');
    if (!hamburger || !nav) return;

    const overlay = nav.querySelector('.mobile-nav-overlay');
    const closeBtn = nav.querySelector('.mobile-nav-close');
    const drawer  = nav.querySelector('.mobile-nav-drawer');

    function open() {
      nav.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      nav.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn && closeBtn.focus();
    }

    function close() {
      nav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      hamburger.focus();
    }

    hamburger.addEventListener('click', open);
    closeBtn && closeBtn.addEventListener('click', close);
    overlay && overlay.addEventListener('click', close);

    nav.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
    });

    // Trap focus within drawer when open
    drawer && drawer.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const focusable = drawer.querySelectorAll(
        'a,button,[tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }

  // ── Active nav link ───────────────────────────────────────
  function highlightActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
        a.ariaCurrent = 'page';
      }
    });
  }

  // ── Smooth scroll for anchor links ───────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Update URL without scroll jump
          history.pushState(null, '', a.getAttribute('href'));
        }
      });
    });
  }

  // ── Table of Contents active tracking ────────────────────
  function initTOC() {
    const toc = document.querySelector('.toc-list');
    if (!toc) return;
    const links = toc.querySelectorAll('a');
    if (!links.length) return;

    const headings = Array.from(links).map(l => {
      const id = l.getAttribute('href').slice(1);
      return document.getElementById(id);
    }).filter(Boolean);

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(l => {
            l.classList.toggle('active', l.getAttribute('href') === '#' + id);
          });
        }
      });
    }, {
      rootMargin: '-64px 0px -60% 0px',
      threshold: 0
    });

    headings.forEach(h => observer.observe(h));
  }

  // ── Accordion / expandable sections ──────────────────────
  function initAccordions() {
    document.querySelectorAll('.accordion-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        const body = document.getElementById(btn.getAttribute('aria-controls'));
        if (body) body.classList.toggle('open', !expanded);
      });
    });
  }

  // ── Back to top ───────────────────────────────────────────
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.hidden = window.scrollY < 400;
    }, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Hero canvas animation (sine wave) ────────────────────
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let w, h, frame;

    function resize() {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width  = w;
      canvas.height = h;
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(168,218,220,0.6)';
      ctx.lineWidth   = 2;

      // Draw multiple sine waves
      [
        { amp: h * 0.12, freq: 0.012, phase: t * 0.0008,  yOff: h * 0.3 },
        { amp: h * 0.08, freq: 0.018, phase: t * 0.0006 + 1, yOff: h * 0.5 },
        { amp: h * 0.06, freq: 0.009, phase: t * 0.001  + 2, yOff: h * 0.7 },
      ].forEach(({ amp, freq, phase, yOff }) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const y = yOff + amp * Math.sin(x * freq + phase);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Draw floating math symbols
      const symbols = ['∑', 'π', '∫', '√', '∂', 'Δ', 'θ', 'λ'];
      ctx.font = '20px serif';
      ctx.fillStyle = 'rgba(168,218,220,0.2)';
      symbols.forEach((sym, i) => {
        const x = ((i * 137 + t * 0.02) % (w + 60)) - 30;
        const y = ((i * 89 + t * 0.015) % (h + 40)) - 20;
        ctx.fillText(sym, x, y);
      });

      // Reduce motion: only draw once
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        frame = requestAnimationFrame(draw);
      }
    }

    resize();
    new ResizeObserver(resize).observe(canvas);

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(t => { frame = requestAnimationFrame(draw); draw(t); });
    } else {
      draw(0);
    }
  }

  // ── Toast utility ─────────────────────────────────────────
  window.BTMToast = function (message, type = 'success', duration = 2500) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : '✕'}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 300ms';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // ── Init ──────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initStickyHeader();
    initMobileNav();
    highlightActiveNav();
    initSmoothScroll();
    initTOC();
    initAccordions();
    initBackToTop();
    initHeroCanvas();
  });

})();
