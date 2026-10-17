// Safe Mathematical Function Expression Evaluator
// Uses Tokenization + Shunting-Yard Algorithm to compile into Reverse Polish Notation (RPN)
// Zero-eval, completely safe mathematical parsing for interactive plotting

const OPERATORS = {
  '+': { precedence: 2, associativity: 'L', fn: (a, b) => a + b },
  '-': { precedence: 2, associativity: 'L', fn: (a, b) => a - b },
  '*': { precedence: 3, associativity: 'L', fn: (a, b) => a * b },
  '/': { precedence: 3, associativity: 'L', fn: (a, b) => (Math.abs(b) < 1e-12 ? NaN : a / b) },
  '^': { precedence: 4, associativity: 'R', fn: (a, b) => Math.pow(a, b) },
};

const FUNCTIONS = {
  sin: Math.sin,
  cos: Math.cos,
  tan: (x) => {
    const cosVal = Math.cos(x);
    return Math.abs(cosVal) < 1e-10 ? NaN : Math.tan(x);
  },
  sqrt: (x) => (x < 0 ? NaN : Math.sqrt(x)),
  abs: Math.abs,
  exp: Math.exp,
  log: (x) => (x <= 0 ? NaN : Math.log(x)),
  ln: (x) => (x <= 0 ? NaN : Math.log(x)),
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
};

const CONSTANTS = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
};

/**
 * Tokenize a math expression string into tokens
 */
function tokenize(expr) {
  const clean = expr
    .toLowerCase()
    .replace(/\s+/g, '')
    // Handle implicit multiplication like 2x -> 2*x, 3(x) -> 3*(x), )x -> )*x
    .replace(/(\d)([a-z(])/g, '$1*$2')
    .replace(/(\))([a-z0-9(])/g, '$1*$2');

  const tokens = [];
  let i = 0;

  while (i < clean.length) {
    const ch = clean[i];

    // Numbers (integers or decimals)
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(clean[i + 1] || ''))) {
      let numStr = '';
      while (i < clean.length && (/[\d.]/.test(clean[i]))) {
        numStr += clean[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(numStr) });
      continue;
    }

    // Identifiers (functions, constants, variable x)
    if (/[a-z]/.test(ch)) {
      let ident = '';
      while (i < clean.length && /[a-z0-9_]/.test(clean[i])) {
        ident += clean[i];
        i++;
      }
      if (ident === 'x') {
        tokens.push({ type: 'variable', name: 'x' });
      } else if (CONSTANTS[ident] !== undefined) {
        tokens.push({ type: 'number', value: CONSTANTS[ident] });
      } else if (FUNCTIONS[ident]) {
        tokens.push({ type: 'function', name: ident });
      } else {
        throw new Error(`Unknown mathematical identifier: "${ident}"`);
      }
      continue;
    }

    // Unary minus (negative sign at start or after operator/open paren)
    if (ch === '-') {
      const prev = tokens[tokens.length - 1];
      if (!prev || prev.type === 'operator' || (prev.type === 'paren' && prev.value === '(')) {
        tokens.push({ type: 'number', value: 0 });
        tokens.push({ type: 'operator', value: '-' });
        i++;
        continue;
      }
    }

    // Binary Operators
    if (OPERATORS[ch]) {
      tokens.push({ type: 'operator', value: ch });
      i++;
      continue;
    }

    // Parentheses
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch });
      i++;
      continue;
    }

    throw new Error(`Unrecognized character: "${ch}"`);
  }

  return tokens;
}

/**
 * Convert infix tokens to Reverse Polish Notation (RPN) via Shunting-Yard
 */
function toRPN(tokens) {
  const outputQueue = [];
  const operatorStack = [];

  for (const token of tokens) {
    if (token.type === 'number' || token.type === 'variable') {
      outputQueue.push(token);
    } else if (token.type === 'function') {
      operatorStack.push(token);
    } else if (token.type === 'operator') {
      const op1 = token.value;
      const op1Info = OPERATORS[op1];

      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.type === 'operator') {
          const op2Info = OPERATORS[top.value];
          if (
            (op1Info.associativity === 'L' && op1Info.precedence <= op2Info.precedence) ||
            (op1Info.associativity === 'R' && op1Info.precedence < op2Info.precedence)
          ) {
            outputQueue.push(operatorStack.pop());
            continue;
          }
        } else if (top.type === 'function') {
          outputQueue.push(operatorStack.pop());
          continue;
        }
        break;
      }
      operatorStack.push(token);
    } else if (token.type === 'paren' && token.value === '(') {
      operatorStack.push(token);
    } else if (token.type === 'paren' && token.value === ')') {
      let matched = false;
      while (operatorStack.length > 0) {
        const top = operatorStack.pop();
        if (top.type === 'paren' && top.value === '(') {
          matched = true;
          break;
        } else {
          outputQueue.push(top);
        }
      }
      if (!matched) {
        throw new Error('Mismatched parentheses in mathematical expression.');
      }
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'function') {
        outputQueue.push(operatorStack.pop());
      }
    }
  }

  while (operatorStack.length > 0) {
    const top = operatorStack.pop();
    if (top.type === 'paren') {
      throw new Error('Mismatched parentheses in mathematical expression.');
    }
    outputQueue.push(top);
  }

  return outputQueue;
}

/**
 * Compile expression string into a high-performance evaluation function (x) => y
 */
export function compileMathExpression(exprStr) {
  if (!exprStr || !exprStr.trim()) {
    throw new Error('Mathematical expression is empty.');
  }

  const tokens = tokenize(exprStr);
  const rpn = toRPN(tokens);

  return (x) => {
    const stack = [];

    for (const token of rpn) {
      if (token.type === 'number') {
        stack.push(token.value);
      } else if (token.type === 'variable') {
        stack.push(x);
      } else if (token.type === 'operator') {
        if (stack.length < 2) return NaN;
        const b = stack.pop();
        const a = stack.pop();
        const res = OPERATORS[token.value].fn(a, b);
        stack.push(res);
      } else if (token.type === 'function') {
        if (stack.length < 1) return NaN;
        const a = stack.pop();
        const res = FUNCTIONS[token.name](a);
        stack.push(res);
      }
    }

    if (stack.length !== 1) return NaN;
    const finalVal = stack[0];
    return Number.isFinite(finalVal) ? finalVal : NaN;
  };
}

/**
 * Generate discrete points array for coordinate canvas plotting
 */
export function generateFunctionPoints(exprStr, xMin = -6, xMax = 6, pointsCount = 300) {
  try {
    const fn = compileMathExpression(exprStr);
    const points = [];
    const step = (xMax - xMin) / pointsCount;

    for (let i = 0; i <= pointsCount; i++) {
      const x = xMin + i * step;
      const y = fn(x);
      points.push({
        x,
        y,
        isValid: Number.isFinite(y) && Math.abs(y) < 1e5,
      });
    }

    return { points, error: null };
  } catch (err) {
    return { points: [], error: err.message };
  }
}

/**
 * Pre-curated Mathematical Function Presets
 */
export const MATH_FUNCTION_PRESETS = [
  { label: 'Standard Parabola', expr: 'x^2', latex: 'f(x) = x^2', category: 'Algebra' },
  { label: 'Cubic Polynomial', expr: 'x^3 - 3*x', latex: 'f(x) = x^3 - 3x', category: 'Algebra' },
  { label: 'Sine Wave', expr: 'sin(x)', latex: 'f(x) = \\sin(x)', category: 'Trigonometry' },
  { label: 'Cosine Wave', expr: '2*cos(x)', latex: 'f(x) = 2\\cos(x)', category: 'Trigonometry' },
  { label: 'Gaussian Bell Curve', expr: 'exp(-x^2)', latex: 'f(x) = e^{-x^2}', category: 'Calculus' },
  { label: 'Hyperbola / Inverse', expr: '1/x', latex: 'f(x) = \\frac{1}{x}', category: 'Algebra' },
  { label: 'Exponential Growth', expr: '2^x', latex: 'f(x) = 2^x', category: 'Exponential' },
  { label: 'Damped Oscillation', expr: 'exp(-0.2*x)*sin(3*x)', latex: 'f(x) = e^{-0.2x}\\sin(3x)', category: 'Physics' },
  { label: 'Sigmoid / Logistic', expr: '1 / (1 + exp(-x))', latex: 'f(x) = \\frac{1}{1 + e^{-x}}', category: 'Machine Learning' },
  { label: 'Square Root', expr: 'sqrt(x)', latex: 'f(x) = \\sqrt{x}', category: 'Foundations' },
];

/**
 * Pre-curated LaTeX Formula Notes for Whiteboard Stamping
 */
export const FORMULA_STAMP_TEMPLATES = [
  { label: 'Quadratic Formula', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
  { label: 'Pythagorean Theorem', latex: 'a^2 + b^2 = c^2' },
  { label: 'Fundamental Calculus', latex: '\\int_a^b f(x)\\,dx = F(b) - F(a)' },
  { label: 'Euler\'s Identity', latex: 'e^{i\\pi} + 1 = 0' },
  { label: 'Derivative Definition', latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}" },
  { label: 'Gaussian Integral', latex: '\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}' },
  { label: 'Euler-Lagrange', latex: '\\frac{\\partial L}{\\partial q} - \\frac{d}{dt}\\left(\\frac{\\partial L}{\\partial \\dot{q}}\\right) = 0' },
  { label: 'Fourier Series', latex: 'f(t) = a_0 + \\sum_{n=1}^{\\infty} [a_n \\cos(n\\omega t) + b_n \\sin(n\\omega t)]' },
  { label: 'Snell\'s Law', latex: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2' },
  { label: 'Newton\'s 2nd Law', latex: '\\vec{F} = m\\vec{a} = \\frac{d\\vec{p}}{dt}' },
];
