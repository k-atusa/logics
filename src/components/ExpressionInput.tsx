import React, { useState } from 'react';
import { parseExpression } from '../logic/parser';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';

interface ExpressionInputProps {
  value: string;
  numVars: number;
  onParsed: (minterms: number[]) => void;
}

export const ExpressionInput: React.FC<ExpressionInputProps> = ({ value, numVars, onParsed }) => {
  const [expr, setExpr] = useState(value);
  const [error, setError] = useState('');

  React.useEffect(() => {
    setExpr(value);
  }, [value]);

  const handleParse = () => {
    if (!expr.trim()) {
      onParsed([]);
      setError('');
      return;
    }
    try {
      const minterms = parseExpression(expr, numVars);
      onParsed(minterms);
      setError('');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleParse();
    }
  };

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Boolean Expression</CardTitle>
        <CardDescription>
          Enter a boolean expression using {numVars >= 4 ? 'A, B, C, D' : numVars === 3 ? 'A, B, C' : 'A, B'}. <br/>
          Operators: AND (* or &), OR (+ or |), NOT (' or ! or ~), XOR (^). <br/>
          Examples: <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">A*B + C'</code> or <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">A(B+C)</code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <Input
              type="text"
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. A*B + C'D"
              className="font-mono bg-background"
            />
            {error && <div className="text-destructive mt-2 text-xs font-medium">{error}</div>}
          </div>
          <Button onClick={handleParse} variant="default">
            Evaluate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
