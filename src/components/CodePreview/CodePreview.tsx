"use client";

import { useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { githubLight } from "@uiw/codemirror-theme-github";
import { useStore } from "@/store";
import type { Node } from "@/store";
import { Copy, Check } from "lucide-react";

function toJson(startNodeId: string | null, nodes: Node[]) {
  return JSON.stringify({ startNodeId, nodes }, null, 2);
}

export default function CodePreview() {
  const { state } = useStore();
  const [copied, setCopied] = useState(false);

  const startNodeId = state.nodes[0]?.id ?? null;

  const storeJson = useMemo(
    () => toJson(startNodeId, state.nodes),
    [startNodeId, state.nodes]
  );

  function handleCopy() {
    navigator.clipboard.writeText(storeJson).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mt-4">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        JSON
      </div>
      <div className="h-max max-h-[300px] w-full mt-2 flex flex-col text-sm border rounded-lg overflow-hidden relative group">
        <div
          className="absolute top-2 right-2 z-10 h-8 w-8 flex items-center justify-center border rounded-md cursor-pointer bg-background"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </div>
        <div className="flex-1 overflow-auto min-h-0">
          <CodeMirror
            value={storeJson}
            height="100%"
            theme={githubLight}
            extensions={[json()]}
            editable={false}
            basicSetup={{
              lineNumbers: false,
              foldGutter: false,
              highlightActiveLine: false,
            }}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
}
