# BehindTheMath --- Project Requirements & Development Document

**Website:** BehindTheMath\
**Presented by:** Santunu Kaysar\
**Helped by:** Intellisoft Innovations\
**Document type:** Product requirements, implementation plan, and
acceptance criteria\
**Related document:** `design.md`

------------------------------------------------------------------------

## 1. Project Summary

BehindTheMath is a comprehensive, static-first educational website for
learning and understanding mathematical formulas. It combines clear
explanations, worked examples, interactive animations, and code snippets
in C and Python.

The purpose is not merely to display formulas. Every lesson should help
users understand what the formula means, how its variables relate, when
the formula applies, how to solve a problem with it, and how to
implement the same concept in code.

### Main product goals

-   Make mathematical learning engaging, visual, and accessible.
-   Explain formulas from foundations through advanced university-level
    topics.
-   Allow learners to change values and immediately observe the result.
-   Connect mathematical theory to practical C and Python
    implementations.
-   Provide a fast, responsive experience on mobile, tablet, and
    desktop.
-   Make the core learning experience available without accounts or a
    backend.

------------------------------------------------------------------------

## 2. Scope

### Included in the first version

-   Responsive home page and navigation.
-   Subject and topic directory.
-   Searchable formula library.
-   Reusable formula lesson pages.
-   Interactive Visual Lab.
-   Worked examples and practice questions.
-   C and Python code tabs with copy functionality.
-   About page and project attribution.
-   Static hosting, SEO metadata, accessibility, and automated quality
    checks.

### Out of scope for the initial release

-   User accounts and cloud-synchronized progress.
-   Server-side databases.
-   Arbitrary code execution in the browser or on a server.
-   Paid courses, subscriptions, and payment processing.
-   Social feeds or community posting.
-   Claims of accreditation or formal certification.

These may be considered later as separate features, but they must not
delay a high-quality learning-focused MVP.

------------------------------------------------------------------------

## 3. Brand Requirements

### Identity

-   **Name:** BehindTheMath
-   **Presented by:** Santunu Kaysar
-   **Helped by:** Intellisoft Innovations
-   **Suggested tagline:** "Understand the formula. Explore the
    relationship. See the math behind it."

### Design palette

  Token       Hex         Usage
  ----------- ----------- ----------------------------------------------
  Primary     `#1D3557`   Brand, navigation, headings, strong surfaces
  Secondary   `#457B9D`   Supporting surfaces, links, charts
  Button      `#A8DADC`   Primary action background
  Text        `#F1FAEE`   Text on dark surfaces
  Warning     `#E63946`   Warnings, errors, invalid input

Additional supporting tokens such as light backgrounds, dark text,
borders, success states, and focus indicators should be defined in
`design.md`. The button color should use dark foreground text for
contrast. The pale text color is intended for dark surfaces rather than
standard text on white.

### Design character

The interface should feel like a modern mathematics studio: clear,
curious, precise, welcoming, and technically credible. Prefer useful
diagrams and restrained motion over decorative effects.

------------------------------------------------------------------------

## 4. Target Users

1.  Learners reviewing arithmetic, algebra, geometry, and trigonometry.
2.  University and engineering students studying probability,
    statistics, matrices, vectors, and calculus.
3.  CSE students and competitive programmers learning number theory,
    combinatorics, bit manipulation, and complexity.
4.  Data Science and AI/ML learners revising mathematical foundations.
5.  Self-directed learners who prefer visual explanations and
    interactive examples.

The site should support beginner, intermediate, and advanced material
without assuming that all visitors have the same background.

------------------------------------------------------------------------

## 5. Content Organization

### Subject categories

1.  Foundations: arithmetic, fractions, percentages, ratios, exponents,
    roots, logarithms, sequences and series.
2.  Number Theory & Programming: GCD/LCM, prime numbers, divisibility,
    modular arithmetic, binary numbers, bit manipulation.
3.  Algebra: identities, linear equations, quadratic equations, complex
    numbers.
4.  Geometry: 2D shapes, area, perimeter, 3D volume and surface area,
    coordinate geometry.
5.  Trigonometry: ratios, identities, unit circle, compound angles,
    triangle laws.
6.  Counting & Probability: factorials, permutations, combinations,
    probability rules, conditional probability, Bayes' theorem.
7.  Statistics: mean, variance, standard deviation, range, z-score.
8.  Linear Algebra: matrices, determinants, inverses, vectors, dot and
    cross products.
9.  Calculus: limits, derivatives, integrals, Taylor and Maclaurin
    series.
10. Physics: mechanics, energy, gravitation, rotation, fluids, heat,
    waves, optics, electricity, magnetism, modern physics.
11. CSE & Competitive Programming: complexity, graph formulas,
    combinatorics, number bases, bit manipulation, useful sums.
12. Quick Reference: formula search, unit conversions, physical
    constants.

### Learning order

Foundations → Exponents and Algebra → Geometry and Trigonometry →
Counting and Probability → Statistics and Linear Algebra → Calculus →
Physics → CSE applications.

### Source content

Use the supplied *University Formula Handbook: Basic to Advanced
Mathematics, Physics & CSE* as an initial curated source for formula
topics and study order. The handbook itself describes its contents as a
broad curated collection rather than every formula in mathematics and
physics. Do not represent the website as containing literally every
known formula.

For each formula, preserve relevant assumptions, domain restrictions,
units, and conventions. Review all source-derived content for accuracy
before publishing, and distinguish newly authored explanations and
examples from the handbook's own content.

------------------------------------------------------------------------

## 6. Standard Lesson Requirements

Every published formula lesson should contain, when applicable:

1.  Formula title and subject.
2.  Rendered mathematical expression.
3.  Plain-language explanation.
4.  Definition of every symbol.
5.  Units and domain restrictions.
6.  Conditions and assumptions.
7.  Step-by-step worked example.
8.  Interactive visualization where it materially helps understanding.
9.  Equivalent C and Python examples.
10. Common mistakes and edge cases.
11. At least three practice questions with hints and explanations.
12. Related lessons and navigation links.

Do not publish a formula as a context-free equation if its validity
depends on assumptions or a sign/unit convention.

### Formula lesson data shape

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
  derivation?: Array<{ step: string; explanation: string }>;
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
  codeExamples: { c: string; python: string };
  exercises: Array<{
    question: string;
    hint?: string;
    answer: string;
    explanation: string;
  }>;
  relatedFormulaIds: string[];
};
```

------------------------------------------------------------------------

## 7. Required Interactive Visualizations

### Initial priority

-   **Circle area:** Change radius; show circle, diameter,
    circumference, and area.
-   **Pythagorean theorem:** Change right-triangle sides and show the
    square-area relationship.
-   **Quadratic function:** Change coefficients and show parabola,
    vertex, and real roots when they exist.
-   **Unit circle:** Change angle; show sine/cosine projections and a
    synchronized wave.
-   **Derivative:** Move the point of tangency and compare secant and
    tangent slopes.
-   **Integral:** Change interval and rectangle count; compare
    approximate and exact area where supported.
-   **Probability simulation:** Run coin/dice trials and compare
    observed frequency to theoretical probability.
-   **Vector explorer:** Change components and show magnitude, dot
    product, and angle when defined.
-   **GCD/LCM:** Show the Euclidean algorithm and remainder sequence.
-   **Motion/energy:** Change physical parameters and plot motion or
    energy relationships under stated assumptions.

### Interaction requirements

-   Controls must update the displayed formula, numerical output, and
    visualization together.
-   Provide sliders and numeric inputs when both are useful.
-   Validate inputs and explain invalid states.
-   Include reset controls; add play/pause for continuous animations.
-   Support `prefers-reduced-motion`.
-   Offer text equivalents for meaningful visual results.
-   Handle edge cases such as zero denominators, negative square roots,
    negative radii, undefined tangents, zero-length vectors, and invalid
    physical values.
-   Do not use motion as decoration when it adds no educational value.

------------------------------------------------------------------------

## 8. C and Python Code Requirements

-   Present C and Python examples for the same mathematical problem.
-   State the relevant C standard; target C11 for the initial release.
-   Use clear variable names, comments where helpful, and readable
    formatting.
-   Include sample output for non-trivial examples.
-   Explain domain restrictions, floating-point precision, integer
    overflow, invalid input, and unit handling.
-   Use standard libraries where appropriate.
-   Do not claim a snippet was run unless the project actually executes
    and verifies it.
-   Do not run arbitrary user-provided code as part of the MVP.

### Code panel behavior

-   Language tabs must be keyboard accessible.
-   Copy button must copy only the code and show success/failure
    feedback.
-   Long lines should remain readable using controlled horizontal
    scrolling or wrapping.
-   Syntax highlighting must preserve adequate contrast.
-   If clipboard access is unavailable, leave the code visible and show
    a helpful message.

------------------------------------------------------------------------

## 9. Page Requirements

### Home

-   Clear value proposition and calls to action.
-   Search entry point.
-   Subject cards.
-   Featured interactive experiments.
-   Featured lessons and a suggested learning path.
-   Visible project credits.

### Learn / subject index

-   List subjects and topics.
-   Support filtering by level and subject.
-   Provide a clear path from beginner to advanced content.

### Formula lesson

-   Breadcrumbs, title, formula, meaning, variables, assumptions.
-   Worked example.
-   Visualization, where useful.
-   C/Python tabs.
-   Practice questions and related lessons.
-   Responsive table of contents.

### Formula Library

-   Client-side search by formula name, symbols, topic, aliases, and
    plain-language keywords.
-   Filters for subject, difficulty, and interactive demos.
-   Formula list and compact reference view.
-   Empty state with useful suggestions.

### Visual Lab

-   Collection of standalone experiments.
-   Each experiment includes controls, a visualization, live numerical
    output, and explanation.

### Practice

-   Multiple-choice and numeric-response questions.
-   Hints before full solutions.
-   Constructive explanations after submission.
-   Optional browser-local progress, with a clear note that it is not
    synced between devices.

### About

-   Explain the project's purpose and content approach.
-   Show "Presented by Santunu Kaysar" and "Helped by Intellisoft
    Innovations".
-   Do not claim third-party endorsement or accreditation without
    authorization.

### 404

-   Friendly message.
-   Links back to home, learning topics, and formula search.

------------------------------------------------------------------------

## 10. Responsive UI/UX Requirements

Test these viewport ranges:

-   320--374px: small mobile.
-   375--767px: mobile.
-   768--1023px: tablet.
-   1024--1439px: desktop.
-   1440px and above: wide desktop.

Requirements:

-   No page-level horizontal overflow at 320px.
-   Mobile-first single-column layout for narrow screens.
-   Responsive subject and formula cards.
-   Desktop lesson layout may use a sticky outline or secondary column.
-   Code blocks may scroll within their own container.
-   Mathematical expressions must remain readable when zoomed.
-   Controls should be easy to tap, aiming for about 44×44 CSS pixels.
-   Search and navigation must remain easy to reach.
-   Avoid squeezing charts to unreadable widths; simplify or stack them
    on mobile.
-   All essential content must remain usable without hover.

------------------------------------------------------------------------

## 11. Accessibility Requirements

Target WCAG 2.2 AA as a quality goal.

-   Semantic HTML landmarks and heading hierarchy.
-   Keyboard-accessible navigation, tabs, controls, and dialogs.
-   Visible focus indicators.
-   Proper input labels and associated error messages.
-   Sufficient contrast across normal, hover, disabled, and focus
    states.
-   Status indicators must use text or icons as well as color.
-   Reduced-motion support and pause controls for ongoing animations.
-   Descriptive text for charts and diagrams.
-   Mathematical expressions should have an accessible reading or
    plain-text equivalent where practical.
-   Support browser zoom and text resizing.
-   Avoid flashing or distracting movement.

------------------------------------------------------------------------

## 12. Technical Requirements

### Suggested stack

-   Static-first framework: Astro.
-   Interactive UI: React components.
-   Styling: CSS Modules or Tailwind CSS.
-   Formula rendering: KaTeX, with accessible alternatives as
    appropriate.
-   Diagrams: SVG first; Canvas or a lightweight plotting library for
    complex graphs.
-   Content: Markdown/MDX or typed local JSON/TypeScript.
-   Search: Build-time index and client-side search.
-   Hosting: Static host or CDN.

The stack is a recommendation, not a requirement to add a backend. Keep
the initial implementation straightforward and testable.

### Architecture rules

-   Render lesson content as static HTML wherever possible.
-   Load JavaScript only where interactivity is required.
-   Separate lesson data from components.
-   Use stable, human-readable slugs.
-   Avoid duplicate formula data across pages.
-   Keep core content available without login or server calls.
-   Use local storage only for optional local preferences or progress,
    and explain its limitations.
-   Do not add remote code execution to the MVP.

### Suggested project structure

``` text
behindthemath/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── formulas/
│   │   ├── visualizations/
│   │   ├── code/
│   │   └── practice/
│   ├── content/
│   ├── data/
│   ├── pages/
│   ├── styles/
│   └── utils/
├── tests/
├── design.md
├── pdg.md
├── README.md
└── package.json
```

------------------------------------------------------------------------

## 13. Performance, SEO & Testing

### Performance

-   Keep initial HTML useful before interactive components load.
-   Lazy-load non-critical visualizations.
-   Avoid shipping visualization libraries on pages that do not need
    them.
-   Reserve space for charts to minimize layout shifts.
-   Compress images and avoid heavy video backgrounds.
-   Use sensible font fallbacks.
-   Aim for Lighthouse performance of 90+ on representative pages, while
    measuring real-device performance.

### SEO

-   Unique title and description for each page.
-   Sitemap, canonical URLs, and social metadata.
-   Descriptive headings and internal links.
-   Human-readable URLs such as `/learn/geometry/circle-area`.
-   Structured data only where valid and appropriate.
-   Avoid creating indexable near-duplicate pages for arbitrary filters.

### Tests

-   Unit tests for formula calculations and edge cases.
-   Component tests for inputs, tabs, copy controls, and feedback.
-   Responsive visual checks at the specified widths.
-   Keyboard and screen-reader spot checks.
-   Link checks for internal navigation.
-   Content validation for required formula fields.
-   Build and production preview checks.
-   Mathematical examples should be independently checked before
    release.

------------------------------------------------------------------------

## 14. MVP Delivery Plan

### Phase 1 --- Foundation

-   Establish project structure, theme tokens, typography, and shared
    layout.
-   Implement navigation, footer, buttons, cards, search shell, and
    responsive behavior.
-   Create About and 404 pages.

### Phase 2 --- Content system

-   Build the formula lesson template and content schema.
-   Add subject and topic indexes.
-   Seed content from the provided University Formula Handbook.
-   Add mathematical rendering and formula metadata.

### Phase 3 --- Core learning experience

-   Implement formula search and filters.
-   Add C/Python tabs and copy controls.
-   Add worked examples and practice questions.
-   Implement the first interactive labs.

### Phase 4 --- Quality and launch

-   Test edge cases, keyboard access, reduced motion, and mobile
    layouts.
-   Review mathematical accuracy and source assumptions.
-   Verify SEO metadata, build output, links, and production behavior.
-   Deploy to static hosting and test the live site.

### Suggested initial lessons

1.  Percentages and ratios.
2.  GCD and LCM.
3.  Exponents and logarithms.
4.  Linear and quadratic equations.
5.  Circle area and circumference.
6.  Pythagorean theorem.
7.  Trigonometric unit circle.
8.  Permutations and combinations.
9.  Probability and Bayes' theorem.
10. Mean and standard deviation.
11. Derivatives and tangent slope.
12. Time complexity and powers of two.

Each lesson should include an explanation, formula conditions, a worked
example, C and Python code, at least three exercises, and related
topics. Add visualizations where they provide genuine explanatory value.

------------------------------------------------------------------------

## 15. Definition of Done

The MVP is ready for release when:

-   All main navigation routes work.
-   Formula search finds lessons using titles and relevant keywords.
-   All lesson pages render equations correctly.
-   Every lesson includes clear variable definitions and relevant
    conditions.
-   C and Python examples are available and consistent.
-   Copy controls provide user feedback.
-   Interactive visualizations synchronize controls, formulas, and
    outputs.
-   Invalid inputs and important edge cases are handled safely.
-   Reduced-motion preferences are respected.
-   The site works at 320px width without page-level horizontal
    overflow.
-   Keyboard users can access all essential functionality.
-   Empty, error, and not-found states are understandable.
-   No backend or account is required for core learning.
-   Source attribution and project credits are visible.
-   Automated build and tests pass.
-   No known critical accessibility, security, or mathematical
    correctness issues remain.

------------------------------------------------------------------------

## 16. Final Implementation Instruction

Build BehindTheMath as a polished, educational product rather than a
static collection of formula cards. Prioritize clear explanations,
mathematically correct interactions, useful animations, accessible
design, and responsive behavior.

For every major formula, guide the learner through this loop:

**Understand → Change a value → Observe → Explain → Implement in
C/Python → Practice**

Keep the initial release focused, verify mathematical correctness, and
expand the library incrementally.

**BehindTheMath**\
Presented by Santunu Kaysar\
Helped by Intellisoft Innovations
