import { create } from "zustand";
import { toast } from "sonner";

import { getUser, setUsernameFirstTime } from "@/lib/api/user/actions";

import { UserType } from "@/lib/schemas/database.types";

type UserData = {
  user: UserType | null;
  getUser: () => Promise<void>;
  setUsernameFirstTime: (username: string) => Promise<{ error: string | null }>;
};

function handleError(err: unknown) {
  toast.error((err as Error).message || "Error desconocido");
}

export const useUserDataStore = create<UserData>()((set) => ({
  user: null,

  getUser: async () => {
    try {
      const { data, error } = await getUser();

      if (error) {
        throw new Error(error);
      }

      set(() => ({ user: data?.user }));
    } catch (err) {
      handleError(err);
    }
  },

  setUsernameFirstTime: async (username: string) => {
    try {
      const res = await setUsernameFirstTime(username);

      if (res.error) {
        if (res.error === "USERNAME_TAKEN") {
          return {
            error: "Ese nombre de usuario ya está en uso. Elige uno diferente.",
          };
        }
      }
    } catch (err) {
      handleError(err);
    }

    return { error: null };
  },
}));
