export type Term = (0 | 1 | -1)[];

// Helper to convert integer to binary array
function toBinaryArray(num: number, numVars: number): Term {
  const bin = num.toString(2).padStart(numVars, '0');
  return bin.split('').map((c) => parseInt(c, 10)) as Term;
}

// Check if two terms differ by exactly one position
function diffPositions(t1: Term, t2: Term): number {
  let diffCount = 0;
  let diffPos = -1;
  for (let i = 0; i < t1.length; i++) {
    if (t1[i] !== t2[i]) {
      diffCount++;
      diffPos = i;
    }
  }
  return diffCount === 1 ? diffPos : -1;
}

// Format a term to a boolean expression string using A, B, C, D
export function formatTerm(term: Term, varNames = ['A', 'B', 'C', 'D']): string {
  let res = '';
  for (let i = 0; i < term.length; i++) {
    if (term[i] === 1) res += varNames[i];
    else if (term[i] === 0) res += varNames[i] + "'";
  }
  return res || '1'; // If all are -1, it's a tautology
}

// Check if a term covers a minterm
export function covers(term: Term, minterm: number, numVars: number): boolean {
  const mintermArr = toBinaryArray(minterm, numVars);
  for (let i = 0; i < term.length; i++) {
    if (term[i] !== -1 && term[i] !== mintermArr[i]) {
      return false;
    }
  }
  return true;
}

// Quine-McCluskey minimization
export function minimize(minterms: number[], dontCares: number[] = [], numVars: number = 4): Term[] {
  if (minterms.length === 0) return [];
  if (minterms.length + dontCares.length === Math.pow(2, numVars)) return [Array(numVars).fill(-1)];

  const allTerms = [...new Set([...minterms, ...dontCares])];
  let groups: Term[][] = [];
  
  // Initial grouping by number of 1s
  allTerms.forEach((m) => {
    const bin = toBinaryArray(m, numVars);
    const ones = bin.filter((b) => b === 1).length;
    if (!groups[ones]) groups[ones] = [];
    groups[ones].push(bin);
  });

  for (let i = 0; i <= numVars; i++) {
    if (!groups[i]) groups[i] = [];
  }

  let primeImplicants: Term[] = [];
  let mergedAny = true;
  let currentGroups = groups;

  while (mergedAny) {
    mergedAny = false;
    let nextGroups: Term[][] = Array.from({ length: numVars + 1 }, () => []);
    let mergedSet = new Set<string>();

    for (let i = 0; i < currentGroups.length - 1; i++) {
      for (const t1 of currentGroups[i]) {
        for (const t2 of currentGroups[i + 1]) {
          const diffPos = diffPositions(t1, t2);
          if (diffPos !== -1) {
            mergedAny = true;
            mergedSet.add(JSON.stringify(t1));
            mergedSet.add(JSON.stringify(t2));
            const newTerm = [...t1];
            newTerm[diffPos] = -1;
            
            // Check if it already exists in nextGroups
            const newTermStr = JSON.stringify(newTerm);
            const ones = newTerm.filter((b) => b === 1).length;
            if (!nextGroups[ones].some(t => JSON.stringify(t) === newTermStr)) {
              nextGroups[ones].push(newTerm);
            }
          }
        }
      }
    }

    // Unmerged terms are prime implicants
    for (const group of currentGroups) {
      for (const term of group) {
        if (!mergedSet.has(JSON.stringify(term))) {
          const termStr = JSON.stringify(term);
          if (!primeImplicants.some(t => JSON.stringify(t) === termStr)) {
            primeImplicants.push(term);
          }
        }
      }
    }
    currentGroups = nextGroups;
  }

  // Petrick's Method / Exact Cover
  // Find essential prime implicants first
  let essentialPIs: Term[] = [];
  let remainingMinterms = new Set(minterms);
  let piCovers = primeImplicants.map(pi => {
    return minterms.filter(m => covers(pi, m, numVars));
  });

  // Find columns with only 1 X
  let changed = true;
  while(changed) {
    changed = false;
    for (const m of Array.from(remainingMinterms)) {
      const coveringPIs = piCovers.map((covered, idx) => covered.includes(m) ? idx : -1).filter(idx => idx !== -1);
      if (coveringPIs.length === 1) {
        const epiIndex = coveringPIs[0];
        if (!essentialPIs.includes(primeImplicants[epiIndex])) {
          essentialPIs.push(primeImplicants[epiIndex]);
          piCovers[epiIndex].forEach(coveredM => remainingMinterms.delete(coveredM));
          changed = true;
        }
      }
    }
  }

  // If there are still uncovered minterms, simple greedy search (since N is small)
  let selectedPIs = [...essentialPIs];
  
  while (remainingMinterms.size > 0) {
    let bestPIIndex = -1;
    let maxCovered = 0;
    for (let i = 0; i < primeImplicants.length; i++) {
      if (selectedPIs.includes(primeImplicants[i])) continue;
      const coveredCount = piCovers[i].filter(m => remainingMinterms.has(m)).length;
      if (coveredCount > maxCovered) {
        maxCovered = coveredCount;
        bestPIIndex = i;
      }
    }
    if (bestPIIndex !== -1) {
      selectedPIs.push(primeImplicants[bestPIIndex]);
      piCovers[bestPIIndex].forEach(m => remainingMinterms.delete(m));
    } else {
      break; // should not happen for valid boolean algebra
    }
  }

  return selectedPIs;
}
