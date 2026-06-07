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

  // Replace boolean operators with JS bitwise operators for 0/1 evaluation
  cleanExpr = cleanExpr
    .replace(/\+/g, '|')
    .replace(/\*/g, '&')
    .replace(/~/g, '!')
    .replace(/'/g, ''); // We will handle ' (postfix NOT) differently

  // Handle postfix NOT (')
  // e.g., A' -> !A, (A&B)' -> !(A&B)
  // This is tricky with simple replace. Let's do a small parser or just replace variables + ' with !variable.
  // Actually, standardizing NOT: replace A' with (!A). Replace )' with something else.
  // Instead of regex, let's write a simple token replacement or just use JS evaluation.
  // Let's do it right. We can evaluate postfix by replacing X' with (!X) but X could be a group.
  
  // Alternative: write a simple recursive descent parser, or just handle simple variable NOTs:
  // For A', B', C', D' -> (!A), (!B), (!C), (!D)
  cleanExpr = cleanExpr.replace(/([A-D01])'/g, '(!$1)');
  
  // If there are group NOTs like (A|B)', it's more complex. We can use a loop to resolve (...)'.
  while (cleanExpr.includes(")'")) {
    cleanExpr = cleanExpr.replace(/\(([^()]+)\)'/g, '(!($1))');
  }

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
