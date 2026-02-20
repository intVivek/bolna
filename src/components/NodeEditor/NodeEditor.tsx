"use client";

import { useStore } from "@/store";

export default function NodeEditor() {
  const { state, dispatch } = useStore();
  const selectedNode =
    state.selectedIndex !== null ? state.nodes[state.selectedIndex] : null;

  if (!selectedNode) return null;

  const idError =
    selectedNode.id.trim() === ""
      ? "ID is required"
      : state.nodes.some((n) => n.id === selectedNode.id && n !== selectedNode)
      ? "ID must be unique"
      : null;

  const descriptionError = !selectedNode.description?.trim()
    ? "Description is required"
    : null;

  function patchId(value: string) {
    dispatch({
      type: "UPDATE_NODE",
      payload: { index: state.selectedIndex!, patch: { id: value } },
    });
  }

  function patchDescription(value: string) {
    dispatch({
      type: "UPDATE_NODE",
      payload: { index: state.selectedIndex!, patch: { description: value } },
    });
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          ID
        </label>
        <input
          className={`rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring bg-background ${
            idError
              ? "border-destructive focus:ring-destructive/30"
              : "border-input"
          }`}
          value={selectedNode.id}
          onChange={(e) => patchId(e.target.value)}
        />
        {idError && <p className="text-xs text-destructive">{idError}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Description
        </label>
        <textarea
          className={`rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none min-h-[80px] bg-background ${
            descriptionError
              ? "border-destructive focus:ring-destructive/30"
              : "border-input"
          }`}
          value={selectedNode.description ?? ""}
          onChange={(e) => patchDescription(e.target.value)}
          placeholder="Enter a description…"
        />
        {descriptionError && (
          <p className="text-xs text-destructive">{descriptionError}</p>
        )}
      </div>
    </div>
  );
}
