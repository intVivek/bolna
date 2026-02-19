import { cn } from "@/lib/utils";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export interface FlowNodeData extends Record<string, unknown> {
  id: string;
  prompt: string;
  isStart: boolean;
}

export default function FlowNode({ data, selected }: NodeProps) {
  const { id, prompt, isStart } = data as FlowNodeData;

  return (
    <div
      className={cn(
        "min-w-[160px] max-w-[220px] rounded-lg border bg-white overflow-hidden",
        selected ? "border-primary/50" : "border-border"
      )}
    >
      <div
        className={cn(
          "px-3 py-2.5 flex flex-col gap-1",
          isStart ? "bg-emerald-400" : ""
        )}
      >
        <span className="text-xs font-semibold text-foreground truncate">
          {id}
        </span>
        {prompt && (
          <span className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
            {prompt}
          </span>
        )}
      </div>

      {!isStart && <Handle type="target" position={Position.Top} />}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
