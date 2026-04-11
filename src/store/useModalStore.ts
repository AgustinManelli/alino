import { create } from "zustand";

//Prop types de cada modal

export interface ConfirmationModalProps {
  text: string;
  additionalText?: string;
  actionButton?: string;
  onConfirm: () => void;
  secondaryAction?: { label: string; onConfirm: () => void };
}

export interface SplitTaskModalProps {
  taskContent: string;
  taskId: string;
  listId: string;
  taskRank: string | null;
  prevTaskRank: string | null;
}

export interface EditTaskModalProps {
  taskId: string;
}

//Discriminated union

export type ModalEntry =
  | { type: "confirmation"; props: ConfirmationModalProps }
  | { type: "splitTask";    props: SplitTaskModalProps }
  | { type: "editTask";     props: EditTaskModalProps }
  | { type: "premium";      props?: Record<string, never> };

export type ModalType = ModalEntry["type"];

//Store

interface ModalStore {
  stack: ModalEntry[];
  open: (entry: ModalEntry) => void;
  close: () => void;
  closeByType: (type: ModalType) => void;
  closeAll: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  stack: [],
  open: (entry) =>
    set((state) => ({ stack: [...state.stack, entry] })),
  close: () =>
    set((state) => ({ stack: state.stack.slice(0, -1) })),
  closeByType: (type) =>
    set((state) => ({ stack: state.stack.filter((e) => e.type !== type) })),
  closeAll: () => set({ stack: [] }),
}));

//Helpers para usar fuera de componentes

export const openModal  = (entry: ModalEntry) => useModalStore.getState().open(entry);
export const closeModal = ()                   => useModalStore.getState().close();
export const closeModalByType = (type: ModalType) => useModalStore.getState().closeByType(type);