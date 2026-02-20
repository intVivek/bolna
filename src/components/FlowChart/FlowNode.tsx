import { cn } from "@/lib/utils";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AlertCircle, AlertTriangle } from "lucide-react";

export interface FlowNodeData extends Record<string, unknown> {
  id: string;
  prompt: string;
  isStart: boolean;
  isSelected: boolean;
  hasError: boolean;
  hasWarning: boolean;
}

export default function FlowNode({ data }: NodeProps) {
  const { id, prompt, isStart, isSelected, hasError, hasWarning } =
    data as FlowNodeData;

  return (
    <div
      className={cn(
        "min-w-[160px] max-w-[220px] rounded-lg border bg-white overflow-hidden",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : hasError
          ? "border-destructive/60"
          : hasWarning
          ? "border-amber-400/70"
          : "border-border"
      )}
    >
      <div
        className={cn(
          "px-3 py-2.5 flex flex-col gap-1",
          isStart ? "bg-emerald-400" : ""
        )}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-semibold text-foreground truncate">
            {id}
          </span>
          {hasError && (
            <AlertCircle className="h-3 w-3 shrink-0 text-destructive" />
          )}
          {!hasError && hasWarning && (
            <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500" />
          )}
        </div>
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
