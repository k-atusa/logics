import { useState, useMemo } from 'react'
import { TruthTable } from './components/TruthTable'
import { KarnaughMap } from './components/KarnaughMap'
import { ExpressionInput } from './components/ExpressionInput'
import { minimize, formatTerm } from './logic/minimizer'

function App() {
  const [minterms, setMinterms] = useState<number[]>([]);
  const [dontCares, setDontCares] = useState<number[]>([]);
  const numVars = 4; // Hardcoded to 4 variables

  // Memoize the minimized prime implicants
  const primeImplicants = useMemo(() => {
    try {
      return minimize(minterms, dontCares, numVars);
    } catch (e) {
      console.error(e);
      return [];
    }
  }, [minterms, dontCares, numVars]);

  // Format the minimized expression as an alphabetically sorted string
  const currentExpressionString = useMemo(() => {
    if (primeImplicants.length === 0) return '';
    if (primeImplicants.length === 1 && primeImplicants[0].every(v => v === -1)) return '1';
    
    const terms = primeImplicants.map(pi => formatTerm(pi));
    terms.sort((a, b) => a.localeCompare(b));
    return terms.join(' + ');
  }, [primeImplicants]);

  const handleExpressionParsed = (newMinterms: number[]) => {
    setMinterms(newMinterms);
    setDontCares([]); // Reset don't cares when parsing a new expression
  };

  const handleTruthTableChange = (newMinterms: number[], newDontCares: number[]) => {
    setMinterms(newMinterms);
    setDontCares(newDontCares);
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 font-sans selection:bg-zinc-800 dark">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-semibold mb-2 tracking-tight">
          Karnaugh Map Generator
        </h1>
        <p className="text-muted-foreground text-sm">Study Logic Circuits • Interactive Truth Table • SOP Minimizer</p>
      </header>

      <main className="max-w-5xl mx-auto space-y-6">
        <ExpressionInput value={currentExpressionString} onParsed={handleExpressionParsed} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <TruthTable
            minterms={minterms}
            dontCares={dontCares}
            numVars={numVars}
            onChange={handleTruthTableChange}
          />
          <KarnaughMap
            minterms={minterms}
            dontCares={dontCares}
            primeImplicants={primeImplicants}
            numVars={numVars}
          />
        </div>
      </main>

      <footer className="text-center mt-16 text-md text-muted-foreground">
        made by <a className="text-primary underline" href="https://github.com/D3vle0">D3vle0</a> with ❤️
      </footer>
    </div>
  )
}

export default App
