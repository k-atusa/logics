import { useState, useMemo } from 'react'
import { TruthTable } from './components/TruthTable'
import { KarnaughMap } from './components/KarnaughMap'
import { ExpressionInput } from './components/ExpressionInput'
import { minimize, formatTerm } from './logic/minimizer'

function App() {
  const [numVars, setNumVars] = useState<number>(4);
  const [minterms, setMinterms] = useState<number[]>([]);
  const [dontCares, setDontCares] = useState<number[]>([]);

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
        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">Variables:</span>
            <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
              {[2, 3, 4].map(v => (
                <button
                  key={v}
                  onClick={() => {
                    setNumVars(v);
                    setMinterms([]);
                    setDontCares([]);
                  }}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    numVars === v 
                      ? 'bg-background text-foreground shadow-sm ring-1 ring-border' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ExpressionInput value={currentExpressionString} onParsed={handleExpressionParsed} numVars={numVars} />

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
