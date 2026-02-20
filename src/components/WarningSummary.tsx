"use client";

import { useMemo } from "react";
import { useStore } from "@/store";
import { validateWarnings } from "@/lib/validate";
import { AlertTriangle } from "lucide-react";

export default function WarningSummary() {
  const { state, dispatch } = useStore();

  const warnings = useMemo(
    () => validateWarnings(state.nodes),
    [state.nodes]
  );

  if (warnings.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-md border border-amber-400/50 bg-amber-50 p-3">
      <div className="flex items-center gap-1.5 text-amber-600">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        <span className="text-xs font-semibold">
          {warnings.length} node{warnings.length > 1 ? "s are" : " is"}{" "}
          disconnected
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {warnings.map(({ nodeId, messages }) => {
          const idx = state.nodes.findIndex((n) => n.id === nodeId);
          return (
            <li key={nodeId}>
              <button
                className="text-left w-full"
                onClick={() =>
                  dispatch({
                    type: "SELECT_NODE",
                    payload: idx >= 0 ? idx : null,
                  })
                }
              >
                <span className="text-xs font-medium text-amber-700 underline underline-offset-2 cursor-pointer">
                  {nodeId || "(empty id)"}
                </span>
              </button>
              <ul className="mt-0.5 pl-2 flex flex-col gap-0.5">
                {messages.map((msg) => (
                  <li key={msg} className="text-xs text-amber-600/80">
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
