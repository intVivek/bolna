import type { Node } from "@/store/types";

export interface NodeError {
  nodeId: string;
  messages: string[];
}

function reachableIds(nodes: Node[]): Set<string> {
  if (nodes.length === 0) return new Set();
  const visited = new Set<string>();
  const queue = [nodes[0].id];
  const adjMap = new Map(nodes.map((n) => [n.id, n.edges.map((e) => e.to_node_id)]));

  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    for (const neighbor of adjMap.get(id) ?? []) {
      if (!visited.has(neighbor)) queue.push(neighbor);
    }
  }
  return visited;
}

export function validateNodes(nodes: Node[]): NodeError[] {
  if (nodes.length === 0) return [];

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

export function validateWarnings(nodes: Node[]): NodeError[] {
  if (nodes.length <= 1) return [];

  const reachable = reachableIds(nodes);

  return nodes.slice(1).reduce<NodeError[]>((acc, node) => {
    if (!reachable.has(node.id)) {
      acc.push({
        nodeId: node.id,
        messages: ["Not reachable from the start node"],
      });
    }
    return acc;
  }, []);
}
