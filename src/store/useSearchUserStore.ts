import { searchUsers } from "@/lib/api/actions";
import { toast } from "sonner";
import { create } from "zustand";

type UserSearchResult = {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
};

type SearchUserStore = {
  searchResults: UserSearchResult[];
  loadingSearch: boolean;
  searchUsers: (searchTerm: string) => void;
  clearSearchResults: () => void;
};

function handleError(err: unknown) {
  toast.error((err as Error).message || "Error desconocido");
}

export const useSearchUserStore = create<SearchUserStore>()((set, get) => ({
  searchResults: [],
  loadingSearch: false,

  searchUsers: async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      set({ searchResults: [], loadingSearch: false });
      return;
    }

    set({ loadingSearch: true });

    try {
      const { data, error } = await searchUsers(searchTerm);

      if (error) {
        set({ searchResults: [], loadingSearch: false });
        throw new Error(error);
      }
      if (data) {
        set({ searchResults: data, loadingSearch: false });
      }
    } catch (err) {
      handleError(err);
    }
  },
  clearSearchResults: () => {
    set({ searchResults: [] });
  },
}));
