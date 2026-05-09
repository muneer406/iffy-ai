"use client";
import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import { SimulationNodeComponent } from "./SimulationNode";
import { SimulationEdgeComponent } from "./SimulationEdge";
import { DurationToggle } from "@/components/simulation/DurationToggle";
import { MutationInput } from "./MutationInput";
import { useSimulationStore } from "@/store/simulation.store";
import { useUIStore } from "@/store/ui.store";
import { mutate as apiMutate } from "@/lib/api/client";
import { getImpactForDuration } from "@/lib/utils";
import type { SimulationNode, SimulationEdge, DurationKey } from "@/types/simulation";

const nodeTypes = { simulationNode: SimulationNodeComponent };
const edgeTypes = { simulationEdge: SimulationEdgeComponent };

function buildFlowNodes(nodes: SimulationNode[], _duration: DurationKey): Node[] {
  return nodes.map((n, i) => ({
    id: n.id,
    type: "simulationNode",
    position: { x: (i % 4) * 220, y: Math.floor(i / 4) * 160 },
    data: n as unknown as Record<string, unknown>,
  }));
}

function buildFlowEdges(edges: SimulationEdge[]): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "simulationEdge",
    data: { relationship: e.relationship, strength: e.strength, explanation: e.explanation },
    animated: e.relationship === "increase" || e.relationship === "enable",
  }));
}

export function FlowchartTab() {
  const { nodes: simNodes, edges: simEdges, selectedDuration, simulation, applyMutation } = useSimulationStore();
  const { isMutating, setMutating } = useUIStore();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Rebuild flow whenever nodes, edges, or duration changes
  useEffect(() => {
    setNodes(buildFlowNodes(simNodes, selectedDuration as DurationKey));
    setEdges(buildFlowEdges(simEdges));
  }, [simNodes, simEdges, selectedDuration, setNodes, setEdges]);

  const handleMutate = useCallback(async (prompt: string) => {
    if (!simulation) return;
    setMutating(true);
    try {
      const result = await apiMutate(simulation.simulation_id, simulation, prompt);
      applyMutation(result);
    } catch (err) {
      console.error("Mutation failed:", err);
    } finally {
      setMutating(false);
    }
  }, [simulation, setMutating, applyMutation]);

  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Controls bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
          <span className="text-xs text-slate-500">
            {simNodes.length} nodes · {simEdges.length} connections
          </span>
        </div>
        <DurationToggle />
      </div>

      {/* Graph */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(59,130,246,0.08)" />
          <Controls className="!bottom-4 !right-4 !left-auto" />
          <MiniMap
            nodeColor={(n) => {
              const d = (n.data as unknown as SimulationNode)?.impact_direction;
              return d === "positive" ? "#10b981" : d === "negative" ? "#ef4444" : "#f59e0b";
            }}
            maskColor="rgba(9,9,15,0.8)"
            style={{ bottom: 72 }}
          />
        </ReactFlow>

        {/* Mutation overlay loading */}
        {isMutating && (
          <motion.div
            className="absolute inset-0 bg-[#09090f]/70 backdrop-blur-sm flex items-center justify-center z-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
              <span className="text-sm text-purple-300 font-medium">Branching timeline…</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Mutation input */}
      <MutationInput onMutate={handleMutate} isLoading={isMutating} />
    </motion.div>
  );
}
