import { create } from "zustand";

export interface SelectionItem {
  id: string;
  kind: "list" | "folder";
  parentFolderId?: string | null;
  name: string;
}

interface SidebarSelectionStore {
  isSelectionMode: boolean;
  selectedItems: SelectionItem[];
  
  startSelectionMode: (initialItem?: SelectionItem) => void;
  cancelSelectionMode: () => void;
  toggleItemSelection: (item: SelectionItem) => void;
  isItemSelected: (id: string) => boolean;
  clearSelection: () => void;
}

export const useSidebarSelectionStore = create<SidebarSelectionStore>((set, get) => ({
  isSelectionMode: false,
  selectedItems: [],
  
  startSelectionMode: (initialItem) => set({
    isSelectionMode: true,
    selectedItems: initialItem ? [initialItem] : []
  }),
  
  cancelSelectionMode: () => set({
    isSelectionMode: false,
    selectedItems: []
  }),
  
  toggleItemSelection: (item) => set((state) => {
    const exists = state.selectedItems.some((x) => x.id === item.id);
    if (exists) {
      return {
        selectedItems: state.selectedItems.filter((x) => x.id !== item.id)
      };
    } else {
      let updatedSelected = [...state.selectedItems, item];
      if (item.kind === "folder") {
        updatedSelected = updatedSelected.filter(
          (x) => !(x.kind === "list" && x.parentFolderId === item.id)
        );
      }
      return { selectedItems: updatedSelected };
    }
  }),
  
  isItemSelected: (id) => get().selectedItems.some((x) => x.id === id),
  
  clearSelection: () => set({ selectedItems: [] })
}));
