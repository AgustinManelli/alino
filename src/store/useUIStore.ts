import { create } from "zustand";

type UIState = {
  navbarStatus: boolean;
  setNavbarStatus: (value: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  navbarStatus: false,
  setNavbarStatus: (value) => set({ navbarStatus: value }),
}));
