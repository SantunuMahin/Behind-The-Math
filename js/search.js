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

  // ── Access formulas dataset safely ───────────────────────
  function getFormulas() {
    return (typeof window !== 'undefined' && (window.BTM_FORMULAS || window.FORMULA_INDEX)) || [];
  }

  // ── Search formulas ───────────────────────────────────────
  function search(query, limit = 8) {
    if (!query || !query.trim()) return [];
    const results = getFormulas()
      .map(f => ({ formula: f, score: scoreFormula(f, query) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.formula);
    return results;
  }

  // ── Bookmarks Storage ─────────────────────────────────────
  const BOOKMARKS_KEY = 'btm_bookmarks';

  function getSavedBookmarks() {
    try {
      const arr = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  }

  function toggleBookmark(id) {
    const set = getSavedBookmarks();
    let added = false;
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
      added = true;
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(Array.from(set)));
    return added;
  }

  // ── Personal Formula Notes ─────────────────────────────────
  const NOTES_KEY = 'btm_notes';
  function getFormulaNotes() {
    try {
      const data = localStorage.getItem(NOTES_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  function saveFormulaNote(id, note) {
    const notes = getFormulaNotes();
    if (!note || !note.trim()) {
      delete notes[id];
    } else {
      notes[id] = note.trim();
    }
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch {}
  }

  // ── Filter formulas ───────────────────────────────────────
  function filterFormulas({ subject, level, hasDemo, query, savedOnly } = {}) {
    let results = getFormulas();

    // Deduplicate by id
    const seen = new Set();
    results = results.filter(f => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });

    if (savedOnly) {
      const saved = getSavedBookmarks();
      results = results.filter(f => saved.has(f.id));
    }

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

  // ── Formula Solvers Configuration ─────────────────────────
  const SOLVER_CONFIGS = {
    'quadratic-equation': {
      title: 'Quadratic Formula Solver',
      latex: 'ax^2 + bx + c = 0 \\implies x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
      inputs: [
        { id: 'a', label: 'Coefficient a', default: 1 },
        { id: 'b', label: 'Coefficient b', default: -5 },
        { id: 'c', label: 'Coefficient c', default: 6 }
      ],
      calculate: (vals) => {
        const a = parseFloat(vals.a) || 0;
        const b = parseFloat(vals.b) || 0;
        const c = parseFloat(vals.c) || 0;
        if (Math.abs(a) < 1e-9) return 'Not a quadratic equation (a cannot be 0)';
        const disc = b * b - 4 * a * c;
        if (disc > 0) {
          const x1 = (-b + Math.sqrt(disc)) / (2 * a);
          const x2 = (-b - Math.sqrt(disc)) / (2 * a);
          return `Two real roots: x₁ = ${x1.toFixed(3)}, x₂ = ${x2.toFixed(3)} (Discriminant Δ = ${disc.toFixed(2)})`;
        } else if (Math.abs(disc) < 1e-9) {
          const x = -b / (2 * a);
          return `One repeated real root: x = ${x.toFixed(3)} (Discriminant Δ = 0)`;
        } else {
          const real = (-b / (2 * a)).toFixed(3);
          const imag = (Math.sqrt(-disc) / (2 * a)).toFixed(3);
          return `Complex roots: ${real} ± ${imag}i (Discriminant Δ = ${disc.toFixed(2)})`;
        }
      }
    },
    'circle-area': {
      title: 'Circle Area & Circumference',
      latex: 'A = \\pi r^2,\\quad C = 2\\pi r',
      inputs: [
        { id: 'r', label: 'Radius r', default: 5 }
      ],
      calculate: (vals) => {
        const r = parseFloat(vals.r) || 0;
        if (r < 0) return 'Radius cannot be negative';
        const area = Math.PI * r * r;
        const circ = 2 * Math.PI * r;
        const d = 2 * r;
        return `Area = ${area.toFixed(3)} sq units | Circumference = ${circ.toFixed(3)} | Diameter = ${d.toFixed(3)}`;
      }
    },
    'pythagorean-theorem': {
      title: 'Pythagorean Hypotenuse Solver',
      latex: 'a^2 + b^2 = c^2 \\implies c = \\sqrt{a^2 + b^2}',
      inputs: [
        { id: 'a', label: 'Leg side a', default: 3 },
        { id: 'b', label: 'Leg side b', default: 4 }
      ],
      calculate: (vals) => {
        const a = parseFloat(vals.a) || 0;
        const b = parseFloat(vals.b) || 0;
        if (a <= 0 || b <= 0) return 'Side lengths must be positive numbers';
        const c = Math.hypot(a, b);
        const area = 0.5 * a * b;
        const angle = Math.atan2(b, a) * (180 / Math.PI);
        return `Hypotenuse c = ${c.toFixed(3)} | Triangle Area = ${area.toFixed(3)} | Angle θ = ${angle.toFixed(2)}°`;
      }
    },
    'gcd-lcm': {
      title: 'Euclidean GCD & LCM',
      latex: 'a \\cdot b = \\gcd(a, b) \\cdot \\operatorname{lcm}(a, b)',
      inputs: [
        { id: 'a', label: 'Integer a', default: 48 },
        { id: 'b', label: 'Integer b', default: 18 }
      ],
      calculate: (vals) => {
        let a = Math.abs(parseInt(vals.a, 10)) || 0;
        let b = Math.abs(parseInt(vals.b, 10)) || 0;
        if (a === 0 && b === 0) return 'Both integers cannot be zero';
        const origA = a;
        const origB = b;
        while (b !== 0) {
          const t = b;
          b = a % b;
          a = t;
        }
        const gcd = a;
        const lcm = (origA * origB) / gcd;
        return `GCD(${origA}, ${origB}) = ${gcd} | LCM(${origA}, ${origB}) = ${lcm}`;
      }
    },
    'percentages-ratios': {
      title: 'Percentage & Scaling Solver',
      latex: '\\text{Percentage} = \\frac{\\text{Part}}{\\text{Whole}} \\times 100\\%',
      inputs: [
        { id: 'part', label: 'Part value', default: 45 },
        { id: 'whole', label: 'Whole total', default: 150 }
      ],
      calculate: (vals) => {
        const part = parseFloat(vals.part) || 0;
        const whole = parseFloat(vals.whole) || 0;
        if (whole === 0) return 'Whole cannot be zero';
        const pct = (part / whole) * 100;
        const ratio = part / whole;
        return `${part} is ${pct.toFixed(2)}% of ${whole} (Decimal ratio = ${ratio.toFixed(4)})`;
      }
    },
    'compound-interest': {
      title: 'Compound Interest Calculator',
      latex: 'A = P \\left(1 + \\frac{r}{n}\\right)^{nt}',
      inputs: [
        { id: 'p', label: 'Principal P ($)', default: 1000 },
        { id: 'r', label: 'Annual Rate r (%)', default: 6 },
        { id: 'n', label: 'Compounds / yr n', default: 12 },
        { id: 't', label: 'Time t (years)', default: 5 }
      ],
      calculate: (vals) => {
        const P = parseFloat(vals.p) || 0;
        const r = (parseFloat(vals.r) || 0) / 100;
        const n = parseFloat(vals.n) || 1;
        const t = parseFloat(vals.t) || 0;
        if (P <= 0 || n <= 0) return 'Invalid inputs';
        const A = P * Math.pow(1 + r / n, n * t);
        const interest = A - P;
        return `Final Amount = $${A.toFixed(2)} (Total Interest Earned = $${interest.toFixed(2)})`;
      }
    },
    'exponents-logarithms': {
      title: 'Logarithm & Power Evaluator',
      latex: 'b^y = x \\iff y = \\log_b(x)',
      inputs: [
        { id: 'base', label: 'Base b', default: 2 },
        { id: 'x', label: 'Argument x', default: 64 }
      ],
      calculate: (vals) => {
        const b = parseFloat(vals.base) || 2;
        const x = parseFloat(vals.x) || 1;
        if (b <= 0 || b === 1 || x <= 0) return 'Base must be > 0 (≠ 1), x must be > 0';
        const y = Math.log(x) / Math.log(b);
        return `log_${b}(${x}) = ${y.toFixed(4)} (Check: ${b}^${y.toFixed(4)} ≈ ${x})`;
      }
    }
  };

  // ── Library page filters ──────────────────────────────────
  function initLibraryFilters() {
    const grid           = document.getElementById('library-grid');
    const countEl        = document.getElementById('library-count');
    const emptyEl        = document.getElementById('library-empty');
    const savedCountEl   = document.getElementById('saved-count');
    const filterSavedBtn = document.getElementById('filter-saved');
    if (!grid) return;

    let currentFilters = { subject: 'all', level: 'all', hasDemo: false, query: '', savedOnly: false };
    const selectedToCompare = new Set();
    let activeNoteFormulaId = null;

    // Note Modal Elements
    const noteModal = document.getElementById('note-modal');
    const noteTitleEl = document.getElementById('note-modal-title');
    const noteTextEl = document.getElementById('note-modal-text');
    const noteSaveBtn = document.getElementById('btn-save-note');
    const noteDeleteBtn = document.getElementById('btn-delete-note');

    // Compare Modal Elements
    const compareModal = document.getElementById('compare-modal');
    const compareContainer = document.getElementById('compare-container');
    const compareDock = document.getElementById('compare-dock');
    const compareCountEl = document.getElementById('compare-count');
    const compareNamesEl = document.getElementById('compare-names');
    const compareOpenBtn = document.getElementById('btn-open-compare');
    const compareClearBtn = document.getElementById('btn-clear-compare');

    function updateSavedCount() {
      const count = getSavedBookmarks().size;
      if (savedCountEl) savedCountEl.textContent = count;
    }

    function updateCompareDock() {
      if (!compareDock) return;
      const count = selectedToCompare.size;
      if (compareCountEl) compareCountEl.textContent = count;

      if (count > 0) {
        compareDock.classList.add('visible');
        if (compareNamesEl) {
          const formulas = getFormulas();
          const names = Array.from(selectedToCompare).map(id => {
            const f = formulas.find(item => item.id === id);
            return f ? f.title : id;
          });
          compareNamesEl.textContent = names.join(', ');
        }
      } else {
        compareDock.classList.remove('visible');
      }
    }

    function openNoteModal(formulaId) {
      if (!noteModal) return;
      activeNoteFormulaId = formulaId;
      const f = getFormulas().find(item => item.id === formulaId);
      if (noteTitleEl) {
        noteTitleEl.textContent = f ? `Note: ${f.title}` : 'Formula Note';
      }
      const notes = getFormulaNotes();
      if (noteTextEl) {
        noteTextEl.value = notes[formulaId] || '';
      }
      noteModal.classList.add('open');
      noteModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => noteTextEl && noteTextEl.focus(), 100);
    }

    function closeNoteModal() {
      if (!noteModal) return;
      noteModal.classList.remove('open');
      noteModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      activeNoteFormulaId = null;
    }

    function openCompareModal() {
      if (!compareModal || !compareContainer) return;
      const formulas = getFormulas();
      const comparedItems = Array.from(selectedToCompare).map(id => formulas.find(f => f.id === id)).filter(Boolean);

      if (!comparedItems.length) {
        if (window.BTMToast) window.BTMToast('Select at least 2 formulas to compare', 'error');
        return;
      }

      compareContainer.innerHTML = comparedItems.map(f => {
        const canSolve = SOLVER_CONFIGS[f.id] !== undefined;
        return `
          <div class="compare-col">
            <div class="compare-col-header">
              <h3 style="font-size:var(--text-base);margin:0 0 6px 0">${escHtml(f.title)}</h3>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                <span class="badge badge-${f.level}">${capitalize(f.level)}</span>
                <span class="badge badge-primary">${escHtml(f.subject)}</span>
              </div>
            </div>
            <div class="compare-col-expr">
              <span class="compare-render" data-latex="${escHtml(f.formulaLatex)}">${escHtml(f.formulaLatex)}</span>
            </div>
            <div style="font-size:var(--text-xs);color:var(--color-muted);line-height:1.5">
              <strong>Summary:</strong> ${escHtml(f.summary)}
            </div>
            <div style="margin-top:auto;display:flex;gap:6px;flex-wrap:wrap;padding-top:var(--space-3);border-top:1px solid var(--color-border)">
              <a href="${escHtml(resolveFormulaHref(f.href))}" class="btn btn-outline-dark btn-sm" style="flex:1;text-align:center">Explore →</a>
              ${canSolve ? `<button type="button" class="btn-solver" data-solve-id="${f.id}">🧮 Solve</button>` : ''}
            </div>
          </div>
        `;
      }).join('');

      // Render KaTeX for compare columns
      if (typeof katex !== 'undefined' && katex.renderToString) {
        compareContainer.querySelectorAll('.compare-render').forEach(el => {
          const latex = el.dataset.latex;
          if (latex) {
            try {
              el.innerHTML = katex.renderToString(latex, { throwOnError: false, displayMode: true });
            } catch {
              el.textContent = latex;
            }
          }
        });
      }

      compareModal.classList.add('open');
      compareModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeCompareModal() {
      if (!compareModal) return;
      compareModal.classList.remove('open');
      compareModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Modal listeners
    if (noteSaveBtn) {
      noteSaveBtn.addEventListener('click', () => {
        if (!activeNoteFormulaId) return;
        const text = noteTextEl ? noteTextEl.value : '';
        saveFormulaNote(activeNoteFormulaId, text);
        closeNoteModal();
        if (window.BTMToast) {
          window.BTMToast(text.trim() ? 'Personal note saved! 📝' : 'Note cleared', 'success', 1500);
        }
        render();
      });
    }

    if (noteDeleteBtn) {
      noteDeleteBtn.addEventListener('click', () => {
        if (!activeNoteFormulaId) return;
        saveFormulaNote(activeNoteFormulaId, '');
        closeNoteModal();
        if (window.BTMToast) {
          window.BTMToast('Note deleted', 'success', 1500);
        }
        render();
      });
    }

    document.querySelectorAll('.note-close').forEach(btn => btn.addEventListener('click', closeNoteModal));
    document.querySelectorAll('.compare-close').forEach(btn => btn.addEventListener('click', closeCompareModal));

    if (compareOpenBtn) compareOpenBtn.addEventListener('click', openCompareModal);
    if (compareClearBtn) {
      compareClearBtn.addEventListener('click', () => {
        selectedToCompare.clear();
        updateCompareDock();
        render();
        if (window.BTMToast) window.BTMToast('Comparison cleared', 'success', 1000);
      });
    }

    function renderMath() {
      if (typeof katex !== 'undefined' && katex.renderToString) {
        grid.querySelectorAll('.formula-render').forEach(el => {
          const latex = el.dataset.latex;
          if (!latex) return;
          try {
            el.innerHTML = katex.renderToString(latex, { throwOnError: false });
          } catch (e) {
            el.textContent = latex;
          }
        });
      }
    }

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
      updateSavedCount();
      updateCompareDock();
      const savedSet = getSavedBookmarks();
      const notes = getFormulaNotes();

      if (!unique.length) {
        grid.innerHTML = '';
        if (emptyEl) emptyEl.hidden = false;
        return;
      }
      if (emptyEl) emptyEl.hidden = true;

      grid.innerHTML = unique.map(f => {
        const isBookmarked = savedSet.has(f.id);
        const canSolve = SOLVER_CONFIGS[f.id] !== undefined;
        const noteText = notes[f.id] || '';
        const hasNote = Boolean(noteText);
        const isCompared = selectedToCompare.has(f.id);

        const difficultyDots = f.level === 'beginner'
          ? '<span title="Level: Beginner" style="color:var(--color-success);font-size:11px">● ○ ○</span>'
          : f.level === 'intermediate'
            ? '<span title="Level: Intermediate" style="color:var(--color-focus);font-size:11px">● ● ○</span>'
            : '<span title="Level: Advanced" style="color:var(--color-warning);font-size:11px">● ● ●</span>';

        return `
        <div class="formula-card" data-id="${f.id}">
          <div class="formula-card-header">
            <div>
              <h3>${escHtml(f.title)}</h3>
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:4px">
                <span class="badge badge-${f.level}">${capitalize(f.level)}</span>
                <span class="badge badge-primary">${escHtml(f.subject)}</span>
                ${f.hasDemo ? '<span class="badge badge-interactive">⚡ Interactive</span>' : ''}
                <span style="margin-left:4px">${difficultyDots}</span>
              </div>
            </div>
            <button type="button" class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" data-id="${f.id}" title="${isBookmarked ? 'Remove from saved' : 'Save formula to study list'}" aria-label="Save formula">★</button>
          </div>
          <div class="formula-card-expr" aria-label="Formula: ${escHtml(f.title)}">
            <span class="formula-render" data-latex="${escHtml(f.formulaLatex)}">${escHtml(f.formulaLatex)}</span>
          </div>
          <p class="formula-card-summary">${escHtml(f.summary)}</p>
          ${hasNote ? `
            <div class="formula-card-note-preview">
              <strong>📝 Note:</strong> ${escHtml(noteText)}
            </div>
          ` : ''}
          <div class="formula-card-footer">
            <a href="${escHtml(resolveFormulaHref(f.href))}" class="btn btn-outline-dark btn-sm">Explore →</a>
            <button type="button" class="btn-note ${hasNote ? 'has-note' : ''}" data-note-id="${f.id}" title="${hasNote ? 'Edit personal note' : 'Add personal note'}">
              📝 ${hasNote ? 'Note ✓' : 'Note'}
            </button>
            <button type="button" class="btn-compare ${isCompared ? 'selected' : ''}" data-compare-id="${f.id}" title="${isCompared ? 'Remove from compare' : 'Compare side-by-side'}">
              ⚖️ ${isCompared ? 'Selected' : 'Compare'}
            </button>
            ${canSolve ? `
              <button type="button" class="btn-solver" data-solve-id="${f.id}" title="Calculate values for this formula">🧮 Solve</button>
            ` : ''}
            ${f.video ? `
              <button type="button" class="btn-video" data-video-id="${escHtml(f.video.youtubeId)}" data-video-title="${escHtml(f.video.title || f.title)}" data-video-channel="${escHtml(f.video.channel)}" data-video-url="${escHtml(f.video.url)}" title="Watch video explanation: ${escHtml(f.video.title || f.title)}">
                ▶ Video
              </button>
            ` : ''}
          </div>
        </div>
      `;
      }).join('');

      renderMath();
    }

    // Grid click handlers (Bookmark, Notes, Compare)
    grid.addEventListener('click', e => {
      // 1. Bookmark star
      const bookmarkBtn = e.target.closest('.btn-bookmark');
      if (bookmarkBtn) {
        e.preventDefault();
        const id = bookmarkBtn.dataset.id;
        const nowSaved = toggleBookmark(id);
        bookmarkBtn.classList.toggle('bookmarked', nowSaved);
        bookmarkBtn.title = nowSaved ? 'Remove from saved' : 'Save formula to study list';
        updateSavedCount();
        if (window.BTMToast) {
          window.BTMToast(nowSaved ? '⭐ Formula saved to your Study List!' : 'Removed from Study List', 'success', 1500);
        }
        if (currentFilters.savedOnly) {
          render();
        }
        return;
      }

      // 2. Note button
      const noteBtn = e.target.closest('.btn-note');
      if (noteBtn) {
        e.preventDefault();
        openNoteModal(noteBtn.dataset.noteId);
        return;
      }

      // 3. Compare button
      const compareBtn = e.target.closest('.btn-compare');
      if (compareBtn) {
        e.preventDefault();
        const id = compareBtn.dataset.compareId;
        if (selectedToCompare.has(id)) {
          selectedToCompare.delete(id);
        } else {
          if (selectedToCompare.size >= 3) {
            if (window.BTMToast) window.BTMToast('Maximum 3 formulas can be compared at once', 'error', 2000);
            return;
          }
          selectedToCompare.add(id);
        }
        updateCompareDock();
        render();
        return;
      }
    });

    if (filterSavedBtn) {
      filterSavedBtn.addEventListener('click', () => {
        const willBeActive = !currentFilters.savedOnly;
        currentFilters.savedOnly = willBeActive;
        filterSavedBtn.classList.toggle('active', willBeActive);
        render();
      });
    }

    // If KaTeX or page finishes loading later, re-run math rendering
    window.addEventListener('load', renderMath);

    // Fallback: If dataset not loaded yet, fetch data/formulas.json asynchronously
    if (!getFormulas().length) {
      fetch('data/formulas.json')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length) {
            window.FORMULA_INDEX = window.BTM_FORMULAS = data;
            render();
          }
        })
        .catch(err => console.warn('Could not load fallback formulas:', err));
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

    // Pre-fill from URL params (?q=, ?subject=, ?level=)
    const urlParams = new URLSearchParams(window.location.search);
    const urlQ = urlParams.get('q');
    if (urlQ && searchInput) {
      searchInput.value = urlQ;
      currentFilters.query = urlQ;
    }
    const urlSubject = urlParams.get('subject');
    if (urlSubject) {
      const matchBtn = Array.from(document.querySelectorAll('[data-filter-subject]')).find(b => b.dataset.filterSubject.toLowerCase() === urlSubject.toLowerCase());
      if (matchBtn) {
        document.querySelectorAll('[data-filter-subject]').forEach(b => b.classList.remove('active'));
        matchBtn.classList.add('active');
        currentFilters.subject = matchBtn.dataset.filterSubject;
      }
    }
    const urlLevel = urlParams.get('level');
    if (urlLevel) {
      const matchLevelBtn = Array.from(document.querySelectorAll('[data-filter-level]')).find(b => b.dataset.filterLevel.toLowerCase() === urlLevel.toLowerCase());
      if (matchLevelBtn) {
        document.querySelectorAll('[data-filter-level]').forEach(b => b.classList.remove('active'));
        matchLevelBtn.classList.add('active');
        currentFilters.level = matchLevelBtn.dataset.filterLevel;
      }
    }

    render();

    // Hook up Flashcard Trainer with currently filtered list
    initFlashcards(() => filterFormulas(currentFilters));

    // Hook up Cheatsheet Print
    const printBtn = document.getElementById('btn-print-cheatsheet');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  // ── Flashcard Trainer ─────────────────────────────────────
  function initFlashcards(getDeckList) {
    const modal = document.getElementById('flashcard-modal');
    if (!modal) return;

    const overlay = modal.querySelector('.flashcard-modal-overlay');
    const closeBtn = modal.querySelector('.flashcard-close');
    const cardEl = document.getElementById('fc-card');
    const titleEl = document.getElementById('fc-title');
    const backTitleEl = document.getElementById('fc-back-title');
    const subjectEl = document.getElementById('fc-subject');
    const levelEl = document.getElementById('fc-level');
    const latexEl = document.getElementById('fc-latex');
    const summaryEl = document.getElementById('fc-summary');
    const progressEl = document.getElementById('fc-progress');
    const prevBtn = document.getElementById('fc-prev');
    const nextBtn = document.getElementById('fc-next');
    const shuffleBtn = document.getElementById('fc-shuffle');
    const gotItBtn = document.getElementById('fc-got-it');
    const needWorkBtn = document.getElementById('fc-need-work');

    let deck = [];
    let currentIndex = 0;
    const MASTERED_KEY = 'btm_mastered_fc';

    function getMastered() {
      try {
        return new Set(JSON.parse(localStorage.getItem(MASTERED_KEY) || '[]'));
      } catch {
        return new Set();
      }
    }

    function saveMastered(set) {
      localStorage.setItem(MASTERED_KEY, JSON.stringify(Array.from(set)));
    }

    function renderCard() {
      if (!deck.length) return;
      cardEl.classList.remove('flipped');
      const item = deck[currentIndex];
      if (!item) return;

      const mastered = getMastered().has(item.id);
      if (titleEl) titleEl.textContent = item.title;
      if (backTitleEl) backTitleEl.textContent = item.title;
      if (subjectEl) subjectEl.textContent = item.subject;
      if (levelEl) {
        levelEl.textContent = capitalize(item.level);
        levelEl.className = `badge badge-${item.level}`;
      }
      const notes = getFormulaNotes();
      const userNote = notes[item.id];
      if (summaryEl) {
        summaryEl.innerHTML = escHtml(item.summary) + (userNote ? `<div style="margin-top:8px;padding:6px 8px;background:rgba(244,162,97,0.15);border-left:3px solid #f59e0b;border-radius:4px;color:var(--color-text-dark);font-size:11px;text-align:left"><strong>📝 Your Note:</strong> ${escHtml(userNote)}</div>` : '');
      }
      if (progressEl) {
        progressEl.textContent = `Card ${currentIndex + 1} / ${deck.length} ${mastered ? '⭐ Mastered' : ''}`;
      }

      if (latexEl && typeof katex !== 'undefined' && katex.renderToString) {
        try {
          latexEl.innerHTML = katex.renderToString(item.formulaLatex, { throwOnError: false, displayMode: true });
        } catch {
          latexEl.textContent = item.formulaLatex;
        }
      } else if (latexEl) {
        latexEl.textContent = item.formulaLatex;
      }
    }

    function openFlashcards() {
      deck = getDeckList ? getDeckList() : getFormulas();
      if (!deck || !deck.length) {
        if (window.BTMToast) window.BTMToast('No formulas found in current view', 'error');
        return;
      }
      currentIndex = 0;
      renderCard();
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeFlashcards() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (cardEl) {
      cardEl.addEventListener('click', () => cardEl.classList.toggle('flipped'));
      cardEl.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
          e.preventDefault();
          cardEl.classList.toggle('flipped');
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentIndex < deck.length - 1) {
          currentIndex++;
          renderCard();
        } else {
          currentIndex = 0;
          renderCard();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--;
          renderCard();
        } else {
          currentIndex = deck.length - 1;
          renderCard();
        }
      });
    }

    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        deck.sort(() => Math.random() - 0.5);
        currentIndex = 0;
        renderCard();
        if (window.BTMToast) window.BTMToast('🔀 Deck shuffled!', 'success', 1200);
      });
    }

    if (gotItBtn) {
      gotItBtn.addEventListener('click', () => {
        const item = deck[currentIndex];
        if (item) {
          const mastered = getMastered();
          mastered.add(item.id);
          saveMastered(mastered);
          if (window.BTMToast) window.BTMToast('Marked as Mastered! 🟢', 'success', 1000);
          if (currentIndex < deck.length - 1) {
            currentIndex++;
          }
          renderCard();
        }
      });
    }

    if (needWorkBtn) {
      needWorkBtn.addEventListener('click', () => {
        const item = deck[currentIndex];
        if (item) {
          const mastered = getMastered();
          mastered.delete(item.id);
          saveMastered(mastered);
          if (window.BTMToast) window.BTMToast('Saved for review 🔴', 'error', 1000);
          if (currentIndex < deck.length - 1) {
            currentIndex++;
          }
          renderCard();
        }
      });
    }

    if (overlay) overlay.addEventListener('click', closeFlashcards);
    if (closeBtn) closeBtn.addEventListener('click', closeFlashcards);

    document.addEventListener('keydown', e => {
      if (modal.classList.contains('open')) {
        if (e.key === 'Escape') closeFlashcards();
        else if (e.key === 'ArrowRight') nextBtn && nextBtn.click();
        else if (e.key === 'ArrowLeft') prevBtn && prevBtn.click();
      }
    });

    const triggerBtn = document.getElementById('btn-flashcards-mode');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', openFlashcards);
    }
  }

  // ── Quick Formula Solver ──────────────────────────────────
  function initSolverModal() {
    const modal = document.getElementById('solver-modal');
    if (!modal) return;

    const overlay = modal.querySelector('.solver-modal-overlay');
    const closeBtn = modal.querySelector('.solver-close');
    const titleEl = document.getElementById('solver-title');
    const formulaRenderEl = document.getElementById('solver-formula-render');
    const inputsContainer = document.getElementById('solver-inputs-container');
    const outputEl = document.getElementById('solver-output');

    let currentConfig = null;

    function recalculate() {
      if (!currentConfig || !outputEl) return;
      const vals = {};
      inputsContainer.querySelectorAll('input').forEach(input => {
        vals[input.dataset.param] = input.value;
      });
      outputEl.textContent = currentConfig.calculate(vals);
    }

    function openSolver(formulaId) {
      const config = SOLVER_CONFIGS[formulaId];
      if (!config) return;
      currentConfig = config;

      if (titleEl) titleEl.textContent = config.title;
      if (formulaRenderEl) {
        if (typeof katex !== 'undefined' && katex.renderToString) {
          try {
            formulaRenderEl.innerHTML = katex.renderToString(config.latex, { throwOnError: false, displayMode: true });
          } catch {
            formulaRenderEl.textContent = config.latex;
          }
        } else {
          formulaRenderEl.textContent = config.latex;
        }
      }

      if (inputsContainer) {
        inputsContainer.innerHTML = config.inputs.map(inp => `
          <div class="solver-input-row">
            <label for="solv-${inp.id}">${escHtml(inp.label)}:</label>
            <input type="number" step="any" id="solv-${inp.id}" data-param="${inp.id}" value="${inp.default}">
          </div>
        `).join('');

        inputsContainer.querySelectorAll('input').forEach(input => {
          input.addEventListener('input', recalculate);
        });
      }

      recalculate();
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeSolver() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (overlay) overlay.addEventListener('click', closeSolver);
    if (closeBtn) closeBtn.addEventListener('click', closeSolver);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeSolver();
      }
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn-solver');
      if (btn) {
        e.preventDefault();
        openSolver(btn.dataset.solveId);
      }
    });
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

  // ── Video Modal ───────────────────────────────────────────
  function initVideoModal() {
    const modal = document.getElementById('video-modal');
    if (!modal) return;

    const overlay = modal.querySelector('.video-modal-overlay');
    const closeBtn = modal.querySelector('.video-modal-close');
    const container = document.getElementById('video-modal-container');
    const titleEl = document.getElementById('video-modal-title');
    const channelEl = document.getElementById('video-modal-channel');
    const linkEl = document.getElementById('video-modal-link');

    function openModal(videoId, title, channel, url) {
      if (!videoId) return;
      if (titleEl) titleEl.textContent = title || 'Formula Video Lesson';
      if (channelEl) channelEl.textContent = channel || 'YouTube';
      if (linkEl) linkEl.href = url || `https://www.youtube.com/watch?v=${videoId}`;
      if (container) {
        container.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1" title="${escHtml(title || 'Formula Video')}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
      }
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      if (container) container.innerHTML = '';
      document.body.style.overflow = '';
    }

    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });

    // Delegate clicks for any .btn-video button on page
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-video');
      if (btn) {
        e.preventDefault();
        const videoId = btn.dataset.videoId;
        const title = btn.dataset.videoTitle;
        const channel = btn.dataset.videoChannel;
        const url = btn.dataset.videoUrl;
        openModal(videoId, title, channel, url);
      }
    });
  }

  // ── Init on DOM ready ─────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initSearchModal();
    initHomeSearch();
    initLibraryFilters();
    initVideoModal();
    initSolverModal();
  });

})();


