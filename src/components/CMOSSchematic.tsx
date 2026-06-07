import React from 'react';
import type { Term } from "../logic/minimizer";

interface Props {
  primeImplicants: Term[];
  numVars: number;
}

const VAR_NAMES = ['A', 'B', 'C', 'D'];

const NMOS = ({ x, y, label }: { x: number, y: number, label: string }) => (
  <g transform={`translate(${x}, ${y})`} className="stroke-current stroke-2 fill-none">
    <line x1={0} y1={-20} x2={0} y2={-10} /> {/* Drain */}
    <line x1={0} y1={10} x2={0} y2={20} />   {/* Source */}
    <line x1={0} y1={-10} x2={0} y2={10} />  {/* Channel */}
    <line x1={-5} y1={-10} x2={-5} y2={10} /> {/* Gate plate */}
    <line x1={-15} y1={0} x2={-5} y2={0} />   {/* Gate terminal */}
    <text x={-18} y={4} textAnchor="end" className="text-[11px] font-bold fill-current stroke-none">{label}</text>
  </g>
);

const PMOS = ({ x, y, label }: { x: number, y: number, label: string }) => (
  <g transform={`translate(${x}, ${y})`} className="stroke-current stroke-2 fill-none">
    <line x1={0} y1={-20} x2={0} y2={-10} /> {/* Source */}
    <line x1={0} y1={10} x2={0} y2={20} />   {/* Drain */}
    <line x1={0} y1={-10} x2={0} y2={10} />  {/* Channel */}
    <line x1={-5} y1={-10} x2={-5} y2={10} /> {/* Gate plate */}
    <circle cx={-8} cy={0} r={3} />            {/* Inversion bubble */}
    <line x1={-15} y1={0} x2={-11} y2={0} />   {/* Gate terminal */}
    <text x={-18} y={4} textAnchor="end" className="text-[11px] font-bold fill-current stroke-none">{label}</text>
  </g>
);

export const CMOSSchematic: React.FC<Props> = ({ primeImplicants }) => {
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
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="text-foreground stroke-current stroke-2 fill-none font-mono text-xs">
      {/* VDD Rail */}
      <line x1={100} y1={20} x2={width - 100} y2={20} />
      <text x={80} y={24} className="fill-current stroke-none font-bold">VDD</text>

      {/* GND Rail */}
      <line x1={100} y1={height - 20} x2={width - 100} y2={height - 20} />
      <text x={80} y={height - 16} className="fill-current stroke-none font-bold">GND</text>

      {/* PUN Network (Series of Parallel Blocks) */}
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
            {/* Top/Bottom rails of this parallel block */}
            <line x1={minX} y1={blockStartY} x2={maxX} y2={blockStartY} />
            <line x1={minX} y1={blockEndY} x2={maxX} y2={blockEndY} />
            
            {/* Connection to next block / rails */}
            {i > 0 && <line x1={centerX} y1={blockStartY - 20} x2={centerX} y2={blockStartY} />}
            
            {active.map((lit, j) => {
              const tx = centerX + (j - (K - 1) / 2) * 60;
              const label = VAR_NAMES[lit.idx] + (lit.val === 0 ? "'" : "");
              return (
                <g key={`pmos-${j}`}>
                  <PMOS x={tx} y={blockStartY + 20} label={label} />
                  <line x1={tx} y1={blockStartY} x2={tx} y2={blockStartY + 20 - 20} />
                  <line x1={tx} y1={blockStartY + 20 + 20} x2={tx} y2={blockEndY} />
                </g>
              );
            })}
          </g>
        );
      })}
      
      {/* Output Node rail */}
      <line x1={centerX} y1={PUN_endY} x2={centerX} y2={OutputY} />
      
      {/* PDN Network (Parallel Branches of Series) */}
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
            {active.map((lit, j) => {
              const ty = PDN_startY + j * 60 + 20;
              const label = VAR_NAMES[lit.idx] + (lit.val === 0 ? "'" : "");
              return (
                <g key={`nmos-${j}`}>
                  <NMOS x={branchX} y={ty} label={label} />
                  {j < K - 1 && <line x1={branchX} y1={ty + 20} x2={branchX} y2={ty + 40} />}
                </g>
              );
            })}
            <line x1={branchX} y1={PDN_startY + (K - 1) * 60 + 40} x2={branchX} y2={PDN_endY} />
          </g>
        );
      })}
      <line x1={centerX} y1={PDN_endY} x2={centerX} y2={height - 20} />

      {/* Complex Gate Output Dot */}
      <circle cx={centerX} cy={OutputY} r={3} className="fill-current" />
      
      {/* Final Inverter Stage */}
      <g transform={`translate(${centerX}, 0)`}>
        {/* Wire from complex output to inverter gate */}
        <line x1={0} y1={OutputY} x2={100} y2={OutputY} />
        <line x1={100} y1={OutputY} x2={100} y2={OutputY - 20} />
        <line x1={100} y1={OutputY} x2={100} y2={OutputY + 20} />
        
        {/* Inverter PMOS */}
        <PMOS x={120} y={OutputY - 20} label="Z" />
        <line x1={120} y1={OutputY - 40} x2={120} y2={20} /> {/* VDD connection */}
        
        {/* Inverter NMOS */}
        <NMOS x={120} y={OutputY + 20} label="Z" />
        <line x1={120} y1={OutputY + 40} x2={120} y2={height - 20} /> {/* GND connection */}
        
        {/* Inverter Output */}
        <line x1={120} y1={OutputY - 5} x2={120} y2={OutputY + 5} />
        <circle cx={120} cy={OutputY} r={3} className="fill-current" />
        <line x1={120} y1={OutputY} x2={160} y2={OutputY} />
        <text x={165} y={OutputY + 4} className="fill-current stroke-none font-bold">Out</text>
      </g>
    </svg>
  );
};
