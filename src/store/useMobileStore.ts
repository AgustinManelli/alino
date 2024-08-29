import create from "zustand";

interface MobileState {
  isMobile: boolean;
  setIsMobile: (value: boolean) => void;
}

const useMobileStore = create<MobileState>((set) => ({
  isMobile: window.innerWidth < 850,
  setIsMobile: (value) => set({ isMobile: value }),
}));

export default useMobileStore;
