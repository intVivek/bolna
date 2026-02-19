"use client";

import { useStore } from "@/store";

export default function NodeEditor() {
  const { state, dispatch } = useStore();
  const { selectedNodeId } = state;
  const selectedNode = state.nodes.find((node) => node.id === selectedNodeId);

  if (!selectedNodeId) return null;

  function patch(field: "id" | "description", value: string) {
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: selectedNodeId!, patch: { [field]: value } },
    });
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          ID
        </label>
        <input
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          value={selectedNode?.id ?? ""}
          onChange={(e) => patch("id", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Description
        </label>
        <textarea
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none min-h-[80px]"
          value={selectedNode?.description ?? ""}
          onChange={(e) => patch("description", e.target.value)}
          placeholder="Optional description…"
        />
      </div>
    </div>
  );
}
