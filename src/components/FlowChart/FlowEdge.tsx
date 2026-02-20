"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { X } from "lucide-react";

export default function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  markerEnd,
  style,
}: EdgeProps) {
  const { deleteElements } = useReactFlow();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  function remove(e: React.MouseEvent) {
    e.stopPropagation();
    deleteElements({ edges: [{ id }] });
  }

  const btnX = targetX - 14;
  const btnY = targetY - 14;

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        {label && (
          <div
            className="nopan nodrag"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
          >
            <div
              className="max-w-[100px] truncate rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground shadow-sm"
              title={typeof label === "string" ? label : undefined}
            >
              {label}
            </div>
          </div>
        )}

        <div
          className="group nopan nodrag"
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${btnX}px,${btnY}px)`,
            pointerEvents: "all",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onClick={remove}
            className="flex items-center justify-center w-3 h-3 rounded-full bg-zinc-600 border border-zinc-500 text-white cursor-pointer opacity-0 group-hover:opacity-30 hover:!opacity-100 hover:!bg-red-400 hover:!border-red-400 transition-all"
          >
            <X size={7} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
