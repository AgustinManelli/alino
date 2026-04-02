"use client";

import { createContext, useRef, useContext } from "react";
import { useStore } from "zustand";
import { createUserStore, UserStore } from "@/store/useUserDataStore";
import { UserType } from "@/lib/schemas/database.types";

export const UserStoreContext = createContext<UserStore | null>(null);

export interface UserStoreProviderProps {
  children: React.ReactNode;
  user: UserType;
}

import { setUserStore } from "@/lib/userStoreSingleton";

export const UserStoreProvider = ({
  children,
  user,
}: UserStoreProviderProps) => {
  const storeRef = useRef<UserStore>();

  if (!storeRef.current) {
    storeRef.current = createUserStore({ user });
    setUserStore(storeRef.current);
  }

  return (
    <UserStoreContext.Provider value={storeRef.current}>
      {children}
    </UserStoreContext.Provider>
  );
};

export function useUserStore<T>(
  selector: (state: ExtractState<UserStore>) => T,
): T {
  const store = useContext(UserStoreContext);
  if (!store) {
    throw new Error("useUserStore debe usarse dentro de UserStoreProvider");
  }
  return useStore(store, selector);
}

type ExtractState<S> = S extends { getState: () => infer T } ? T : never;
