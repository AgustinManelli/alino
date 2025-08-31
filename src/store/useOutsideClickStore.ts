import { create } from "zustand";

type RefType = React.RefObject<HTMLElement>;

interface OutsideClickState {
  ignoreRefs: RefType[];
  registerRef: (ref: RefType) => void;
  unregisterRef: (ref: RefType) => void;
}

export const useOutsideClickStore = create<OutsideClickState>((set) => ({
  ignoreRefs: [],
  registerRef: (ref) =>
    set((state) => ({
      ignoreRefs: [...state.ignoreRefs, ref],
    })),
  unregisterRef: (ref) =>
    set((state) => ({
      ignoreRefs: state.ignoreRefs.filter((r) => r !== ref),
    })),
}));
