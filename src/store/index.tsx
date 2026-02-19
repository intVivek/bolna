"use client";

import { createContext, useContext, useReducer, ReactNode, JSX } from "react";
import type { Node, Edge } from "./types";

export type { Node, Edge };

interface StoreState {
  nodes: Node[];
  edges: Edge[];
}

type Action =
  | { type: "SET_NODES"; payload: Node[] }
  | { type: "SET_EDGES"; payload: Edge[] };

const initialState: StoreState = {
  nodes: [],
  edges: [],
};

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "SET_NODES":
      return { ...state, nodes: action.payload };
    case "SET_EDGES":
      return { ...state, edges: action.payload };
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
