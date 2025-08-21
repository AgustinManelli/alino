import { create } from "zustand";
import { TaskType } from "@/lib/schemas/todo-schema";

interface EditTaskModalState {
  isOpen: boolean;
  task: TaskType | null;
  onConfirm: () => void;
  initialRect: DOMRect | null;
  openModal: (options: {
    task: TaskType;
    onConfirm: () => void;
    initialRect: DOMRect;
  }) => void;
  closeModal: () => void;
}

export const useEditTaskModalStore = create<EditTaskModalState>((set) => ({
  isOpen: false,
  task: null,
  initialRect: null,
  onConfirm: () => {},
  openModal: ({ task, onConfirm, initialRect }) =>
    set({
      isOpen: true,
      task,
      onConfirm,
      initialRect,
    }),
  closeModal: () =>
    set({
      isOpen: false,
      task: null,
      initialRect: null,
    }),
}));
