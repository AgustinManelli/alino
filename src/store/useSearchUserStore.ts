"use client"

import { create } from "zustand";
import { UserSearchResult } from "@/lib/schemas/user.types";

type SearchUserStore = {
  searchResults: UserSearchResult[];
  loadingSearch: boolean;
  setSearchResults: (results: UserSearchResult[]) => void;
  setLoadingSearch: (loading: boolean) => void;
  clearSearchResults: () => void;
};

export const useSearchUserStore = create<SearchUserStore>()((set) => ({
  searchResults: [],
  loadingSearch: false,

  setSearchResults: (results) => set({ searchResults: results }),
  setLoadingSearch: (loading) => set({ loadingSearch: loading }),
  clearSearchResults: () => set({ searchResults: [] }),
}));
