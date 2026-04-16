"use client"

import { create } from "zustand";
import { TaskType } from "@/lib/schemas/database.types";

interface EditTaskModalState {
  isOpen: boolean;
  isAnimating: boolean;
  task: TaskType | null;
  onConfirm: () => void;
  initialRect: DOMRect | null;
  tempFocusElement: HTMLTextAreaElement | null;
  openModal: (options: {
    task: TaskType;
    onConfirm: () => void;
    initialRect: DOMRect;
    tempFocusElement?: HTMLTextAreaElement;
  }) => void;
  closeModal: () => void;
  setAnimating: (v: boolean) => void;
}

export const useEditTaskModalStore = create<EditTaskModalState>((set) => ({
  isOpen: false,
  isAnimating: false,
  task: null,
  initialRect: null,
  tempFocusElement: null,
  onConfirm: () => {},
  setAnimating: (v) => set({ isAnimating: v }),
  openModal: ({ task, onConfirm, initialRect, tempFocusElement }) =>
    set({
      isOpen: true,
      isAnimating: true,
      task,
      onConfirm,
      initialRect,
      tempFocusElement: tempFocusElement || null,
    }),
  closeModal: () =>
    set((state) => {
      if (state.tempFocusElement) {
        state.tempFocusElement.remove();
      }

      return {
        isOpen: false,
        isAnimating: true,
        task: null,
        onConfirm: () => {},
        initialRect: null,
        tempFocusElement: null,
      };
    }),
}));
