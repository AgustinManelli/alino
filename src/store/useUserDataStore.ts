import { createStore } from "zustand";
import { toast } from "sonner";
import { setUsernameFirstTime as setUsernameFirstTimeAction } from "@/lib/api/user/actions";
import { UserType } from "@/lib/schemas/database.types";

interface UserProps {
  user: UserType | null;
}

interface UserState extends UserProps {
  updateUser: (partial: Partial<UserType>) => void;
  setUsernameFirstTime: (username: string) => Promise<{ error: string | null }>;
}

export type UserStore = ReturnType<typeof createUserStore>;

export const createUserStore = (initProps?: Partial<UserProps>) => {
  const DEFAULT_PROPS: UserProps = { user: null };

  return createStore<UserState>()((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,

    updateUser: (partial: Partial<UserType>) => {
      set((state) => ({
        user: state.user ? { ...state.user, ...partial } : null,
      }));
    },

    setUsernameFirstTime: async (username: string) => {
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
                ? { ...state.user.user_private, initial_username_prompt_shown: false }
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
};