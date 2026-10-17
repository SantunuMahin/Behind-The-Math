import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Circle,
  Compass, 
  Sparkles, 
  Target, 
  Search, 
  Flame, 
  Award, 
  BookOpen, 
  FlaskConical, 
  ExternalLink, 
  ChevronRight, 
  GraduationCap, 
  Layers, 
  Cpu, 
  Zap, 
  Filter,
  Clock,
  CheckSquare,
  Square,
  HelpCircle
} from 'lucide-react';
import { formulasApi } from '../api/formulasApi';
import { useStudent } from '../context/StudentContext';
import MathView from '../components/common/MathView';
import FormulaDetailModal from '../components/formulas/FormulaDetailModal';
import { FALLBACK_SUBJECTS } from '../data/homeFallbackData';
import { normalizeFormula } from '../utils/formulaUtils';

export default function LearnPage() {
  const [subjects, setSubjects] = useState(FALLBACK_SUBJECTS);
  const [allFormulas, setAllFormulas] = useState([]);
  const [activeStage, setActiveStage] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState('all'); // 'all' | 'hsc' | 'university' | 'ai'
  const [stageTab, setStageTab] = useState('formulas'); // 'formulas' | 'labs' | 'milestones'
  const [subjectCategory, setSubjectCategory] = useState('all'); // 'all' | 'pure' | 'applied' | 'cs'
  const [subjectSearch, setSubjectSearch] = useState('');
  const [quickViewFormula, setQuickViewFormula] = useState(null);

  // Student milestone progress saved in localStorage
  const [checkedMilestones, setCheckedMilestones] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('btm_checked_milestones') || '[]'));
    } catch {
      return new Set();
    }
  });

  const toggleMilestone = (name) => {
    setCheckedMilestones((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      try {
        localStorage.setItem('btm_checked_milestones', JSON.stringify([...next]));
      } catch (err) {
        console.error('Storage error:', err);
      }
      return next;
    });
  };

  const { profile } = useStudent();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [subs, forms] = await Promise.all([
          formulasApi.getSubjects(),
          formulasApi.getFormulas(),
        ]);
        if (isMounted) {
          if (subs && Array.isArray(subs) && subs.length > 0) {
            const merged = subs.map((s) => {
              const fallback = FALLBACK_SUBJECTS.find((fs) => fs.slug === s.slug);
              return {
                ...fallback,
                ...s,
                sample_latex: fallback?.sample_latex || 'f(x) = y',
              };
            });
            setSubjects(merged);
          }
          if (forms && Array.isArray(forms) && forms.length > 0) {
            setAllFormulas(forms.map(normalizeFormula));
          }
        }
      } catch (err) {
        console.warn('Backend API unavailable; using enriched offline curriculum data.', err);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const enrichStageFormulas = (stageSubjects, curated) => {
    if (!allFormulas || allFormulas.length === 0) return curated;
    const stageSubjectSet = new Set(stageSubjects);
    const dynamicMatches = allFormulas.filter((f) => stageSubjectSet.has(f.subject_slug));
    if (dynamicMatches.length === 0) return curated;
    const seen = new Set(curated.map((c) => c.slug || c.id));
    const extra = dynamicMatches.filter((d) => !seen.has(d.slug) && !seen.has(d.id)).slice(0, 6);
    return [...curated, ...extra];
  };

  const curriculumStages = useMemo(() => [
    {
      stage: 1,
      title: 'Foundations & Discrete Logic',
      shortLabel: 'Foundations',
      subtitle: 'Proportions, Sets & Logic',
      level: 'Beginner',
      badge: 'Stage 1 · Core Literacy',
      tracks: ['all', 'hsc', 'ai'],
      subjects: ['foundations', 'discrete-math'],
      primarySubject: 'foundations',
      estHours: '4.5 hrs',
      desc: 'Master proportional reasoning, percentage scaling, set theory, and De Morgan dualities that form the universal building blocks of mathematical proof.',
      colorAccent: 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/10',
      milestones: [
        { name: 'Percentages & Proportions', desc: 'Ratios, scaling factors, and relative growth mechanics' },
        { name: "De Morgan's Dualities", desc: 'Duality in logic, set intersection, and union complements' },
        { name: 'Orders of Magnitude', desc: 'Logarithmic scaling, powers of 10, and dimensional estimation' },
        { name: 'Pigeonhole Principle', desc: 'Dirichlet drawer principle and counting boundary proofs' },
      ],
      featuredLabs: [
        { id: 'euclidean-gcd', title: 'Euclidean Algorithm & GCD', icon: '🔢', tag: 'Number Theory', desc: 'Step through geometric tiling divisions to uncover greatest common divisors.' },
        { id: 'circle-area', title: 'Circle Area & Circumference', icon: '⚪', tag: 'Geometry', desc: 'Inspect quadratic area growth vs linear perimeter growth under slider control.' },
        { id: 'pythagorean', title: 'Pythagorean Theorem 3D', icon: '📐', tag: 'Geometry', desc: 'Interactive right triangle sides and geometric hypotenuse square proofs.' },
      ],
      coreFormulas: enrichStageFormulas(['foundations', 'discrete-math'], [
        { id: 'pythagorean-theorem', title: 'Pythagorean Theorem', slug: 'pythagorean-theorem', subject_name: 'Geometry', level: 'beginner', summary: 'Foundational Euclidean right triangle relationship.', formula_latex: 'a^2 + b^2 = c^2' },
        { id: 'circle-area', title: 'Circle Area & Perimeter', slug: 'circle-area', subject_name: 'Geometry', level: 'beginner', summary: 'Quadratic area vs linear perimeter growth.', formula_latex: 'A = \\pi r^2,\\quad C = 2\\pi r' },
        { id: 'de-morgans-law', title: "De Morgan's Laws", slug: 'de-morgans-law', subject_name: 'Discrete Math', level: 'beginner', summary: 'Duality of complement sets and logic.', formula_latex: '\\overline{A \\cup B} = \\overline{A} \\cap \\overline{B}' },
        { id: 'arithmetic-progression', title: 'Arithmetic Progression', slug: 'arithmetic-progression', subject_name: 'Foundations', level: 'beginner', summary: 'Formula for the nth term in an arithmetic sequence.', formula_latex: 'a_n = a_1 + (n-1)d' },
      ]),
    },
    {
      stage: 2,
      title: 'Class 11: Conics, Trig & Kinematics',
      shortLabel: 'Class 11 STEM',
      subtitle: 'Conics, Vectors & Trig',
      level: 'Intermediate',
      badge: 'Stage 2 · Higher Secondary I',
      tracks: ['all', 'hsc'],
      subjects: ['geometry', 'trigonometry', 'physics'],
      primarySubject: 'trigonometry',
      estHours: '6.0 hrs',
      desc: 'Explore trigonometric unit circle identities, binomial expansions, conic sections, and parabolic projectile kinematics in accelerated gravitational fields.',
      colorAccent: 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
      milestones: [
        { name: 'Unit Circle Identities', desc: 'Phase angles, radians, and exact circular identity proofs' },
        { name: 'Kinematic Trajectories', desc: 'Independent horizontal velocity & accelerated vertical flight' },
        { name: 'Conic Sections', desc: 'Parabolas, ellipses, hyperbolas, and focal directrices' },
        { name: 'Harmonic Oscillation', desc: 'Restoring forces, spring constants, and period T' },
      ],
      featuredLabs: [
        { id: 'unit-circle', title: 'Unit Circle & Sine Wave', icon: '⭕', tag: 'Trigonometry', desc: 'Watch rotating radius vectors trace out real-time harmonic waveforms.' },
        { id: 'projectile-motion', title: 'Projectile Kinematics Lab', icon: '🚀', tag: 'Physics', desc: 'Launch projectile particles at variable angles, gravity, and velocities.' },
        { id: 'quadratic', title: 'Quadratic Roots & Curvature', icon: '📈', tag: 'Algebra', desc: 'Adjust coefficients a, b, c to inspect real and complex root roots.' },
        { id: 'harmonic-wave', title: 'Harmonic Superposition', icon: '🌊', tag: 'Physics', desc: 'Superimpose traveling waves to observe destructive and constructive nodes.' },
      ],
      coreFormulas: enrichStageFormulas(['geometry', 'trigonometry', 'physics'], [
        { id: 'quadratic-equation', title: 'Quadratic Formula', slug: 'quadratic-equation', subject_name: 'Algebra', level: 'intermediate', summary: 'Finds the roots of ax² + bx + c = 0.', formula_latex: 'x = \\dfrac{-b \\pm \\sqrt{b^2-4ac}}{2a}' },
        { id: 'projectile-motion', title: 'Projectile Range', slug: 'projectile-motion', subject_name: 'Physics', level: 'intermediate', summary: 'Horizontal flight distance under gravity.', formula_latex: 'R = \\dfrac{v_0^2 \\sin(2\\theta)}{g}' },
        { id: 'unit-circle', title: "Trigonometric Identity", slug: 'unit-circle', subject_name: 'Trigonometry', level: 'intermediate', summary: 'Pythagorean circular identity sin²θ + cos²θ = 1.', formula_latex: '\\sin^2\\theta + \\cos^2\\theta = 1' },
        { id: 'binomial-theorem', title: 'Binomial Theorem', slug: 'binomial-theorem', subject_name: 'Algebra', level: 'intermediate', summary: 'Algebraic expansion of binomial powers.', formula_latex: '(x+y)^n = \\sum_{k=0}^n \\binom{n}{k} x^{n-k} y^k' },
      ]),
    },
    {
      stage: 3,
      title: 'Class 12: Calculus, Optics & Fields',
      shortLabel: 'Class 12 STEM',
      subtitle: 'Calculus, Snell & Fields',
      level: 'Intermediate',
      badge: 'Stage 3 · Higher Secondary II',
      tracks: ['all', 'hsc', 'university'],
      subjects: ['calculus', 'physics'],
      primarySubject: 'calculus',
      estHours: '7.5 hrs',
      desc: 'Master instantaneous rates of change, tangent limits, integration by parts, Snell refraction optics, and electrostatic Coulomb inverse-square fields.',
      colorAccent: 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10',
      milestones: [
        { name: 'Secant-to-Tangent Limits', desc: 'Difference quotients and instantaneous derivatives' },
        { name: 'Integration by Parts', desc: 'Product rule reversal and definite accumulator integrals' },
        { name: "Snell's Refractive Index", desc: "Fermat's principle of least time across optical media" },
        { name: "Gauss & Coulomb Flux", desc: 'Inverse-square electric field divergence and charge flux' },
      ],
      featuredLabs: [
        { id: 'derivative', title: 'Derivative & Tangent Slope', icon: '📐', tag: 'Calculus', desc: 'Shrink interval h to watch the secant snap onto the true tangent line.' },
        { id: 'snells-law', title: "Snell's Law & Refraction", icon: '🔦', tag: 'Physics', desc: 'Trace light ray bends through variable refractive index media.' },
        { id: 'normal-distribution', title: 'Gaussian Normal Bell Curve', icon: '📊', tag: 'Statistics', desc: 'Adjust mean μ and standard deviation σ to visualize 68-95-99.7% areas.' },
      ],
      coreFormulas: enrichStageFormulas(['calculus', 'physics'], [
        { id: 'derivatives-tangent', title: 'Derivative Definition', slug: 'derivatives-tangent', subject_name: 'Calculus', level: 'intermediate', summary: 'Instantaneous rate of change limit.', formula_latex: "f'(x) = \\lim_{h \\to 0} \\dfrac{f(x+h)-f(x)}{h}" },
        { id: 'integration-by-parts', title: 'Integration by Parts', slug: 'integration-by-parts', subject_name: 'Calculus', level: 'intermediate', summary: 'Reversal of product differentiation rule.', formula_latex: '\\int u\\,dv = uv - \\int v\\,du' },
        { id: 'snells-law', title: "Snell's Law", slug: 'snells-law', subject_name: 'Physics', level: 'intermediate', summary: 'Refraction index relation across optical boundaries.', formula_latex: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2' },
        { id: 'coulombs-law', title: "Coulomb's Law", slug: 'coulombs-law', subject_name: 'Physics', level: 'intermediate', summary: 'Electrostatic force between point charges.', formula_latex: 'F = k_e \\dfrac{|q_1 q_2|}{r^2}' },
      ]),
    },
    {
      stage: 4,
      title: 'University: Multivariable & Transforms',
      shortLabel: 'Multivariable',
      subtitle: 'Gradients & Fourier',
      level: 'Advanced',
      badge: 'Stage 4 · University Engineering',
      tracks: ['all', 'university'],
      subjects: ['calculus', 'physics'],
      primarySubject: 'calculus',
      estHours: '8.0 hrs',
      desc: 'Solve multidimensional gradient vector fields, constrained Lagrange optimization, harmonic Fourier epicycles, and relativistic spacetime dilation.',
      colorAccent: 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-500/10',
      milestones: [
        { name: 'Multivariable Gradients', desc: 'Directional derivatives, tangent planes, and vector fields' },
        { name: 'Lagrange Multipliers', desc: 'Constrained extrema with collinear gradient normals' },
        { name: 'Fourier Series Synthesis', desc: 'Circular epicyclic phasor decomposition into harmonics' },
        { name: 'Lorentz Time Dilation', desc: 'Spacetime invariant interval and relativistic gamma factor' },
      ],
      featuredLabs: [
        { id: 'fourier-series', title: 'Fourier Series Harmonics', icon: '🌀', tag: 'Calculus', desc: 'Superimpose circular epicycles to build square and sawtooth waves.' },
        { id: 'lagrange-multipliers', title: 'Lagrange Multipliers Optimization', icon: '🎯', tag: 'Calculus', desc: 'Visualize tangent constraint curves and collinear gradient vectors.' },
        { id: 'lorentz-dilation', title: 'Lorentz Time Dilation', icon: '⚡', tag: 'Relativity', desc: 'Accelerate a clock toward the speed of light to witness dilation.' },
        { id: 'kepler-orbit', title: "Kepler's Planetary Orbits", icon: '🪐', tag: 'Astrophysics', desc: 'Simulate elliptical orbital mechanics and Kepler third law periods.' },
      ],
      coreFormulas: enrichStageFormulas(['calculus', 'physics'], [
        { id: 'lagrange-multipliers', title: 'Lagrange Condition', slug: 'lagrange-multipliers', subject_name: 'Calculus', level: 'advanced', summary: 'Constrained extrema condition ∇f = λ∇g.', formula_latex: '\\nabla f(x) = \\lambda \\nabla g(x)' },
        { id: 'fourier-series', title: 'Fourier Series', slug: 'fourier-series', subject_name: 'Calculus', level: 'advanced', summary: 'Waveform harmonic decomposition.', formula_latex: 'f(x) = \\dfrac{a_0}{2} + \\sum_{n=1}^\\infty (a_n \\cos nx + b_n \\sin nx)' },
        { id: 'lorentz-dilation', title: 'Lorentz Gamma Factor', slug: 'lorentz-dilation', subject_name: 'Physics', level: 'advanced', summary: 'Relativistic time expansion factor.', formula_latex: '\\gamma = \\dfrac{1}{\\sqrt{1 - v^2/c^2}}' },
        { id: 'kepler-orbit', title: "Kepler's Third Law", slug: 'kepler-orbit', subject_name: 'Physics', level: 'advanced', summary: 'Orbital period relation to semi-major axis.', formula_latex: 'T^2 = \\dfrac{4\\pi^2}{GM} a^3' },
      ]),
    },
    {
      stage: 5,
      title: 'Linear Algebra & Algorithmic Rigor',
      shortLabel: 'Linear Algebra',
      subtitle: 'Matrices & Complexity',
      level: 'Advanced',
      badge: 'Stage 5 · Algorithmic Rigor',
      tracks: ['all', 'university', 'ai'],
      subjects: ['linear-algebra', 'computer-science'],
      primarySubject: 'linear-algebra',
      estHours: '8.5 hrs',
      desc: 'Decompose vector spaces via SVD, transform coordinates with eigenvalues, analyze Big-O asymptotic limits, and formulate Bayes theorem.',
      colorAccent: 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10',
      milestones: [
        { name: 'Linear Transformations', desc: 'Matrix determinants, rotations, shears, and eigenvectors' },
        { name: 'Asymptotic Complexity', desc: 'Worst-case bounds O(1), O(log n), O(n log n), and O(2^n)' },
        { name: 'Bayesian Posterior Updating', desc: 'Conditional probability and prior-to-posterior transition' },
        { name: 'Graph Topology & Paths', desc: 'Dijkstra priority relaxation and minimum spanning trees' },
      ],
      featuredLabs: [
        { id: 'matrix-transform', title: '2D Matrix Eigen-Transforms', icon: '📐', tag: 'Linear Algebra', desc: 'Transform grid basis vectors and track determinant area scaling.' },
        { id: 'big-o', title: 'Big-O Algorithmic Complexities', icon: '⏱️', tag: 'Computer Science', desc: 'Compare growth rates of O(n), O(n log n), and O(n²) algorithms.' },
        { id: 'bayes-theorem', title: "Bayes' Theorem & Inference", icon: '🎲', tag: 'Probability', desc: 'Update hypothesis odds given conditional evidence test rates.' },
      ],
      coreFormulas: enrichStageFormulas(['linear-algebra', 'computer-science'], [
        { id: 'matrix-determinant', title: 'Matrix Determinant 2x2', slug: 'matrix-determinant', subject_name: 'Linear Algebra', level: 'intermediate', summary: 'Area scaling factor under matrix transformation.', formula_latex: '\\det(A) = ad - bc' },
        { id: 'bayes-theorem', title: "Bayes' Theorem", slug: 'bayes-theorem', subject_name: 'Probability', level: 'intermediate', summary: 'Conditional probability inversion formula.', formula_latex: 'P(A \\mid B) = \\dfrac{P(B \\mid A)P(A)}{P(B)}' },
        { id: 'eigenvalues', title: 'Eigenvalue Equation', slug: 'eigenvalues', subject_name: 'Linear Algebra', level: 'advanced', summary: 'Characteristic equation for invariant directions.', formula_latex: 'A\\mathbf{v} = \\lambda\\mathbf{v}' },
        { id: 'euler-polyhedron', title: "Euler's Polyhedral Formula", slug: 'euler-polyhedron', subject_name: 'Discrete Math', level: 'advanced', summary: 'Topological invariant of convex polyhedra.', formula_latex: 'V - E + F = 2' },
      ]),
    },
    {
      stage: 6,
      title: 'Modern AI & Quantum Frontiers',
      shortLabel: 'AI & Quantum',
      subtitle: 'Neural Nets & Waves',
      level: 'Advanced',
      badge: 'Stage 6 · Modern Frontiers',
      tracks: ['all', 'ai'],
      subjects: ['computer-science', 'statistics', 'physics'],
      primarySubject: 'computer-science',
      estHours: '9.0 hrs',
      desc: 'Formulate neural network decision boundaries, high-dimensional vector embeddings, chaotic double pendulum dynamics, and Schrödinger wave mechanics.',
      colorAccent: 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-500/10',
      milestones: [
        { name: 'Neural Decision Boundaries', desc: 'Forward propagation, non-linear activations, and loss gradients' },
        { name: 'Vector Space Embeddings', desc: 'Cosine similarity metric across semantic embedding spaces' },
        { name: 'Deterministic Chaos', desc: 'Lagrangian sensitivity to initial conditions and Lyapunov exponents' },
        { name: 'Quantum State Evolution', desc: 'Schrödinger wave equation and probability amplitude densities' },
      ],
      featuredLabs: [
        { id: 'neural-network', title: 'Neural Decision Boundary Lab', icon: '🧠', tag: 'Machine Learning', desc: 'Train decision boundaries across 2D point clouds with live loss.' },
        { id: 'cosine-similarity', title: 'Cosine Similarity Embeddings', icon: '🧭', tag: 'AI & Vectors', desc: 'Rotate semantic vector embeddings to observe angular cosine metrics.' },
        { id: 'double-pendulum', title: 'Double Pendulum & Chaos Theory', icon: '⚡', tag: 'Chaos Dynamics', desc: 'Simulate chaotic Lagrangian mechanics and trace butterfly trajectories.' },
      ],
      coreFormulas: enrichStageFormulas(['computer-science', 'statistics', 'physics'], [
        { id: 'cosine-similarity', title: 'Cosine Similarity', slug: 'cosine-similarity', subject_name: 'Computer Science', level: 'intermediate', summary: 'Normalized dot product measuring angular alignment.', formula_latex: '\\cos(\\theta) = \\dfrac{\\mathbf{A} \\cdot \\mathbf{B}}{\\|\\mathbf{A}\\| \\|\\mathbf{B}\\|}' },
        { id: 'cross-entropy-loss', title: 'Cross-Entropy Loss', slug: 'cross-entropy-loss', subject_name: 'Computer Science', level: 'advanced', summary: 'Information divergence loss for classification.', formula_latex: 'L = -\\sum y_i \\log(\\hat{y}_i)' },
        { id: 'softmax-function', title: 'Softmax Activation', slug: 'softmax-function', subject_name: 'Computer Science', level: 'advanced', summary: 'Converts logits into probability distribution.', formula_latex: '\\sigma(\\mathbf{z})_i = \\dfrac{e^{z_i}}{\\sum_j e^{z_j}}' },
        { id: 'schrodinger-equation', title: "Schrödinger's Equation", slug: 'schrodinger-equation', subject_name: 'Physics', level: 'advanced', summary: 'Time-dependent wave equation of quantum states.', formula_latex: 'i\\hbar \\dfrac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi' },
      ]),
    },
  ], [allFormulas]);

  // Filter stages based on selected curriculum track
  const visibleStages = useMemo(() => {
    if (selectedTrack === 'all') return curriculumStages;
    return curriculumStages.filter((st) => st.tracks.includes(selectedTrack));
  }, [curriculumStages, selectedTrack]);

  const currentStageInfo = curriculumStages[activeStage] || curriculumStages[0];

  // Stage milestone completion count
  const stageMilestonesCompleted = useMemo(() => {
    const list = currentStageInfo.milestones || [];
    return list.filter((m) => checkedMilestones.has(m.name)).length;
  }, [currentStageInfo, checkedMilestones]);

  // Categorize 12 subjects
  const categorizedSubjects = useMemo(() => {
    const PURE_SLUGS = ['geometry', 'algebra', 'foundations', 'number-theory', 'trigonometry', 'calculus'];
    const APPLIED_SLUGS = ['physics', 'statistics', 'probability'];
    const CS_SLUGS = ['linear-algebra', 'computer-science', 'discrete-math'];

    return subjects.filter((sub) => {
      if (subjectCategory === 'pure' && !PURE_SLUGS.includes(sub.slug)) return false;
      if (subjectCategory === 'applied' && !APPLIED_SLUGS.includes(sub.slug)) return false;
      if (subjectCategory === 'cs' && !CS_SLUGS.includes(sub.slug)) return false;

      if (subjectSearch.trim()) {
        const query = subjectSearch.toLowerCase().trim();
        const matchesName = sub.name?.toLowerCase().includes(query);
        const matchesDesc = (sub.description || '').toLowerCase().includes(query);
        return matchesName || matchesDesc;
      }
      return true;
    });
  }, [subjects, subjectCategory, subjectSearch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* 1. Header & Student Progress Ribbon */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 w-fit">
            <Compass className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Structured Mathematical Learning Progression</span>
          </div>

          {profile && (
            <div className="flex items-center gap-2.5 text-xs flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium border border-zinc-200 dark:border-zinc-700">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>{profile.display_name || 'Scholar'}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-900/50">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{profile.study_streak_days || 7}d Streak</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-medium border border-cyan-200 dark:border-cyan-900/50">
                <FlaskConical className="w-3.5 h-3.5 text-cyan-500" />
                <span>20 Visual Labs</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-black dark:text-white tracking-tight">
            Visual Curriculum & Learning Roadmap
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl mt-2 leading-relaxed">
            Follow a progressive mathematical path designed for deep intuitive mastery. Move from foundational proportions to modern artificial intelligence mathematics and physics, with real-time interactive simulations at every step.
          </p>
        </div>

        {/* Curriculum Track Switcher */}
        <div className="pt-2 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Target Syllabus Track:</span>
          </span>

          {[
            { id: 'all', label: '🌟 All 6 Stages (Comprehensive)' },
            { id: 'hsc', label: '📘 HSC Higher Secondary Track' },
            { id: 'university', label: '🏛️ University STEM Track' },
            { id: 'ai', label: '🤖 AI & Computational Math' },
          ].map((track) => (
            <button
              key={track.id}
              onClick={() => setSelectedTrack(track.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTrack === track.id
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {track.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Redesigned Adaptive Stage Roadmap Command Center */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-xl space-y-8 relative overflow-hidden">
        
        {/* Ambient subtle glow in dark mode */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Timeline Bar: Clean Step Nodes (No text truncation!) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-black dark:text-white">
                {activeStage + 1}
              </span>
              <div>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-black dark:text-white">
                  {currentStageInfo.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{currentStageInfo.badge}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>Est. {currentStageInfo.estHours}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Stage Milestone Completion Readout */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium">
              <span className="text-zinc-500 dark:text-zinc-400">Milestones:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                {stageMilestonesCompleted} / {currentStageInfo.milestones.length} Mastered
              </strong>
            </div>
          </div>

          {/* Stepper Grid: 6 Distinct, Clean Stage Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
            {curriculumStages.map((st, i) => {
              const isSelected = activeStage === i;
              const isIncludedInTrack = visibleStages.some((vs) => vs.stage === st.stage);

              return (
                <button
                  key={st.stage}
                  onClick={() => setActiveStage(i)}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md scale-[1.02]'
                      : isIncludedInTrack
                      ? 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600'
                      : 'bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200/50 dark:border-zinc-800/40 text-zinc-400 dark:text-zinc-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1 opacity-75">
                      <span>Step {i + 1}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                      ) : (
                        <Circle className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
                      )}
                    </div>
                    <div className="font-heading font-extrabold text-xs leading-snug">
                      {st.shortLabel}
                    </div>
                  </div>
                  <div className="text-[10px] mt-2 font-medium opacity-70">
                    {st.subtitle}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Horizontal Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-black dark:bg-white transition-all duration-500 ease-out"
              style={{ width: `${((activeStage + 1) / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Selected Stage Command Center Content */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-5 sm:p-7 space-y-6">
          
          {/* Stage Header Info & Navigation Controls */}
          <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="space-y-1 max-w-2xl">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-wider">
                Stage {currentStageInfo.stage} · {currentStageInfo.level}
              </span>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-black dark:text-white pt-1">
                {currentStageInfo.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {currentStageInfo.desc}
              </p>
            </div>

            {/* Sequential Step Prev/Next Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveStage((prev) => Math.max(0, prev - 1))}
                disabled={activeStage === 0}
                className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev Step</span>
              </button>

              {activeStage < 5 ? (
                <button
                  type="button"
                  onClick={() => setActiveStage((prev) => Math.min(5, prev + 1))}
                  className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>Next: Step {activeStage + 2}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Curriculum Frontier Reached</span>
                </div>
              )}
            </div>
          </div>

          {/* Section View Tabs: Formulas, Interactive Labs, Milestones Checklist */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80 text-xs font-semibold w-fit">
            <button
              onClick={() => setStageTab('formulas')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                stageTab === 'formulas'
                  ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Foundational Equations ({currentStageInfo.coreFormulas.length})</span>
            </button>

            <button
              onClick={() => setStageTab('labs')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                stageTab === 'labs'
                  ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Interactive 60fps Labs ({currentStageInfo.featuredLabs.length})</span>
            </button>

            <button
              onClick={() => setStageTab('milestones')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                stageTab === 'milestones'
                  ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Milestones Checklist ({stageMilestonesCompleted}/{currentStageInfo.milestones.length})</span>
            </button>
          </div>

          {/* TAB 1: FOUNDATIONAL EQUATIONS */}
          {stageTab === 'formulas' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Core Stage Mathematical Equations
                </span>
                <Link
                  to={`/library?subject=${currentStageInfo.primarySubject}`}
                  className="font-semibold text-black dark:text-white hover:underline flex items-center gap-1"
                >
                  <span>Browse full subject formulas</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentStageInfo.coreFormulas.map((f) => (
                  <div
                    key={f.id || f.slug}
                    onClick={() => setQuickViewFormula(f)}
                    className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-black dark:hover:border-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold uppercase px-2 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {f.subject_name}
                        </span>
                        <span className="text-zinc-400 font-medium capitalize">
                          {f.level}
                        </span>
                      </div>

                      <div className="font-heading font-bold text-sm text-black dark:text-white group-hover:underline truncate">
                        {f.title}
                      </div>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {f.summary}
                      </p>

                      {/* KaTeX Formula Box */}
                      <div className="py-2.5 px-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center font-mono text-xs overflow-x-auto scrollbar-none min-h-[50px] flex items-center justify-center">
                        <MathView math={f.formula_latex} display={false} />
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-black dark:text-white">
                      <span>Quick Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE VISUAL LABS */}
          {stageTab === 'labs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  60 FPS Physics & Geometry Simulations for this Stage
                </span>
                <Link
                  to="/lab"
                  className="font-semibold text-black dark:text-white hover:underline flex items-center gap-1"
                >
                  <span>Open all 20 Labs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentStageInfo.featuredLabs.map((lab) => (
                  <Link
                    key={lab.id}
                    to={`/lab?id=${lab.id}`}
                    className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-black dark:hover:border-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 shadow-2xs group-hover:scale-110 transition-transform">
                          {lab.icon}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                          {lab.tag}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-heading font-bold text-sm sm:text-base text-black dark:text-white group-hover:underline">
                          {lab.title}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {lab.desc}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-black dark:text-white">
                      <span>Launch Simulation</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MILESTONES CHECKLIST */}
          {stageTab === 'milestones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Interactive Concept Milestones Checklist
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  Click any milestone to mark as mastered
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentStageInfo.milestones.map((m) => {
                  const isChecked = checkedMilestones.has(m.name);

                  return (
                    <div
                      key={m.name}
                      onClick={() => toggleMilestone(m.name)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 shadow-xs'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 fill-emerald-500 text-white" />
                        ) : (
                          <Square className="w-5 h-5 text-zinc-400" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className={`font-heading font-bold text-sm ${isChecked ? 'text-emerald-950 dark:text-emerald-300 line-through' : 'text-black dark:text-white'}`}>
                          {m.name}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {m.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 3. Subjects Detailed Blocks (12 Disciplines Grid) */}
      <div className="space-y-6 pt-4">
        
        {/* Title, Search, and Category Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-black dark:text-white">
                All 12 Mathematical Subjects (169 Formulas)
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Explore comprehensive formula derivations, interactive simulations, and practice quizzes by subject.
              </p>
            </div>

            {/* Real-time Subject Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter subjects or topics..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            {[
              { id: 'all', label: 'All Subjects (12)' },
              { id: 'pure', label: 'Pure Mathematics (6)' },
              { id: 'applied', label: 'Applied Science & Physics (3)' },
              { id: 'cs', label: 'Computer Science & Discrete (3)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubjectCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  subjectCategory === tab.id
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {categorizedSubjects.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 space-y-3">
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              No subjects found matching "{subjectSearch}"
            </p>
            <button
              type="button"
              onClick={() => {
                setSubjectSearch('');
                setSubjectCategory('all');
              }}
              className="text-xs font-bold text-black dark:text-white underline cursor-pointer"
            >
              Reset subject search and filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categorizedSubjects.map((sub) => (
              <div
                key={sub.id || sub.slug}
                className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Subject card header */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 text-black dark:text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1.5 rounded-xl bg-white dark:bg-zinc-900 shadow-2xs group-hover:scale-110 transition-transform">
                        {sub.icon || '📐'}
                      </span>
                      <div>
                        <h3 className="font-heading font-extrabold text-base leading-tight">
                          {sub.name}
                        </h3>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                          {sub.formula_count || 12} equations
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/lab"
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-bold flex items-center gap-1 hover:border-black dark:hover:border-white transition-colors"
                    >
                      <FlaskConical className="w-3 h-3 text-cyan-500" />
                      <span>Labs</span>
                    </Link>
                  </div>

                  {/* Body description & sample KaTeX */}
                  <div className="p-5 space-y-3">
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                      {sub.description}
                    </p>

                    {/* Sample KaTeX Box */}
                    {sub.sample_latex && (
                      <div className="py-2.5 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center text-xs font-mono overflow-x-auto scrollbar-none min-h-[48px] flex items-center justify-center">
                        <MathView math={sub.sample_latex} display={false} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <Link
                    to={`/library?subject=${sub.slug}`}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>Explore Equations</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/lab"
                    className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold text-xs flex items-center gap-1 transition-colors"
                    title={`Explore visual labs related to ${sub.name}`}
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-cyan-500" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick View Formula Modal */}
      {quickViewFormula && (
        <FormulaDetailModal
          formula={quickViewFormula}
          onClose={() => setQuickViewFormula(null)}
        />
      )}

    </div>
  );
}
