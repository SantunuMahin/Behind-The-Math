/* ============================================================
   BehindTheMath — Code Tabs & Copy Buttons
   ============================================================ */

(function () {
  'use strict';

  function initCodeTabs() {
    document.querySelectorAll('.code-tabs').forEach(tabsEl => {
      const tabBtns  = tabsEl.querySelectorAll('.code-tab-btn');
      const panels   = tabsEl.querySelectorAll('.code-panel');
      const copyBtn  = tabsEl.querySelector('.code-copy-btn');

      // Tab switching
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.tab;
          tabBtns.forEach(b => {
            b.setAttribute('aria-selected', b.dataset.tab === target ? 'true' : 'false');
          });
          panels.forEach(p => {
            p.classList.toggle('active', p.dataset.tab === target);
          });
        });

        // Arrow key navigation between tabs
        btn.addEventListener('keydown', e => {
          const btns = Array.from(tabBtns);
          const idx  = btns.indexOf(e.currentTarget);
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            btns[(idx + 1) % btns.length].focus();
            btns[(idx + 1) % btns.length].click();
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            btns[(idx - 1 + btns.length) % btns.length].focus();
            btns[(idx - 1 + btns.length) % btns.length].click();
          }
        });
      });

      // Copy button
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const activePanel = tabsEl.querySelector('.code-panel.active');
          const code = activePanel ? activePanel.querySelector('code, pre').textContent : '';

          if (!navigator.clipboard) {
            // Fallback: select text
            copyBtn.textContent = 'Text visible above';
            setTimeout(() => { copyBtn.innerHTML = '⎘ Copy'; }, 2000);
            return;
          }

          navigator.clipboard.writeText(code).then(() => {
            copyBtn.classList.add('copied');
            copyBtn.innerHTML = '✓ Copied!';
            setTimeout(() => {
              copyBtn.classList.remove('copied');
              copyBtn.innerHTML = '⎘ Copy';
            }, 2000);
          }).catch(() => {
            copyBtn.innerHTML = '✕ Failed';
            setTimeout(() => { copyBtn.innerHTML = '⎘ Copy'; }, 2000);
          });
        });
      }
    });
  }

  // ── Render KaTeX on page ──────────────────────────────────
  function initKaTeX() {
    if (!window.renderMathInElement) return;
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true  },
        { left: '\\[', right: '\\]', display: true  },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false }
      ],
      throwOnError: false,
      errorColor: '#E63946'
    });

    // Also render data-latex attributes in formula cards
    document.querySelectorAll('[data-latex]').forEach(el => {
      const latex = el.dataset.latex;
      if (latex) {
        try {
          el.innerHTML = katex.renderToString(latex, {
            throwOnError: false,
            displayMode: el.dataset.display === 'true'
          });
        } catch (e) {
          el.textContent = latex;
        }
      }
    });
  }

  // ── Practice question system ──────────────────────────────
  function initPractice() {
    document.querySelectorAll('.practice-question').forEach(qEl => {
      const hintBtn    = qEl.querySelector('.hint-btn, .practice-hint-btn');
      const hintEl     = qEl.querySelector('.practice-hint');
      const submitBtn  = qEl.querySelector('.submit-btn, .practice-submit-btn');
      const retryBtn   = qEl.querySelector('.retry-btn, .practice-retry-btn');
      const feedbackEl = qEl.querySelector('.practice-feedback');
      const explainEl  = qEl.querySelector('.practice-explanation');
      const correctAns = qEl.dataset.answer;

      // Hint
      if (hintBtn && hintEl) {
        hintBtn.addEventListener('click', () => {
          hintEl.classList.add('visible');
          hintBtn.disabled = true;
          hintBtn.textContent = 'Hint shown';
        });
      }

      // Submit
      if (submitBtn && feedbackEl) {
        submitBtn.addEventListener('click', () => {
          const choice = qEl.querySelector('input[type="radio"]:checked');
          const numInput = qEl.querySelector('.practice-numeric-input');
          let userAns = '';

          if (choice) userAns = choice.value;
          else if (numInput) userAns = numInput.value.trim();

          if (!userAns) {
            feedbackEl.className = 'practice-feedback visible incorrect';
            feedbackEl.innerHTML = '⚠ Please select or enter an answer first.';
            return;
          }

          const isCorrect = String(userAns).toLowerCase() === String(correctAns).toLowerCase();

          feedbackEl.className = `practice-feedback visible ${isCorrect ? 'correct' : 'incorrect'}`;
          feedbackEl.innerHTML = isCorrect
            ? '✓ Correct! Well done.'
            : `✕ Not quite. The correct answer is <strong>${escHtml(correctAns)}</strong>.`;

          if (explainEl) explainEl.classList.add('visible');
          submitBtn.disabled = true;
          if (retryBtn) retryBtn.style.display = 'inline-flex';
        });
      }

      // Retry
      if (retryBtn) {
        retryBtn.style.display = 'none';
        retryBtn.addEventListener('click', () => {
          feedbackEl && feedbackEl.classList.remove('visible');
          explainEl && explainEl.classList.remove('visible');
          hintEl && hintEl.classList.remove('visible');
          if (hintBtn) { hintBtn.disabled = false; hintBtn.textContent = 'Show Hint'; }
          if (submitBtn) submitBtn.disabled = false;
          retryBtn.style.display = 'none';
          qEl.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
          const numInput = qEl.querySelector('.practice-numeric-input');
          if (numInput) numInput.value = '';
        });
      }
    });
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Formula copy button (formula panel) ───────────────────
  function initFormulaCopy() {
    document.querySelectorAll('.formula-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.closest('.formula-panel');
        const latex = panel ? panel.dataset.latex : '';
        if (!latex || !navigator.clipboard) return;
        navigator.clipboard.writeText(latex).then(() => {
          btn.textContent = '✓ Copied!';
          setTimeout(() => { btn.textContent = '⎘ Copy LaTeX'; }, 2000);
        });
      });
    });
  }

  // ── Init ──────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initCodeTabs();
    initKaTeX();
    initPractice();
    initFormulaCopy();
  });

})();
