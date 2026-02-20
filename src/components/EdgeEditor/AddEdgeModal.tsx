"use client";

import { useState } from "react";
import { type Edge } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AddEdgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableNodes: { id: string }[];
  onConfirm: (edge: Edge) => void;
}

const EMPTY_EDGE: Edge = { to_node_id: "", condition: "" };

export default function AddEdgeModal({
  open,
  onOpenChange,
  availableNodes,
  onConfirm,
}: AddEdgeModalProps) {
  const [draft, setDraft] = useState<Edge>(EMPTY_EDGE);
  const [errors, setErrors] = useState<Partial<Record<keyof Edge, string>>>({});

  function handleOpenChange(val: boolean) {
    if (!val) {
      setDraft(EMPTY_EDGE);
      setErrors({});
    }
    onOpenChange(val);
  }

  function validate(): boolean {
    const e: Partial<Record<keyof Edge, string>> = {};
    if (!draft.to_node_id) e.to_node_id = "Target node is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleConfirm() {
    if (!validate()) return;
    onConfirm(draft);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Edge</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium">Target Node</label>
            <Select
              value={draft.to_node_id}
              onValueChange={(val) => {
                setDraft((d) => ({ ...d, to_node_id: val }));
                setErrors((e) => ({ ...e, to_node_id: undefined }));
              }}
            >
              <SelectTrigger
                className={cn(
                  "max-w-[220px]",
                  errors.to_node_id ? "border-destructive" : ""
                )}
              >
                <SelectValue placeholder="Pick a target node…" />
              </SelectTrigger>
              <SelectContent>
                {availableNodes.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.to_node_id && (
              <p className="text-xs text-destructive">{errors.to_node_id}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium">
              Condition{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Input
              placeholder="Add a condition..."
              value={draft.condition}
              onChange={(e) =>
                setDraft((d) => ({ ...d, condition: e.target.value }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Add Edge</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
