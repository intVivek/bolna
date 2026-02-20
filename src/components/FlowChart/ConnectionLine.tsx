import {
  getSmoothStepPath,
  Position,
  type ConnectionLineComponentProps,
} from "@xyflow/react";

const EDGE_COLOR = "#7c3aed";

export default function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
}: ConnectionLineComponentProps) {
  const fromSource = fromPosition === Position.Bottom;

  const [path] = getSmoothStepPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: fromSource ? Position.Top : Position.Bottom,
  });

  return (
    <g>
      <defs>
        <marker
          id="conn-arrow"
          markerWidth="5"
          markerHeight="5"
          refX="0"
          refY="2.5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 5 2.5 L 0 5 z" fill={EDGE_COLOR} />
        </marker>
      </defs>
      <path
        fill="none"
        stroke={EDGE_COLOR}
        strokeWidth={0.75}
        strokeDasharray="6 3"
        d={path}
        markerEnd={fromSource ? "url(#conn-arrow)" : undefined}
        markerStart={!fromSource ? "url(#conn-arrow)" : undefined}
        style={{ animation: "dashdraw 0.8s linear infinite" }}
      />
      <style>{`
        @keyframes dashdraw {
          from { stroke-dashoffset: 18; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
    </g>
  );
}
