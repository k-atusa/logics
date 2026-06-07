import React from 'react';
import { covers, formatTerm } from '../logic/minimizer';
import type { Term } from '../logic/minimizer';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface KarnaughMapProps {
  minterms: number[];
  dontCares: number[];
  primeImplicants: Term[];
  numVars: number;
}

const COLORS = [
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#a855f7', // purple-500
  '#ec4899', // pink-500
  '#0ea5e9', // sky-500
  '#f97316', // orange-500
];

export const KarnaughMap: React.FC<KarnaughMapProps> = ({ minterms, dontCares, primeImplicants, numVars }) => {
  const sortedPrimeImplicants = React.useMemo(() => {
    return [...primeImplicants].sort((a, b) => {
      const strA = formatTerm(a);
      const strB = formatTerm(b);
      return strA.localeCompare(strB);
    });
  }, [primeImplicants]);

  if (numVars !== 4) {
    return (
      <Card className="bg-card border-border/50">
        <CardContent className="p-6 text-center text-muted-foreground">
          Only 4-variable K-Map is visually supported currently.
        </CardContent>
      </Card>
    );
  }

  const rowVals = [0, 1, 3, 2]; // 00, 01, 11, 10
  const colVals = [0, 1, 3, 2];

  const getMinterm = (row: number, col: number) => {
    const A = (row & 2) ? 1 : 0;
    const B = (row & 1) ? 1 : 0;
    const C = (col & 2) ? 1 : 0;
    const D = (col & 1) ? 1 : 0;
    return A * 8 + B * 4 + C * 2 + D * 1;
  };

  const getCellLabel = (m: number) => {
    if (minterms.includes(m)) return '1';
    if (dontCares.includes(m)) return 'X';
    return '0';
  };

  const toBinaryString = (val: number, bits: number) => {
    return val.toString(2).padStart(bits, '0');
  };

  const getCoveringGroups = (m: number) => {
    return sortedPrimeImplicants
      .map((pi, idx) => ({ pi, idx }))
      .filter(({ pi }) => covers(pi, m, numVars));
  };

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Karnaugh Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-8 relative">
          <table className="border-collapse bg-background">
            <thead>
              <tr>
                <th className="border border-border/50 p-0 relative min-w-[64px] min-h-[64px] bg-muted/30 overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full text-muted-foreground opacity-30 pointer-events-none" preserveAspectRatio="none">
                    <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeWidth="1" />
                  </svg>
                  <div className="absolute top-1 right-1.5 text-[10px] font-mono text-muted-foreground opacity-70">CD</div>
                  <div className="absolute bottom-1 left-1.5 text-[10px] font-mono text-muted-foreground opacity-70">AB</div>
                </th>
                {colVals.map(c => (
                  <th key={c} className="border border-border/50 p-2 font-mono text-sm tracking-widest text-muted-foreground bg-muted/30">
                    {toBinaryString(c, 2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowVals.map((r) => (
                <tr key={r}>
                  <th className="border border-border/50 p-2 font-mono text-sm tracking-widest text-muted-foreground bg-muted/30">
                    {toBinaryString(r, 2)}
                  </th>
                  {colVals.map((c) => {
                    const m = getMinterm(r, c);
                    const groups = getCoveringGroups(m);
                    return (
                      <td key={c} className="border border-border/50 p-0 relative w-16 h-16 text-center text-lg font-bold align-middle bg-card">
                        {/* Render grouping highlights */}
                        <div className="absolute inset-0 flex flex-wrap justify-center items-center pointer-events-none p-1 gap-1 opacity-70">
                          {groups.map(({ idx }) => (
                            <div
                              key={idx}
                              className="absolute rounded-md border-2"
                              style={{
                                borderColor: COLORS[idx % COLORS.length],
                                inset: `${(idx % 4) * 4}px`,
                                backgroundColor: `${COLORS[idx % COLORS.length]}15`
                              }}
                            ></div>
                          ))}
                        </div>
                        <span className="relative z-10 font-mono" style={{
                          color: minterms.includes(m) ? '#22c55e' : dontCares.includes(m) ? '#eab308' : 'var(--muted-foreground)'
                        }}>{getCellLabel(m)}</span>
                        <span className="absolute bottom-1 right-1 text-[10px] text-muted-foreground z-10 font-mono opacity-50">
                          {m}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-muted/30 border border-border/50 p-4 rounded-md">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Minimized Expression (SOP)</h3>
          <div className="flex flex-wrap gap-2 items-center">
            {sortedPrimeImplicants.length === 0 ? (
              <Badge variant="secondary" className="font-mono text-sm">0</Badge>
            ) : sortedPrimeImplicants.length === 1 && sortedPrimeImplicants[0].every(v => v === -1) ? (
              <Badge variant="secondary" className="font-mono text-sm bg-green-500/20 text-green-500 hover:bg-green-500/30">1</Badge>
            ) : (
              sortedPrimeImplicants.map((pi, idx) => (
                <React.Fragment key={idx}>
                  <Badge
                    variant="outline"
                    className="font-mono text-base border-2"
                    style={{ borderColor: COLORS[idx % COLORS.length], color: COLORS[idx % COLORS.length] }}
                  >
                    {formatTerm(pi)}
                  </Badge>
                  {idx < sortedPrimeImplicants.length - 1 && <span className="text-muted-foreground font-mono">+</span>}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
