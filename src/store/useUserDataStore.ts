"use client";
import { createStore, StoreApi, useStore } from "zustand";
import { toast } from "sonner";
import {
  setUsernameFirstTime as setUsernameFirstTimeAction,
  updateUserProfile as updateUserProfileAction,
  getUserProfileStats as getUserProfileStatsAction,
  uploadAvatarAction,
  getFeatureUsageAction,
  ProfileStats,
  FeatureUsage,
} from "@/lib/api/user/actions";
import { UserType } from "@/lib/schemas/database.types";
import { AI_FEATURE_KEY } from "@/lib/ai/creditCosts";
import { createContext, useContext } from "react";

export interface UserState {
  user: UserType | null;
  configUserActive: boolean;
  profileStats: ProfileStats | null;
  aiUsage: FeatureUsage | null;

  updateUser: (partial: Partial<UserType>) => void;
  setConfigUserActive: (active: boolean) => void;
  setUsernameFirstTime: (username: string) => Promise<{ error: string | null }>;
  fetchProfileStats: () => Promise<void>;
  fetchAIUsage: () => Promise<void>;
  updateProfile: (updates: {
    display_name?: string;
    username?: string;
    biography?: string;
    website_url?: string;
  }) => Promise<{ error: string | null }>;
  uploadAvatar: (formData: FormData) => Promise<{ error: string | null }>;
}

export const UserStoreContext = createContext<StoreApi<UserState> | undefined>(
  undefined,
);

export let globalUserStore: StoreApi<UserState> | undefined = undefined;

export const createUserDataStore = (initialState: Partial<UserState> = {}) => {
  const store = createStore<UserState>()((set, get) => ({
    user: initialState.user || null,
    configUserActive: false,
    profileStats: null,
    aiUsage: null,

    updateUser: (partial) =>
      set((state) => ({
        user: state.user ? { ...state.user, ...partial } : null,
      })),

    setConfigUserActive: (active) => set({ configUserActive: active }),

    fetchProfileStats: async () => {
      const res = await getUserProfileStatsAction();
      if (res.data) {
        set({ profileStats: res.data });
      }
    },

    fetchAIUsage: async () => {
      const res = await getFeatureUsageAction(AI_FEATURE_KEY);
      if (res.data) {
        set({ aiUsage: res.data });
      }
    },

    updateProfile: async (updates) => {
      try {
        const res = await updateUserProfileAction(updates);
        if (res.error) return { error: res.error };

        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));

        if (updates.username) {
          await get().fetchProfileStats();
        }

        return { error: null };
      } catch (err: any) {
        return { error: err.message || "Error al actualizar perfil." };
      }
    },

    uploadAvatar: async (formData) => {
      try {
        const res = await uploadAvatarAction(formData);
        if (res.error) return { error: res.error };

        if (res.data) {
          set((state) => ({
            user: state.user
              ? { ...state.user, avatar_url: res.data!.avatar_url }
              : null,
          }));
        }

        return { error: null };
      } catch (err: any) {
        return { error: err.message || "Error al subir avatar." };
      }
    },

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