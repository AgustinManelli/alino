import { create } from "zustand";
import React from "react";

type RefType = React.RefObject<HTMLElement>;

interface PortalState {
  portalRefs: Set<RefType>;
  registerPortalRef: (ref: RefType) => void;
  unregisterPortalRef: (ref: RefType) => void;
}

export const usePortalStore = create<PortalState>()((set) => ({
  portalRefs: new Set(),

  registerPortalRef: (ref) =>
    set((state) => ({
      portalRefs: new Set(state.portalRefs).add(ref),
    })),

  unregisterPortalRef: (ref) =>
    set((state) => {
      const newRefs = new Set(state.portalRefs);
      newRefs.delete(ref);
      return { portalRefs: newRefs };
    }),
}));
