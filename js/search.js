/* ============================================================
   BehindTheMath — Client-side Search Engine
   ============================================================ */

(function () {
  'use strict';

  // ── Score a single formula against a query ────────────────
  function scoreFormula(formula, query) {
    const q = query.toLowerCase().trim();
    if (!q) return 0;

    const terms = q.split(/\s+/);
    let score = 0;

    function match(field, weight) {
      if (!field) return;
      const f = String(field).toLowerCase();
      for (const term of terms) {
        if (f === term)                    score += weight * 4;
        else if (f.startsWith(term))       score += weight * 3;
        else if (f.includes(term))         score += weight * 2;
      }
    }

    match(formula.title,   10);
    match(formula.id,       8);
    match(formula.subject,  6);
    (formula.keywords || []).forEach(k => match(k, 5));
    (formula.topics || []).forEach(t => match(t, 4));
    match(formula.summary,  2);

    return score;
  }

  // ── Search formulas ───────────────────────────────────────
  function search(query, limit = 8) {
    if (!query || !query.trim()) return [];
    const results = BTM_FORMULAS
      .map(f => ({ formula: f, score: scoreFormula(f, query) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.formula);
    return results;
  }

  // ── Filter formulas ───────────────────────────────────────
  function filterFormulas({ subject, level, hasDemo, query } = {}) {
    let results = BTM_FORMULAS;

    // Deduplicate by id
    const seen = new Set();
    results = results.filter(f => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });

    if (subject && subject !== 'all') {
      results = results.filter(f => f.subject.toLowerCase() === subject.toLowerCase());
    }
    if (level && level !== 'all') {
      results = results.filter(f => f.level === level);
    }
    if (hasDemo === true) {
      results = results.filter(f => f.hasDemo);
    }
    if (query && query.trim()) {
      const scored = results
        .map(f => ({ formula: f, score: scoreFormula(f, query) }))
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score);
      results = scored.map(r => r.formula);
    }
    return results;
  }

  // ── Resolve relative href based on current directory ─────
  function resolveFormulaHref(href) {
    if (!href) return '#';
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#')) {
      return href;
    }

    // Determine if current page is inside the lessons/ subfolder
    const isInsideLessons = (function() {
      if (typeof window !== 'undefined' && window.location) {
        const path = window.location.pathname || '';
        if (path.includes('/lessons/')) return true;
      }
      const logo = document.querySelector('.site-logo');
      if (logo) {
        const h = logo.getAttribute('href') || '';
        if (h.startsWith('../')) return true;
      }
      return false;
    })();

    if (isInsideLessons) {
      if (href.startsWith('lessons/')) {
        // E.g. 'lessons/gcd-lcm.html' -> 'gcd-lcm.html' (same directory)
        return href.slice('lessons/'.length);
      } else {
        // E.g. 'learn.html#algebra' -> '../learn.html#algebra'
        return '../' + href;
      }
    } else {
      // Root level (index.html, library.html, etc.)
      return href;
    }
  }

  // ── Expose globally ───────────────────────────────────────
  window.BTMSearch = { search, filterFormulas, resolveFormulaHref };

  // ── Initialize search UI ──────────────────────────────────
  function initSearchModal() {
    const openBtns = document.querySelectorAll('[data-search-open]');
    const modal    = document.getElementById('search-modal');
    if (!modal) return;

    const overlay  = modal.querySelector('.search-modal-overlay');
    const input    = modal.querySelector('.search-input');
    const results  = modal.querySelector('.search-results');

    function open() {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      setTimeout(() => input && input.focus(), 100);
      document.body.style.overflow = 'hidden';
    }

    function close() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (input) input.value = '';
      renderResults([]);
    }

    openBtns.forEach(btn => btn.addEventListener('click', open));
    overlay && overlay.addEventListener('click', close);

    modal.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
    });

    // Global shortcut: / or Ctrl+K
    document.addEventListener('keydown', e => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && !isInputFocused()) {
        e.preventDefault();
        open();
      }
    });

    function isInputFocused() {
      const tag = document.activeElement && document.activeElement.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    }

    function renderResults(formulas) {
      if (!results) return;
      if (!formulas.length) {
        const q = input ? input.value.trim() : '';
        results.innerHTML = q
          ? `<div class="search-empty">
               <div style="font-size:32px;margin-bottom:8px">🔍</div>
               No results for "<strong>${escHtml(q)}</strong>".<br>
               Try searching by formula name, subject, or symbol.
             </div>`
          : `<div class="search-empty">
               Start typing to search formulas, subjects, or symbols…
             </div>`;
        return;
      }

      results.innerHTML = formulas.map(f => `
        <a class="search-result-item" href="${escHtml(resolveFormulaHref(f.href))}">
          <div style="flex:1;min-width:0">
            <div class="search-result-formula">${escHtml(f.title)}</div>
            <div class="search-result-subject">${escHtml(f.subject)} · ${capitalize(f.level)}</div>
          </div>
          <span class="badge badge-${f.level}" style="flex-shrink:0">${capitalize(f.level)}</span>
        </a>
      `).join('');
    }

    if (input) {
      let debounce;
      input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          const hits = search(input.value);
          renderResults(hits);
        }, 120);
      });
    }

    renderResults([]);
  }

  // ── Home page inline search ───────────────────────────────
  function initHomeSearch() {
    const input = document.getElementById('home-search-input');
    const suggestionsBox = document.getElementById('home-search-suggestions');
    if (!input || !suggestionsBox) return;

    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const hits = search(input.value, 6);
        if (!hits.length) { suggestionsBox.hidden = true; return; }
        suggestionsBox.hidden = false;
        suggestionsBox.innerHTML = hits.map(f => `
          <a class="search-result-item" href="${escHtml(resolveFormulaHref(f.href))}">
            <div style="flex:1;min-width:0">
              <div class="search-result-formula">${escHtml(f.title)}</div>
              <div class="search-result-subject">${escHtml(f.subject)}</div>
            </div>
          </a>
        `).join('');
      }, 120);
    });

    document.addEventListener('click', e => {
      if (!input.parentElement.contains(e.target)) {
        suggestionsBox.hidden = true;
      }
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const q = input.value.trim();
        if (q) window.location.href = `library.html?q=${encodeURIComponent(q)}`;
      }
    });
  }

  // ── Library page filters ──────────────────────────────────
  function initLibraryFilters() {
    const grid      = document.getElementById('library-grid');
    const countEl   = document.getElementById('library-count');
    const emptyEl   = document.getElementById('library-empty');
    if (!grid) return;

    let currentFilters = { subject: 'all', level: 'all', hasDemo: false, query: '' };

    function render() {
      const results = filterFormulas(currentFilters);
      // Deduplicate
      const seen = new Set();
      const unique = results.filter(f => {
        if (seen.has(f.id)) return false;
        seen.add(f.id);
        return true;
      });

      if (countEl) countEl.textContent = unique.length;

      if (!unique.length) {
        grid.innerHTML = '';
        if (emptyEl) emptyEl.hidden = false;
        return;
      }
      if (emptyEl) emptyEl.hidden = true;

      grid.innerHTML = unique.map(f => `
        <div class="formula-card">
          <div class="formula-card-header">
            <div>
              <h3>${escHtml(f.title)}</h3>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">
                <span class="badge badge-${f.level}">${capitalize(f.level)}</span>
                <span class="badge badge-primary">${escHtml(f.subject)}</span>
                ${f.hasDemo ? '<span class="badge badge-interactive">⚡ Interactive</span>' : ''}
              </div>
            </div>
          </div>
          <div class="formula-card-expr" aria-label="Formula: ${escHtml(f.title)}">
            <span class="formula-render" data-latex="${escHtml(f.formulaLatex)}"></span>
          </div>
          <p class="formula-card-summary">${escHtml(f.summary)}</p>
          <div class="formula-card-footer">
            <a href="${escHtml(resolveFormulaHref(f.href))}" class="btn btn-outline-dark btn-sm">Explore formula →</a>
          </div>
        </div>
      `).join('');

      // Render KaTeX
      if (window.renderMathInElement) {
        grid.querySelectorAll('.formula-render').forEach(el => {
          const latex = el.dataset.latex;
          try {
            el.innerHTML = katex.renderToString(latex, { throwOnError: false });
          } catch (e) {
            el.textContent = latex;
          }
        });
      }
    }

    // Filter buttons
    document.querySelectorAll('[data-filter-subject]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter-subject]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilters.subject = btn.dataset.filterSubject;
        render();
      });
    });

    document.querySelectorAll('[data-filter-level]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter-level]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilters.level = btn.dataset.filterLevel;
        render();
      });
    });

    const demoToggle = document.getElementById('filter-has-demo');
    if (demoToggle) {
      demoToggle.addEventListener('change', () => {
        currentFilters.hasDemo = demoToggle.checked;
        render();
      });
    }

    const searchInput = document.getElementById('library-search');
    if (searchInput) {
      let debounce;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          currentFilters.query = searchInput.value;
          render();
        }, 150);
      });
    }

    // Pre-fill from URL ?q=
    const urlQ = new URLSearchParams(window.location.search).get('q');
    if (urlQ && searchInput) {
      searchInput.value = urlQ;
      currentFilters.query = urlQ;
    }

    render();
  }

  // ── Helpers ───────────────────────────────────────────────
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  // ── Init on DOM ready ─────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initSearchModal();
    initHomeSearch();
    initLibraryFilters();
  });

})();
