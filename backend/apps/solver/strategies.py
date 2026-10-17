import math
from .base import BaseSolverStrategy

class QuadraticSolver(BaseSolverStrategy):
    slug = 'quadratic-equation'
    title = 'Quadratic Equation Solver'
    formula_latex = r'ax^2 + bx + c = 0 \implies x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}'
    inputs_schema = [
        {'id': 'a', 'label': 'Coefficient a', 'default': 1, 'type': 'number'},
        {'id': 'b', 'label': 'Coefficient b', 'default': -5, 'type': 'number'},
        {'id': 'c', 'label': 'Coefficient c', 'default': 6, 'type': 'number'},
    ]

    def calculate(self, inputs: dict) -> dict:
        try:
            a = float(inputs.get('a', 1))
            b = float(inputs.get('b', -5))
            c = float(inputs.get('c', 6))
        except (ValueError, TypeError):
            return {'success': False, 'error': 'Invalid numerical inputs'}

        if abs(a) < 1e-12:
            return {'success': False, 'error': 'Coefficient "a" cannot be zero in a quadratic equation.'}

        disc = b * b - 4 * a * c
        steps = [
            {
                'step': 1,
                'title': 'Identify Coefficients',
                'description': f'From {a}x² + ({b})x + ({c}) = 0, identify a = {a}, b = {b}, c = {c}.',
                'latex': f'a = {a},\\quad b = {b},\\quad c = {c}'
            },
            {
                'step': 2,
                'title': 'Compute Discriminant (Δ)',
                'description': f'Calculate Δ = b² - 4ac = ({b})² - 4({a})({c}) = {b*b} - {4*a*c} = {disc}.',
                'latex': f'\\Delta = b^2 - 4ac = ({b})^2 - 4({a})({c}) = {disc:.4g}'
            }
        ]

        if disc > 0:
            sqrt_d = math.sqrt(disc)
            x1 = (-b + sqrt_d) / (2 * a)
            x2 = (-b - sqrt_d) / (2 * a)
            steps.append({
                'step': 3,
                'title': 'Positive Discriminant (Two Real Roots)',
                'description': f'Since Δ > 0, the equation has two distinct real roots.',
                'latex': f'x_1 = \\frac{{-({b}) + {sqrt_d:.4g}}}{{2({a})}} = {x1:.4g},\\quad x_2 = \\frac{{-({b}) - {sqrt_d:.4g}}}{{2({a})}} = {x2:.4g}'
            })
            return {
                'success': True,
                'result': f'Two distinct real roots: x₁ = {x1:.4g}, x₂ = {x2:.4g} (Discriminant Δ = {disc:.4g})',
                'steps': steps,
                'calculated_values': {'x1': round(x1, 4), 'x2': round(x2, 4), 'discriminant': round(disc, 4), 'type': 'two_real'}
            }
        elif abs(disc) < 1e-12:
            x = -b / (2 * a)
            steps.append({
                'step': 3,
                'title': 'Zero Discriminant (One Repeated Real Root)',
                'description': 'Since Δ = 0, the parabola touches the x-axis at exactly one point (the vertex).',
                'latex': f'x = \\frac{{-({b})}}{{2({a})}} = {x:.4g}'
            })
            return {
                'success': True,
                'result': f'One repeated real root: x = {x:.4g} (Discriminant Δ = 0)',
                'steps': steps,
                'calculated_values': {'x1': round(x, 4), 'x2': round(x, 4), 'discriminant': 0.0, 'type': 'repeated_real'}
            }
        else:
            sqrt_neg_d = math.sqrt(-disc)
            real_part = -b / (2 * a)
            imag_part = sqrt_neg_d / (2 * a)
            steps.append({
                'step': 3,
                'title': 'Negative Discriminant (Complex Conjugate Roots)',
                'description': 'Since Δ < 0, there are no real x-intercepts. The solutions are a pair of complex conjugates.',
                'latex': f'x = {real_part:.4g} \\pm {abs(imag_part):.4g}i'
            })
            return {
                'success': True,
                'result': f'Two complex conjugate roots: {real_part:.4g} ± {abs(imag_part):.4g}i (Discriminant Δ = {disc:.4g})',
                'steps': steps,
                'calculated_values': {'real': round(real_part, 4), 'imag': round(abs(imag_part), 4), 'discriminant': round(disc, 4), 'type': 'complex'}
            }


class CircleAreaSolver(BaseSolverStrategy):
    slug = 'circle-area'
    title = 'Circle Area & Circumference Solver'
    formula_latex = r'A = \pi r^2,\quad C = 2\pi r,\quad d = 2r'
    inputs_schema = [
        {'id': 'r', 'label': 'Radius r', 'default': 5, 'type': 'number'},
    ]

    def calculate(self, inputs: dict) -> dict:
        try:
            r = float(inputs.get('r', 5))
        except (ValueError, TypeError):
            return {'success': False, 'error': 'Radius must be a valid number'}

        if r < 0:
            return {'success': False, 'error': 'Radius cannot be negative'}

        area = math.pi * r * r
        circ = 2 * math.pi * r
        d = 2 * r

        steps = [
            {
                'step': 1,
                'title': 'Diameter Calculation',
                'description': f'Diameter is twice the radius: d = 2 × {r} = {d}.',
                'latex': f'd = 2r = 2 \\times {r} = {d:.4g}'
            },
            {
                'step': 2,
                'title': 'Circumference (Perimeter)',
                'description': f'Circumference measures the boundary: C = 2πr = 2 × π × {r} ≈ {circ:.4g}.',
                'latex': f'C = 2\\pi r = 2 \\times \\pi \\times {r} \\approx {circ:.4g}'
            },
            {
                'step': 3,
                'title': 'Area Calculation',
                'description': f'Area grows quadratically with radius: A = πr² = π × ({r})² = {r*r}π ≈ {area:.4g}.',
                'latex': f'A = \\pi r^2 = \\pi \\times ({r})^2 \\approx {area:.4g}'
            }
        ]

        return {
            'success': True,
            'result': f'Area = {area:.4g} sq units | Circumference = {circ:.4g} units | Diameter = {d:.4g}',
            'steps': steps,
            'calculated_values': {'area': round(area, 4), 'circumference': round(circ, 4), 'diameter': round(d, 4)}
        }


class PythagoreanSolver(BaseSolverStrategy):
    slug = 'pythagorean-theorem'
    title = 'Pythagorean Hypotenuse & Triangle Solver'
    formula_latex = r'a^2 + b^2 = c^2 \implies c = \sqrt{a^2 + b^2}'
    inputs_schema = [
        {'id': 'a', 'label': 'Leg side a', 'default': 3, 'type': 'number'},
        {'id': 'b', 'label': 'Leg side b', 'default': 4, 'type': 'number'},
    ]

    def calculate(self, inputs: dict) -> dict:
        try:
            a = float(inputs.get('a', 3))
            b = float(inputs.get('b', 4))
        except (ValueError, TypeError):
            return {'success': False, 'error': 'Side lengths must be valid numbers'}

        if a <= 0 or b <= 0:
            return {'success': False, 'error': 'Triangle leg lengths must be positive numbers'}

        c_squared = a * a + b * b
        c = math.sqrt(c_squared)
        area = 0.5 * a * b
        angle_rad = math.atan2(b, a)
        angle_deg = math.degrees(angle_rad)

        steps = [
            {
                'step': 1,
                'title': 'Square the Perpendicular Legs',
                'description': f'Compute a² = ({a})² = {a*a} and b² = ({b})² = {b*b}.',
                'latex': f'a^2 = {a*a:.4g},\\quad b^2 = {b*b:.4g}'
            },
            {
                'step': 2,
                'title': 'Sum the Squares',
                'description': f'Add the areas of the squares on both legs: a² + b² = {a*a} + {b*b} = {c_squared}.',
                'latex': f'c^2 = a^2 + b^2 = {a*a:.4g} + {b*b:.4g} = {c_squared:.4g}'
            },
            {
                'step': 3,
                'title': 'Take the Square Root',
                'description': f'Hypotenuse c = √{c_squared} = {c:.4g}.',
                'latex': f'c = \\sqrt{{{c_squared:.4g}}} = {c:.4g}'
            },
            {
                'step': 4,
                'title': 'Compute Triangle Properties',
                'description': f'Right-triangle Area = 0.5 × a × b = {area:.4g}. Opposite angle θ = arctan(b/a) = {angle_deg:.2f}°.',
                'latex': f'\\text{{Area}} = \\frac{{1}}{{2}}ab = {area:.4g},\\quad \\theta = {angle_deg:.2f}^\\circ'
            }
        ]

        return {
            'success': True,
            'result': f'Hypotenuse c = {c:.4g} | Triangle Area = {area:.4g} | Angle θ = {angle_deg:.2f}°',
            'steps': steps,
            'calculated_values': {'hypotenuse': round(c, 4), 'area': round(area, 4), 'angle_deg': round(angle_deg, 2)}
        }


class EuclideanGcdSolver(BaseSolverStrategy):
    slug = 'gcd-lcm'
    title = 'Euclidean GCD & LCM Solver'
    formula_latex = r'a \cdot b = \gcd(a, b) \cdot \operatorname{lcm}(a, b)'
    inputs_schema = [
        {'id': 'a', 'label': 'Positive Integer a', 'default': 48, 'type': 'number'},
        {'id': 'b', 'label': 'Positive Integer b', 'default': 18, 'type': 'number'},
    ]

    def calculate(self, inputs: dict) -> dict:
        try:
            a = abs(int(inputs.get('a', 48)))
            b = abs(int(inputs.get('b', 18)))
        except (ValueError, TypeError):
            return {'success': False, 'error': 'Inputs must be whole integers'}

        if a == 0 and b == 0:
            return {'success': False, 'error': 'Both numbers cannot be zero'}

        orig_a, orig_b = a, b
        div_steps = []
        step_idx = 1

        curr_a, curr_b = a, b
        while curr_b != 0:
            q = curr_a // curr_b
            r = curr_a % curr_b
            div_steps.append({
                'step': step_idx,
                'title': f'Division Step {step_idx}',
                'description': f'{curr_a} = {curr_b} × {q} + {r} (remainder {r})',
                'latex': f'{curr_a} = {curr_b} \\times {q} + {r}'
            })
            curr_a, curr_b = curr_b, r
            step_idx += 1

        gcd = curr_a
        lcm = (orig_a * orig_b) // gcd if gcd != 0 else 0

        div_steps.append({
            'step': step_idx,
            'title': 'Calculate LCM from Identity',
            'description': f'Using a · b = gcd(a, b) · lcm(a, b): lcm = ({orig_a} × {orig_b}) / {gcd} = {lcm}.',
            'latex': f'\\operatorname{{lcm}}({orig_a}, {orig_b}) = \\frac{{{orig_a} \\times {orig_b}}}{{\\gcd({orig_a}, {orig_b})}} = {lcm}'
        })

        return {
            'success': True,
            'result': f'GCD({orig_a}, {orig_b}) = {gcd} | LCM({orig_a}, {orig_b}) = {lcm}',
            'steps': div_steps,
            'calculated_values': {'gcd': gcd, 'lcm': lcm}
        }


class CompoundInterestSolver(BaseSolverStrategy):
    slug = 'compound-interest'
    title = 'Compound Interest Calculator'
    formula_latex = r'A = P \left(1 + \frac{r}{n}\right)^{nt}'
    inputs_schema = [
        {'id': 'p', 'label': 'Principal P ($)', 'default': 1000, 'type': 'number'},
        {'id': 'r', 'label': 'Annual Rate r (%)', 'default': 6, 'type': 'number'},
        {'id': 'n', 'label': 'Compounds / Year n', 'default': 12, 'type': 'number'},
        {'id': 't', 'label': 'Time t (years)', 'default': 5, 'type': 'number'},
    ]

    def calculate(self, inputs: dict) -> dict:
        try:
            p = float(inputs.get('p', 1000))
            r_pct = float(inputs.get('r', 6))
            n = float(inputs.get('n', 12))
            t = float(inputs.get('t', 5))
        except (ValueError, TypeError):
            return {'success': False, 'error': 'Invalid numerical inputs'}

        if p <= 0 or n <= 0 or t < 0:
            return {'success': False, 'error': 'Principal and compounding frequency must be positive'}

        r = r_pct / 100.0
        base = 1 + (r / n)
        if base <= 0:
            return {'success': False, 'error': 'Rate and compounding frequency produce a non-positive base.'}
        exponent = n * t
        try:
            a = p * math.pow(base, exponent)
            interest = a - p
        except OverflowError:
            return {'success': False, 'error': 'Calculated future value exceeds computational numerical limits.'}


        steps = [
            {
                'step': 1,
                'title': 'Convert Interest Rate to Decimal',
                'description': f'Annual rate r = {r_pct}% = {r}. Periodic rate = r / n = {r} / {n} = {r/n:.6f}.',
                'latex': f'\\frac{{r}}{{n}} = \\frac{{{r}}}{{{n}}} = {r/n:.6f}'
            },
            {
                'step': 2,
                'title': 'Total Number of Compounding Periods',
                'description': f'Total compounding cycles = n × t = {n} × {t} = {exponent:.0f} periods.',
                'latex': f'nt = {n} \\times {t} = {exponent:.0f}'
            },
            {
                'step': 3,
                'title': 'Evaluate Future Amount',
                'description': f'A = {p} × (1 + {r/n:.6f})^{exponent:.0f} = ${a:.2f}. Total interest = ${interest:.2f}.',
                'latex': f'A = {p} \\left(1 + {r/n:.6f}\\right)^{{{exponent:.0f}}} = \\${a:.2f}'
            }
        ]

        return {
            'success': True,
            'result': f'Final Amount A = ${a:.2f} (Total Interest Earned = ${interest:.2f})',
            'steps': steps,
            'calculated_values': {'final_amount': round(a, 2), 'interest_earned': round(interest, 2)}
        }


class LinearSystemSolver(BaseSolverStrategy):
    slug = 'linear-system-2x2'
    title = '2×2 Linear System (Cramer’s Rule)'
    formula_latex = r'\begin{cases} a_1x + b_1y = c_1 \\ a_2x + b_2y = c_2 \end{cases} \implies x = \frac{D_x}{D},\quad y = \frac{D_y}{D}'
    inputs_schema = [
        {'id': 'a1', 'label': 'a₁ (x coeff)', 'default': 2, 'type': 'number'},
        {'id': 'b1', 'label': 'b₁ (y coeff)', 'default': 3, 'type': 'number'},
        {'id': 'c1', 'label': 'c₁ (constant)', 'default': 8, 'type': 'number'},
        {'id': 'a2', 'label': 'a₂ (x coeff)', 'default': 1, 'type': 'number'},
        {'id': 'b2', 'label': 'b₂ (y coeff)', 'default': -1, 'type': 'number'},
        {'id': 'c2', 'label': 'c₂ (constant)', 'default': -1, 'type': 'number'},
    ]

    def calculate(self, inputs: dict) -> dict:
        try:
            a1 = float(inputs.get('a1', 2))
            b1 = float(inputs.get('b1', 3))
            c1 = float(inputs.get('c1', 8))
            a2 = float(inputs.get('a2', 1))
            b2 = float(inputs.get('b2', -1))
            c2 = float(inputs.get('c2', -1))
        except (ValueError, TypeError):
            return {'success': False, 'error': 'Invalid numerical inputs'}

        D = a1 * b2 - a2 * b1
        Dx = c1 * b2 - c2 * b1
        Dy = a1 * c2 - a2 * c1

        steps = [
            {
                'step': 1,
                'title': 'Formulate Coefficient Determinant D',
                'description': f'D = a₁b₂ - a₂b₁ = ({a1})({b2}) - ({a2})({b1}) = {a1*b2} - {a2*b1} = {D:.4g}.',
                'latex': f'D = \\begin{{vmatrix}} {a1} & {b1} \\\\ {a2} & {b2} \\end{{vmatrix}} = ({a1})({b2}) - ({a2})({b1}) = {D:.4g}'
            }
        ]

        if abs(D) < 1e-12:
            if abs(Dx) < 1e-12 and abs(Dy) < 1e-12:
                return {
                    'success': True,
                    'result': 'Infinitely many solutions (Coincident dependent lines, D = 0 and Dx = Dy = 0).',
                    'steps': steps,
                    'calculated_values': {'D': 0, 'type': 'infinite'}
                }
            else:
                return {
                    'success': True,
                    'result': 'No solution (Parallel inconsistent lines, D = 0 but Dx or Dy ≠ 0).',
                    'steps': steps,
                    'calculated_values': {'D': 0, 'type': 'no_solution'}
                }

        steps.append({
            'step': 2,
            'title': 'Formulate Coordinate Determinants Dx and Dy',
            'description': f'Replace column 1 with constants for Dx, and column 2 with constants for Dy.',
            'latex': f'D_x = \\begin{{vmatrix}} {c1} & {b1} \\\\ {c2} & {b2} \\end{{vmatrix}} = {Dx:.4g},\\quad D_y = \\begin{{vmatrix}} {a1} & {c1} \\\\ {a2} & {c2} \\end{{vmatrix}} = {Dy:.4g}'
        })

        x = Dx / D
        y = Dy / D

        steps.append({
            'step': 3,
            'title': 'Apply Cramer’s Rule for Solution Point (x, y)',
            'description': f'x = Dx / D = {Dx:.4g} / {D:.4g} = {x:.4g}, y = Dy / D = {Dy:.4g} / {D:.4g} = {y:.4g}.',
            'latex': f'x = \\frac{{D_x}}{{D}} = {x:.4g},\\quad y = \\frac{{D_y}}{{D}} = {y:.4g}'
        })

        return {
            'success': True,
            'result': f'Unique Intersection: x = {x:.4g}, y = {y:.4g} (Determinant D = {D:.4g})',
            'steps': steps,
            'calculated_values': {'x': round(x, 4), 'y': round(y, 4), 'D': round(D, 4)}
        }


class DerivativePolynomialSolver(BaseSolverStrategy):
    slug = 'derivative-polynomial'
    title = 'Derivative & Tangent Line Slope'
    formula_latex = r'f(x) = ax^2 + bx + c \implies f^\prime(x) = 2ax + b,\quad m = f^\prime(x_0)'
    inputs_schema = [
        {'id': 'a', 'label': 'Coeff a (x²)', 'default': 1, 'type': 'number'},
        {'id': 'b', 'label': 'Coeff b (x)', 'default': -4, 'type': 'number'},
        {'id': 'c', 'label': 'Constant c', 'default': 3, 'type': 'number'},
        {'id': 'x0', 'label': 'Tangent Point x₀', 'default': 2, 'type': 'number'},
    ]

    def calculate(self, inputs: dict) -> dict:
        try:
            a = float(inputs.get('a', 1))
            b = float(inputs.get('b', -4))
            c = float(inputs.get('c', 3))
            x0 = float(inputs.get('x0', 2))
        except (ValueError, TypeError):
            return {'success': False, 'error': 'Invalid numerical inputs'}

        # f(x0) = a*x0^2 + b*x0 + c
        y0 = a * x0 * x0 + b * x0 + c
        # f'(x) = 2a*x + b
        m = 2 * a * x0 + b
        # Tangent line: y - y0 = m(x - x0) -> y = m*x + (y0 - m*x0)
        intercept = y0 - m * x0

        steps = [
            {
                'step': 1,
                'title': 'Evaluate Point of Tangency (x₀, y₀)',
                'description': f'Substitute x₀ = {x0} into f(x): f({x0}) = ({a})({x0})² + ({b})({x0}) + ({c}) = {y0:.4g}.',
                'latex': f'y_0 = f({x0}) = {y0:.4g}'
            },
            {
                'step': 2,
                'title': 'Differentiate Using Power Rule',
                'description': f'd/dx[ax² + bx + c] = 2ax + b = 2({a})x + ({b}) = {2*a:.4g}x + ({b:.4g}).',
                'latex': f'f^\\prime(x) = 2ax + b = {2*a:.4g}x + ({b:.4g})'
            },
            {
                'step': 3,
                'title': 'Compute Tangent Slope m = f′(x₀)',
                'description': f'Evaluate slope at x₀ = {x0}: m = 2({a})({x0}) + ({b}) = {m:.4g}.',
                'latex': f'm = f^\\prime({x0}) = {m:.4g}'
            },
            {
                'step': 4,
                'title': 'Formulate Tangent Line Equation',
                'description': f'In point-slope form y - y₀ = m(x - x₀): y = {m:.4g}x + ({intercept:.4g}).',
                'latex': f'y = {m:.4g}x + ({intercept:.4g})'
            }
        ]

        return {
            'success': True,
            'result': f'Slope m = {m:.4g} at ({x0}, {y0:.4g}) | Tangent Line: y = {m:.4g}x + {intercept:.4g}',
            'steps': steps,
            'calculated_values': {'slope': round(m, 4), 'x0': round(x0, 4), 'y0': round(y0, 4), 'intercept': round(intercept, 4)}
        }


class DefiniteIntegralSolver(BaseSolverStrategy):
    slug = 'definite-integral'
    title = 'Definite Integral & Area Under Curve'
    formula_latex = r'\int_a^b (Ax^2 + Bx + C)\,dx = \left[\frac{A}{3}x^3 + \frac{B}{2}x^2 + Cx\right]_a^b'
    inputs_schema = [
        {'id': 'a_coeff', 'label': 'Coeff A (x²)', 'default': 3, 'type': 'number'},
        {'id': 'b_coeff', 'label': 'Coeff B (x)', 'default': 2, 'type': 'number'},
        {'id': 'c_coeff', 'label': 'Constant C', 'default': 1, 'type': 'number'},
        {'id': 'lower', 'label': 'Lower Limit a', 'default': 0, 'type': 'number'},
        {'id': 'upper', 'label': 'Upper Limit b', 'default': 2, 'type': 'number'},
    ]

    def calculate(self, inputs: dict) -> dict:
        try:
            A = float(inputs.get('a_coeff', 3))
            B = float(inputs.get('b_coeff', 2))
            C = float(inputs.get('c_coeff', 1))
            a = float(inputs.get('lower', 0))
            b = float(inputs.get('upper', 2))
        except (ValueError, TypeError):
            return {'success': False, 'error': 'Invalid numerical inputs'}

        def F(x):
            return (A / 3.0) * (x ** 3) + (B / 2.0) * (x ** 2) + C * x

        Fa = F(a)
        Fb = F(b)
        integral_val = Fb - Fa

        steps = [
            {
                'step': 1,
                'title': 'Find the Indefinite Antiderivative F(x)',
                'description': f'Integrate term-by-term: ∫({A}x² + {B}x + {C})dx = ({A}/3)x³ + ({B}/2)x² + {C}x.',
                'latex': f'F(x) = \\frac{{{A}}}{{3}}x^3 + \\frac{{{B}}}{{2}}x^2 + {C}x'
            },
            {
                'step': 2,
                'title': 'Evaluate F(b) at Upper Limit',
                'description': f'At upper limit b = {b}: F({b}) = ({A}/3)({b})³ + ({B}/2)({b})² + ({C})({b}) = {Fb:.4g}.',
                'latex': f'F({b}) = {Fb:.4g}'
            },
            {
                'step': 3,
                'title': 'Evaluate F(a) at Lower Limit',
                'description': f'At lower limit a = {a}: F({a}) = ({A}/3)({a})³ + ({B}/2)({a})² + ({C})({a}) = {Fa:.4g}.',
                'latex': f'F({a}) = {Fa:.4g}'
            },
            {
                'step': 4,
                'title': 'Apply Fundamental Theorem of Calculus: F(b) - F(a)',
                'description': f'Exact Definite Integral = F({b}) - F({a}) = {Fb:.4g} - ({Fa:.4g}) = {integral_val:.4g}.',
                'latex': f'\\int_{{{a}}}^{{{b}}} f(x)\\,dx = F({b}) - F({a}) = {integral_val:.4g}'
            }
        ]

        return {
            'success': True,
            'result': f'Exact Integral Value = {integral_val:.4g} (Net Signed Area from {a} to {b})',
            'steps': steps,
            'calculated_values': {'integral': round(integral_val, 4), 'lower': a, 'upper': b}
        }


class VectorDotCrossSolver(BaseSolverStrategy):
    slug = 'vector-dot-cross'
    title = '3D Vector Dot & Cross Product'
    formula_latex = r'\mathbf{u}\cdot\mathbf{v} = |\mathbf{u}||\mathbf{v}|\cos\theta,\quad \mathbf{u}\times\mathbf{v} = \begin{vmatrix} \mathbf{i} & \mathbf{j} & \mathbf{k} \\ u_1 & u_2 & u_3 \\ v_1 & v_2 & v_3 \end{vmatrix}'
    inputs_schema = [
        {'id': 'u1', 'label': 'u₁', 'default': 1, 'type': 'number'},
        {'id': 'u2', 'label': 'u₂', 'default': 2, 'type': 'number'},
        {'id': 'u3', 'label': 'u₃', 'default': 3, 'type': 'number'},
        {'id': 'v1', 'label': 'v₁', 'default': 4, 'type': 'number'},
        {'id': 'v2', 'label': 'v₂', 'default': 5, 'type': 'number'},
        {'id': 'v3', 'label': 'v₃', 'default': 6, 'type': 'number'},
    ]

    def calculate(self, inputs: dict) -> dict:
        try:
            u1, u2, u3 = float(inputs.get('u1', 1)), float(inputs.get('u2', 2)), float(inputs.get('u3', 3))
            v1, v2, v3 = float(inputs.get('v1', 4)), float(inputs.get('v2', 5)), float(inputs.get('v3', 6))
        except (ValueError, TypeError):
            return {'success': False, 'error': 'Invalid numerical inputs'}

        # Dot product
        dot = u1 * v1 + u2 * v2 + u3 * v3
        mag_u = math.sqrt(u1*u1 + u2*u2 + u3*u3)
        mag_v = math.sqrt(v1*v1 + v2*v2 + v3*v3)

        # Cross product: (u2*v3 - u3*v2)i - (u1*v3 - u3*v1)j + (u1*v2 - u2*v1)k
        cx = u2 * v3 - u3 * v2
        cy = u3 * v1 - u1 * v3
        cz = u1 * v2 - u2 * v1
        mag_cross = math.sqrt(cx*cx + cy*cy + cz*cz)

        cos_theta = 0.0
        theta_deg = 90.0
        if mag_u > 1e-12 and mag_v > 1e-12:
            cos_theta = max(-1.0, min(1.0, dot / (mag_u * mag_v)))
            theta_deg = math.degrees(math.acos(cos_theta))

        steps = [
            {
                'step': 1,
                'title': 'Compute Magnitudes (Lengths)',
                'description': f'|u| = √({u1}² + {u2}² + {u3}²) = {mag_u:.4g}, |v| = √({v1}² + {v2}² + {v3}²) = {mag_v:.4g}.',
                'latex': f'|\\mathbf{{u}}| = {mag_u:.4g},\\quad |\\mathbf{{v}}| = {mag_v:.4g}'
            },
            {
                'step': 2,
                'title': 'Evaluate Scalar Dot Product u · v',
                'description': f'u · v = ({u1})({v1}) + ({u2})({v2}) + ({u3})({v3}) = {dot:.4g}.',
                'latex': f'\\mathbf{{u}} \\cdot \\mathbf{{v}} = {dot:.4g}'
            },
            {
                'step': 3,
                'title': 'Calculate Subtended Angle θ',
                'description': f'cos(θ) = (u · v) / (|u||v|) = {cos_theta:.4g} ⇒ θ = {theta_deg:.2f}°.',
                'latex': f'\\theta = \\arccos\\left(\\frac{{{dot:.4g}}}{{{mag_u:.4g} \\times {mag_v:.4g}}}\\right) = {theta_deg:.2f}^\\circ'
            },
            {
                'step': 4,
                'title': 'Evaluate Vector Cross Product u × v',
                'description': f'u × v = ({cx:.4g})i + ({cy:.4g})j + ({cz:.4g})k, with magnitude |u × v| = {mag_cross:.4g}.',
                'latex': f'\\mathbf{{u}} \\times \\mathbf{{v}} = \\langle {cx:.4g},\\, {cy:.4g},\\, {cz:.4g} \\rangle'
            }
        ]

        return {
            'success': True,
            'result': f'u · v = {dot:.4g} | u × v = ⟨{cx:.4g}, {cy:.4g}, {cz:.4g}⟩ | Angle θ = {theta_deg:.2f}°',
            'steps': steps,
            'calculated_values': {'dot': round(dot, 4), 'cross': [round(cx, 4), round(cy, 4), round(cz, 4)], 'theta_deg': round(theta_deg, 2)}
        }


class NormalZScoreSolver(BaseSolverStrategy):
    slug = 'normal-zscore'
    title = 'Normal Distribution & Z-Score'
    formula_latex = r'Z = \frac{X - \mu}{\sigma},\quad P(X \le x) = \frac{1}{2}\left[1 + \operatorname{erf}\left(\frac{x - \mu}{\sigma\sqrt{2}}\right)\right]'
    inputs_schema = [
        {'id': 'x', 'label': 'Raw Value X', 'default': 115, 'type': 'number'},
        {'id': 'mu', 'label': 'Population Mean μ', 'default': 100, 'type': 'number'},
        {'id': 'sigma', 'label': 'Std Deviation σ', 'default': 15, 'type': 'number'},
    ]

    def calculate(self, inputs: dict) -> dict:
        try:
            x = float(inputs.get('x', 115))
            mu = float(inputs.get('mu', 100))
            sigma = float(inputs.get('sigma', 15))
        except (ValueError, TypeError):
            return {'success': False, 'error': 'Invalid numerical inputs'}

        if sigma <= 0:
            return {'success': False, 'error': 'Standard deviation σ must be strictly positive.'}

        z = (x - mu) / sigma
        # Cumulative probability using error function
        p_less = 0.5 * (1.0 + math.erf(z / math.sqrt(2)))
        percentile = p_less * 100.0

        steps = [
            {
                'step': 1,
                'title': 'Calculate Standard Score (Z-Score)',
                'description': f'Z = (X - μ) / σ = ({x} - {mu}) / {sigma} = {x - mu:.4g} / {sigma} = {z:.4g}.',
                'latex': f'Z = \\frac{{{x} - {mu}}}{{{sigma}}} = {z:.4g}'
            },
            {
                'step': 2,
                'title': 'Interpret Standard Deviation Distance',
                'description': f'The raw value X = {x} lies exactly {abs(z):.2f} standard deviations {"above" if z >= 0 else "below"} the mean.',
                'latex': f'X = \\mu + ({z:.2f})\\sigma'
            },
            {
                'step': 3,
                'title': 'Evaluate Cumulative Probability P(X ≤ x)',
                'description': f'Area under the Gaussian bell curve to the left of Z = {z:.4g} is {p_less:.4f} ({percentile:.2f}% percentile).',
                'latex': f'P(X \\le {x}) = {p_less:.4f} \\quad ({percentile:.2f}\\%\\text{{ percentile}})'
            }
        ]

        return {
            'success': True,
            'result': f'Z = {z:.4g} | Cumulative Probability P(X ≤ {x}) = {p_less:.4f} ({percentile:.2f}th Percentile)',
            'steps': steps,
            'calculated_values': {'z': round(z, 4), 'percentile': round(percentile, 2), 'p_less': round(p_less, 4)}
        }

