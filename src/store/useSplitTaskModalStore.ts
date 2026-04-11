"use client";

import { create } from "zustand";
import type { AIGeneratedTask } from "@/lib/ai/aiProvider";

type SplitPhase = "preview" | "loading" | "confirming" | "error";

interface SplitTaskModalState {
  isOpen: boolean;
  phase: SplitPhase;
  taskContent: string;
  taskId: string;
  listId: string;
  taskRank: string | null;
  prevTaskRank: string | null;
  previewTasks: AIGeneratedTask[];
  errorMessage: string | null;
  creditsRemaining: number | null;
  openModal: (options: {
    taskContent: string;
    taskId: string;
    listId: string;
    taskRank: string | null;
    prevTaskRank: string | null;
  }) => void;
  closeModal: () => void;
  setPhase: (phase: SplitPhase) => void;
  setPreviewTasks: (tasks: AIGeneratedTask[], credits: { remaining: number }) => void;
  setError: (message: string) => void;
}

export const useSplitTaskModalStore = create<SplitTaskModalState>((set) => ({
  isOpen: false,
  phase: "loading",
  taskContent: "",
  taskId: "",
  listId: "",
  taskRank: null,
  prevTaskRank: null,
  previewTasks: [],
  errorMessage: null,
  creditsRemaining: null,

  openModal: ({ taskContent, taskId, listId, taskRank, prevTaskRank }) =>
    set({
      isOpen: true,
      phase: "loading",
      taskContent,
      taskId,
      listId,
      taskRank,
      prevTaskRank,
      previewTasks: [],
      errorMessage: null,
      creditsRemaining: null,
    }),

  closeModal: () =>
    set({
      isOpen: false,
      previewTasks: [],
      errorMessage: null,
      creditsRemaining: null,
    }),

  setPhase: (phase) => set({ phase }),
  setPreviewTasks: (tasks, credits) =>
    set({ previewTasks: tasks, phase: "preview", creditsRemaining: credits.remaining }),
  setError: (message) => set({ errorMessage: message, phase: "error" }),
}));
