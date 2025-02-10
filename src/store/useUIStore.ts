import { create } from "zustand";

type UIState = {
  allowCloseNavbar: boolean;
  isCreating: boolean;
  setAllowCloseNavbar: (value: boolean) => void;
  setIsCreating: (value: boolean) => void;
  navbarStatus: boolean;
  setNavbarStatus: (value: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  allowCloseNavbar: true,
  isCreating: false,
  navbarStatus: false,

  setAllowCloseNavbar: (value) => set({ allowCloseNavbar: value }),
  setIsCreating: (value) => set({ isCreating: value }),
  setNavbarStatus: (value) => set({ navbarStatus: value }),
}));
