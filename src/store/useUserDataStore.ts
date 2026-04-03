"use client";

import { createStore, StoreApi, useStore } from "zustand";
import { toast } from "sonner";
import { setUsernameFirstTime as setUsernameFirstTimeAction } from "@/lib/api/user/actions";
import { UserType } from "@/lib/schemas/database.types";
import { createContext, useContext } from "react";

export interface UserState {
  user: UserType | null;
  updateUser: (partial: Partial<UserType>) => void;
  setUsernameFirstTime: (username: string) => Promise<{ error: string | null }>;
}

export const UserStoreContext = createContext<StoreApi<UserState> | undefined>(
  undefined,
);

export let globalUserStore: StoreApi<UserState> | undefined = undefined;

export const createUserDataStore = (initialState: Partial<UserState> = {}) => {
  const store = createStore<UserState>()((set) => ({
    user: initialState.user || null,

    updateUser: (partial) =>
      set((state) => ({
        user: state.user ? { ...state.user, ...partial } : null,
      })),

    setUsernameFirstTime: async (username) => {
      try {
        const res = await setUsernameFirstTimeAction(username);
        if (res.error) {
          if (res.error === "USERNAME_TAKEN") {
            return { error: "Ese nombre de usuario ya está en uso." };
          }
          return { error: res.error };
        }
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              username,
              user_private: state.user.user_private
                ? {
                    ...state.user.user_private,
                    initial_username_prompt_shown: false,
                  }
                : null,
            },
          };
        });
        return { error: null };
      } catch (err) {
        toast.error((err as Error).message || "Error desconocido");
        return { error: "Error desconocido." };
      }
    },
  }));

  if (typeof window !== "undefined") {
    globalUserStore = store;
  }

  return store;
};

export const useUserDataStore = <T,>(selector: (state: UserState) => T): T => {
  const store = useContext(UserStoreContext);
  if (!store) {
    throw new Error("Missing UserStoreProvider in the tree");
  }
  return useStore(store, selector);
};