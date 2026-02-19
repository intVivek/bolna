"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  applyNodeChanges,
  useReactFlow,
  ConnectionMode,
  MarkerType,
  type NodeChange,
  type EdgeChange,
  type Node as RFNode,
  type Edge as RFEdge,
  type Connection,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useStore, type Node as StoreNode } from "@/store";
import FlowNode from "./FlowNode";

const nodeTypes = { flowNode: FlowNode };

const defaultEdgeOptions = {
  type: "step",
  markerEnd: { type: MarkerType.ArrowClosed },
};

function toRFNodes(
  storeNodes: StoreNode[],
  startNodeId: string | null
): RFNode[] {
  return storeNodes.map((node, i) => ({
    id: node.id,
    type: "flowNode",
    position: { x: 0, y: i * 120 },
    data: {
      id: node.id,
      prompt: node.prompt,
      isStart: node.id === startNodeId,
    },
    deletable: node.id !== startNodeId,
  }));
}

function toRFEdges(storeNodes: StoreNode[]): RFEdge[] {
  return storeNodes.flatMap((node) =>
    node.edges.map((edge) => ({
      id: `${node.id}->${edge.to_node_id}`,
      source: node.id,
      target: edge.to_node_id,
      label: edge.condition,
    }))
  );
}

function CanvasInner() {
  const { state, dispatch } = useStore();
  const { fitView } = useReactFlow();

  const [rfNodes, setRFNodes] = useState<RFNode[]>(() =>
    toRFNodes(state.nodes, state.startNodeId)
  );

  // Sync store node additions/removals while preserving drag positions
  useEffect(() => {
    setRFNodes((prev) => {
      const posMap = new Map(prev.map((n) => [n.id, n.position]));
      return toRFNodes(state.nodes, state.startNodeId).map((node) => ({
        ...node,
        position: posMap.get(node.id) ?? node.position,
      }));
    });
    fitView({ padding: 0.2, duration: 300 });
  }, [state.nodes, state.startNodeId, fitView]);

  // Edges are fully derived — no local state needed
  const rfEdges = useMemo(() => toRFEdges(state.nodes), [state.nodes]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setRFNodes((prev) => applyNodeChanges(changes, prev));
      changes
        .filter((c) => c.type === "remove")
        .forEach((c) => dispatch({ type: "DELETE_NODE", payload: c.id }));
    },
    [dispatch]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: RFNode) => {
      dispatch({ type: "SELECT_NODE", payload: node.id });
    },
    [dispatch]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const removals = changes.filter((c) => c.type === "remove");
      for (const change of removals) {
        const [source, target] = change.id.split("->");
        const sourceNode = state.nodes.find((n) => n.id === source);
        if (!sourceNode) continue;
        dispatch({
          type: "UPDATE_NODE",
          payload: {
            id: source,
            patch: {
              edges: sourceNode.edges.filter((e) => e.to_node_id !== target),
            },
          },
        });
      }
    },
    [state.nodes, dispatch]
  );

  const isValidConnection = useCallback(
    (connection: Connection | RFEdge) => {
      const { source, target } = connection;
      if (!source || !target || source === target) return false;
      // block only if this exact direction already exists
      return !state.nodes.some(
        (n) => n.id === source && n.edges.some((e) => e.to_node_id === target)
      );
    },
    [state.nodes]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = state.nodes.find((n) => n.id === params.source);
      if (!sourceNode) return;
      dispatch({
        type: "UPDATE_NODE",
        payload: {
          id: sourceNode.id,
          patch: {
            edges: [
              ...sourceNode.edges,
              { to_node_id: params.target!, condition: "" },
            ],
          },
        },
      });
    },
    [state.nodes, dispatch]
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        isValidConnection={isValidConnection}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onConnect={onConnect}
        fitView
      >
        <MiniMap zoomable pannable />
      </ReactFlow>
    </div>
  );
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
