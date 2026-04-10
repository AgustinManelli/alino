import { create } from "zustand";

interface PremiumModalState {
  isOpen: boolean;
  openPremiumModal: () => void;
  closePremiumModal: () => void;
}

export const usePremiumModalStore = create<PremiumModalState>((set) => ({
  isOpen: false,
  openPremiumModal: () => set({ isOpen: true }),
  closePremiumModal: () => set({ isOpen: false }),
}));
