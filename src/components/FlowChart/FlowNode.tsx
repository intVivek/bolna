import { cn } from "@/lib/utils";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { Badge } from "../ui/badge";

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
        "min-w-[160px] max-w-[220px] rounded-lg border bg-white overflow-hidden shadow-md",
        isSelected && "ring-2 ring-primary/20",
        hasWarning && "border-amber-400/70",
        hasError && "border-destructive/60",
        isStart && "bg-primary/10"
      )}
    >
      <div className={cn("px-3 py-2.5 flex gap-2 min-w-0")}>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-xs font-semibold text-foreground truncate">
              {id}
            </span>
            {isStart && (
              <Badge
                variant="default"
                className="text-[6px] py-px px-1 h-max shrink-0"
              >
                Start
              </Badge>
            )}
          </div>
          {prompt && (
            <div className="text-[8px] py-[2px] truncate text-muted-foreground leading-snug">
              {prompt}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between ml-auto gap-1">
          <div className="flex items-center gap-1">
            {hasWarning && (
              <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500" />
            )}
            {hasError && (
              <AlertCircle className="h-3 w-3 shrink-0 text-destructive" />
            )}
          </div>
        </div>
      </div>

      <Handle
        id="target"
        type="target"
        position={Position.Top}
        className="w-3! h-[6px]! rounded-[2px]! bg-muted-foreground! border-0!"
      />
      <Handle
        id="source"
        type="source"
        position={Position.Bottom}
        className="w-[6px]! h-[6px]! rounded-full! bg-primary! border-0!"
      />
    </div>
  );
}
