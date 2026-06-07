function resolveNegations(expr: string): string {
  let s = expr;
  let i = 0;
  while (i < s.length) {
    if (s[i] === "'") {
      if (i > 0 && s[i - 1] === ')') {
        let depth = 1;
        let j = i - 2;
        while (j >= 0 && depth > 0) {
          if (s[j] === ')') depth++;
          else if (s[j] === '(') depth--;
          j--;
        }
        if (depth === 0) {
          const start = j + 1;
          const group = s.substring(start, i);
          s = s.substring(0, start) + "!" + group + s.substring(i + 1);
          i = start + 1;
        } else {
          throw new Error("Mismatched parentheses");
        }
      } else if (i > 0 && /[A-D01]/.test(s[i - 1])) {
        const varChar = s[i - 1];
        s = s.substring(0, i - 1) + "!" + varChar + s.substring(i + 1);
      } else {
        throw new Error("Invalid use of ' operator");
      }
    } else {
      i++;
    }
  }
  return s;
}

// Helper to validate and convert expression to JS evaluatable string
export function parseExpression(expr: string, numVars: number = 4): number[] {
  let cleanExpr = expr.toUpperCase().replace(/\s+/g, '');
  
  // Basic validation: only allow A, B, C, D, 0, 1, and operators +, *, &, |, !, ~, ^, ', (, )
  if (/[^A-D01+*&|!~^'()]/g.test(cleanExpr)) {
    throw new Error("Invalid characters in expression. Use A, B, C, D and operators like +, *, ', ()");
  }

  // Pre-process implicit AND (e.g., AB -> A&B, A(B) -> A&(B), (A)(B) -> (A)&(B), A'B -> A'&B)
  // This regex matches cases where an AND is implied.
  cleanExpr = cleanExpr.replace(/([A-D01)'])(?=[A-D01(~])/g, '$1&');

  // Resolve postfix negations (')
  cleanExpr = resolveNegations(cleanExpr);

  // Replace boolean operators with JS bitwise operators for 0/1 evaluation
  cleanExpr = cleanExpr
    .replace(/\+/g, '|')
    .replace(/\*/g, '&')
    .replace(/~/g, '!');

  const minterms: number[] = [];
  const maxVal = Math.pow(2, numVars);

  for (let i = 0; i < maxVal; i++) {
    const A = (i & 8) ? 1 : 0;
    const B = (i & 4) ? 1 : 0;
    const C = (i & 2) ? 1 : 0;
    const D = (i & 1) ? 1 : 0;

    try {
      // Create a function that evaluates the expression for given A, B, C, D
      // Use Function constructor for safe execution context
      const evaluate = new Function('A', 'B', 'C', 'D', `return !!(${cleanExpr});`);
      if (evaluate(A, B, C, D)) {
        minterms.push(i);
      }
    } catch (e) {
      throw new Error("Syntax error in expression.");
    }
  }

  return minterms;
}

export function generateTruthTable(minterms: number[], dontCares: number[] = [], numVars: number = 4) {
  const table = [];
  const maxVal = Math.pow(2, numVars);
  for (let i = 0; i < maxVal; i++) {
    let output: 0 | 1 | -1 = 0; // -1 represents X (don't care)
    if (dontCares.includes(i)) output = -1;
    else if (minterms.includes(i)) output = 1;

    table.push({
      m: i,
      A: (i & 8) ? 1 : 0,
      B: (i & 4) ? 1 : 0,
      C: (i & 2) ? 1 : 0,
      D: (i & 1) ? 1 : 0,
      out: output
    });
  }
  return table;
}
