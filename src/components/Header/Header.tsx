"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check, ArrowLeft } from "lucide-react";

function buildJson(nodes: ReturnType<typeof useStore>["state"]["nodes"]) {
  return JSON.stringify(
    { startNodeId: nodes[0]?.id ?? null, nodes },
    null,
    2
  );
}

export default function Header() {
  const { state } = useStore();
  const [copied, setCopied] = useState(false);

  function handleExport() {
    const json = buildJson(state.nodes);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flow.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildJson(state.nodes)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="h-[60px] flex items-center justify-between border-b px-4">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="text-lg font-bold">Flow Builder</div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied" : "Copy JSON"}
        </Button>
        <Button size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
}
