import { create } from "zustand";

type UIState = {
  allowCloseNavbar: boolean;
  setAllowCloseNavbar: (value: boolean) => void;
  navbarStatus: boolean;
  setNavbarStatus: (value: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  allowCloseNavbar: true,
  navbarStatus: false,

  setAllowCloseNavbar: (value) => set({ allowCloseNavbar: value }),
  setNavbarStatus: (value) => set({ navbarStatus: value }),
}));
