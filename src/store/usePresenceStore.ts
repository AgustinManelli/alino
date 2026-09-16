"use client";

import { create } from "zustand";

interface PresenceStore {
  onlineUserIds: Set<string>;
  setOnlineUserIds: (ids: Set<string>) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
}

export const usePresenceStore = create<PresenceStore>((set) => ({
  onlineUserIds: new Set<string>(),
  setOnlineUserIds: (ids) => set({ onlineUserIds: ids }),
  addOnlineUser: (userId) =>
    set((state) => {
      if (state.onlineUserIds.has(userId)) return state;
      const next = new Set(state.onlineUserIds);
      next.add(userId);
      return { onlineUserIds: next };
    }),
  removeOnlineUser: (userId) =>
    set((state) => {
      if (!state.onlineUserIds.has(userId)) return state;
      const next = new Set(state.onlineUserIds);
      next.delete(userId);
      return { onlineUserIds: next };
    }),
}));
