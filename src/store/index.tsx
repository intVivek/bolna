"use client";

import { createContext, useContext, useReducer, ReactNode, JSX } from "react";
import type { Node } from "./types";

export type { Node };
export type { Edge } from "./types";

interface StoreState {
  nodes: Node[];
  selectedNodeId: string | null;
  startNodeId: string | null;
}

type Action =
  | { type: "SET_NODES"; payload: Node[] }
  | { type: "ADD_NODE"; payload: Node }
  | { type: "DELETE_NODE"; payload: string }
  | { type: "UPDATE_NODE"; payload: { id: string; patch: Partial<Node> } }
  | { type: "SELECT_NODE"; payload: string | null }
  | { type: "SET_START_NODE"; payload: string | null };

export type { Action };

const initialState: StoreState = {
  nodes: [],
  selectedNodeId: null,
  startNodeId: null,
};

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "SET_NODES":
      return { ...state, nodes: action.payload };

    case "ADD_NODE": {
      const isFirst = state.nodes.length === 0;
      return {
        ...state,
        nodes: [...state.nodes, action.payload],
        startNodeId: isFirst ? action.payload.id : state.startNodeId,
      };
    }

    case "DELETE_NODE": {
      const id = action.payload;
      return {
        ...state,
        nodes: state.nodes
          .filter((n) => n.id !== id)
          .map((n) => ({
            ...n,
            edges: n.edges.filter((e) => e.to_node_id !== id),
          })),
        selectedNodeId:
          state.selectedNodeId === id ? null : state.selectedNodeId,
        startNodeId: state.startNodeId === id ? null : state.startNodeId,
      };
    }

    case "UPDATE_NODE": {
      const { id, patch } = action.payload;
      const newId = patch.id;

      let nodes = state.nodes.map((n) =>
        n.id === id ? { ...n, ...patch } : n
      );

      if (newId && newId !== id) {
        nodes = nodes.map((n) => ({
          ...n,
          edges: n.edges.map((e) => ({
            ...e,
            to_node_id: e.to_node_id === id ? newId : e.to_node_id,
          })),
        }));
      }

      return {
        ...state,
        nodes,
        selectedNodeId:
          newId && state.selectedNodeId === id ? newId : state.selectedNodeId,
        startNodeId:
          newId && state.startNodeId === id ? newId : state.startNodeId,
      };
    }

    case "SELECT_NODE":
      return { ...state, selectedNodeId: action.payload };

    case "SET_START_NODE":
      return { ...state, startNodeId: action.payload };

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
  const [state, dispatch] = useReducer(reducer, initialState);

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
