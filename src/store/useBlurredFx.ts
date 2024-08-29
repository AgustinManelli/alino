import { create } from "zustand";

interface BlurredState {
  color: string | undefined;
  setColor: (color: string) => void;
}

export const useBlurredFxStore = create<BlurredState>((set) => ({
  color: "transparent",
  setColor: (color) => set({ color }),
}));
