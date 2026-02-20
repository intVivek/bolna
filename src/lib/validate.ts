import type { Node } from "@/store/types";

export interface NodeError {
  nodeId: string;
  messages: string[];
}

export function validateNodes(nodes: Node[]): NodeError[] {
  const ids = nodes.map((n) => n.id);

  return nodes.reduce<NodeError[]>((acc, node) => {
    const messages: string[] = [];

    if (!node.id.trim()) messages.push("ID is required");
    else if (ids.filter((id) => id === node.id).length > 1)
      messages.push("ID must be unique");

    if (!node.description?.trim()) messages.push("Description is required");

    if (messages.length) acc.push({ nodeId: node.id, messages });
    return acc;
  }, []);
}
