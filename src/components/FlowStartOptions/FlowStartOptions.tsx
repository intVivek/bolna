"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  FilePlus,
  FileJson,
  Upload,
  AlertCircle,
  AlertTriangle,
  History,
} from "lucide-react";
import type { Node } from "@/store/types";
import { validateNodes, type NodeError } from "@/lib/validate";
import { clearPersistedNodes } from "@/store";

type Mode = "idle" | "paste";

interface ParsedResult {
  nodes: Node[];
  validationErrors: NodeError[];
}

function parseJson(raw: string): ParsedResult | string {
  try {
    const parsed = JSON.parse(raw);
    const nodes: Node[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.nodes)
      ? parsed.nodes
      : null!;
    if (!Array.isArray(nodes) || nodes.length === 0)
      return "JSON must contain a non-empty nodes array.";
    return { nodes, validationErrors: validateNodes(nodes) };
  } catch {
    return "Invalid JSON — please check the syntax and try again.";
  }
}

export default function FlowStartOptions() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("idle");
  const [text, setText] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [pending, setPending] = useState<ParsedResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("flow_nodes");
      if (stored) {
        const nodes = JSON.parse(stored);
        setHasSaved(Array.isArray(nodes) && nodes.length > 0);
      }
    } catch {}
  }, []);

  function navigate() {
    router.push("/dashboard");
  }

  function tryLoad(raw: string) {
    setParseError(null);
    setPending(null);
    const result = parseJson(raw);
    if (typeof result === "string") return setParseError(result);
    if (result.validationErrors.length > 0) {
      setPending(result);
    } else {
      navigate();
    }
  }

  function handleFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => tryLoad(e.target?.result as string);
    reader.readAsText(file);
    fileRef.current!.value = "";
  }

  function resetMode(next: Mode) {
    setMode(next);
    setParseError(null);
    setPending(null);
    setText("");
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {hasSaved && (
        <>
          <button
            onClick={navigate}
            className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-left hover:border-primary hover:bg-primary/10 transition-colors"
          >
            <History className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <div className="text-sm font-medium">
                Continue where you left off
              </div>
              <div className="text-xs text-muted-foreground">
                Your last flow is saved locally
              </div>
            </div>
          </button>
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </>
      )}

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => {
            clearPersistedNodes();
            navigate();
          }}
          className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <FilePlus className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium">Create New</span>
        </button>

        <button
          onClick={() => resetMode(mode === "paste" ? "idle" : "paste")}
          className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors ${
            mode === "paste"
              ? "border-primary bg-primary/5"
              : "hover:border-primary hover:bg-primary/5"
          }`}
        >
          <FileJson className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium">Paste JSON</span>
        </button>

        <button
          onClick={() => {
            resetMode("idle");
            fileRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Element))
              setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files[0] ?? null);
          }}
          className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors ${
            dragging
              ? "border-primary bg-primary/5 border-dashed"
              : "hover:border-primary hover:bg-primary/5"
          }`}
        >
          <Upload
            className={`h-6 w-6 ${
              dragging ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <span className="text-sm font-medium">
            {dragging ? "Drop here" : "Upload File"}
          </span>
        </button>
      </div>

      {mode === "paste" && !pending && (
        <div className="flex flex-col gap-2">
          <textarea
            autoFocus
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-ring resize-none h-40"
            placeholder={'{\n  "nodes": [...]\n}'}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setParseError(null);
            }}
          />
          {parseError && (
            <div className="flex items-start gap-1.5 text-destructive text-xs">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {parseError}
            </div>
          )}
          <Button
            size="sm"
            onClick={() => tryLoad(text)}
            disabled={!text.trim()}
          >
            Load
          </Button>
        </div>
      )}

      {parseError && mode !== "paste" && (
        <div className="flex items-start gap-1.5 text-destructive text-xs">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          {parseError}
        </div>
      )}

      {pending && (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-400/50 bg-amber-50 p-3">
          <div className="flex items-center gap-1.5 text-amber-600">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs font-semibold">
              {pending.validationErrors.length} node
              {pending.validationErrors.length > 1 ? "s have" : " has"}{" "}
              validation issues
            </span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {pending.validationErrors.map(({ nodeId, messages }) => (
              <li key={nodeId}>
                <span className="text-xs font-medium text-amber-700">
                  {nodeId || "(empty id)"}
                </span>
                <ul className="pl-2">
                  {messages.map((msg) => (
                    <li key={msg} className="text-xs text-amber-600/80">
                      · {msg}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPending(null)}
            >
              Go back
            </Button>
            <Button size="sm" onClick={navigate}>
              Load anyway
            </Button>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
