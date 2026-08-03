"use client";

import { type ReactNode, useRef } from "react";
import { type StoreApi } from "zustand";
import { UserType } from "@/lib/schemas/database.types";
import { createUserDataStore, UserStoreContext, type UserState } from "@/store/useUserDataStore";

import { createUserPreferencesStore, UserPreferencesContext } from "@/store/useUserPreferencesStore";

interface Props {
  children: ReactNode;
  user: UserType | null;
  initialSidebarCollapsed: boolean;
  initialSidebarPosition: "left" | "right";
}

export const UserStoreProvider = ({ children, user, initialSidebarCollapsed, initialSidebarPosition }: Props) => {
  const storeRef = useRef<StoreApi<UserState> | null>(null);
  const prefsStoreRef = useRef<any>(null);

  if (!storeRef.current) {
    storeRef.current = createUserDataStore({ user });
  }

  if (!prefsStoreRef.current) {
    const dbPrefs = (user?.user_private?.preferences || {}) as any;
    prefsStoreRef.current = createUserPreferencesStore({
      ...dbPrefs,
      sidebarCollapsed: initialSidebarCollapsed,
      sidebarPosition: initialSidebarPosition,
    });
  }

  return (
    <UserStoreContext.Provider value={storeRef.current}>
      <UserPreferencesContext.Provider value={prefsStoreRef.current}>
        {children}
      </UserPreferencesContext.Provider>
    </UserStoreContext.Provider>
  );
};

