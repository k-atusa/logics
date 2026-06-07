import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";
import type { Term } from "../logic/minimizer";
import { LogicCircuit } from "./LogicCircuit";
import { NANDCircuit } from "./NANDCircuit";
import { CMOSSchematic } from "./CMOSSchematic";
import { StickDiagram } from "./StickDiagram";

interface CircuitViewerProps {
  primeImplicants: Term[];
  numVars: number;
}

export const CircuitViewer: React.FC<CircuitViewerProps> = ({ primeImplicants, numVars }) => {
  if (primeImplicants.length === 0) {
    return (
      <Card className="bg-card border-border/50 col-span-1 lg:col-span-2 mt-6">
        <CardContent className="p-6 text-center text-muted-foreground">
          Output is always 0. No circuit to build.
        </CardContent>
      </Card>
    );
  }

  if (primeImplicants.length === 1 && primeImplicants[0].every(v => v === -1)) {
    return (
      <Card className="bg-card border-border/50 col-span-1 lg:col-span-2 mt-6">
        <CardContent className="p-6 text-center text-muted-foreground">
          Output is always 1 (Tautology). No gates needed.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border/50 col-span-1 lg:col-span-2 mt-6">
      <CardContent className="p-6">
        <Tabs defaultValue="logic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="logic">Standard Logic</TabsTrigger>
            <TabsTrigger value="nand">NAND Logic</TabsTrigger>
            <TabsTrigger value="cmos">CMOS Schematic</TabsTrigger>
            <TabsTrigger value="stick">Stick Diagram</TabsTrigger>
          </TabsList>
          
          <TabsContent value="logic" className="flex justify-center border border-border/50 rounded-lg bg-muted/10 p-4 overflow-x-auto min-h-[300px]">
            <LogicCircuit primeImplicants={primeImplicants} numVars={numVars} />
          </TabsContent>
          <TabsContent value="nand" className="flex justify-center border border-border/50 rounded-lg bg-muted/10 p-4 overflow-x-auto min-h-[300px]">
            <NANDCircuit primeImplicants={primeImplicants} numVars={numVars} />
          </TabsContent>
          <TabsContent value="cmos" className="flex justify-center border border-border/50 rounded-lg bg-muted/10 p-4 overflow-x-auto min-h-[300px]">
            <CMOSSchematic primeImplicants={primeImplicants} numVars={numVars} />
          </TabsContent>
          <TabsContent value="stick" className="flex justify-center border border-border/50 rounded-lg bg-muted/10 p-4 overflow-x-auto min-h-[300px]">
            <StickDiagram primeImplicants={primeImplicants} numVars={numVars} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
