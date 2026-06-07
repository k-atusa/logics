import React from 'react';
import { generateTruthTable } from '../logic/parser';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface TruthTableProps {
  minterms: number[];
  dontCares: number[];
  numVars: number;
  onChange: (minterms: number[], dontCares: number[]) => void;
}

export const TruthTable: React.FC<TruthTableProps> = ({ minterms, dontCares, numVars, onChange }) => {
  const table = generateTruthTable(minterms, dontCares, numVars);

  const toggleRow = (m: number, currentOut: number) => {
    let newMinterms = [...minterms];
    let newDontCares = [...dontCares];

    // cycle: 0 -> 1 -> X (-1) -> 0
    if (currentOut === 0) {
      newMinterms.push(m);
      newDontCares = newDontCares.filter(x => x !== m);
    } else if (currentOut === 1) {
      newMinterms = newMinterms.filter(x => x !== m);
      newDontCares.push(m);
    } else {
      // is X
      newMinterms = newMinterms.filter(x => x !== m);
      newDontCares = newDontCares.filter(x => x !== m);
    }

    onChange(newMinterms, newDontCares);
  };

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Truth Table</CardTitle>
        <CardDescription>Click a row to toggle its output (0 → 1 → X)</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
              <TableRow>
                <TableHead className="w-12 text-center border-r border-border/50">m</TableHead>
                {numVars >= 1 && <TableHead className="text-center">A</TableHead>}
                {numVars >= 2 && <TableHead className="text-center">B</TableHead>}
                {numVars >= 3 && <TableHead className="text-center">C</TableHead>}
                {numVars >= 4 && <TableHead className="text-center">D</TableHead>}
                <TableHead className="text-center border-l border-border/50 font-semibold">Out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.map((row) => (
                <TableRow 
                  key={row.m} 
                  className="cursor-pointer transition-colors hover:bg-muted/50" 
                  onClick={() => toggleRow(row.m, row.out)}
                >
                  <TableCell className="text-center text-muted-foreground border-r border-border/50 font-mono text-xs">{row.m}</TableCell>
                  {numVars >= 1 && <TableCell className="text-center font-mono">{row.A}</TableCell>}
                  {numVars >= 2 && <TableCell className="text-center font-mono">{row.B}</TableCell>}
                  {numVars >= 3 && <TableCell className="text-center font-mono">{row.C}</TableCell>}
                  {numVars >= 4 && <TableCell className="text-center font-mono">{row.D}</TableCell>}
                  <TableCell className={`text-center border-l border-border/50 font-bold font-mono ${
                    row.out === 1 ? 'text-green-500' : row.out === -1 ? 'text-yellow-500' : 'text-zinc-500'
                  }`}>
                    {row.out === 1 ? '1' : row.out === -1 ? 'X' : '0'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
