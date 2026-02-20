"use client";

import { useMemo } from "react";
import { useStore } from "@/store";
import { validateNodes } from "@/lib/validate";
import { AlertCircle } from "lucide-react";

export default function ValidationSummary() {
  const { state, dispatch } = useStore();

  const errors = useMemo(() => validateNodes(state.nodes), [state.nodes]);

  if (errors.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 max-w-[300px] rounded-md border border-destructive/40 bg-destructive/5 p-3">
      <div className="flex items-center gap-1.5 text-destructive">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        <span className="text-xs truncate font-semibold">
          {errors.length} node{errors.length > 1 ? "s have" : " has"} errors
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {errors.map(({ nodeId, messages }) => {
          const idx = state.nodes.findIndex((n) => n.id === nodeId);
          return (
            <li key={nodeId}>
              <button
                className="text-left w-full truncate"
                onClick={() =>
                  dispatch({
                    type: "SELECT_NODE",
                    payload: idx >= 0 ? idx : null,
                  })
                }
              >
                <span className="text-xs font-medium text-destructive underline underline-offset-2 cursor-pointer">
                  {nodeId || "(empty id)"}
                </span>
              </button>
              <ul className="mt-0.5 pl-2 flex flex-col gap-0.5">
                {messages.map((msg) => (
                  <li key={msg} className="text-xs text-destructive/80">
                    · {msg}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
