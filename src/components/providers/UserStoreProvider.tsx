"use client";

import { type ReactNode, useRef, useEffect } from "react";
import { type StoreApi } from "zustand";
import { UserType } from "@/lib/schemas/database.types";
import { createUserDataStore, UserStoreContext, type UserState } from "@/store/useUserDataStore";
import { getUserCosmeticsCatalogAction } from "@/lib/api/cosmetics/actions";

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

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user-preferences") || "{}");
      if (stored.animations !== undefined) {
        prefsStoreRef.current?.setState({ animations: stored.animations });
      }
    } catch (_) { }
  }, []);

  useEffect(() => {
    if (user?.user_id) {
      getUserCosmeticsCatalogAction().then((res) => {
        if (res.data?.cosmetics) {
          storeRef.current?.getState().setCosmeticsCatalog(res.data.cosmetics);
        }
      });
    }
  }, [user?.user_id]);

  return (
    <UserStoreContext.Provider value={storeRef.current}>
      <UserPreferencesContext.Provider value={prefsStoreRef.current}>
        {children}
      </UserPreferencesContext.Provider>
    </UserStoreContext.Provider>
  );
};

