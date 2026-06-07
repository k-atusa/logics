import React from 'react';
import type { Term } from "../logic/minimizer";

interface Props {
  primeImplicants: Term[];
  numVars: number;
}

const VAR_NAMES = ['A', 'B', 'C', 'D'];

export const LogicCircuit: React.FC<Props> = ({ primeImplicants, numVars }) => {
  if (primeImplicants.length === 0) return null;

  const width = 500;
  const height = Math.max(300, primeImplicants.length * 80 + 100);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="text-foreground stroke-current stroke-2 fill-none font-mono text-xs">
      {/* Input Bus */}
      {Array.from({ length: numVars }).map((_, i) => {
        const x = 40 + i * 40;
        return (
          <g key={`bus-${i}`}>
            <text x={x - 4} y={15} className="fill-current stroke-none font-bold">{VAR_NAMES[i]}</text>
            <line x1={x} y1={20} x2={x} y2={height - 20} />
            {/* NOT Line */}
            <line x1={x} y1={30} x2={x + 15} y2={30} />
            <path d={`M ${x + 15} 30 L ${x + 25} 35 L ${x + 15} 40 Z`} />
            <circle cx={x + 27} cy={35} r={2} />
            <line x1={x + 29} y1={35} x2={x + 29} y2={height - 20} />
          </g>
        );
      })}

      {/* AND Gates & Routing */}
      {primeImplicants.map((term, idx) => {
        const gateY = 60 + idx * 80;
        const gateX = 240;
        
        // Find active inputs
        const activeInputs = term.map((val, i) => ({ val, i })).filter(t => t.val !== -1);
        
        return (
          <g key={`term-${idx}`}>
            {/* AND Gate Shape */}
            <path d={`M ${gateX} ${gateY} L ${gateX + 20} ${gateY} A 20 20 0 0 1 ${gateX + 20} ${gateY + 40} L ${gateX} ${gateY + 40} Z`} />
            
            {/* Inputs to AND */}
            {activeInputs.map((input, j) => {
              const inputY = gateY + (j + 1) * (40 / (activeInputs.length + 1));
              const lineX = 40 + input.i * 40 + (input.val === 0 ? 29 : 0);
              return (
                <g key={`in-${j}`}>
                  <circle cx={lineX} cy={inputY} r={3} className="fill-current" />
                  <line x1={lineX} y1={inputY} x2={gateX} y2={inputY} />
                </g>
              );
            })}
            
            {/* Output of AND (to OR routing) */}
            {(() => {
              if (primeImplicants.length === 1) {
                // If only 1 term, output goes straight to end
                return <line x1={gateX + 40} y1={gateY + 20} x2={width - 20} y2={gateY + 20} />;
              }
              const orGateY = 60 + (primeImplicants.length - 1) * 80 / 2;
              const orGateX = 380;
              const targetY = orGateY + (idx + 1) * (40 / (primeImplicants.length + 1));
              return (
                <>
                  <line x1={gateX + 40} y1={gateY + 20} x2={gateX + 80} y2={gateY + 20} />
                  <line x1={gateX + 80} y1={gateY + 20} x2={gateX + 80} y2={targetY} />
                  <line x1={gateX + 80} y1={targetY} x2={orGateX} y2={targetY} />
                </>
              );
            })()}
          </g>
        );
      })}

      {/* Final OR Gate */}
      {primeImplicants.length > 1 && (() => {
        const orGateY = 60 + (primeImplicants.length - 1) * 80 / 2;
        const orGateX = 380;
        return (
          <g>
            {/* OR Gate Shape */}
            <path d={`M ${orGateX} ${orGateY} Q ${orGateX + 20} ${orGateY} ${orGateX + 40} ${orGateY + 20} Q ${orGateX + 20} ${orGateY + 40} ${orGateX} ${orGateY + 40} Q ${orGateX + 10} ${orGateY + 20} ${orGateX} ${orGateY} Z`} />
            {/* Final Output */}
            <line x1={orGateX + 40} y1={orGateY + 20} x2={width - 20} y2={orGateY + 20} />
            <text x={width - 15} y={orGateY + 24} className="fill-current stroke-none font-bold">Out</text>
          </g>
        );
      })()}
      
      {primeImplicants.length === 1 && (
        <text x={width - 15} y={60 + 24} className="fill-current stroke-none font-bold">Out</text>
      )}
    </svg>
  );
};
