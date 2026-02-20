"use client";

import { useState } from "react";
import { useStore, type Edge } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import AddEdgeModal from "./AddEdgeModal";

export default function EdgeEditor() {
  const { state, dispatch } = useStore();
  const selectedNode =
    state.selectedIndex !== null ? state.nodes[state.selectedIndex] : null;

  const [open, setOpen] = useState(false);

  if (!selectedNode) return null;

  const otherNodes = state.nodes.filter((n) => n.id !== selectedNode.id);
  const existingTargetIds = new Set(selectedNode.edges.map((e) => e.to_node_id));
  const availableNodes = otherNodes.filter((n) => !existingTargetIds.has(n.id));

  function updateEdges(edges: Edge[]) {
    dispatch({
      type: "UPDATE_NODE",
      payload: { index: state.selectedIndex!, patch: { edges } },
    });
  }

  function openModal() {
    if (availableNodes.length === 0) {
      toast.warning("All nodes already connected", {
        description:
          "All other nodes already have an outgoing edge from this node.",
      });
      return;
    }
    setOpen(true);
  }

  function removeEdge(index: number) {
    updateEdges(selectedNode!.edges.filter((_, i) => i !== index));
  }

  function updateEdge(index: number, patch: Partial<Edge>) {
    updateEdges(
      selectedNode!.edges.map((e, i) => (i === index ? { ...e, ...patch } : e))
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Outgoing Edges
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={openModal}
          className="h-7 gap-1 text-xs"
        >
          <Plus className="h-3 w-3" />
          Add Edge
        </Button>
      </div>

      {selectedNode.edges.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No outgoing edges</p>
      )}

      {selectedNode.edges.map((edge, i) => {
        const rowAvailableNodes = otherNodes.filter(
          (n) => n.id === edge.to_node_id || !existingTargetIds.has(n.id)
        );

        return (
          <div key={i} className="flex flex-col gap-2 rounded-md border p-3">
            <div className="flex items-center gap-2">
              <Select
                value={edge.to_node_id}
                onValueChange={(val) => updateEdge(i, { to_node_id: val })}
              >
                <SelectTrigger className="flex-1 h-8 text-xs">
                  <SelectValue placeholder="Target node…" />
                </SelectTrigger>
                <SelectContent>
                  {rowAvailableNodes.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                onClick={() => removeEdge(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              className="h-8 text-xs"
              placeholder="Condition (optional)…"
              value={edge.condition}
              onChange={(e) => updateEdge(i, { condition: e.target.value })}
            />
          </div>
        );
      })}

      <AddEdgeModal
        open={open}
        onOpenChange={setOpen}
        availableNodes={availableNodes}
        onConfirm={(edge) => updateEdges([...selectedNode.edges, edge])}
      />
    </div>
  );
}
