import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Zap, 
  Search, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  MonitorPlay, 
  Layers, 
  RotateCcw,
  Sliders,
  ExternalLink,
  Cpu,
  Compass,
  Maximize2,
  Minimize2,
  Camera,
  Bookmark,
  CheckCircle2,
  Share2,
  HelpCircle,
  Shuffle,
  X,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  BookOpen,
  Filter,
  ArrowRight,
  Clock,
  Flame,
  Award
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { LAB_DETAILS } from '../data/labDetailsData';

// Lab Components
import CircleAreaLab from '../components/labs/CircleAreaLab';
import PythagoreanLab from '../components/labs/PythagoreanLab';
import QuadraticLab from '../components/labs/QuadraticLab';
import UnitCircleLab from '../components/labs/UnitCircleLab';
import DerivativeLab from '../components/labs/DerivativeLab';
import EuclideanGcdLab from '../components/labs/EuclideanGcdLab';
import BigOComplexityLab from '../components/labs/BigOComplexityLab';
import NormalDistributionLab from '../components/labs/NormalDistributionLab';
import HarmonicWaveLab from '../components/labs/HarmonicWaveLab';
import MatrixTransformLab from '../components/labs/MatrixTransformLab';
import ProjectileMotionLab from '../components/labs/ProjectileMotionLab';
import SnellsLawLab from '../components/labs/SnellsLawLab';
import LagrangeMultipliersLab from '../components/labs/LagrangeMultipliersLab';
import LorentzDilationLab from '../components/labs/LorentzDilationLab';
import CosineSimilarityLab from '../components/labs/CosineSimilarityLab';
import FourierSeriesLab from '../components/labs/FourierSeriesLab';
import DoublePendulumLab from '../components/labs/DoublePendulumLab';
import KeplerOrbitLab from '../components/labs/KeplerOrbitLab';
import BayesTheoremLab from '../components/labs/BayesTheoremLab';
import NeuralNetworkLab from '../components/labs/NeuralNetworkLab';

// Alias dictionary for backward compatibility and formula library links
const LAB_ALIASES = {
  'fourier': 'fourier-series',
  'lorenz': 'double-pendulum',
  'chaos': 'double-pendulum',
  'pendulum': 'double-pendulum',
  'orbit': 'kepler-orbit',
  'kepler': 'kepler-orbit',
  'bayes': 'bayes-theorem',
  'neural-net': 'neural-network',
  'perceptron': 'neural-network',
  'nn': 'neural-network',
  'gcd-euclidean': 'euclidean-gcd',
  'gcd': 'euclidean-gcd',
  'euclidean': 'euclidean-gcd',
  'circle': 'circle-area',
  'archimedes': 'circle-area',
  'wave': 'harmonic-wave',
  'standing-wave': 'harmonic-wave',
  'trig': 'unit-circle',
  'snell': 'snells-law',
  'optics': 'snells-law',
  'time-dilation': 'lorentz-dilation',
  'dilation': 'lorentz-dilation',
  'relativity': 'lorentz-dilation',
  'lagrange': 'lagrange-multipliers',
  'cosine': 'cosine-similarity',
  'embeddings': 'cosine-similarity',
  'normal': 'normal-dist',
  'gaussian': 'normal-dist',
  'bell-curve': 'normal-dist',
  'projectile': 'projectile-motion',
  'ballistics': 'projectile-motion',
  'pythagoras': 'pythagorean',
  'quad': 'quadratic',
  'parabola': 'quadratic',
  'matrix': 'matrix-transform',
  'determinant': 'matrix-transform',
  'big-o': 'big-o',
  'sorting': 'big-o',
  'complexity': 'big-o',
};

export default function VisualLabPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Resolve initial lab id with alias matching
  const rawParamId = searchParams.get('id') || searchParams.get('tab') || 'fourier-series';
  const resolvedInitialId = LAB_ALIASES[rawParamId] || rawParamId;

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabId, setSelectedLabId] = useState(resolvedInitialId);
  const [viewMode, setViewMode] = useState('spotlight'); // 'spotlight' | 'grid' | 'stacked'
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'fps' | 'alpha' | 'difficulty'
  const [filterFilter, setFilterFilter] = useState('all'); // 'all' | 'bookmarked' | 'mastered' | 'unexplored'

  // Studio UI states
  const [isTheatreMode, setIsTheatreMode] = useState(false);
  const [deepDiveTab, setDeepDiveTab] = useState('intuition'); // 'intuition' | 'missions' | 'formula'
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [isFilmstripOpen, setIsFilmstripOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Stacked mode expanded accordion cards
  const [expandedStackedLabs, setExpandedStackedLabs] = useState({ [resolvedInitialId]: true });

  const stageRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const { profile, completeLab, awardXp } = useStudent();

  // Local storage bookmarks for labs
  const [labBookmarks, setLabBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('btm_lab_bookmarks');
      return saved ? JSON.parse(saved) : ['fourier-series', 'double-pendulum', 'neural-network'];
    } catch {
      return ['fourier-series', 'double-pendulum', 'neural-network'];
    }
  });

  // Local storage mission completions map: { [missionId]: boolean }
  const [completedMissions, setCompletedMissions] = useState(() => {
    try {
      const saved = localStorage.getItem('btm_lab_missions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleMission = (missionId) => {
    setCompletedMissions(prev => {
      const next = { ...prev, [missionId]: !prev[missionId] };
      try {
        localStorage.setItem('btm_lab_missions', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const showToast = useCallback((msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  const toggleBookmark = (id) => {
    setLabBookmarks(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('btm_lab_bookmarks', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      showToast(exists ? 'Removed from Bookmarked Labs' : '⭐ Saved to Bookmarked Labs');
      return updated;
    });
  };

  // All 20 interactive labs catalog definition
  const allLabs = useMemo(() => [
    {
      id: 'fourier-series',
      title: 'Fourier Series & Epicycle Decomposition',
      category: 'signals',
      categoryLabel: 'Signals & Waves',
      icon: '🌀',
      formula: 'f(t) = a₀ + ∑(aₙ cos(nωt) + bₙ sin(nωt))',
      description: 'Decompose square, sawtooth, triangle, and pulse waveforms into rotating harmonic epicycles with real-time spectrum analysis.',
      component: <FourierSeriesLab />,
      tags: ['Fourier', 'Epicycles', 'Harmonics', 'Signal Processing'],
      badge: 'New 60 FPS',
      difficulty: 'Advanced',
      order: 1
    },
    {
      id: 'double-pendulum',
      title: 'Double Pendulum & Chaos Theory',
      category: 'physics',
      categoryLabel: 'Physics & Dynamics',
      icon: '⚡',
      formula: 'Lagrangian Mechanics & Lyapunov Exponent',
      description: 'Runge-Kutta 4th-order chaotic simulation showing extreme sensitivity to initial angular conditions with twin pendulum divergence.',
      component: <DoublePendulumLab />,
      tags: ['Chaos', 'Lagrangian', 'RK4', 'Lyapunov'],
      badge: 'New 60 FPS',
      difficulty: 'Advanced',
      order: 2
    },
    {
      id: 'kepler-orbit',
      title: 'Keplerian Orbital Mechanics & Vis-Viva',
      category: 'physics',
      categoryLabel: 'Physics & Astronomy',
      icon: '🪐',
      formula: 'v² = GM(2/r - 1/a)',
      description: 'Gravitational 2-body orbit simulator illustrating Kepler’s 3 laws, sweeping equal areas in equal times, apoapsis/periapsis velocities.',
      component: <KeplerOrbitLab />,
      tags: ['Kepler', 'Gravity', 'Orbital Mechanics', 'Vis-Viva'],
      badge: 'New 60 FPS',
      difficulty: 'Intermediate',
      order: 3
    },
    {
      id: 'bayes-theorem',
      title: "Bayes' Theorem & Diagnostic Probability",
      category: 'statistics',
      categoryLabel: 'Probability & Stats',
      icon: '🎲',
      formula: 'P(A|B) = P(B|A)P(A) / P(B)',
      description: '10,000-population interactive mosaic grid demystifying false positives, sensitivity, specificity, and base rate fallacy.',
      component: <BayesTheoremLab />,
      tags: ['Bayes', 'False Positives', 'Base Rate', 'Probability'],
      badge: 'New 60 FPS',
      difficulty: 'Intermediate',
      order: 4
    },
    {
      id: 'neural-network',
      title: 'Neural Network Decision Boundary & Perceptron',
      category: 'ml',
      categoryLabel: 'Machine Learning',
      icon: '🧠',
      formula: 'ŷ = σ(W₂ · ReLU(W₁x + b₁) + b₂)',
      description: 'Live 2D decision boundary classification engine. Train weights with real-time gradient descent on Circles, XOR, Moons, and Spiral datasets.',
      component: <NeuralNetworkLab />,
      tags: ['Neural Net', 'Decision Boundary', 'Gradient Descent', 'ML'],
      badge: 'New 60 FPS',
      difficulty: 'Advanced',
      order: 5
    },
    {
      id: 'big-o',
      title: 'Big-O Algorithmic Growth & Racing Arena',
      category: 'cse',
      categoryLabel: 'Algorithms & CS',
      icon: '⚡',
      formula: 'O(1) ⊂ O(log n) ⊂ O(n) ⊂ O(n log n) ⊂ O(n²)',
      description: 'Compare asymptotic algorithm complexity curves and run a live 2D racing arena matching Linear Search, Binary Search, and Bubble Sort.',
      component: <BigOComplexityLab />,
      tags: ['Big-O', 'Algorithms', 'Complexity', 'Sorting Race'],
      badge: 'Upgraded',
      difficulty: 'Foundational',
      order: 6
    },
    {
      id: 'circle-area',
      title: 'Circle Area & Archimedes Polygon Limits',
      category: 'geometry',
      categoryLabel: 'Geometry & Trig',
      icon: '⭕',
      formula: 'A = πr² = lim (n/2 · r² · sin(2π/n))',
      description: 'Archimedes method of exhaustion: watch regular polygons transform into a continuous circular area as side count approaches infinity.',
      component: <CircleAreaLab />,
      tags: ['Circle Area', 'Archimedes', 'Polygon Limit', 'Pi'],
      badge: 'Upgraded',
      difficulty: 'Foundational',
      order: 7
    },
    {
      id: 'euclidean-gcd',
      title: 'Euclidean GCD Algorithm & Square Tiling',
      category: 'algebra',
      categoryLabel: 'Algebra & Number Theory',
      icon: '🧱',
      formula: 'gcd(a, b) = gcd(b, a mod b)',
      description: 'Visual geometric proof of the Euclidean Algorithm through recursive rectangle square tiling and step-by-step remainder breakdown.',
      component: <EuclideanGcdLab />,
      tags: ['GCD', 'Euclidean', 'Number Theory', 'Tiling'],
      badge: 'Upgraded',
      difficulty: 'Foundational',
      order: 8
    },
    {
      id: 'harmonic-wave',
      title: 'Harmonic Wave, Standing Waves & Interference',
      category: 'physics',
      categoryLabel: 'Signals & Waves',
      icon: '🌊',
      formula: 'y(x, t) = A sin(kx - ωt + φ)',
      description: 'Interactive wave mechanics simulator showing traveling sinusoidal waves, standing wave nodes/antinodes, and wave superposition.',
      component: <HarmonicWaveLab />,
      tags: ['Waves', 'Superposition', 'Interference', 'Standing Waves'],
      badge: 'Upgraded',
      difficulty: 'Intermediate',
      order: 9
    },
    {
      id: 'unit-circle',
      title: 'Unit Circle Trigonometry & Phasors',
      category: 'geometry',
      categoryLabel: 'Geometry & Trig',
      icon: '📐',
      formula: 'cos²θ + sin²θ = 1',
      description: 'Explore trigonometric definitions of sine, cosine, tangent, exact special radian angles, and dynamic right-triangle projections.',
      component: <UnitCircleLab />,
      tags: ['Trigonometry', 'Unit Circle', 'Sine', 'Cosine'],
      badge: 'Upgraded',
      difficulty: 'Foundational',
      order: 10
    },
    {
      id: 'derivative',
      title: 'Derivative & Secant-to-Tangent Slope',
      category: 'calculus',
      categoryLabel: 'Calculus & Optimization',
      icon: '📈',
      formula: "f'(x) = lim_{h→0} [f(x+h) - f(x)] / h",
      description: 'Watch the secant line snap to the true instantaneous tangent slope as the interval step size h approaches zero.',
      component: <DerivativeLab />,
      tags: ['Derivative', 'Calculus', 'Tangent', 'Secant'],
      badge: 'Active',
      difficulty: 'Intermediate',
      order: 11
    },
    {
      id: 'pythagorean',
      title: 'Pythagorean Theorem & Geometric Squares',
      category: 'geometry',
      categoryLabel: 'Geometry & Trig',
      icon: '📐',
      formula: 'a² + b² = c²',
      description: 'Adjust right-triangle legs and verify Euclid’s visual proof with interactive geometric area squares built on each side.',
      component: <PythagoreanLab />,
      tags: ['Pythagorean', 'Right Triangle', 'Euclidean Proof', 'Geometry'],
      badge: 'Upgraded',
      difficulty: 'Foundational',
      order: 12
    },
    {
      id: 'quadratic',
      title: 'Quadratic Function, Parabola & Roots',
      category: 'algebra',
      categoryLabel: 'Algebra & Number Theory',
      icon: '📊',
      formula: 'x = (-b ± √(b² - 4ac)) / (2a)',
      description: 'Modify coefficients a, b, and c to track vertex shift, axis of symmetry, discriminant Δ, and transitions between real and complex roots.',
      component: <QuadraticLab />,
      tags: ['Quadratic', 'Parabola', 'Discriminant', 'Roots'],
      badge: 'Active',
      difficulty: 'Foundational',
      order: 13
    },
    {
      id: 'matrix-transform',
      title: '2D Linear Matrix Transformations & Determinant',
      category: 'linear-algebra',
      categoryLabel: 'Linear Algebra',
      icon: '🔲',
      formula: 'v’ = Av,   Area = |det(A)|',
      description: 'Deform coordinate grids, transform basis vectors î and ĵ, and visualize how determinant measures signed area scaling and inversions.',
      component: <MatrixTransformLab />,
      tags: ['Matrix', 'Linear Algebra', 'Determinant', 'Transformation'],
      badge: 'Active',
      difficulty: 'Intermediate',
      order: 14
    },
    {
      id: 'projectile-motion',
      title: 'Projectile Motion & Kinematics Ballistics',
      category: 'physics',
      categoryLabel: 'Physics & Astronomy',
      icon: '🚀',
      formula: 'R = (v₀² sin 2θ) / g',
      description: 'Launch cannonballs at arbitrary angles and velocities. Observe real-time horizontal and vertical velocity vector decomposition.',
      component: <ProjectileMotionLab />,
      tags: ['Projectile', 'Kinematics', 'Ballistics', 'Physics'],
      badge: 'Active',
      difficulty: 'Foundational',
      order: 15
    },
    {
      id: 'snells-law',
      title: 'Snell’s Law & Total Internal Reflection',
      category: 'physics',
      categoryLabel: 'Physics & Astronomy',
      icon: '💡',
      formula: 'n₁ sin θ₁ = n₂ sin θ₂',
      description: 'Simulate light refraction across media boundaries (Air, Water, Glass, Diamond) and observe the critical angle phenomenon.',
      component: <SnellsLawLab />,
      tags: ['Optics', 'Snells Law', 'Refraction', 'Physics'],
      badge: 'Active',
      difficulty: 'Intermediate',
      order: 16
    },
    {
      id: 'lorentz-dilation',
      title: 'Lorentz Factor & Relativistic Time Dilation',
      category: 'physics',
      categoryLabel: 'Physics & Astronomy',
      icon: '⏱️',
      formula: 'Δt’ = Δt / √(1 - v²/c²)',
      description: 'Einstein’s special relativity light clock simulator revealing why moving clocks tick slower as velocity approaches speed of light c.',
      component: <LorentzDilationLab />,
      tags: ['Relativity', 'Lorentz', 'Time Dilation', 'Physics'],
      badge: 'Active',
      difficulty: 'Advanced',
      order: 17
    },
    {
      id: 'lagrange-multipliers',
      title: 'Lagrange Multipliers Constrained Optimization',
      category: 'calculus',
      categoryLabel: 'Calculus & Optimization',
      icon: '🎯',
      formula: '∇f = λ ∇g',
      description: '2D contour map visualization showing where objective function level curves meet constraint boundaries at collinear normal gradients.',
      component: <LagrangeMultipliersLab />,
      tags: ['Lagrange', 'Optimization', 'Multivariable', 'Calculus'],
      badge: 'Active',
      difficulty: 'Advanced',
      order: 18
    },
    {
      id: 'cosine-similarity',
      title: 'Cosine Similarity & High-Dimensional Embeddings',
      category: 'ml',
      categoryLabel: 'Machine Learning & AI',
      icon: '🧭',
      formula: 'cos(θ) = (u · v) / (||u|| ||v||)',
      description: 'Vector orientation lab demystifying semantic distance, dot products, and token similarity used in modern LLMs and vector databases.',
      component: <CosineSimilarityLab />,
      tags: ['Cosine Similarity', 'Embeddings', 'Vectors', 'ML'],
      badge: 'Active',
      difficulty: 'Intermediate',
      order: 19
    },
    {
      id: 'normal-dist',
      title: 'Normal (Gaussian) Distribution & Empirical Rule',
      category: 'statistics',
      categoryLabel: 'Probability & Stats',
      icon: '🔔',
      formula: 'f(x) = (1 / (σ√(2π))) · e^(-(x-μ)² / (2σ²))',
      description: 'Interactive Gaussian bell curve showing dynamic cumulative probability integrals and the 68-95-99.7 empirical rule intervals.',
      component: <NormalDistributionLab />,
      tags: ['Gaussian', 'Normal Distribution', 'Standard Deviation', 'Statistics'],
      badge: 'Active',
      difficulty: 'Foundational',
      order: 20
    }
  ], []);

  // Update URL param when selectedLabId changes
  const handleSelectLab = useCallback((id) => {
    const canonicalId = LAB_ALIASES[id] || id;
    setSelectedLabId(canonicalId);
    setSearchParams({ id: canonicalId });
    if (viewMode === 'grid') {
      setViewMode('spotlight');
    }
    // Also expand in stacked mode
    setExpandedStackedLabs(prev => ({ ...prev, [canonicalId]: true }));
  }, [setSearchParams, viewMode]);

  // Synchronize URL search params with alias resolution
  useEffect(() => {
    const rawParam = searchParams.get('id') || searchParams.get('tab');
    if (rawParam) {
      const canonical = LAB_ALIASES[rawParam] || rawParam;
      if (canonical !== selectedLabId && allLabs.some(l => l.id === canonical)) {
        setSelectedLabId(canonical);
      }
    }
  }, [searchParams, selectedLabId, allLabs]);

  // Current spotlight lab
  const currentLab = useMemo(() => {
    return allLabs.find(l => l.id === selectedLabId) || allLabs[0];
  }, [allLabs, selectedLabId]);

  // Pedagogical details for the active lab
  const currentLabDetails = useMemo(() => {
    return LAB_DETAILS[currentLab.id] || {
      difficulty: currentLab.difficulty || 'Intermediate',
      realWorldApps: ['Interactive mathematical visualization for STEM intuition.'],
      parameters: [{ name: 'Simulation Parameters', desc: 'Adjust sliders to observe system behavior.' }],
      missions: [
        { id: `${currentLab.id}-1`, title: 'Explore Parameters', text: 'Tweak controls and observe output patterns.' },
        { id: `${currentLab.id}-2`, title: 'Reset and Compare', text: 'Observe extreme conditions and boundary states.' }
      ]
    };
  }, [currentLab]);

  // Navigation indices
  const currentIndex = allLabs.findIndex(l => l.id === currentLab.id);
  const handlePrevLab = useCallback(() => {
    const prevIdx = (currentIndex - 1 + allLabs.length) % allLabs.length;
    handleSelectLab(allLabs[prevIdx].id);
  }, [currentIndex, allLabs, handleSelectLab]);

  const handleNextLab = useCallback(() => {
    const nextIdx = (currentIndex + 1) % allLabs.length;
    handleSelectLab(allLabs[nextIdx].id);
  }, [currentIndex, allLabs, handleSelectLab]);

  // Random "Surprise Me" lab selection
  const handleSurpriseMe = () => {
    const others = allLabs.filter(l => l.id !== currentLab.id);
    const randomLab = others[Math.floor(Math.random() * others.length)];
    if (randomLab) {
      handleSelectLab(randomLab.id);
      showToast(`🎲 Exploring: ${randomLab.title}`);
    }
  };

  // Mastery status
  const completedLabsList = profile.completed_labs || [];
  const isCurrentLabMastered = completedLabsList.includes(currentLab.id);

  const handleMarkMastered = () => {
    completeLab(currentLab.id);
    showToast(`🏆 ${currentLab.title} marked as Mastered! (+50 XP)`);
  };

  // Canvas Snapshot feature: exports high-res PNG with BehindTheMath watermark
  const handleTakeSnapshot = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const canvas = stage.querySelector('canvas');
    if (!canvas) {
      showToast('⚠️ No active simulation canvas found');
      return;
    }
    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const ctx = exportCanvas.getContext('2d');

      // Draw original simulation frame
      ctx.drawImage(canvas, 0, 0);

      // Add watermark overlay
      const watermarkHeight = 26;
      ctx.fillStyle = 'rgba(10, 10, 15, 0.78)';
      ctx.fillRect(exportCanvas.width - 290, exportCanvas.height - watermarkHeight - 8, 282, watermarkHeight);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(exportCanvas.width - 290, exportCanvas.height - watermarkHeight - 8, 282, watermarkHeight);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText(`BehindTheMath · ${currentLab.title.slice(0, 24)}...`, exportCanvas.width - 280, exportCanvas.height - 16);

      const dataUrl = exportCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `BehindTheMath-${currentLab.id}-sim.png`;
      a.click();
      showToast('📸 Simulation snapshot downloaded!');
    } catch (err) {
      console.error('Snapshot failed:', err);
      showToast('Could not export canvas snapshot');
    }
  };

  // Copy Deep Link
  const handleShareLink = () => {
    const url = `${window.location.origin}/lab?id=${currentLab.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('🔗 Direct lab link copied to clipboard!');
    } else {
      showToast(`Link: ${url}`);
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is focused inside an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevLab();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextLab();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsTheatreMode(prev => !prev);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleTakeSnapshot();
      } else if (e.key === 'Escape' && isTheatreMode) {
        setIsTheatreMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevLab, handleNextLab, isTheatreMode]);

  // Categories list with dynamic count
  const categories = useMemo(() => [
    { id: 'all', label: 'All Experiments', count: allLabs.length },
    { id: 'physics', label: 'Physics & Astronomy', count: allLabs.filter(l => l.category === 'physics').length },
    { id: 'signals', label: 'Signals & Waves', count: allLabs.filter(l => l.category === 'signals').length },
    { id: 'ml', label: 'Machine Learning & AI', count: allLabs.filter(l => l.category === 'ml').length },
    { id: 'calculus', label: 'Calculus & Optimization', count: allLabs.filter(l => l.category === 'calculus').length },
    { id: 'linear-algebra', label: 'Linear Algebra', count: allLabs.filter(l => l.category === 'linear-algebra').length },
    { id: 'geometry', label: 'Geometry & Trig', count: allLabs.filter(l => l.category === 'geometry').length },
    { id: 'algebra', label: 'Algebra & Number Theory', count: allLabs.filter(l => l.category === 'algebra').length },
    { id: 'statistics', label: 'Probability & Stats', count: allLabs.filter(l => l.category === 'statistics').length },
    { id: 'cse', label: 'Algorithms & CS', count: allLabs.filter(l => l.category === 'cse').length },
  ], [allLabs]);

  // Filtered & Sorted Labs
  const filteredLabs = useMemo(() => {
    let result = allLabs.filter((lab) => {
      const matchesCategory = activeCategory === 'all' || lab.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        lab.title.toLowerCase().includes(query) ||
        lab.formula.toLowerCase().includes(query) ||
        lab.description.toLowerCase().includes(query) ||
        lab.tags.some(t => t.toLowerCase().includes(query));

      let matchesFilter = true;
      if (filterFilter === 'bookmarked') {
        matchesFilter = labBookmarks.includes(lab.id);
      } else if (filterFilter === 'mastered') {
        matchesFilter = completedLabsList.includes(lab.id);
      } else if (filterFilter === 'unexplored') {
        matchesFilter = !completedLabsList.includes(lab.id);
      }

      return matchesCategory && matchesSearch && matchesFilter;
    });

    if (sortBy === 'alpha') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'fps') {
      result = [...result].sort((a, b) => (b.badge.includes('60 FPS') ? 1 : 0) - (a.badge.includes('60 FPS') ? 1 : 0));
    } else if (sortBy === 'difficulty') {
      const diffOrder = { 'Foundational': 1, 'Intermediate': 2, 'Advanced': 3 };
      result = [...result].sort((a, b) => (diffOrder[a.difficulty] || 2) - (diffOrder[b.difficulty] || 2));
    }

    return result;
  }, [allLabs, activeCategory, searchQuery, filterFilter, sortBy, labBookmarks, completedLabsList]);

  // Overall student mastery stats
  const masteredCount = useMemo(() => {
    return allLabs.filter(l => completedLabsList.includes(l.id)).length;
  }, [allLabs, completedLabsList]);

  const masteryPercent = Math.round((masteredCount / allLabs.length) * 100);

  return (
    <div className={`transition-all duration-300 py-6 sm:py-8 space-y-6 ${
      isTheatreMode ? 'max-w-[1700px] px-2 sm:px-4 mx-auto' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
    }`}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold border border-zinc-700 dark:border-zinc-300 flex items-center gap-2">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Studio Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Interactive Mathematical Simulation Studio ({allLabs.length} Active 60 FPS Labs)</span>
            </div>
            
            {/* Student Mastery Mini Indicator */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>{masteredCount} / {allLabs.length} Explored ({masteryPercent}%)</span>
            </div>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-zinc-900 dark:text-white tracking-tight">
            Visual STEM Experiment Lab
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Manipulate parameters, inspect differential phase-space portraits, and witness math in motion. Built with high-precision Runge-Kutta numerical solvers, continuous Fourier epicycles, and live Canvas 2D engines.
          </p>
        </div>

        {/* View mode toggle & Action triggers */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start md:self-auto">
          {/* View mode buttons */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setViewMode('spotlight')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                viewMode === 'spotlight'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
              title="Spotlight Studio: focused simulation stage"
            >
              <MonitorPlay className="w-3.5 h-3.5 shrink-0" />
              <span>Spotlight Studio</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
              title="Catalog Explorer: browse all 20 lab cards"
            >
              <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
              <span>Catalog ({allLabs.length})</span>
            </button>
            <button
              onClick={() => setViewMode('stacked')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                viewMode === 'stacked'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
              title="Stacked Gallery: scrollable list"
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Stacked</span>
            </button>
          </div>

          {/* Surprise Me button */}
          <button
            onClick={handleSurpriseMe}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors shadow-xs cursor-pointer"
            title="Jump to a random simulation experiment"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Surprise Me</span>
          </button>
        </div>
      </div>

      {/* Controls Bar: Search & Category Filter Pills */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by formula, concept, or algorithm (e.g. 'orbit', 'fourier', 'chaos')..."
              className="w-full pl-9 pr-12 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-black dark:hover:text-white font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filter & Jump Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Status Filter in Grid/Stacked modes */}
            {viewMode !== 'spotlight' && (
              <select
                value={filterFilter}
                onChange={(e) => setFilterFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white shadow-xs cursor-pointer"
              >
                <option value="all">Filter: All Statuses</option>
                <option value="bookmarked">⭐ Bookmarked Only ({labBookmarks.length})</option>
                <option value="mastered">✓ Mastered Only ({masteredCount})</option>
                <option value="unexplored">Unexplored Only ({allLabs.length - masteredCount})</option>
              </select>
            )}

            {/* Quick Sort in Grid Mode */}
            {viewMode === 'grid' && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white shadow-xs cursor-pointer"
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="fps">Sort: 60 FPS First</option>
                <option value="alpha">Sort: Alphabetical (A-Z)</option>
                <option value="difficulty">Sort: Difficulty</option>
              </select>
            )}

            {/* Focus Lab dropdown */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 whitespace-nowrap shrink-0">Focus Lab:</label>
              <select
                value={selectedLabId}
                onChange={(e) => handleSelectLab(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white shadow-xs cursor-pointer max-w-[200px] truncate"
              >
                {allLabs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.icon} {l.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills with counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                activeCategory === tab.id
                  ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: SPOTLIGHT STUDIO (Cockpit + Action Bar + Deep Dive Tabs)    */}
      {/* ========================================================================= */}
      {viewMode === 'spotlight' && (
        <div className="space-y-6">
          
          {/* Spotlight Stage Header & Studio Cockpit Toolbar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* Lab Identity */}
            <div className="flex items-center gap-3.5">
              <span className="text-3xl sm:text-4xl p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 shrink-0">
                {currentLab.icon}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-heading font-extrabold text-lg sm:text-xl text-zinc-900 dark:text-white">
                    {currentLab.title}
                  </h2>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    {currentLab.badge}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {currentLab.categoryLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                    {currentLab.difficulty}
                  </span>
                  {isCurrentLabMastered && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Mastered</span>
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-zinc-600 dark:text-zinc-300 mt-1 font-semibold">
                  {currentLab.formula}
                </p>
              </div>
            </div>

            {/* Studio Action Toolbar */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap self-stretch md:self-auto justify-end">
              {/* Stepper Navigation */}
              <div className="flex items-center gap-1 border-r border-zinc-200 dark:border-zinc-800 pr-2 mr-1">
                <span className="text-xs text-zinc-400 font-mono mr-1">
                  {currentIndex + 1}/{allLabs.length}
                </span>
                <button
                  onClick={handlePrevLab}
                  className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
                  title="Previous lab (Left Arrow)"
                  aria-label="Previous lab"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextLab}
                  className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
                  title="Next lab (Right Arrow)"
                  aria-label="Next lab"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Theatre Mode Toggle */}
              <button
                onClick={() => setIsTheatreMode(prev => !prev)}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isTheatreMode 
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
                title={isTheatreMode ? "Exit Theatre Mode (F or Esc)" : "Theatre Mode (F)"}
              >
                {isTheatreMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isTheatreMode ? 'Exit Theatre' : 'Theatre'}</span>
              </button>

              {/* Snapshot Canvas Button */}
              <button
                onClick={handleTakeSnapshot}
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Save high-resolution PNG image of this simulation (S)"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Snapshot</span>
              </button>

              {/* Bookmark Toggle */}
              <button
                onClick={() => toggleBookmark(currentLab.id)}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  labBookmarks.includes(currentLab.id)
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
                title={labBookmarks.includes(currentLab.id) ? "Remove Bookmark" : "Bookmark this Experiment"}
              >
                <Bookmark className={`w-3.5 h-3.5 ${labBookmarks.includes(currentLab.id) ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">Save</span>
              </button>

              {/* Share Deep Link */}
              <button
                onClick={handleShareLink}
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy shareable link to this experiment"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {/* Mark Mastered (+50 XP) */}
              {!isCurrentLabMastered ? (
                <button
                  onClick={handleMarkMastered}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                  title="Mark this lab as mastered to earn +50 XP"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Master (+50 XP)</span>
                </button>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mastered</span>
                </div>
              )}

              {/* Keyboard Help */}
              <button
                onClick={() => setShowShortcutsModal(true)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                title="Keyboard shortcuts"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Spotlight Simulation Component Stage */}
          <div ref={stageRef} className="transition-all duration-300">
            {currentLab.component}
          </div>

          {/* ================================================================= */}
          {/* INTERACTIVE 20-LAB FILMSTRIP (Visual Quick Jump Drawer)          */}
          {/* ================================================================= */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MonitorPlay className="w-3.5 h-3.5 text-amber-500" />
                  <span>Interactive Experiment Filmstrip ({allLabs.length})</span>
                </span>
                <span className="text-[11px] text-zinc-400">· 1-click switch</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsFilmstripOpen(prev => !prev)}
                  className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>{isFilmstripOpen ? 'Collapse' : 'Expand'}</span>
                  {isFilmstripOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className="text-xs text-zinc-600 dark:text-zinc-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>View All 20 Cards</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {isFilmstripOpen && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-2.5 pt-1">
                {allLabs.map((lab) => {
                  const isSelected = lab.id === currentLab.id;
                  const isMastered = completedLabsList.includes(lab.id);
                  const isSaved = labBookmarks.includes(lab.id);

                  return (
                    <button
                      key={lab.id}
                      onClick={() => handleSelectLab(lab.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md'
                          : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 w-full">
                        <span className="text-xl">{lab.icon}</span>
                        <div className="flex items-center gap-1">
                          {isSaved && (
                            <span className="text-[10px] text-amber-500" title="Bookmarked">★</span>
                          )}
                          {isMastered && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Mastered" />
                          )}
                        </div>
                      </div>

                      <div className="mt-2 w-full">
                        <div className="text-xs font-bold truncate leading-snug">
                          {lab.title}
                        </div>
                        <div className={`text-[10px] truncate mt-0.5 ${
                          isSelected ? 'opacity-80' : 'text-zinc-400'
                        }`}>
                          {lab.categoryLabel}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* DEEP DIVE & LAB MISSIONS ACCORDION / TABS                        */}
          {/* ================================================================= */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            {/* Tab Switcher */}
            <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 px-4 pt-2 gap-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setDeepDiveTab('intuition')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  deepDiveTab === 'intuition'
                    ? 'border-black dark:border-white text-zinc-900 dark:text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Real-World Intuition & Applications</span>
              </button>

              <button
                onClick={() => setDeepDiveTab('missions')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  deepDiveTab === 'missions'
                    ? 'border-black dark:border-white text-zinc-900 dark:text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-rose-500" />
                <span>Interactive Guided Challenges ({currentLabDetails.missions?.length || 0})</span>
              </button>

              <button
                onClick={() => setDeepDiveTab('formula')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  deepDiveTab === 'formula'
                    ? 'border-black dark:border-white text-zinc-900 dark:text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>Equations & Parameter Guide</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 sm:p-6">
              
              {/* TAB 1: Intuition & Applications */}
              {deepDiveTab === 'intuition' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-zinc-900 dark:text-white">
                      Physical Intuition & Modern Applications
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      How this mathematical principle drives contemporary technology, engineering, and scientific discoveries.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                    {currentLabDetails.realWorldApps.map((app, idx) => {
                      const [title, ...descParts] = app.split(':');
                      const desc = descParts.join(':');

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-[11px] font-bold flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                              {idx + 1}
                            </span>
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                              {title}
                            </h4>
                          </div>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {desc || title}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: Guided Challenge Missions */}
              {deepDiveTab === 'missions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-heading font-bold text-sm text-zinc-900 dark:text-white">
                        Interactive Experiment Challenges
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Tweak the simulation parameters above to complete these pedagogical missions.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-zinc-400 font-mono">
                      Completed: {currentLabDetails.missions.filter(m => completedMissions[m.id]).length} / {currentLabDetails.missions.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {currentLabDetails.missions.map((mission) => {
                      const isDone = Boolean(completedMissions[mission.id]);

                      return (
                        <div
                          key={mission.id}
                          onClick={() => toggleMission(mission.id)}
                          className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                            isDone
                              ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                              : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => {}}
                            className="mt-0.5 rounded accent-emerald-600 cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <h4 className={`text-xs font-bold ${isDone ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-white'}`}>
                              {mission.title}
                            </h4>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                              {mission.text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: Equations & Parameter Breakdown */}
              {deepDiveTab === 'formula' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Governing Mathematical Law</span>
                    <div className="font-mono text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                      {currentLab.formula}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-zinc-500">
                      Parameter Reference & Sliders Guide
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentLabDetails.parameters.map((param, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1"
                        >
                          <span className="font-bold text-zinc-900 dark:text-white block font-mono">
                            {param.name}
                          </span>
                          <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                            {param.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: CATALOG EXPLORER (Grid Mode with Sorting & Status Filters) */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="space-y-6">
          
          {/* Catalog Explorer Summary Banner */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-white">
                Showing {filteredLabs.length} of {allLabs.length} STEM interactive labs
              </span>
              {searchQuery && (
                <span className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  Matching "{searchQuery}"
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-zinc-500">
              <span>⭐ {labBookmarks.length} Bookmarked</span>
              <span>•</span>
              <span>🏆 {masteredCount} Mastered</span>
            </div>
          </div>

          {/* Grid Cards */}
          {filteredLabs.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 space-y-3">
              <div className="text-3xl">🔍</div>
              <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
                No matching experiments found
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Try searching for a different formula, concept, or reset your category and status filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                  setFilterFilter('all');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLabs.map((lab) => {
                const isMastered = completedLabsList.includes(lab.id);
                const isSaved = labBookmarks.includes(lab.id);

                return (
                  <div
                    key={lab.id}
                    className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-lg transition-all group relative"
                  >
                    <div className="space-y-3">
                      {/* Top row: Icon, Badges, Bookmark */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-3xl p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                          {lab.icon}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200">
                            {lab.badge}
                          </span>
                          <button
                            onClick={() => toggleBookmark(lab.id)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isSaved
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                            }`}
                            title={isSaved ? "Remove Bookmark" : "Save Bookmark"}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Formula */}
                      <div>
                        <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                          {lab.title}
                        </h3>
                        <div className="text-xs font-mono text-zinc-800 dark:text-zinc-200 mt-1 font-semibold truncate">
                          {lab.formula}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                        {lab.description}
                      </p>

                      {/* Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {lab.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-zinc-400">
                          {lab.categoryLabel}
                        </span>
                        {isMastered && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mastered</span>
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleSelectLab(lab.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
                      >
                        <MonitorPlay className="w-3.5 h-3.5" />
                        <span>Launch Lab</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 3: STACKED GALLERY (Lazy Performance Accordion)                */}
      {/* ========================================================================= */}
      {viewMode === 'stacked' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
            <span>
              Stacked Gallery runs high-precision simulations on demand. Expand any card to run the 60 FPS live canvas engine.
            </span>
            <span className="font-semibold text-zinc-900 dark:text-white">
              {filteredLabs.length} Available
            </span>
          </div>

          <div className="space-y-6">
            {filteredLabs.map((lab) => {
              const isExpanded = Boolean(expandedStackedLabs[lab.id]);

              return (
                <div
                  key={lab.id}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs transition-all"
                >
                  {/* Card Header Bar */}
                  <div className="flex items-center justify-between p-4 bg-zinc-50/50 dark:bg-zinc-950/40 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        {lab.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                            {lab.title}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {lab.categoryLabel}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 mt-0.5 font-semibold">
                          {lab.formula}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSelectLab(lab.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <MonitorPlay className="w-3.5 h-3.5" />
                        <span>Spotlight View</span>
                      </button>

                      <button
                        onClick={() => {
                          setExpandedStackedLabs(prev => ({
                            ...prev,
                            [lab.id]: !prev[lab.id]
                          }));
                        }}
                        className="p-1.5 px-3 rounded-xl text-xs font-semibold bg-black text-white dark:bg-white dark:text-black cursor-pointer"
                      >
                        {isExpanded ? 'Hide Simulation' : 'Run Simulation'}
                      </button>
                    </div>
                  </div>

                  {/* Body Simulation (only rendered if expanded to protect frame rate) */}
                  {isExpanded ? (
                    <div className="p-4 sm:p-6 bg-zinc-100/50 dark:bg-black/40">
                      {lab.component}
                    </div>
                  ) : (
                    <div className="p-4 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                      <p className="max-w-xl">{lab.description}</p>
                      <button
                        onClick={() => {
                          setExpandedStackedLabs(prev => ({
                            ...prev,
                            [lab.id]: true
                          }));
                        }}
                        className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Activate 60 FPS Engine</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KEYBOARD SHORTCUTS MODAL                                                 */}
      {/* ========================================================================= */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-500" />
                <span>Studio Keyboard Shortcuts</span>
              </h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs divide-y divide-zinc-100 dark:divide-zinc-800">
              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-600 dark:text-zinc-400">Previous Experiment</span>
                <kbd className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] font-bold">← Left Arrow</kbd>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-zinc-600 dark:text-zinc-400">Next Experiment</span>
                <kbd className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] font-bold">→ Right Arrow</kbd>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-zinc-600 dark:text-zinc-400">Toggle Theatre Mode</span>
                <kbd className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] font-bold">F</kbd>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-zinc-600 dark:text-zinc-400">Export Canvas Snapshot</span>
                <kbd className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] font-bold">S</kbd>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-zinc-600 dark:text-zinc-400">Exit Theatre Mode</span>
                <kbd className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] font-bold">Esc</kbd>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="w-full py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
