import { create } from "zustand";

interface SecondaryAction {
  label: string;
  onConfirm: () => void;
}

interface ConfirmationModalState {
  isOpen: boolean;
  text: string;
  additionalText?: string;
  actionButton: string;
  onConfirm: () => void;
  secondaryAction?: SecondaryAction;
  openModal: (options: {
    text: string;
    onConfirm: () => void;
    additionalText?: string;
    actionButton?: string;
    secondaryAction?: SecondaryAction;
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
    secondaryAction: undefined,
    openModal: ({
      text,
      onConfirm,
      additionalText,
      actionButton = "Eliminar",
      secondaryAction,
    }) =>
      set({
        isOpen: true,
        text,
        onConfirm,
        additionalText,
        actionButton,
        secondaryAction,
      }),
    closeModal: () =>
      set({
        isOpen: false,
        secondaryAction: undefined,
      }),
  })
);
