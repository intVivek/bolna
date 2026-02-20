"use client";

import Canvas from "./Canvas";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import ValidationSummary from "../ValidationSummary";
import WarningSummary from "../WarningSummary";

function generateId(nodes: { id: string }[]): string {
  const ids = new Set(nodes.map((n) => n.id));
  let i = 1;
  while (ids.has(`node-${i}`)) i++;
  return `node-${i}`;
}

export default function FlowChart() {
  const { state, dispatch } = useStore();
  const selectedNode =
    state.selectedIndex !== null ? state.nodes[state.selectedIndex] : null;

  function addNode() {
    const id = generateId(state.nodes);
    dispatch({
      type: "ADD_NODE",
      payload: { id, description: id, prompt: "", edges: [] },
    });
  }

  return (
    <div className="relative h-full flex-1">
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <ValidationSummary />
        <WarningSummary />
      </div>
      <Canvas />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        <Button onClick={addNode}>
          <Plus className="h-4 w-4" />
          Add Node
        </Button>
        {selectedNode && (
          <Button
            variant="destructive"
            disabled={state.selectedIndex === 0}
            title={
              state.selectedIndex === 0
                ? "Start node cannot be deleted"
                : undefined
            }
            onClick={() =>
              dispatch({
                type: "DELETE_NODE",
                payload: state.selectedIndex!,
              })
            }
          >
            <Trash2 className="h-4 w-4" />
            Delete Node
          </Button>
        )}
      </div>
    </div>
  );
}
