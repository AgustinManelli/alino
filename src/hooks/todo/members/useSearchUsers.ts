"use client"

import { useCallback } from "react";
import { searchUsers as searchUsersAction } from "@/lib/api/user/actions";
import { useSearchUserStore } from "@/store/useSearchUserStore";
import { handleError } from "@/store/todoUtils";

export function useSearchUsers() {
  const setSearchResults = useSearchUserStore((s) => s.setSearchResults);
  const setLoadingSearch = useSearchUserStore((s) => s.setLoadingSearch);
  const clearSearchResults = useSearchUserStore((s) => s.clearSearchResults);

  const searchUsers = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      clearSearchResults();
      setLoadingSearch(false);
      return;
    }

    setLoadingSearch(true);

    try {
      const { data, error } = await searchUsersAction(searchTerm);

      if (error) {
        clearSearchResults();
        setLoadingSearch(false);
        throw new Error(error);
      }

      if (data) {
        setSearchResults(data);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoadingSearch(false);
    }
  }, [clearSearchResults, setLoadingSearch, setSearchResults]);

  return {
    searchUsers,
    clearSearchResults,
  };
}
