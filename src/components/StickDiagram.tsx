import React from 'react';
import type { Term } from "../logic/minimizer";

interface Props {
  primeImplicants: Term[];
  numVars: number;
}

const VAR_NAMES = ['A', 'B', 'C', 'D'];

const StickNMOS = ({ x, y, label }: { x: number, y: number, label: string }) => (
  <g transform={`translate(${x}, ${y})`} className="stroke-2 fill-none">
    <line x1={-15} y1={0} x2={15} y2={0} className="stroke-green-500 stroke-[6px]" />
    <line x1={0} y1={-15} x2={0} y2={15} className="stroke-red-500 stroke-[4px]" />
    <text x={-8} y={12} className="text-[10px] fill-current stroke-none" textAnchor="end">{label}</text>
    <rect x={-17} y={-2} width={4} height={4} className="fill-black stroke-none" />
    <rect x={13} y={-2} width={4} height={4} className="fill-black stroke-none" />
    <line x1={-15} y1={0} x2={0} y2={-20} className="stroke-blue-500" />
    <line x1={15} y1={0} x2={0} y2={20} className="stroke-blue-500" />
  </g>
);

const StickPMOS = ({ x, y, label }: { x: number, y: number, label: string }) => (
  <g transform={`translate(${x}, ${y})`} className="stroke-2 fill-none">
    <line x1={-15} y1={0} x2={15} y2={0} className="stroke-orange-500 stroke-[6px]" />
    <line x1={0} y1={-15} x2={0} y2={15} className="stroke-red-500 stroke-[4px]" />
    <text x={-8} y={12} className="text-[10px] fill-current stroke-none" textAnchor="end">{label}</text>
    <rect x={-17} y={-2} width={4} height={4} className="fill-black stroke-none" />
    <rect x={13} y={-2} width={4} height={4} className="fill-black stroke-none" />
    <line x1={-15} y1={0} x2={0} y2={-20} className="stroke-blue-500" />
    <line x1={15} y1={0} x2={0} y2={20} className="stroke-blue-500" />
  </g>
);

export const StickDiagram: React.FC<Props> = ({ primeImplicants }) => {
  if (primeImplicants.length === 0) return null;

  const N = primeImplicants.length;
  const maxK = Math.max(...primeImplicants.map(t => t.filter(v => v !== -1).length));

  const PUN_startY = 40;
  const PUN_endY = PUN_startY + N * 60;
  const OutputY = PUN_endY + 20;
  const PDN_startY = OutputY + 20;
  const PDN_endY = PDN_startY + maxK * 60;
  const height = PDN_endY + 40;
  const width = 600;
  const centerX = 240;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="text-foreground stroke-blue-500 stroke-2 fill-none font-mono text-xs">
      {/* VDD Rail */}
      <line x1={100} y1={20} x2={width - 100} y2={20} className="stroke-blue-500 stroke-[4px]" />
      <text x={80} y={24} className="fill-blue-500 stroke-none font-bold">VDD</text>

      {/* GND Rail */}
      <line x1={100} y1={height - 20} x2={width - 100} y2={height - 20} className="stroke-blue-500 stroke-[4px]" />
      <text x={80} y={height - 16} className="fill-blue-500 stroke-none font-bold">GND</text>

      {/* PUN Network */}
      <line x1={centerX} y1={20} x2={centerX} y2={PUN_startY} />
      {primeImplicants.map((term, i) => {
        const active = term.map((val, idx) => ({ val, idx })).filter(t => t.val !== -1);
        const K = active.length;
        const blockStartY = PUN_startY + i * 60;
        const blockEndY = blockStartY + 40;
        
        const minX = centerX + (0 - (K - 1) / 2) * 60;
        const maxX = centerX + ((K - 1) - (K - 1) / 2) * 60;

        return (
          <g key={`pun-${i}`}>
            <line x1={minX} y1={blockStartY} x2={maxX} y2={blockStartY} />
            <line x1={minX} y1={blockEndY} x2={maxX} y2={blockEndY} />
            
            {i > 0 && <line x1={centerX} y1={blockStartY - 20} x2={centerX} y2={blockStartY} />}
            
            {active.map((lit, j) => {
              const tx = centerX + (j - (K - 1) / 2) * 60;
              const label = VAR_NAMES[lit.idx] + (lit.val === 0 ? "'" : "");
              return (
                <g key={`pmos-${j}`}>
                  <StickPMOS x={tx} y={blockStartY + 20} label={label} />
                  <line x1={tx} y1={blockStartY} x2={tx} y2={blockStartY + 20 - 20} />
                  <line x1={tx} y1={blockStartY + 20 + 20} x2={tx} y2={blockEndY} />
                  <rect x={tx - 2} y={blockStartY - 2} width={4} height={4} className="fill-black stroke-none" />
                  <rect x={tx - 2} y={blockEndY - 2} width={4} height={4} className="fill-black stroke-none" />
                </g>
              );
            })}
          </g>
        );
      })}
      
      {/* Output Node rail */}
      <line x1={centerX} y1={PUN_endY} x2={centerX} y2={OutputY} />
      <rect x={centerX - 2} y={OutputY - 2} width={4} height={4} className="fill-black stroke-none" />
      
      {/* PDN Network */}
      <line x1={centerX} y1={OutputY} x2={centerX} y2={PDN_startY} />
      {(() => {
        const minX = centerX + (0 - (N - 1) / 2) * 80;
        const maxX = centerX + ((N - 1) - (N - 1) / 2) * 80;
        return (
          <g>
            <line x1={minX} y1={PDN_startY} x2={maxX} y2={PDN_startY} />
            <line x1={minX} y1={PDN_endY} x2={maxX} y2={PDN_endY} />
          </g>
        );
      })()}
      
      {primeImplicants.map((term, i) => {
        const active = term.map((val, idx) => ({ val, idx })).filter(t => t.val !== -1);
        const K = active.length;
        const branchX = centerX + (i - (N - 1) / 2) * 80;

        return (
          <g key={`pdn-${i}`}>
            <line x1={branchX} y1={PDN_startY} x2={branchX} y2={PDN_startY + 20} />
            <rect x={branchX - 2} y={PDN_startY - 2} width={4} height={4} className="fill-black stroke-none" />
            
            {active.map((lit, j) => {
              const ty = PDN_startY + j * 60 + 20;
              const label = VAR_NAMES[lit.idx] + (lit.val === 0 ? "'" : "");
              return (
                <g key={`nmos-${j}`}>
                  <StickNMOS x={branchX} y={ty} label={label} />
                  {j < K - 1 && <line x1={branchX} y1={ty + 20} x2={branchX} y2={ty + 40} />}
                  <rect x={branchX - 2} y={ty + 20 - 2} width={4} height={4} className="fill-black stroke-none" />
                </g>
              );
            })}
            <line x1={branchX} y1={PDN_startY + (K - 1) * 60 + 40} x2={branchX} y2={PDN_endY} />
            <rect x={branchX - 2} y={PDN_endY - 2} width={4} height={4} className="fill-black stroke-none" />
          </g>
        );
      })}
      <line x1={centerX} y1={PDN_endY} x2={centerX} y2={height - 20} />

      {/* Final Inverter Stage */}
      <g transform={`translate(${centerX}, 0)`}>
        <line x1={0} y1={OutputY} x2={100} y2={OutputY} />
        <line x1={100} y1={OutputY} x2={100} y2={OutputY - 20} />
        <line x1={100} y1={OutputY} x2={100} y2={OutputY + 20} />
        
        <StickPMOS x={120} y={OutputY - 20} label="Z" />
        <line x1={120} y1={OutputY - 40} x2={120} y2={20} />
        <rect x={118} y={18} width={4} height={4} className="fill-black stroke-none" />
        
        <StickNMOS x={120} y={OutputY + 20} label="Z" />
        <line x1={120} y1={OutputY + 40} x2={120} y2={height - 20} />
        <rect x={118} y={height - 22} width={4} height={4} className="fill-black stroke-none" />
        
        <line x1={120} y1={OutputY - 5} x2={120} y2={OutputY + 5} />
        <rect x={118} y={OutputY - 2} width={4} height={4} className="fill-black stroke-none" />
        <line x1={120} y1={OutputY} x2={160} y2={OutputY} />
        <text x={165} y={OutputY + 4} className="fill-blue-500 stroke-none font-bold">Out</text>
      </g>
      
      {/* Legend */}
      <g transform={`translate(${width - 100}, 20)`} className="text-[10px] font-sans">
        <rect x={0} y={0} width={80} height={70} className="fill-card stroke-border" />
        <line x1={5} y1={10} x2={25} y2={10} className="stroke-red-500 stroke-[4px]" />
        <text x={30} y={13} className="fill-current stroke-none">Poly</text>
        <line x1={5} y1={25} x2={25} y2={25} className="stroke-blue-500 stroke-[2px]" />
        <text x={30} y={28} className="fill-current stroke-none">Metal</text>
        <line x1={5} y1={40} x2={25} y2={40} className="stroke-green-500 stroke-[6px]" />
        <text x={30} y={43} className="fill-current stroke-none">N-Diff</text>
        <line x1={5} y1={55} x2={25} y2={55} className="stroke-orange-500 stroke-[6px]" />
        <text x={30} y={58} className="fill-current stroke-none">P-Diff</text>
      </g>
    </svg>
  );
};
