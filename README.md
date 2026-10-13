# BehindTheMath 📐

> **Understand the formula. Explore the relationship. See the math behind it.**
> 
> **Presented by:** Santunu Kaysar  
> **Helped by:** Intellisoft Innovations

---

## 🌟 Overview

**BehindTheMath** is a responsive, static-first educational web platform that demystifies mathematical formulas. It goes beyond rote memorization to teach the *meaning*, *derivation*, *geometric intuition*, *computational implementation*, and *boundary limitations* of mathematical laws.

## ✨ Features

- **🏛️ 12 Core Subject Categories:** Foundations, Number Theory, Algebra, Geometry, Trigonometry, Calculus, Statistics, Counting & Probability, Linear Algebra, Discrete Math, Physics, and CSE.
- **⚡ Interactive Visual Labs:**
  - **Lab A — Circle Area & Circumference:** Live radius slider with dynamic SVG visualization comparing quadratic area growth against linear circumference growth.
  - **Lab B — Pythagorean Theorem:** Interactive right-triangle side slider with live hypotenuse, area, and angle calculations.
  - **Lab C — Quadratic Formula & Parabola Explorer:** Adjust coefficients $a, b, c$ with live canvas plotting of parabola curvature, vertex, discriminant, and roots.
  - **Lab D — Trigonometric Unit Circle:** Animated rotating angle radius tracing out a synchronized sine wave in real time with $\sin^2\theta + \cos^2\theta = 1$ identity verification.
  - **Lab E — Derivatives & Tangent Slope:** Choose functions ($x^2, \sin x, x$), move point $x$, and shrink difference interval $h$ to watch the secant line snap onto the true tangent line.
- **💻 Multi-Language Code Tabs:** Production-ready implementations in **C (C11)** and **Python 3** for all formulas, complete with input validation and zero-division guards.
- **🔍 Instant Client-Side Formula Search:** Global search modal (<kbd>Ctrl+K</kbd> or <kbd>/</kbd>) querying static JSON/JS search indices with keyword relevance scoring and direct deep-linking.
- **✏️ Interactive Practice Hub:** Progressive hint revelation, multiple choice and numeric inputs, constructive explanations, and local browser score tracking.
- **🎨 Premium Math-Centric Design System:**
  - Curated palette: Deep Navy (`#1D3557`), Steel Blue (`#457B9D`), Soft Mint (`#A8DADC`), Warm Coral (`#E63946`), Cream White (`#F1FAEE`).
  - KaTeX integration for high-speed mathematical typesetting.
  - Accessible focus states (`#F4A261`), ARIA roles, skip-to-content, keyboard drawer traps, and `prefers-reduced-motion` compliance.

---

## 📁 Repository Structure

```
BehindTheMath/
├── index.html                   # Homepage (Hero, search, subjects, lab highlights)
├── learn.html                   # Subject index and structured learning path
├── library.html                 # Searchable, filterable formula reference library
├── lab.html                     # Visual lab experiment hub
├── practice.html                # Practice problem set with score tracking
├── about.html                   # Mission, methodology, accessibility, credits
├── 404.html                     # Friendly math-themed 404 page
│
├── css/
│   ├── tokens.css               # Design tokens: palette, typography, spacing, shadows
│   ├── global.css               # CSS reset, base typography, responsive layouts
│   ├── components.css           # Cards, headers, footers, buttons, tabs, labs, formulas
│   └── utilities.css            # Helper layout, spacing, and accessibility classes
│
├── js/
│   ├── nav.js                   # Mobile navigation drawer, sticky header, canvas hero
│   ├── search-index.js          # Formula metadata and topic keywords index
│   ├── search.js                # Search engine, modal dialog, keyboard shortcuts
│   ├── code-tabs.js             # Code language tab switching, clipboard copy, practice engine
│   └── labs/
│       ├── circle-area.js       # Lab A: Circle area canvas/SVG explorer
│       ├── quadratic.js         # Lab C: Parabola & quadratic roots canvas
│       ├── unit-circle.js       # Lab D: Trigonometric unit circle & wave canvas
│       └── derivative.js        # Lab E: Secant-to-tangent derivative slope canvas
│
├── lessons/                     # 12 Comprehensive formula lesson modules
│   ├── circle-area.html
│   ├── pythagorean-theorem.html
│   ├── quadratic-equation.html
│   ├── gcd-lcm.html
│   ├── percentages-ratios.html
│   ├── exponents-logarithms.html
│   ├── permutations-combinations.html
│   ├── probability-bayes.html
│   ├── mean-standard-deviation.html
│   ├── derivatives-tangent.html
│   ├── unit-circle.html
│   └── time-complexity.html
│
└── data/
    └── formulas.json            # Static JSON formula database
```

---

## 🚀 How to Run Locally

Because **BehindTheMath** is built with modern, vanilla static web technologies (HTML5, CSS3, ES6 JavaScript, and CDN-hosted KaTeX), **no build step, package manager, or Node compilation is required**.

### Option 1: Direct File Opening
Double-click `index.html` or open it directly in any modern browser (Chrome, Firefox, Safari, Edge).

### Option 2: Local HTTP Server (Recommended)
Using Python:
```bash
python -m http.server 8000
```
Or using Node.js:
```bash
npx serve .
```
Then navigate to `http://localhost:8000`.

---

## 👥 Credits & Attribution

- **Presented by:** Santunu Kaysar
- **Helped by:** Intellisoft Innovations
- **Typesetting:** [KaTeX](https://katex.org/)
- **Typography:** Plus Jakarta Sans, Inter, JetBrains Mono
