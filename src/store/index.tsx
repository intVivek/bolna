"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  JSX,
} from "react";
import type { Node } from "./types";

export type { Node };
export type { Edge } from "./types";

const STORAGE_KEY = "flow_nodes";

interface StoreState {
  nodes: Node[];
  selectedIndex: number | null;
}

type Action =
  | { type: "SET_NODES"; payload: Node[] }
  | { type: "ADD_NODE"; payload: Node }
  | { type: "DELETE_NODE"; payload: number }
  | { type: "UPDATE_NODE"; payload: { index: number; patch: Partial<Node> } }
  | { type: "SELECT_NODE"; payload: number | null };

export type { Action };

const defaultState: StoreState = {
  nodes: [{ id: "node-1", description: "Start node", prompt: "", edges: [] }],
  selectedIndex: 0,
};

function getInitialState(): StoreState {
  if (typeof window === "undefined") return defaultState;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const nodes = JSON.parse(stored);
      if (Array.isArray(nodes) && nodes.length > 0)
        return { nodes, selectedIndex: 0 };
    }
  } catch {}
  return defaultState;
}

export function clearPersistedNodes() {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
}

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "SET_NODES": {
      const newNodes = action.payload;
      const selected =
        state.selectedIndex !== null && state.selectedIndex < newNodes.length
          ? state.selectedIndex
          : newNodes.length > 0
          ? 0
          : null;
      return { ...state, nodes: newNodes, selectedIndex: selected };
    }

    case "ADD_NODE": {
      const newNodes = [...state.nodes, action.payload];
      return { ...state, nodes: newNodes, selectedIndex: newNodes.length - 1 };
    }

    case "DELETE_NODE": {
      const idx = action.payload;
      const deletedId = state.nodes[idx]?.id;
      const newNodes = state.nodes
        .filter((_, i) => i !== idx)
        .map((n) => ({
          ...n,
          edges: n.edges.filter((e) => e.to_node_id !== deletedId),
        }));

      let newSelected: number | null;
      if (newNodes.length === 0) {
        newSelected = null;
      } else if (state.selectedIndex === idx) {
        newSelected = 0;
      } else if (state.selectedIndex !== null && state.selectedIndex > idx) {
        newSelected = state.selectedIndex - 1;
      } else {
        newSelected = state.selectedIndex;
      }

      return { ...state, nodes: newNodes, selectedIndex: newSelected };
    }

    case "UPDATE_NODE": {
      const { index, patch } = action.payload;
      const target = state.nodes[index];
      if (!target) return state;

      const oldId = target.id;
      const newId = patch.id;

      let nodes = state.nodes.map((n, i) =>
        i === index ? { ...n, ...patch } : n
      );

      if (newId !== undefined && newId !== oldId) {
        nodes = nodes.map((n, i) =>
          i === index
            ? n
            : {
                ...n,
                edges: n.edges.map((e) => ({
                  ...e,
                  to_node_id: e.to_node_id === oldId ? newId : e.to_node_id,
                })),
              }
        );
      }

      return { ...state, nodes };
    }

    case "SELECT_NODE":
      return { ...state, selectedIndex: action.payload };

    default:
      return state;
  }
}

interface StoreContextValue {
  state: StoreState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  // Persist on every nodes change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.nodes));
  }, [state.nodes]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
