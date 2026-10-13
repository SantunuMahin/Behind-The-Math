# BehindTheMath --- Website Design & Product Specification

**Presented by:** Santunu Kaysar\
**Helped by:** Intellisoft Innovations\
**Product type:** Responsive, static-first educational website\
**Primary goal:** Help learners understand the *meaning, derivation,
use, and limitations* of mathematical formulas through clear
explanations, interactive visualizations, animations, and
executable-looking examples in C and Python.

------------------------------------------------------------------------

## 1. Product Vision

BehindTheMath should make mathematics feel discoverable rather than
intimidating. Each topic should answer four questions:

1.  **What does the formula say?**
2.  **Why does it work?**
3.  **What changes when its variables change?**
4.  **How can I apply it in a real problem or program?**

The experience should combine the clarity of a well-edited textbook, the
feedback of an interactive lab, and the speed of a modern developer
reference.

### Core principles

-   **Understanding before memorization:** Explain symbols, assumptions,
    units, and intuition before presenting a formula as a fact to
    memorize.
-   **Learn by changing values:** Use sliders, number inputs, step
    controls, and animated diagrams.
-   **Progressive disclosure:** Begin with a simple explanation and
    reveal derivations, edge cases, and advanced notes when requested.
-   **Code is part of the lesson:** Offer C and Python examples side by
    side, with comments and sample input/output.
-   **Accessible by default:** Keyboard navigation, sufficient contrast,
    reduced-motion support, semantic structure, and readable
    mathematical notation.
-   **Honest static-first architecture:** Core lessons and reference
    content must work without a server. Interactive features should run
    in the browser and degrade gracefully.

------------------------------------------------------------------------

## 2. Audience & Learning Modes

### Primary audiences

-   Secondary and university students building mathematical foundations.
-   Engineering and CSE students connecting formulas to practical
    problems.
-   Competitive programmers learning number theory, combinatorics, bit
    manipulation, and complexity.
-   Data Science and AI/ML learners reviewing algebra, vectors,
    matrices, probability, statistics, and calculus.
-   Curious learners who want to understand the mathematics behind
    everyday phenomena.

### Learning modes

1.  **Explore:** A visual playground with adjustable values and
    immediate feedback.
2.  **Understand:** Plain-language explanation, symbol definitions,
    assumptions, and a worked example.
3.  **Implement:** C and Python code snippets with sample input/output
    and edge-case notes.
4.  **Practice:** Hints-first exercises with an explanation after
    submission.
5.  **Reference:** A searchable formula index for quick revision.

------------------------------------------------------------------------

## 3. Brand & Visual Identity

### Brand personality

Curious, calm, precise, welcoming, modern, and technically credible.
Avoid a childish classroom aesthetic or a dense, intimidating textbook
layout.

### Required palette

  ------------------------------------------------------------------------
  Token                    Hex                     Intended use
  ------------------------ ----------------------- -----------------------
  `--color-primary`        `#1D3557`               Main brand, navigation,
                                                   headings, dark surfaces

  `--color-secondary`      `#457B9D`               Links, charts,
                                                   supporting surfaces,
                                                   selected states

  `--color-button`         `#A8DADC`               Primary call-to-action
                                                   backgrounds

  `--color-text`           `#F1FAEE`               Text on dark surfaces

  `--color-warning`        `#E63946`               Errors, warnings,
                                                   destructive or invalid
                                                   states

  `--color-background`     `#F7FAFC`               Light page background

  `--color-surface`        `#FFFFFF`               Cards, panels, formula
                                                   sheets

  `--color-surface-dark`   `#13263D`               Dark panels and code
                                                   surfaces

  `--color-text-dark`      `#17212B`               Text on light surfaces

  `--color-muted`          `#64748B`               Supporting text and
                                                   labels

  `--color-border`         `#D8E1E8`               Dividers, card borders,
                                                   input outlines

  `--color-success`        `#2A9D8F`               Correct answers and
                                                   successful actions

  `--color-focus`          `#F4A261`               High-visibility
                                                   keyboard focus

  `--color-code`           `#0B1320`               Code editor background
  ------------------------------------------------------------------------

**Contrast note:** `#F1FAEE` is intended for dark surfaces, not ordinary
body text on white. Use `#17212B` for light backgrounds. The button
color `#A8DADC` should use dark text such as `#1D3557` to preserve
contrast.

### Suggested CSS tokens

``` css
:root {
  color-scheme: light;
  --color-primary: #1D3557;
  --color-secondary: #457B9D;
  --color-button: #A8DADC;
  --color-text: #F1FAEE;
  --color-warning: #E63946;

  --color-background: #F7FAFC;
  --color-surface: #FFFFFF;
  --color-surface-dark: #13263D;
  --color-text-dark: #17212B;
  --color-muted: #64748B;
  --color-border: #D8E1E8;
  --color-success: #2A9D8F;
  --color-focus: #F4A261;

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
  --shadow-card: 0 8px 28px rgb(29 53 87 / 8%);
  --content-width: 1200px;
  --reading-width: 760px;
}
```

### Typography

-   **Headings:** `Manrope` or `Plus Jakarta Sans`, with a strong but
    friendly geometric feel.
-   **Body:** `Inter` or a system sans-serif fallback for long-form
    readability.
-   **Code:** `JetBrains Mono` or `ui-monospace`.
-   **Math:** KaTeX-rendered mathematical typesetting or accessible
    MathML where feasible.

Use a restrained type scale. Body text should be comfortable on mobile
(16--18px). Keep line length near 60--80 characters for lesson content.
Do not rely on color alone to distinguish states.

### Shape, depth, and imagery

-   Use rounded cards with subtle borders and soft shadows.
-   Prefer diagrams, plotted curves, geometric illustrations, and small
    purposeful motion over stock photography.
-   Keep the interface spacious and content-first.
-   Use gradients sparingly, primarily in hero illustrations or
    interactive visualization canvases.

------------------------------------------------------------------------

## 4. Information Architecture

### Main navigation

-   **Home**
-   **Learn**
-   **Formula Library**
-   **Visual Lab**
-   **Practice**
-   **About**

Desktop navigation should be compact and sticky after scrolling. On
mobile, use a clear menu button with an accessible drawer or sheet. Keep
search easy to reach on every page.

### Topic taxonomy

Organize the library by subject and difficulty, and let users filter by
both.

1.  **Foundations**
    -   Arithmetic, fractions, percentages, ratios
    -   Exponents, roots, logarithms, scientific notation
    -   Sequences and series
2.  **Number Theory & Programming**
    -   GCD and LCM, primes, divisibility
    -   Modular arithmetic, integer overflow notes
    -   Binary numbers, bit manipulation
3.  **Algebra**
    -   Identities, linear equations, quadratic equations
    -   Complex numbers
4.  **Geometry**
    -   2D shapes, perimeter, area
    -   3D shapes, surface area, volume
    -   Coordinate geometry
5.  **Trigonometry**
    -   Ratios, identities, unit circle
    -   Compound angles and triangle laws
6.  **Counting & Probability**
    -   Factorials, permutations, combinations
    -   Probability rules, conditional probability, Bayes' theorem
7.  **Statistics**
    -   Mean, variance, standard deviation, z-score
8.  **Linear Algebra**
    -   Matrices, determinants, inverse, vectors, dot and cross products
9.  **Calculus**
    -   Limits, differentiation, integration, Taylor series
10. **Physics**
    -   Motion, forces, work and energy
    -   Gravitation, circular motion, fluids
    -   Heat, gases, waves, optics
    -   Electricity, circuits, magnetism, modern physics
11. **CSE & Competitive Programming**
    -   Time complexity, combinatorics, graph formulas
    -   Binary representation and useful sums
12. **Quick Reference**
    -   Searchable formula finder
    -   Unit conversions and physical constants

This taxonomy follows the supplied *University Formula Handbook: Basic
to Advanced Mathematics, Physics & CSE*. Treat the handbook as the
initial content seed, not as a claim that the site contains every
formula in existence.

### Recommended learning path

Foundations → Exponents and Algebra → Geometry and Trigonometry →
Counting and Probability → Statistics and Linear Algebra → Calculus →
Physics by topic → CSE applications and edge cases.

------------------------------------------------------------------------

## 5. Sitemap & Page Requirements

### Home page

1.  **Hero section**
    -   Headline: "Understand the math behind everything."
    -   Supporting text: "Explore formulas, experiment with variables,
        and connect mathematical ideas to C and Python."
    -   Primary CTA: **Start Exploring**
    -   Secondary CTA: **Open Formula Library**
    -   Hero visual: an animated mathematical curve or geometric
        construction; avoid a purely decorative animation that does not
        teach anything.
2.  **Search-first formula finder**
    -   Search by formula name, symbol, topic, or use case.
    -   Show suggestions and recent popular topics.
3.  **Explore by subject**
    -   Subject cards with icon, short description, topic count, and
        difficulty.
4.  **Interactive highlights**
    -   Circle area explorer
    -   Quadratic function explorer
    -   Sine wave explorer
    -   Derivative as slope
5.  **Learning workflow**
    -   Understand → Visualize → Calculate → Code → Practice
6.  **Featured lessons**
    -   Display difficulty, estimated time, and whether an interactive
        lab is included.
7.  **About and attribution**
    -   "BehindTheMath --- Presented by Santunu Kaysar, helped by
        Intellisoft Innovations."

### Subject listing page

-   Subject overview and learning outcomes.
-   Search and filters for level, type, and interactive availability.
-   Topic cards that remain consistent across all categories.
-   Clear empty state when filters produce no results.

### Topic lesson page

Recommended layout:

-   Breadcrumbs and topic title.
-   Short "why this matters" introduction.
-   Formula panel with copy button.
-   Variable definitions and domain/condition notes.
-   Interactive visualization.
-   Worked example with each calculation step explained.
-   C and Python tabs.
-   Practice problems with hints and feedback.
-   Related formulas and next/previous lesson links.

On desktop, use a two-column layout when useful: lesson content on the
left and a sticky "On this page" panel on the right. On mobile, collapse
the outline into a compact jump menu and keep interactive controls close
to the visualization.

### Formula library

-   Fast client-side search.
-   Filters: subject, difficulty, formula type, and "has interactive
    demo".
-   Sort by title, subject, or learning path.
-   Formula cards show formula, name, topic, one-line meaning, and a
    "Learn this" link.
-   Provide a dense table/list mode for quick revision, while retaining
    readable spacing.

### Visual Lab

A collection of focused interactive experiments. Each lab must include
controls, a visualization, a live result, and a short explanation of the
observed behavior.

### Practice

-   Multiple-choice, numeric answer, and "predict what happens"
    questions.
-   Reveal hints progressively.
-   Show a worked solution after answering.
-   Keep score and progress locally if desired, but clearly explain that
    browser-local progress may not sync between devices.

### About

Explain the educational purpose, content approach, accessibility goals,
and attribution. Do not imply endorsement or certification by any
institution unless it has been explicitly granted.

------------------------------------------------------------------------

## 6. Formula Lesson Content Model

Every formula should use a consistent structure:

``` ts
type FormulaLesson = {
  id: string;
  title: string;
  slug: string;
  subject: string;
  topics: string[];
  level: "beginner" | "intermediate" | "advanced";
  summary: string;
  formulaLatex: string;
  plainLanguageMeaning: string;
  variables: Array<{
    symbol: string;
    meaning: string;
    unit?: string;
    constraints?: string;
  }>;
  assumptions: string[];
  derivation?: Array<{
    step: string;
    explanation: string;
  }>;
  workedExample: {
    problem: string;
    steps: string[];
    answer: string;
  };
  visualization?: {
    type: string;
    description: string;
    controls: string[];
  };
  codeExamples: {
    c: string;
    python: string;
  };
  exercises: Array<{
    question: string;
    hint?: string;
    answer: string;
    explanation: string;
  }>;
  relatedFormulaIds: string[];
  sourceNotes?: string;
};
```

Use this model to keep content consistent. Optional fields should be
omitted when not relevant rather than filled with invented information.

### Formula card anatomy

-   Formula name
-   Rendered mathematical expression
-   One-sentence intuition
-   Subject and level labels
-   Interactive indicator, when applicable
-   "Explore formula" link

### Formula explanation quality checklist

For each lesson, answer:

-   What do the symbols mean?
-   What are the units, if any?
-   What assumptions or domain restrictions apply?
-   What does the formula look like with actual numbers?
-   What common mistake should learners avoid?
-   What happens when a variable increases or decreases?
-   How can it be expressed in C and Python?
-   What test cases cover ordinary values and edge cases?

------------------------------------------------------------------------

## 7. Interactive Animation & Visualization System

**Principle:** Motion must explain a mathematical relationship, not
merely decorate the page. Every animation needs user control, a
meaningful state change, and a reduced-motion alternative.

### Priority visual labs

#### A. Circle area explorer

-   Controls: radius slider and numeric input.
-   Visual: circle grows as radius changes; display radius, diameter,
    circumference, and area.
-   Live formula: `A = πr²`.
-   Explain why doubling the radius makes area four times as large.
-   Include a reset button and accessible value readout.

#### B. Pythagorean theorem

-   Controls: two perpendicular side lengths.
-   Visual: right triangle with squares attached to all three sides.
-   Live calculation: `a² + b² = c²`.
-   Animate square areas filling or rearranging to illustrate the
    relationship.
-   State clearly that the theorem applies to right triangles.

#### C. Quadratic function explorer

-   Controls: `a`, `b`, and `c` for `y = ax² + bx + c`.
-   Visual: plotted parabola, x/y axes, vertex, and roots where real
    roots exist.
-   Explain how the sign and magnitude of `a` affect opening direction
    and width.
-   Handle `a = 0` as a linear case instead of attempting division by
    zero.
-   Do not display real roots when the discriminant is negative; explain
    why.

#### D. Trigonometric unit circle

-   Controls: angle slider, degree/radian toggle, play/pause.
-   Visual: rotating radius, point on the circle, horizontal cosine
    projection, vertical sine projection, and a synchronized wave.
-   Show `sin²θ + cos²θ = 1`.
-   Use a clear marker for undefined tangent positions.

#### E. Derivative as slope

-   Function selector: start with `f(x) = x²`, then `sin(x)` and a
    simple linear function.
-   Controls: x-position and tangent/secant toggle.
-   Visual: curve and tangent line; optionally show a secant line
    approaching the tangent as `h` approaches zero.
-   Display an approximate derivative and the symbolic result.
-   Explain that the usual trigonometric derivative rules assume
    radians.

#### F. Integral as accumulated area

-   Function selector and interval endpoints.
-   Visual: curve with a shaded region and adjustable Riemann
    rectangles.
-   Controls: rectangle count and left/right/midpoint sample mode.
-   Display approximate sum and, where supported, the exact integral.
-   Explain signed area when the function falls below the x-axis.

#### G. Probability simulator

-   Example: coin flips or dice rolls.
-   Controls: number of trials and run/reset.
-   Visual: animated outcomes and a bar chart comparing observed
    frequency with theoretical probability.
-   Explain that simulated outcomes vary and converge imperfectly rather
    than guaranteeing exact results in a small sample.

#### H. Vector explorer

-   Controls: vector components.
-   Visual: arrows on a coordinate plane; display magnitude, dot
    product, and angle where defined.
-   Show how a dot product changes with direction.
-   Handle zero-length vectors safely.

#### I. GCD / LCM explorer

-   Controls: two positive integers.
-   Visual: Euclidean algorithm steps, remainders, and a final GCD.
-   Display `lcm(a,b) = (a / gcd(a,b)) × b` for positive inputs, with
    overflow guidance for code implementations.

#### J. Motion and energy lab

-   Controls: initial velocity, acceleration, elapsed time, mass, and
    height where relevant.
-   Visual: simple motion timeline or position/velocity graph.
-   Connect equations to `v = u + at`, `s = ut + ½at²`, and `KE = ½mv²`.
-   Label assumptions such as constant acceleration and use SI units.

### Animation behavior

-   Prefer SVG and Canvas for diagrams and plots; use CSS transitions
    for simple interface changes.
-   Animate values over approximately 150--350 ms for ordinary state
    changes, while giving users pause/play controls for continuous
    motion.
-   Never force autoplay for complex or long-running lessons.
-   Respect `prefers-reduced-motion: reduce`; replace movement with
    immediate updates or a static annotated diagram.
-   Keep controls synchronized: slider, numeric input, formula, and
    diagram must always represent the same state.
-   Include a reset action and readable numerical output.
-   Keep diagrams responsive and avoid clipping labels on small screens.
-   For SVG, provide accessible labels or a concise textual equivalent.

------------------------------------------------------------------------

## 8. Code Examples: C & Python

Code examples should illustrate the same mathematical concept in both
languages. Use tabs labelled **C** and **Python**, with copy buttons and
syntax highlighting. Avoid pretending that snippets have executed unless
the site actually runs them.

### Example 1 --- Circle area

**C**

``` c
#include <stdio.h>

int main(void) {
    const double pi = 3.141592653589793;
    double radius = 3.0;

    if (radius < 0.0) {
        printf("Radius must be non-negative.\\n");
        return 1;
    }

    double area = pi * radius * radius;
    printf("Area = %.2f\\n", area);
    return 0;
}
```

**Python**

``` python
import math

radius = 3.0

if radius < 0:
    raise ValueError("Radius must be non-negative")

area = math.pi * radius**2
print(f"Area = {area:.2f}")
```

### Example 2 --- Euclidean GCD

**C**

``` c
#include <stdio.h>

long long gcd_nonnegative(long long a, long long b) {
    while (b != 0) {
        long long remainder = a % b;
        a = b;
        b = remainder;
    }
    return a;
}

int main(void) {
    long long a = 12, b = 18;
    printf("GCD = %lld\\n", gcd_nonnegative(a, b));
    return 0;
}
```

For production-quality code, explicitly define behavior for negative
inputs and the `LLONG_MIN` edge case before taking absolute values. The
example assumes non-negative inputs.

**Python**

``` python
from math import gcd

a, b = 12, 18
print("GCD =", gcd(a, b))
```

### Example 3 --- Quadratic equation

**C**

``` c
#include <math.h>
#include <stdio.h>

int main(void) {
    double a = 1.0, b = -3.0, c = 2.0;

    if (a == 0.0) {
        puts("This is not a quadratic equation.");
        return 0;
    }

    double d = b * b - 4.0 * a * c;

    if (d > 0.0) {
        double root1 = (-b + sqrt(d)) / (2.0 * a);
        double root2 = (-b - sqrt(d)) / (2.0 * a);
        printf("Two real roots: %.4f, %.4f\\n", root1, root2);
    } else if (d == 0.0) {
        printf("Repeated real root: %.4f\\n", -b / (2.0 * a));
    } else {
        puts("No real roots; the roots are complex.");
    }

    return 0;
}
```

**Python**

``` python
import cmath

a, b, c = 1.0, -3.0, 2.0

if a == 0:
    raise ValueError("a must not be zero")

discriminant = b*b - 4*a*c
root1 = (-b + cmath.sqrt(discriminant)) / (2*a)
root2 = (-b - cmath.sqrt(discriminant)) / (2*a)

print(root1, root2)
```

### Code presentation requirements

-   Include language labels, copy-to-clipboard controls, line wrapping
    or horizontal scrolling, and a readable font size.
-   Explain important lines below the snippet.
-   Show sample input/output when useful.
-   Call out precision, integer overflow, invalid inputs, units, and
    domain restrictions.
-   Keep C examples compatible with a clearly stated standard,
    preferably C11.
-   Do not execute arbitrary user-supplied code on the main website. If
    a future playground is added, run code in an isolated sandbox with
    time and resource limits.

------------------------------------------------------------------------

## 9. UX Details & Interaction Patterns

### Search

-   Search should work by formula title, symbol, alias, subject, and
    plain-language query.
-   Support keyboard access: `/` or `Ctrl/Cmd + K` may focus the search
    when it does not conflict with browser or assistive technology
    conventions.
-   Show useful suggestions, recent searches in the current session, and
    a clear no-results message.
-   Never require an account to search or read lessons.

### Formula controls

-   Provide both slider and numeric input for values where precise input
    matters.
-   Validate ranges and explain invalid input next to the control.
-   Include reset, pause/play where relevant, and a text equivalent of
    important visual output.
-   Avoid hidden state changes: always show current values and units.

### Practice feedback

-   Confirm correct answers with a calm success state.
-   For incorrect answers, explain the next useful step and offer a hint
    instead of using shame-based language.
-   Do not rely only on red/green; use icons and explanatory text.
-   Allow retrying without refreshing the page.

### Navigation and reading

-   Preserve a clear page hierarchy.
-   Use breadcrumbs on topic pages.
-   Make table-of-contents links and "back to top" keyboard accessible.
-   Keep lesson navigation predictable and provide related topics at the
    end.
-   Avoid unnecessary modals; prefer inline explanations or expandable
    sections.

### Empty, loading, and error states

Even on a static site, design clear states for empty search results,
invalid numeric values, unsupported visualizations, and clipboard
failures. If an interaction fails, preserve the lesson content and offer
a simple fallback.

------------------------------------------------------------------------

## 10. Responsive Design

Use a mobile-first approach and test at least these viewport widths:

-   **Small mobile:** 320--374px
-   **Mobile:** 375--767px
-   **Tablet:** 768--1023px
-   **Desktop:** 1024--1439px
-   **Wide desktop:** 1440px and above

### Layout rules

-   Main content maximum width: about 1200px.
-   Long-form lesson text maximum width: about 760px.
-   Desktop: 12-column grid, with optional side outline for lessons.
-   Tablet: two-column cards where space permits.
-   Mobile: single-column flow; controls and formula panels use full
    available width.
-   Keep interactive targets around 44×44 CSS pixels where practical.
-   Do not require horizontal page scrolling. Code blocks may scroll
    horizontally within their own container.
-   Formula expressions should wrap or scale responsibly without
    becoming unreadable.
-   Tables should convert to stacked cards or use a clearly labelled
    scroll container on small screens.
-   Keep mobile navigation and search reachable with one hand.

### Responsive interactive lab

On mobile, place the visualization first, followed by compact controls
and a live result summary. Do not shrink a desktop chart until labels
are illegible; simplify the chart or stack its panels instead.

------------------------------------------------------------------------

## 11. Accessibility & Inclusion

Target **WCAG 2.2 AA** as the design goal.

-   Use semantic landmarks: `header`, `nav`, `main`, `section`, and
    `footer`.
-   Maintain visible keyboard focus using `--color-focus`.
-   Ensure all actions work with keyboard alone.
-   Label inputs programmatically; associate error messages with the
    relevant field.
-   Provide text descriptions for meaningful diagrams and charts.
-   Do not communicate status by color alone.
-   Respect browser zoom and text resizing.
-   Test contrast for every foreground/background pair, including hover,
    disabled, and focus states.
-   Use accessible math rendering where possible and provide a
    spoken/plain-text reading of complex expressions.
-   Respect reduced-motion preferences and offer pause controls for
    ongoing animation.
-   Ensure focus remains sensible when dialogs, menus, or tabs change.
-   Avoid flashing effects and unnecessary continuous motion.

------------------------------------------------------------------------

## 12. Static-First Technical Architecture

The site should be primarily static, fast, and inexpensive to host. A
practical implementation can use:

-   **Framework:** Astro, or a static-export-capable React framework.
-   **UI:** React components for interactive labs and reusable interface
    elements.
-   **Styling:** CSS Modules or Tailwind CSS with the design tokens
    above.
-   **Mathematics:** KaTeX for fast formula rendering; use a plain-text
    alternative where needed.
-   **Charts and geometry:** SVG first for simple diagrams; Canvas or a
    lightweight plotting library for more complex graphs.
-   **Icons:** Lucide or another consistent accessible icon set.
-   **Content:** Markdown/MDX or typed local JSON/TypeScript data.
-   **Search:** Build-time generated search index with client-side
    filtering (for example, a small search library or custom index).
-   **Hosting:** Any static hosting provider or CDN.

### Architecture principles

1.  Render lesson content as static HTML wherever possible.
2.  Hydrate only the interactive components that need browser-side
    behavior.
3.  Store formula data separately from UI components.
4.  Use URL-friendly slugs for lessons and categories.
5.  Avoid a backend requirement for core learning.
6.  Keep progress local only if progress tracking is implemented;
    explain that it is device/browser-specific.
7.  If a server, login, cloud sync, or remote code execution is added
    later, treat it as a separate optional feature.

### Suggested project structure

``` text
behindthemath/
├── public/
│   ├── icons/
│   ├── images/
│   └── og/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── formulas/
│   │   ├── visualizations/
│   │   ├── code/
│   │   └── practice/
│   ├── content/
│   │   ├── foundations/
│   │   ├── algebra/
│   │   ├── geometry/
│   │   ├── trigonometry/
│   │   ├── probability/
│   │   ├── statistics/
│   │   ├── linear-algebra/
│   │   ├── calculus/
│   │   ├── physics/
│   │   └── cse/
│   ├── data/
│   │   ├── formulas/
│   │   └── search-index/
│   ├── pages/
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── global.css
│   │   └── utilities.css
│   └── utils/
├── tests/
├── design.md
├── README.md
└── package.json
```

------------------------------------------------------------------------

## 13. Performance, SEO & Reliability

### Performance goals

-   Keep initial content useful before interactive code loads.
-   Lazy-load below-the-fold visualizations where practical.
-   Avoid shipping a large charting library to pages that do not use
    charts.
-   Prefer SVG for small diagrams and compress raster images.
-   Reserve space for visualizations to reduce layout shifts.
-   Avoid heavy background videos and excessive animation libraries.
-   Use local/system font fallbacks to prevent invisible text while
    fonts load.

### Suggested quality targets

-   Lighthouse performance: aim for 90+ on representative pages.
-   Core Web Vitals: target good LCP, INP, and CLS values on real
    devices.
-   No console errors on core journeys.
-   All major lessons remain readable if JavaScript fails, except for
    the interactive part itself.

### SEO

-   Unique page title and description for every subject and formula.
-   Canonical URLs and sitemap.
-   Open Graph and social sharing metadata.
-   Structured data only when appropriate and valid.
-   Descriptive headings and internal links.
-   Human-readable URLs such as `/learn/geometry/circle-area`.
-   Avoid generating near-duplicate pages for every possible formula
    filter.

### Reliability

-   Add automated checks for internal links, required content fields,
    and formula page metadata.
-   Test mathematical edge cases such as zero denominators, negative
    square roots, invalid domains, empty inputs, and large integer
    values.
-   Show limitations and assumptions beside formulas rather than hiding
    them in a global disclaimer.

------------------------------------------------------------------------

## 14. Formula Content Seed

Use the supplied *University Formula Handbook: Basic to Advanced
Mathematics, Physics & CSE* as the first curated content source. It
includes:

-   Arithmetic and number theory: averages, percentages, fractions,
    GCD/LCM, primes, modular arithmetic, and sequences.
-   Exponents, roots, logarithms, and scientific notation.
-   Algebra: identities, linear and quadratic equations, and complex
    numbers.
-   Geometry and coordinate geometry.
-   Trigonometry and triangle laws.
-   Permutations, combinations, probability, and Bayes' theorem.
-   Statistics: mean, variance, standard deviation, range, and z-score.
-   Matrices and vectors.
-   Calculus: limits, differentiation, integration, and Taylor/Maclaurin
    series.
-   Physics: mechanics, energy, gravitation, rotation, fluids, heat,
    waves, optics, electricity, magnetism, and modern physics.
-   Unit conversions and physical constants.
-   CSE and competitive programming: complexity, bit manipulation,
    combinatorics, graph formulas, number bases, and useful sums.
-   A quick-reference formula finder and recommended study order.

### Editorial rules for source-based lessons

-   Preserve conditions and conventions given with each formula.
-   Explain any additional examples as illustrative teaching material,
    not as quotations from the handbook.
-   Check mathematical accuracy before publishing, especially unit
    conventions, domain restrictions, sign conventions, and code edge
    cases.
-   The handbook describes itself as a curated collection, not literally
    every formula. The website should make the same distinction.
-   The handbook includes some C++ examples; BehindTheMath should
    provide C and Python examples as a separate implementation layer,
    with careful translation and testing.

------------------------------------------------------------------------

## 15. Suggested MVP Scope

Build a polished, complete first version before attempting an enormous
formula encyclopedia.

### MVP pages

1.  Home
2.  Learn / subject index
3.  Subject topic listing
4.  Formula lesson template
5.  Formula library with search and filters
6.  Visual Lab index
7.  About / credits
8.  404 page

### MVP lessons

Start with 12 high-value lessons:

1.  Percentages and ratios
2.  GCD and LCM
3.  Exponents and logarithms
4.  Linear and quadratic equations
5.  Circle area and circumference
6.  Pythagorean theorem
7.  Trigonometric unit circle
8.  Permutations and combinations
9.  Probability and Bayes' theorem
10. Mean and standard deviation
11. Derivatives and tangent slope
12. Time complexity and powers of two

For each lesson, provide the formula, variable definitions, conditions,
a worked example, a visualization where appropriate, C and Python code,
at least three practice questions, and related links.

### MVP acceptance criteria

-   Every primary navigation item works.
-   Search finds formulas by name and relevant keywords.
-   Every lesson renders mathematical notation correctly.
-   Interactive controls update the formula, output, and diagram
    consistently.
-   C and Python tabs work and copy buttons give clear feedback.
-   Mobile layouts have no page-level horizontal overflow at 320px.
-   Keyboard users can reach every control and understand focus state.
-   Reduced-motion preference disables nonessential motion.
-   No lesson presents a formula without its essential conditions or
    domain restrictions.
-   Attribution is visible in the footer and About page.

------------------------------------------------------------------------

## 16. Suggested Component Inventory

-   `SiteHeader`
-   `MobileNavigation`
-   `SiteFooter`
-   `GlobalSearch`
-   `Breadcrumbs`
-   `SubjectCard`
-   `TopicCard`
-   `FormulaCard`
-   `FormulaDisplay`
-   `VariableLegend`
-   `AssumptionNote`
-   `WorkedExample`
-   `CodeTabs`
-   `CopyCodeButton`
-   `InteractiveLabShell`
-   `RangeNumberControl`
-   `AccessiblePlot`
-   `StepByStepDerivation`
-   `PracticeQuestion`
-   `HintReveal`
-   `AnswerFeedback`
-   `RelatedLessons`
-   `TableOfContents`
-   `EmptySearchState`
-   `ReducedMotionNotice`

Keep components focused and reusable. Formula-specific behavior belongs
in a small, testable visualization component rather than in a giant
lesson page.

------------------------------------------------------------------------

## 17. Design QA Checklist

### Visual consistency

-   [ ] Colors come from design tokens rather than scattered hard-coded
    values.
-   [ ] Typography, spacing, radius, shadows, and buttons are
    consistent.
-   [ ] Dark text is used on the pale button color for contrast.
-   [ ] Light text is used only on sufficiently dark backgrounds.

### Learning experience

-   [ ] Each formula has plain-language meaning and variable
    definitions.
-   [ ] Assumptions, units, and domain restrictions are visible.
-   [ ] Examples show steps, not only the final answer.
-   [ ] Code examples in C and Python solve the same task.
-   [ ] Practice feedback explains mistakes constructively.

### Interaction

-   [ ] Sliders and numeric inputs stay synchronized.
-   [ ] Reset, pause, and play controls work where present.
-   [ ] Invalid values are handled safely.
-   [ ] Animations teach a relationship and respect reduced motion.
-   [ ] Important chart values are available as text.

### Responsive and accessible

-   [ ] No page-level horizontal overflow at 320px.
-   [ ] Navigation works with keyboard and touch.
-   [ ] Focus indicators are clearly visible.
-   [ ] Inputs have labels and errors are announced.
-   [ ] Color is not the only signal for success or failure.
-   [ ] Mathematical content remains readable when zoomed.

### Engineering quality

-   [ ] Formula content is separated from components.
-   [ ] Search works without a backend.
-   [ ] No arbitrary code execution occurs in the main site.
-   [ ] Internal links and metadata are tested.
-   [ ] Common mathematical edge cases are covered.

------------------------------------------------------------------------

## 18. Final Creative Direction

**BehindTheMath should feel like an interactive mathematics studio:**
deep navy structure, blue supporting elements, pale aqua action buttons,
crisp mathematical typesetting, restrained motion, and visual
experiments that reward curiosity.

The signature interaction should be simple: change a value, watch the
mathematical relationship respond, read why it changed, then see how the
same idea is implemented in C and Python.

**Presented by Santunu Kaysar**\
**Helped by Intellisoft Innovations**

*Understand the formula. Explore the relationship. See the math behind
it.*
