import { create } from "zustand";

type SidebarStateStore = {
  navbarStatus: boolean;
  setNavbarStatus: (value: boolean) => void;
  toggleNavbarStatus: () => void;
};

export const useSidebarStateStore = create<SidebarStateStore>((set) => ({
  navbarStatus: false,
  setNavbarStatus: (value) => set({ navbarStatus: value }),
  toggleNavbarStatus: () =>
    set((state) => ({ navbarStatus: !state.navbarStatus })),
}));
