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
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>`;
    btn.title = 'Back to top of page';
    window.addEventListener('scroll', () => {
      btn.hidden = window.scrollY < 350;
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

  // ── Theme Manager (Dark / Light Mode) ────────────────────
  function initThemeManager() {
    const STORAGE_KEY = 'btm_theme';
    const html = document.documentElement;

    function getPreferredTheme() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function updateButtons(theme) {
      document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
        btn.innerHTML = theme === 'dark'
          ? `<svg class="theme-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
          : `<svg class="theme-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      });
    }

    function applyTheme(theme) {
      html.setAttribute('data-theme', theme);
      localStorage.setItem(STORAGE_KEY, theme);
      updateButtons(theme);
    }

    // Apply saved or system theme immediately
    const initialTheme = getPreferredTheme();
    applyTheme(initialTheme);

    // Inject toggle button into header if not present
    const headerContainer = document.querySelector('.site-header .container');
    if (headerContainer && !document.querySelector('.site-header .theme-toggle-btn')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'theme-toggle-btn';
      toggleBtn.addEventListener('click', () => {
        const current = html.getAttribute('data-theme') || initialTheme;
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        if (window.BTMToast) {
          window.BTMToast(next === 'dark' ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️', 'success', 1500);
        }
      });

      const searchBtn = headerContainer.querySelector('.nav-search-btn');
      const hamburger = headerContainer.querySelector('.hamburger');
      if (searchBtn && searchBtn.nextSibling) {
        headerContainer.insertBefore(toggleBtn, searchBtn.nextSibling);
      } else if (hamburger) {
        headerContainer.insertBefore(toggleBtn, hamburger);
      } else {
        headerContainer.appendChild(toggleBtn);
      }
      updateButtons(initialTheme);
    }

    // Also add toggle in mobile drawer header if drawer exists
    const mobileHeader = document.querySelector('.mobile-nav-header');
    if (mobileHeader && !mobileHeader.querySelector('.theme-toggle-btn')) {
      const mobileToggle = document.createElement('button');
      mobileToggle.type = 'button';
      mobileToggle.className = 'theme-toggle-btn';
      mobileToggle.style.marginRight = '8px';
      mobileToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme') || initialTheme;
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
      const closeBtn = mobileHeader.querySelector('.mobile-nav-close');
      if (closeBtn) {
        mobileHeader.insertBefore(mobileToggle, closeBtn);
      } else {
        mobileHeader.appendChild(mobileToggle);
      }
      updateButtons(initialTheme);
    }

    // Listen for system theme changes if user has no saved preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // ── Learning Progress Tracker ─────────────────────────────
  function initLearningProgress() {
    const STORAGE_KEY = 'btm_progress';
    const BOOKMARKS_KEY = 'btm_bookmarks';
    const PRACTICE_KEY = 'btm_practice_score';

    function getVisitedLessons() {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    }

    function recordCurrentLesson() {
      const path = window.location.pathname || '';
      const match = path.match(/\/lessons\/([a-zA-Z0-9_-]+)\.html/);
      if (match && match[1]) {
        const slug = match[1];
        const visited = getVisitedLessons();
        if (!visited.includes(slug)) {
          visited.push(slug);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(visited));
          } catch (e) {}
        }
      }
    }

    function getBookmarksCount() {
      try {
        const data = localStorage.getItem(BOOKMARKS_KEY);
        return data ? JSON.parse(data).length : 0;
      } catch (e) {
        return 0;
      }
    }

    function getPracticeScore() {
      try {
        const raw = localStorage.getItem(PRACTICE_KEY) || localStorage.getItem('btm_score');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed.attempted > 0) {
          return Math.round((parsed.correct / parsed.attempted) * 100);
        }
      } catch (e) {}
      return null;
    }

    // Record if currently in a lesson
    recordCurrentLesson();

    // Update Homepage Dashboard if present
    const visited = getVisitedLessons();
    const count = visited.length;
    const total = 12;
    const pct = Math.min(100, Math.round((count / total) * 100));

    const dashVisitedEl = document.getElementById('dash-lessons-visited');
    const dashProgressFill = document.getElementById('dash-progress-fill');
    const dashFormulasSaved = document.getElementById('dash-formulas-saved');
    const dashPracticeScore = document.getElementById('dash-practice-score');
    const dashStreakBadge = document.getElementById('dash-streak-badge');

    if (dashVisitedEl) {
      dashVisitedEl.textContent = `${count} / ${total}`;
    }
    if (dashProgressFill) {
      dashProgressFill.style.width = `${pct}%`;
    }
    if (dashFormulasSaved) {
      dashFormulasSaved.textContent = String(getBookmarksCount());
    }
    if (dashPracticeScore) {
      const score = getPracticeScore();
      dashPracticeScore.textContent = score !== null ? `${score}%` : 'Not Started';
    }
    if (dashStreakBadge) {
      if (count === 0) dashStreakBadge.textContent = 'Getting Started 🌱';
      else if (count < 4) dashStreakBadge.textContent = 'Curious Learner 🔍';
      else if (count < 8) dashStreakBadge.textContent = 'Math Explorer ⚡';
      else if (count < 12) dashStreakBadge.textContent = 'Advanced Scholar 📚';
      else dashStreakBadge.textContent = 'Grand Master 🏆';
    }

    // Update Learn.html progress tracker and visited checkmarks if present
    const learnProgressBadge = document.getElementById('learn-progress-badge');
    const learnProgressFill = document.getElementById('learn-progress-fill');
    if (learnProgressBadge) {
      learnProgressBadge.textContent = `${count} of ${total} Lessons Explored (${pct}%)`;
    }
    if (learnProgressFill) {
      learnProgressFill.style.width = `${pct}%`;
    }

    // Highlight visited lessons on Learn page
    visited.forEach(slug => {
      document.querySelectorAll(`a[href*="${slug}.html"]`).forEach(link => {
        const topicItem = link.closest('.topic-item');
        if (topicItem) {
          topicItem.classList.add('visited');
        }
      });
    });
  }

  // ── Entrance & Scroll Micro-animations ────────────────────
  function initScrollAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    const cards = document.querySelectorAll('.subject-card, .feat-card, .highlight-card, .lab-card, .subject-block, .score-card');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    cards.forEach(card => observer.observe(card));
  }

  // ── Init ──────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initThemeManager();
    initStickyHeader();
    initMobileNav();
    highlightActiveNav();
    initSmoothScroll();
    initTOC();
    initAccordions();
    initBackToTop();
    initHeroCanvas();
    initLearningProgress();
    initScrollAnimations();
  });

})();

