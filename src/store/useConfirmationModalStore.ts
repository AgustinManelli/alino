import { create } from "zustand";

interface ConfirmationModalState {
  isOpen: boolean;
  text: string;
  additionalText?: string;
  actionButton: string;
  onConfirm: () => void;
  openModal: (options: {
    text: string;
    onConfirm: () => void;
    additionalText?: string;
    actionButton?: string;
  }) => void;
  closeModal: () => void;
}

export const useConfirmationModalStore = create<ConfirmationModalState>(
  (set) => ({
    isOpen: false,
    text: "",
    additionalText: undefined,
    actionButton: "Eliminar",
    onConfirm: () => {},
    openModal: ({
      text,
      onConfirm,
      additionalText,
      actionButton = "Eliminar",
    }) =>
      set({
        isOpen: true,
        text,
        onConfirm,
        additionalText,
        actionButton,
      }),
    closeModal: () =>
      set({
        isOpen: false,
      }),
  })
);
