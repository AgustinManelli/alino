import { create } from "zustand";

type SidebarStateStore = {
  navbarStatus: boolean;
  setNavbarStatus: (value: boolean) => void;
  toggleNavbarStatus: () => void;
  pendingListId: string | null;
  setPendingListId: (id: string | null) => void;
};

export const useSidebarStateStore = create<SidebarStateStore>((set) => ({
  navbarStatus: false,
  setNavbarStatus: (value) => set({ navbarStatus: value }),
  toggleNavbarStatus: () =>
    set((state) => ({ navbarStatus: !state.navbarStatus })),
  pendingListId: null,
  setPendingListId: (id) => set({ pendingListId: id }),
}));
