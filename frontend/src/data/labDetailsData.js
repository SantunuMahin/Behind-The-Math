// Detailed educational metadata, real-world applications, and challenge missions for all 20 Visual Labs

export const LAB_DETAILS = {
  'fourier-series': {
    difficulty: 'Advanced',
    realWorldApps: [
      'MP3 & AAC Audio Compression: Stripping inaudible harmonics using discrete cosine and Fourier transforms.',
      'MRI & Medical Imaging: Transforming k-space spatial frequency data into 3D anatomical cross-sections.',
      'Quantum Mechanics: Decomposing wavefunctions into harmonic energy eigenstates via Fourier analysis.'
    ],
    parameters: [
      { name: 'Waveform Function', desc: 'The target periodic signal being approximated (Square, Sawtooth, Triangle, Pulse).' },
      { name: 'Harmonic Order N', desc: 'Number of rotating phasor circles (epicycles). Higher N increases fidelity and reduces approximation error.' },
      { name: 'Animation Speed', desc: 'Rotational frequency multiplier of the fundamental harmonic circle.' },
      { name: 'Epicycles & Phasors', desc: 'Toggle visibility of the underlying complex vector circles and connecting radii.' }
    ],
    missions: [
      {
        id: 'fs-1',
        title: 'Fundamental to Harmonics',
        text: 'Select "Square Wave" and start with N=1 (a single pure sine wave). Gradually increase N to 5, 9, and 15 to observe sharp step edges forming.'
      },
      {
        id: 'fs-2',
        title: 'Gibbs Phenomenon Observation',
        text: 'Set N=21 on a Square Wave. Notice the persistent ~9% amplitude overshoot near the sharp vertical discontinuities that never disappears as N increases.'
      },
      {
        id: 'fs-3',
        title: 'Spectral Decay Comparison',
        text: 'Switch between Sawtooth (harmonics decay as 1/n) and Triangle (harmonics decay as 1/n²). Notice why Triangle requires far fewer circles to look smooth.'
      }
    ]
  },

  'double-pendulum': {
    difficulty: 'Advanced',
    realWorldApps: [
      'Chaotic Dynamics & Weather Prediction: The theoretical foundation of why atmospheric weather models diverge beyond ~10 days (Butterfly Effect).',
      'Satellite Attitude Control: Avoiding chaotic rotational tumbling in multi-link robotic arms and orbital tether systems.',
      'Nonlinear Acoustics & Robotics: Modeling leg joint oscillations and fluid-structure vortex shedding.'
    ],
    parameters: [
      { name: 'Length L1 & L2', desc: 'Length of the primary and secondary rigid pendulum rods.' },
      { name: 'Mass M2', desc: 'Mass of the secondary chaotic bob at the outer end.' },
      { name: 'Initial Angles (θ1, θ2)', desc: 'Starting angles of both rods from vertical down.' },
      { name: 'Butterfly Shadow Pendulum', desc: 'Runs an identical twin pendulum with a 0.001 rad initial perturbation to measure Lyapunov divergence.' }
    ],
    missions: [
      {
        id: 'dp-1',
        title: 'Witness Deterministic Chaos',
        text: 'Enable "Butterfly Effect Shadow" and launch the default preset. Watch the two bobs trace identical trajectories for ~4 seconds, then violently diverge.'
      },
      {
        id: 'dp-2',
        title: 'Inverted Extreme Energy Loop',
        text: 'Select the "Inverted (Extreme Energy)" preset (θ1=178°, θ2=178°). Observe how high gravitational potential energy triggers chaotic full 360° flips.'
      },
      {
        id: 'dp-3',
        title: 'Near-Linear Harmonic Island',
        text: 'Select the "Small Angle" preset (θ1=11°, θ2=11°). Observe how the system behaves as two coupled linear harmonic oscillators with virtually zero divergence.'
      }
    ]
  },

  'kepler-orbit': {
    difficulty: 'Intermediate',
    realWorldApps: [
      'Spaceflight & Orbital Injection: Calculating Hohmann transfer burns and gravity assists for interplanetary probes (Voyager, Perseverance).',
      'GPS & Geostationary Satellites: Maintaining precise 24-hour circular orbits at 35,786 km altitude.',
      'Exoplanet Detection: Determining star-planet mass ratios using orbital velocity variations in radial velocity spectroscopy.'
    ],
    parameters: [
      { name: 'Star Mass (GM)', desc: 'Gravitational attraction strength of the central primary star.' },
      { name: 'Orbital Presets', desc: 'Preconfigured initial positions and velocities for circular, elliptical, and hyperbolic escape orbits.' },
      { name: 'Equal Area Sectors', desc: 'Visual wedges swept out by the radius vector in equal time increments Δt (Kepler’s 2nd Law).' },
      { name: 'Engine Thrust (Δv)', desc: 'Fire prograde or retrograde propulsion burns to adjust orbital eccentricity in real time.' }
    ],
    missions: [
      {
        id: 'ko-1',
        title: 'Kepler’s 2nd Law Demonstration',
        text: 'Enable "Equal Area Sectors" on an elliptical orbit. Notice that the fat, short wedge at apoapsis (far away) has the exact same area as the thin, long wedge at periapsis (close in).'
      },
      {
        id: 'ko-2',
        title: 'Hohmann Orbit Raising',
        text: 'Select "Circular Orbit". When the craft reaches the lowest point, apply small forward engine thrust (+Δv) to raise the apoapsis into a higher elliptical transfer orbit.'
      },
      {
        id: 'ko-3',
        title: 'Escape Velocity Breakthrough',
        text: 'Apply continuous thrust until current velocity v exceeds the local escape speed √(2GM/r). Observe the orbit unbind into an open hyperbola!'
      }
    ]
  },

  'bayes-theorem': {
    difficulty: 'Intermediate',
    realWorldApps: [
      'Medical Diagnostic Screening: Why a 99% accurate test for a rare disease (1 in 1,000) produces more false positives than true positives.',
      'Bayesian Spam Filtering: Continuously updating the posterior probability that an email is spam given suspicious token frequencies.',
      'Autonomous Driving Sensor Fusion: Updating obstacle presence beliefs using noisy radar, lidar, and camera feeds.'
    ],
    parameters: [
      { name: 'Base Rate / Disease Prevalence P(D)', desc: 'Prior probability of having the condition in the general population.' },
      { name: 'Test Sensitivity P(+|D)', desc: 'Probability the test correctly returns positive when the condition is present (True Positive Rate).' },
      { name: 'Test Specificity P(-|~D)', desc: 'Probability the test correctly returns negative when healthy (1 - False Positive Rate).' },
      { name: 'Population Mosaic Grid', desc: '10,000 individual simulated patients color-coded by True Positives, False Positives, and Healthy.' }
    ],
    missions: [
      {
        id: 'bt-1',
        title: 'The Base Rate Fallacy',
        text: 'Set Prevalence to 1.0%, Sensitivity to 95%, and Specificity to 95%. Notice that despite 95% accuracy, if you test positive, you only have ~16% chance of having the condition!'
      },
      {
        id: 'bt-2',
        title: 'The Power of High Specificity',
        text: 'With Prevalence at 1.0%, raise Specificity from 95% to 99.5%. Observe how drastically reducing False Positives skyrockets posterior certainty.'
      },
      {
        id: 'bt-3',
        title: 'Universal Prevalence Scenario',
        text: 'Increase Prevalence to 50% (like a coin flip). Observe how posterior probability P(D|+) now closely mirrors the raw test sensitivity.'
      }
    ]
  },

  'neural-network': {
    difficulty: 'Advanced',
    realWorldApps: [
      'Computer Vision & Object Detection: Learning non-linear geometric decision boundaries across high-dimensional feature spaces.',
      'Fraud Detection: Classifying fraudulent versus genuine banking transactions from sparse tabular data.',
      'Speech Recognition: Segmenting acoustic phonemes through multi-layer perceptron feature maps.'
    ],
    parameters: [
      { name: 'Dataset Topology', desc: '2D benchmark classification challenge: Concentric Circles, XOR Four Quadrants, Two Moons, or Twin Spirals.' },
      { name: 'Hidden Neurons', desc: 'Number of hidden layer ReLU/Sigmoid activation units that assemble piecewise-linear decision boundaries.' },
      { name: 'Learning Rate (η)', desc: 'Step size taken along the negative loss gradient during backpropagation.' },
      { name: 'Batch & Training Loop', desc: 'Live stochastic gradient descent loop adjusting synaptic weights W and biases b at 60 FPS.' }
    ],
    missions: [
      {
        id: 'nn-1',
        title: 'Solve Non-Linear XOR',
        text: 'Select the "XOR" dataset. Start training with 4 hidden neurons and watch the linear decision planes bend to separate the opposite diagonal clusters.'
      },
      {
        id: 'nn-2',
        title: 'Concentric Circles Enclosure',
        text: 'Select "Concentric Circles". Train with 6 neurons and observe how multiple half-spaces intersect to form a closed circular decision boundary.'
      },
      {
        id: 'nn-3',
        title: 'Learning Rate Instability',
        text: 'Set learning rate to maximum (> 0.5) and observe weight oscillation or divergence, then drop it to 0.05 for smooth gradient descent convergence.'
      }
    ]
  },

  'big-o': {
    difficulty: 'Foundational',
    realWorldApps: [
      'Software Architecture & Scalability: Choosing O(n log n) sorting over O(n²) when scaling from 1,000 items to 100,000,000 records.',
      'Database Indexing: Why B-Trees maintain O(log n) lookups across multi-terabyte SQL databases.',
      'Cryptography: Exploiting exponential O(2^n) complexity to ensure cryptographic keys cannot be brute-forced before heat death of the universe.'
    ],
    parameters: [
      { name: 'Input Size N', desc: 'Number of elements processed by the algorithm (from N=10 to N=1,000).' },
      { name: 'Complexity Curves', desc: 'Plots comparing O(1) Constant, O(log n) Logarithmic, O(n) Linear, O(n log n) Linearithmic, and O(n²) Quadratic growth.' },
      { name: 'Live Sorting Arena', desc: 'Simultaneous visual race between Linear Search, Binary Search, and Bubble Sort.' }
    ],
    missions: [
      {
        id: 'bo-1',
        title: 'Quadratic Explosion',
        text: 'Increase N from 10 to 100. Notice that while Linear time grows 10x, Quadratic time grows 100x (10²), rocketing completely off the chart!'
      },
      {
        id: 'bo-2',
        title: 'The Binary Search Miracle',
        text: 'Run the search race with N=500. Observe Binary Search find the target in ~9 operations while Linear Search takes up to 500 steps.'
      },
      {
        id: 'bo-3',
        title: 'Logarithmic Plateau',
        text: 'Observe the O(log n) curve at high N. Notice how it flattens into an almost horizontal line, demonstrating why divide-and-conquer is so powerful.'
      }
    ]
  },

  'circle-area': {
    difficulty: 'Foundational',
    realWorldApps: [
      'Calculus Foundations: Archimedes’ method of exhaustion laid the groundwork for Riemann integral sums 2,000 years later.',
      'CNC Machining & Polygon Meshes: Approximating curved surfaces with finite triangular mesh facets in 3D graphics rendering.',
      'Civil Engineering & Hydraulics: Calculating flow capacity and wetted perimeter of circular drainage pipes.'
    ],
    parameters: [
      { name: 'Radius r', desc: 'Radius of the circle from center to outer boundary.' },
      { name: 'Polygon Slices N', desc: 'Number of inscribed/circumscribed polygon triangles sliced into wedge sectors.' },
      { name: 'Unroll Wedge Mode', desc: 'Rearranges circular wedge sectors into an alternating parallelogram of length πr and height r.' }
    ],
    missions: [
      {
        id: 'ca-1',
        title: 'Archimedes Exhaustion',
        text: 'Start with N=4 (a square). Note the large gap between polygon area and true πr². Increase N to 12, 24, and 64 to see the error vanish.'
      },
      {
        id: 'ca-2',
        title: 'Parallelogram Unrolling Proof',
        text: 'Toggle the unrolled sector visualization. Notice how the alternating teeth form a rectangle with base = circumference/2 = πr and height = r, yielding A = πr².'
      },
      {
        id: 'ca-3',
        title: 'Approximating Pi',
        text: 'Set N=96 (Archimedes’ famous calculation) and inspect the computed perimeter ratio to witness π approximated to 3.141.'
      }
    ]
  },

  'euclidean-gcd': {
    difficulty: 'Foundational',
    realWorldApps: [
      'RSA Public Key Cryptography: Finding modular multiplicative inverses via the Extended Euclidean Algorithm.',
      'Aspect Ratios & Display Scaling: Simplifying screen resolution ratios (e.g., 3840x2160 simplifies to 16:9).',
      'Music Rhythm & Polyrhythms: Generating Euclidean rhythms used in world music and algorithmic composition.'
    ],
    parameters: [
      { name: 'Integer A & B', desc: 'The two dimensions forming an A × B rectangle to be tiled by identical largest squares.' },
      { name: 'Step-by-Step Tiling', desc: 'Recursive geometric square extraction where each step tiles max squares of size min(a,b).' }
    ],
    missions: [
      {
        id: 'eg-1',
        title: 'Square Tiling Proof',
        text: 'Input A=120 and B=45. Watch the algorithm tile two 45×45 squares, leaving a 45×30 rectangle, then tile one 30×30 square, leaving a 30×15 rectangle tiled by two 15×15 squares (GCD = 15).'
      },
      {
        id: 'eg-2',
        title: 'Coprime Numbers',
        text: 'Test two consecutive Fibonacci numbers (e.g., A=89, B=55). Notice that because they are coprime, the final square tile has size 1.'
      },
      {
        id: 'eg-3',
        title: 'Worst-Case Euclidean Run',
        text: 'Observe why Fibonacci numbers represent Lamé’s Theorem worst-case scenario requiring the maximum number of recursive division steps.'
      }
    ]
  },

  'harmonic-wave': {
    difficulty: 'Intermediate',
    realWorldApps: [
      'Acoustics & Musical Instruments: Standing wave nodes and antinodes in guitar strings, flute air columns, and organ pipes.',
      'RF Antennas & Transmission Lines: Preventing destructive standing wave voltage ratios (VSWR) in wireless communications.',
      'Noise-Canceling Headphones: Producing exact 180° out-of-phase anti-sound waves to cancel ambient noise through destructive interference.'
    ],
    parameters: [
      { name: 'Amplitude A', desc: 'Maximum displacement from the equilibrium resting centerline.' },
      { name: 'Wavelength λ', desc: 'Spatial distance between consecutive crests or troughs.' },
      { name: 'Frequency f (or ω)', desc: 'Number of wave oscillations per second.' },
      { name: 'Wave Mode', desc: 'Switch between Traveling Sinusoidal Wave, Standing Wave (fixed boundaries), and Two-Wave Superposition.' }
    ],
    missions: [
      {
        id: 'hw-1',
        title: 'Standing Wave Nodes',
        text: 'Switch to "Standing Wave" mode. Notice the stationary nodes where displacement is permanently zero despite high vibrating energy around them.'
      },
      {
        id: 'hw-2',
        title: 'Destructive Interference',
        text: 'Switch to "Superposition" mode. Set the phase offset to 180° (π radians). Watch the two identical waves completely cancel into a flat silent line!'
      },
      {
        id: 'hw-3',
        title: 'Constructive Interference',
        text: 'Align the phase difference to 0°. Observe how the combined wave amplitude instantly doubles to 2A through constructive reinforcement.'
      }
    ]
  },

  'unit-circle': {
    difficulty: 'Foundational',
    realWorldApps: [
      'Game Development & 3D Graphics: Calculating vector directions, character rotations, and projectile trajectories via sin and cos.',
      'AC Electrical Circuit Analysis: Representing alternating voltage and current as rotating phasors in the complex plane.',
      'Robotics Kinematics: Computing forward kinematics and end-effector joint angle positioning.'
    ],
    parameters: [
      { name: 'Angle θ', desc: 'Current rotation angle measured counter-clockwise from positive x-axis in radians and degrees.' },
      { name: 'Special Radians (π/6, π/4, π/3, π/2)', desc: 'Snap to exact trigonometric reference angles with exact square root values.' },
      { name: 'Trig Projections', desc: 'Toggle visual color-coded projections of Sine (vertical), Cosine (horizontal), and Tangent.' }
    ],
    missions: [
      {
        id: 'uc-1',
        title: 'Pythagorean Trig Identity',
        text: 'Drag the angle pointer around the circle. Notice that no matter where the point moves, the right triangle legs always satisfy x² + y² = cos²θ + sin²θ = 1.'
      },
      {
        id: 'uc-2',
        title: 'Tangent Asymptotes',
        text: 'Approach θ = 90° (π/2) and 270° (3π/2). Observe the tangent projection line explode toward positive and negative infinity.'
      },
      {
        id: 'uc-3',
        title: 'Quadrant Signs',
        text: 'Rotate into Quadrant II (90° - 180°). Observe why Cosine becomes negative while Sine remains positive.'
      }
    ]
  },

  'derivative': {
    difficulty: 'Intermediate',
    realWorldApps: [
      'Machine Learning Gradient Descent: Computing loss function derivatives to update millions of neural network weights.',
      'Vehicle Cruise Control: Measuring vehicle acceleration as the second time derivative of position to throttle engines smoothly.',
      'Financial Portfolio Optimization: Calculating marginal utility and Greeks (Delta, Gamma) in options trading.'
    ],
    parameters: [
      { name: 'Function f(x)', desc: 'Target curves to differentiate (Quadratic x², Sinusoidal 2 sin x, or Cubic 0.2 x³).' },
      { name: 'Evaluation Point x₀', desc: 'The horizontal coordinate where tangent slope is being analyzed.' },
      { name: 'Secant Step Size h', desc: 'The interval step Δx between x and x+h. As h → 0, the secant line converges to the true tangent.' }
    ],
    missions: [
      {
        id: 'dr-1',
        title: 'Secant Snapping to Tangent',
        text: 'Set x=1.5 on f(x)=x². With h=2.0, observe the secant slope differs noticeably. Slide h down toward 0.01 and watch the red secant line snap onto the green true tangent (slope = 3.0).'
      },
      {
        id: 'dr-2',
        title: 'Zero Derivative at Extrema',
        text: 'Switch to f(x) = 2 sin(x). Move x to π/2 (~1.57). Observe the tangent line become completely horizontal with slope = 0 at the crest peak.'
      },
      {
        id: 'dr-3',
        title: 'Negative Slope in Downward Slopes',
        text: 'On the sine curve, move x to 2.5. Observe the negative tangent slope corresponding to the falling curve.'
      }
    ]
  },

  'pythagorean': {
    difficulty: 'Foundational',
    realWorldApps: [
      'GPS & Triangulation: Computing direct Euclidean line-of-sight distance between satellites and mobile receivers in 3D.',
      'Construction & Carpentry: The 3-4-5 rule used for thousands of years to guarantee perfectly perpendicular 90° foundation corners.',
      'Computer Graphics: Distance calculations, collision bounding box detection, and normal vector normalization.'
    ],
    parameters: [
      { name: 'Leg a', desc: 'Length of the horizontal base leg of the right-angled triangle.' },
      { name: 'Leg b', desc: 'Length of the vertical perpendicular leg.' },
      { name: 'Geometric Squares Mode', desc: 'Constructs physical squares on all 3 sides with area a², b², and hypotenuse square c².' }
    ],
    missions: [
      {
        id: 'pt-1',
        title: 'Classic 3-4-5 Pythagorean Triple',
        text: 'Adjust leg a to 3 and leg b to 4. Verify that area a²=9 and area b²=16 sum exactly to hypotenuse area c²=25 (c=5).'
      },
      {
        id: 'pt-2',
        title: 'Isosceles 45-45-90 Triangle',
        text: 'Set both legs a and b to 5. Notice the hypotenuse is exactly 5√2 (~7.07), with hypotenuse area 50 = 25 + 25.'
      },
      {
        id: 'pt-3',
        title: 'Euclid’s Area Conservation',
        text: 'Watch the dynamic area readout as you smoothly drag leg a. Notice how area a² + area b² never deviates from c² by even 0.001 units.'
      }
    ]
  },

  'quadratic': {
    difficulty: 'Foundational',
    realWorldApps: [
      'Trajectory & Ballistics: Calculating maximum projectile height and range under uniform gravitational acceleration.',
      'Parabolic Mirrors & Satellite Dishes: The geometric property where all incoming parallel signals reflect directly into the single focal point.',
      'Economics & Profit Maximization: Finding the vertex of quadratic revenue and cost functions to maximize profit.'
    ],
    parameters: [
      { name: 'Leading Coefficient a', desc: 'Controls curvature and direction (a > 0 opens upward, a < 0 opens downward).' },
      { name: 'Linear Coefficient b', desc: 'Shifts the vertex along the horizontal axis of symmetry x = -b/(2a).' },
      { name: 'Constant Term c', desc: 'The vertical y-intercept where the parabola crosses x = 0.' }
    ],
    missions: [
      {
        id: 'qd-1',
        title: 'Discriminant Phase Transitions',
        text: 'Start with 2 real roots (Δ > 0). Adjust c upward until the parabola touches the x-axis at exactly 1 vertex point (Δ = 0), then crosses above into complex conjugate roots (Δ < 0).'
      },
      {
        id: 'qd-2',
        title: 'Parabolic Inversion',
        text: 'Flip coefficient a from +1 to -1. Watch the parabola invert from a valley with a minimum into a mountain peak with a maximum.'
      },
      {
        id: 'qd-3',
        title: 'Axis of Symmetry Tracking',
        text: 'Adjust b while keeping a constant. Observe how the dashed line of symmetry x = -b/(2a) tracks the vertex coordinate.'
      }
    ]
  },

  'matrix-transform': {
    difficulty: 'Intermediate',
    realWorldApps: [
      '3D Game Engines: World, View, and Projection transformation pipelines in DirectX, Vulkan, and WebGL.',
      'Robotics Coordinate Frames: Transforming sensor frames to end-effector coordinates via homogeneous transformation matrices.',
      'Computer Vision & Homography: Correcting perspective skew and lens distortion in camera feeds.'
    ],
    parameters: [
      { name: 'Basis Vector î (a, c)', desc: 'Where the standard unit x-vector (1, 0) lands after transformation.' },
      { name: 'Basis Vector ĵ (b, d)', desc: 'Where the standard unit y-vector (0, 1) lands after transformation.' },
      { name: 'Matrix Presets', desc: 'Pre-configured transformations: Pure 45° Rotation, Non-Uniform Shear, Reflection, and Singular Projection (det = 0).' }
    ],
    missions: [
      {
        id: 'mt-1',
        title: 'Geometric Meaning of Determinant',
        text: 'Notice the shaded unit square. Observe that |det(A)| represents the exact area scaling factor of the deformed parallelogram.'
      },
      {
        id: 'mt-2',
        title: 'Singular Matrix & Dimensional Collapse',
        text: 'Select the "Singular / Projection" preset where det(A) = 0. Notice the 2D plane collapses into a single 1D line, losing information permanently.'
      },
      {
        id: 'mt-3',
        title: 'Negative Determinant & Orientation Reversal',
        text: 'Select "Reflection". Notice the determinant becomes negative, indicating that the orientation has flipped (a left-handed coordinate system).'
      }
    ]
  },

  'projectile-motion': {
    difficulty: 'Foundational',
    realWorldApps: [
      'Aerospace & Artillery: Computing ballistic trajectories, aerodynamic drag corrections, and launch angles.',
      'Sports Science: Optimizing launch angle in basketball 3-point shots, golf drives, and javelin throws.',
      'Cinematography & FX: Simulating natural physics particles (water fountains, debris, fireworks) in visual effects.'
    ],
    parameters: [
      { name: 'Launch Velocity v₀', desc: 'Initial muzzle exit speed of the projectile in meters per second.' },
      { name: 'Launch Angle θ', desc: 'Angle above the horizontal ground from 0° to 90°.' },
      { name: 'Gravity g', desc: 'Gravitational acceleration (Earth 9.8 m/s², Moon 1.6 m/s², Mars 3.7 m/s²).' },
      { name: 'Velocity Decomposition Vectors', desc: 'Display horizontal vx (constant) and vertical vy (decelerated by g) component vectors.' }
    ],
    missions: [
      {
        id: 'pm-1',
        title: 'Maximum Range at 45°',
        text: 'Launch at 30°, 45°, and 60° with identical speed. Notice that 45° achieves the maximum horizontal range R = (v₀² sin 2θ)/g on flat ground.'
      },
      {
        id: 'pm-2',
        title: 'Complementary Launch Angles',
        text: 'Compare launches at 30° and 60°. Observe that complementary angles (θ and 90°-θ) land at the exact same horizontal distance, though 60° spends longer in the air!'
      },
      {
        id: 'pm-3',
        title: 'Low Gravity on the Moon',
        text: 'Switch gravity to the Moon (1.6 m/s²). Launch at 45° and marvel at the massive trajectory expansion.'
      }
    ]
  },

  'snells-law': {
    difficulty: 'Intermediate',
    realWorldApps: [
      'Fiber Optic Telecommunications: Total internal reflection enables transoceanic light pulses to travel thousands of kilometers with negligible loss.',
      'Optometry & Camera Lenses: Designing compound multi-element lenses to eliminate chromatic and spherical aberrations.',
      'Gemology: Why diamond’s ultra-high refractive index (n=2.42) causes total internal reflection and brilliant sparkle.'
    ],
    parameters: [
      { name: 'Medium 1 Refractive Index (n₁)', desc: 'Optical density of incident medium (Air = 1.0, Water = 1.33, Glass = 1.5, Diamond = 2.42).' },
      { name: 'Medium 2 Refractive Index (n₂)', desc: 'Optical density of refracting medium across the boundary interface.' },
      { name: 'Incident Angle θ₁', desc: 'Angle of incoming laser ray relative to the surface normal line.' }
    ],
    missions: [
      {
        id: 'sl-1',
        title: 'Refraction Toward the Normal',
        text: 'Set Medium 1 to Air (n=1.0) and Medium 2 to Glass (n=1.5). Notice that moving into an optically denser medium bends light toward the vertical normal line (θ₂ < θ₁).'
      },
      {
        id: 'sl-2',
        title: 'Find the Critical Angle',
        text: 'Reverse the media: set Medium 1 to Glass (n=1.5) and Medium 2 to Air (n=1.0). Increase incident angle to ~41.8° to watch the refracted ray graze the boundary at 90°.'
      },
      {
        id: 'sl-3',
        title: 'Total Internal Reflection in Action',
        text: 'Increase angle beyond the critical angle (> 42°). Watch 100% of light reflect back into the glass with zero light escaping into air — the exact principle powering high-speed internet fiber optics!'
      }
    ]
  },

  'lorentz-dilation': {
    difficulty: 'Advanced',
    realWorldApps: [
      'GPS Satellite Clock Synchronization: GPS satellite atomic clocks run ~7 microseconds slower per day due to special relativistic speed (plus general relativity blueshift).',
      'Muon Atmospheric Penetration: Atmospheric muons with half-life of 2.2 microseconds reach sea level because their high speed dilates their internal clock by a factor of 30+.',
      'Particle Accelerators (CERN LHC): Protons accelerated to 0.999999991c experience time dilation factors exceeding γ = 7,000.'
    ],
    parameters: [
      { name: 'Velocity Ratio (v/c)', desc: 'Speed of moving light clock expressed as a fraction of the speed of light c.' },
      { name: 'Rest vs Moving Clock View', desc: 'Side-by-side comparison of stationary vertical bounce vs moving triangular photon path.' },
      { name: 'Lorentz Factor γ', desc: 'Time dilation multiplier γ = 1 / √(1 - v²/c²).' }
    ],
    missions: [
      {
        id: 'ld-1',
        title: 'Everyday Speeds vs Relativistic Speeds',
        text: 'Set velocity to 0.1c (30,000 km/s). Notice the Lorentz factor γ is only 1.005 — time dilation is virtually undetectable at non-relativistic speeds.'
      },
      {
        id: 'ld-2',
        title: 'The 0.866c Half-Speed Point',
        text: 'Increase velocity to v = 0.866c. Notice γ hits exactly 2.0: moving time ticks twice as slow as stationary observer time!'
      },
      {
        id: 'ld-3',
        title: 'Approaching the Light Barrier',
        text: 'Slide velocity to 0.99c. Observe the photon trace an immense diagonal zig-zag as γ skyrockets past 7.0, illustrating why nothing with mass can reach c.'
      }
    ]
  },

  'lagrange-multipliers': {
    difficulty: 'Advanced',
    realWorldApps: [
      'Microeconomic Consumer Utility: Maximizing satisfaction utility U(x,y) subject to a strict household budget constraint Px·x + Py·y = B.',
      'Structural Engineering: Minimizing structural weight subject to minimum load stress and deflection safety constraints.',
      'Support Vector Machines (SVM): Finding maximum margin separating hyperplanes in machine learning via Lagrange duality.'
    ],
    parameters: [
      { name: 'Objective Function f(x,y)', desc: 'Paraboloid height surface being maximized or minimized (level curves plotted in blue).' },
      { name: 'Constraint Function g(x,y) = c', desc: 'The allowable boundary path (circle or line) plotted in amber.' },
      { name: 'Gradient Vectors ∇f & ∇g', desc: 'Normal gradient arrows showing the condition ∇f = λ∇g where level curves touch tangentially.' }
    ],
    missions: [
      {
        id: 'lm-1',
        title: 'Tangency Condition Verification',
        text: 'Move along the constraint boundary until you reach the optimal point. Observe that at the optimum, the objective contour curve and the constraint curve are perfectly tangent!'
      },
      {
        id: 'lm-2',
        title: 'Collinear Gradients',
        text: 'Notice the arrows ∇f (objective gradient) and ∇g (constraint gradient). At the extreme points, they point in exactly the same or opposite direction (collinear).'
      },
      {
        id: 'lm-3',
        title: 'Interpreting the Multiplier λ',
        text: 'Notice the scalar multiplier λ is the ratio of gradient magnitudes: ||∇f|| / ||∇g||, representing the shadow price of relaxing the constraint.'
      }
    ]
  },

  'cosine-similarity': {
    difficulty: 'Intermediate',
    realWorldApps: [
      'LLM Vector Search & Retrieval (RAG): Matching user questions to semantic document chunks in vector databases (Pinecone, Chroma).',
      'Recommendation Engines: Finding similar movies, songs, or products based on embedding dot products in collaborative filtering.',
      'Facial Recognition: Comparing face embedding vectors to gallery identities under varying lighting conditions.'
    ],
    parameters: [
      { name: 'Vector A (u)', desc: 'First embedding vector defined by coordinates (x₁, y₁) or angle and magnitude.' },
      { name: 'Vector B (v)', desc: 'Second embedding vector defined by coordinates (x₂, y₂).' },
      { name: 'Metric Comparison', desc: 'Compare Cosine Similarity cos(θ) vs Euclidean Distance ||u - v||.' }
    ],
    missions: [
      {
        id: 'cs-1',
        title: 'Magnitude Invariance',
        text: 'Keep Vector A and Vector B pointing in the same direction, but double the length of Vector A. Notice that Euclidean distance changes, but Cosine Similarity stays exactly 1.0!'
      },
      {
        id: 'cs-2',
        title: 'Orthogonal Semantic Independence',
        text: 'Rotate Vector B until it is perpendicular (90°) to Vector A. Observe cos(90°) = 0, indicating zero semantic correlation between concepts.'
      },
      {
        id: 'cs-3',
        title: 'Opposite Semantic Vectors',
        text: 'Rotate Vector B to 180° opposite to Vector A. Notice Cosine Similarity reaches -1.0, representing exact semantic opposites.'
      }
    ]
  },

  'normal-dist': {
    difficulty: 'Foundational',
    realWorldApps: [
      'Six Sigma & Quality Control: Ensuring manufacturing defect rates remain below 3.4 parts per million (within ±6 standard deviations).',
      'Finance & Risk Modeling: Value at Risk (VaR) modeling and portfolio asset return distributions.',
      'Standardized Testing & Psychometrics: Normalizing IQ tests (μ=100, σ=15) and SAT/GRE percentiles across national populations.'
    ],
    parameters: [
      { name: 'Mean μ', desc: 'The center location of the bell curve where probability density peaks.' },
      { name: 'Standard Deviation σ', desc: 'The spread or width of the distribution (larger σ = wider, flatter curve).' },
      { name: 'Integral Interval [a, b]', desc: 'The shaded region under the curve computing cumulative probability P(a ≤ X ≤ b).' }
    ],
    missions: [
      {
        id: 'nd-1',
        title: 'The 68-95-99.7 Empirical Rule',
        text: 'Set the interval to [μ - σ, μ + σ] and verify that exactly ~68.2% of the total distribution area is enclosed. Then expand to ±2σ to see ~95.4%, and ±3σ to see ~99.7%.'
      },
      {
        id: 'nd-2',
        title: 'Area Conservation Under Spread Change',
        text: 'Increase standard deviation σ from 1 to 2.5. Notice how the bell curve flattens while preserving total integral area equal to exactly 1.0 (100%).'
      },
      {
        id: 'nd-3',
        title: 'Left & Right Tail Probabilities',
        text: 'Position interval from -∞ to μ - 2σ. Observe the tiny ~2.2% tail probability corresponding to extreme outliers.'
      }
    ]
  }
};
