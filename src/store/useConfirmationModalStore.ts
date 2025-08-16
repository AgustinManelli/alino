// src/store/useConfirmationModalStore.ts

import { create } from "zustand";

interface ConfirmationModalState {
  isOpen: boolean;
  text: string;
  aditionalText?: string;
  actionButton: string;
  onConfirm: () => void;
  openModal: (options: {
    text: string;
    onConfirm: () => void;
    aditionalText?: string;
    actionButton?: string;
  }) => void;
  closeModal: () => void;
}

export const useConfirmationModalStore = create<ConfirmationModalState>(
  (set) => ({
    isOpen: false,
    text: "",
    aditionalText: undefined,
    actionButton: "Eliminar",
    onConfirm: () => {},
    openModal: ({
      text,
      onConfirm,
      aditionalText,
      actionButton = "Eliminar",
    }) =>
      set({
        isOpen: true,
        text,
        onConfirm,
        aditionalText,
        actionButton,
      }),
    closeModal: () =>
      set({
        isOpen: false,
      }),
  })
);
