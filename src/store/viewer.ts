import { createContext, useContext } from "react";
import { UserRole } from "../types";
import { PriceAlert } from "../lib/priceAlerts";
import { Planting } from "../lib/plantings";
import { IncomingOrder } from "../types";

// ─── Viewer ───────────────────────────────────────────────────────────────────
// Who is looking at the screen, for the shared pieces that answer differently
// for a farmer and a buyer (the header bell). Screens already take the role as
// a prop; the header sits inside all of them, and threading the same two
// values through six screens for one component is plumbing, not design.
export type Viewer = {
  role: UserRole; location: string; priceAlerts: PriceAlert[]; plantings: Planting[];
  /** Orders buyers have placed with this farmer, and how to confirm one. */
  orders: IncomingOrder[];
  confirmOrder: (id: string) => void;
};

export const ViewerContext = createContext<Viewer>({ role: null, location: "", priceAlerts: [], plantings: [], orders: [], confirmOrder: () => {} });

export const useViewer = () => useContext(ViewerContext);
