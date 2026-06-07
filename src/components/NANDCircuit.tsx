import React from 'react';
import type { Term } from "../logic/minimizer";

interface Props {
  primeImplicants: Term[];
  numVars: number;
}

const VAR_NAMES = ['A', 'B', 'C', 'D'];

export const NANDCircuit: React.FC<Props> = ({ primeImplicants, numVars }) => {
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

      {/* NAND Gates (First Level) & Routing */}
      {primeImplicants.map((term, idx) => {
        const gateY = 60 + idx * 80;
        const gateX = 240;
        
        // Find active inputs
        const activeInputs = term.map((val, i) => ({ val, i })).filter(t => t.val !== -1);
        
        return (
          <g key={`term-${idx}`}>
            {/* NAND Gate Shape */}
            <path d={`M ${gateX} ${gateY} L ${gateX + 20} ${gateY} A 20 20 0 0 1 ${gateX + 20} ${gateY + 40} L ${gateX} ${gateY + 40} Z`} />
            <circle cx={gateX + 43} cy={gateY + 20} r={3} />
            
            {/* Inputs to NAND */}
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
            
            {/* Output of NAND (to 2nd level NAND routing) */}
            {(() => {
              if (primeImplicants.length === 1) {
                // If only 1 term, we actually need 2 inverted NANDs or we can just draw it as a direct line if we are strictly mapping the SOP to NAND-NAND.
                // For a single term SOP like AB, NAND-NAND is (AB)' -> NOT -> AB.
                // We'll just draw a NOT gate at the end to make it technically NAND logic.
                return (
                  <>
                    <line x1={gateX + 46} y1={gateY + 20} x2={width - 40} y2={gateY + 20} />
                    <path d={`M ${width - 40} ${gateY + 10} L ${width - 30} ${gateY + 20} L ${width - 40} ${gateY + 30} Z`} />
                    <circle cx={width - 27} cy={gateY + 20} r={3} />
                    <line x1={width - 24} y1={gateY + 20} x2={width - 10} y2={gateY + 20} />
                  </>
                );
              }
              const nandGateY = 60 + (primeImplicants.length - 1) * 80 / 2;
              const nandGateX = 380;
              const targetY = nandGateY + (idx + 1) * (40 / (primeImplicants.length + 1));
              return (
                <>
                  <line x1={gateX + 46} y1={gateY + 20} x2={gateX + 80} y2={gateY + 20} />
                  <line x1={gateX + 80} y1={gateY + 20} x2={gateX + 80} y2={targetY} />
                  <line x1={gateX + 80} y1={targetY} x2={nandGateX} y2={targetY} />
                </>
              );
            })()}
          </g>
        );
      })}

      {/* Final NAND Gate (Second Level) */}
      {primeImplicants.length > 1 && (() => {
        const nandGateY = 60 + (primeImplicants.length - 1) * 80 / 2;
        const nandGateX = 380;
        return (
          <g>
            {/* NAND Gate Shape */}
            <path d={`M ${nandGateX} ${nandGateY} L ${nandGateX + 20} ${nandGateY} A 20 20 0 0 1 ${nandGateX + 20} ${nandGateY + 40} L ${nandGateX} ${nandGateY + 40} Z`} />
            <circle cx={nandGateX + 43} cy={nandGateY + 20} r={3} />
            {/* Final Output */}
            <line x1={nandGateX + 46} y1={nandGateY + 20} x2={width - 20} y2={nandGateY + 20} />
            <text x={width - 15} y={nandGateY + 24} className="fill-current stroke-none font-bold">Out</text>
          </g>
        );
      })()}
      
      {primeImplicants.length === 1 && (
        <text x={width - 5} y={60 + 24} className="fill-current stroke-none font-bold">Out</text>
      )}
    </svg>
  );
};
