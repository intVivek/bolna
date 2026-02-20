"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Background,
  BackgroundVariant,
  applyNodeChanges,
  useReactFlow,
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
import FlowEdge from "./FlowEdge";
import ConnectionLine from "./ConnectionLine";
import { validateNodes, validateWarnings } from "@/lib/validate";

const nodeTypes = { flowNode: FlowNode };
const edgeTypes = { flowEdge: FlowEdge };

const EDGE_COLOR = "#6b7280";

const defaultEdgeOptions = {
  type: "flowEdge",
  style: { stroke: EDGE_COLOR, strokeWidth: 0.75 },
  markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLOR },
};

function toRFNodes(
  storeNodes: StoreNode[],
  selectedIndex: number | null
): RFNode[] {
  const errorIds = new Set(validateNodes(storeNodes).map((e) => e.nodeId));
  const warnIds = new Set(validateWarnings(storeNodes).map((w) => w.nodeId));
  return storeNodes.map((node, i) => ({
    id: String(i),
    type: "flowNode",
    position: { x: 0, y: i * 120 },
    data: {
      id: node.id,
      prompt: node.prompt,
      isStart: i === 0,
      isSelected: i === selectedIndex,
      hasError: errorIds.has(node.id),
      hasWarning: warnIds.has(node.id),
    },
    deletable: i !== 0,
  }));
}

function toRFEdges(storeNodes: StoreNode[]): RFEdge[] {
  const idToIdx = new Map(storeNodes.map((n, i) => [n.id, String(i)]));
  return storeNodes.flatMap((node, i) =>
    node.edges.map((edge) => {
      const tgtIdx = idToIdx.get(edge.to_node_id) ?? edge.to_node_id;
      return {
        id: `${i}->${tgtIdx}`,
        source: String(i),
        target: tgtIdx,
        sourceHandle: "source",
        targetHandle: "target",
        label: edge.condition,
      };
    })
  );
}

function CanvasInner() {
  const { state, dispatch } = useStore();
  const { fitView } = useReactFlow();

  const [rfNodes, setRFNodes] = useState<RFNode[]>(() =>
    toRFNodes(state.nodes, state.selectedIndex)
  );

  useEffect(() => {
    setRFNodes((prev) => {
      const posMap = new Map(prev.map((n) => [n.id, n.position]));
      return toRFNodes(state.nodes, state.selectedIndex).map((node) => ({
        ...node,
        position: posMap.get(node.id) ?? node.position,
      }));
    });
    fitView({ padding: 0.2, duration: 300 });
  }, [state.nodes, state.selectedIndex, fitView]);

  const rfEdges = useMemo(() => toRFEdges(state.nodes), [state.nodes]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setRFNodes((prev) => applyNodeChanges(changes, prev));
      changes
        .filter((c) => c.type === "remove")
        .forEach((c) =>
          dispatch({ type: "DELETE_NODE", payload: parseInt(c.id) })
        );
    },
    [dispatch]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: RFNode) => {
      dispatch({ type: "SELECT_NODE", payload: parseInt(node.id) });
    },
    [dispatch]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      changes
        .filter((c) => c.type === "remove")
        .forEach((change) => {
          const [srcIdx, tgtIdx] = change.id.split("->").map(Number);
          const sourceNode = state.nodes[srcIdx];
          const targetNode = state.nodes[tgtIdx];
          if (!sourceNode || !targetNode) return;
          dispatch({
            type: "UPDATE_NODE",
            payload: {
              index: srcIdx,
              patch: {
                edges: sourceNode.edges.filter(
                  (e) => e.to_node_id !== targetNode.id
                ),
              },
            },
          });
        });
    },
    [state.nodes, dispatch]
  );

  const isValidConnection = useCallback(
    (connection: Connection | RFEdge) => {
      const { source, target } = connection;
      if (!source || !target || source === target) return false;
      const sourceNode = state.nodes[parseInt(source)];
      const targetNode = state.nodes[parseInt(target)];
      if (!sourceNode || !targetNode) return false;
      return !sourceNode.edges.some((e) => e.to_node_id === targetNode.id);
    },
    [state.nodes]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const srcIdx = parseInt(params.source!);
      const tgtIdx = parseInt(params.target!);
      const sourceNode = state.nodes[srcIdx];
      const targetNode = state.nodes[tgtIdx];
      if (!sourceNode || !targetNode) return;
      dispatch({
        type: "UPDATE_NODE",
        payload: {
          index: srcIdx,
          patch: {
            edges: [
              ...sourceNode.edges,
              { to_node_id: targetNode.id, condition: "" },
            ],
          },
        },
      });
    },
    [state.nodes, dispatch]
  );

  return (
    <div className="h-full w-full bg-[#f8f8f8]">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineComponent={ConnectionLine}
        isValidConnection={isValidConnection}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onConnect={onConnect}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d1d5db" />
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
