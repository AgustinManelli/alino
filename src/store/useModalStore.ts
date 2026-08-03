"use client"

import { create } from "zustand";
import { ListsType } from "@/lib/schemas/database.types";

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

export interface ListInformationModalProps {
  list: ListsType;
}

export interface MultiDeleteConfirmModalProps {
  selectedItems: { id: string; kind: "list" | "folder"; parentFolderId?: string | null; name: string }[];
  onConfirm: (folderOptions: { folderId: string; option: "keep_lists" | "delete_contents" }[]) => void;
}

export type ModalEntry =
  | { type: "confirmation"; props: ConfirmationModalProps }
  | { type: "splitTask";    props: SplitTaskModalProps }
  | { type: "editTask";     props: EditTaskModalProps }
  | { type: "listInformation"; props: ListInformationModalProps }
  | { type: "multiDeleteConfirm"; props: MultiDeleteConfirmModalProps }
  | { type: "premium";      props?: Record<string, never> };


export type ModalType = ModalEntry["type"];

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

export const openModal  = (entry: ModalEntry) => useModalStore.getState().open(entry);
export const closeModal = ()                   => useModalStore.getState().close();
export const closeModalByType = (type: ModalType) => useModalStore.getState().closeByType(type);