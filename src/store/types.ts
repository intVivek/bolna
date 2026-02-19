export interface Edge {
  to_node_id: string;
  condition: string;
  parameters?: Record<string, string>;
}

export interface Node {
  id: string;
  description?: string;
  prompt: string;
  edges: Edge[];
}
