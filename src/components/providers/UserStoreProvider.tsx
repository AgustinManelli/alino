"use client";

import { type ReactNode, useRef } from "react";
import { type StoreApi } from "zustand";
import { UserType } from "@/lib/schemas/database.types";
import { createUserDataStore, UserStoreContext, type UserState } from "@/store/useUserDataStore";

interface Props {
  children: ReactNode;
  user: UserType | null;
}

/**
 * Provee el store de usuario a través de un Contexto.
 * Esto evita problemas de hidratación ("saltos") porque el store
 * ya nace instanciado con los datos del servidor para esta petición específica.
 */
export const UserStoreProvider = ({ children, user }: Props) => {
  const storeRef = useRef<StoreApi<UserState> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createUserDataStore({ user });
  }

  return (
    <UserStoreContext.Provider value={storeRef.current}>
      {children}
    </UserStoreContext.Provider>
  );
};
