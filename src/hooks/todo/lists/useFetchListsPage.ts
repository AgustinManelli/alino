"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { FolderType, ListsType } from "@/lib/schemas/database.types";
import { handleError } from "@/store/todoUtils";

type TaggedAsList = ListsType & { _item_type: "list" };
type TaggedAsFolder = FolderType & { _item_type: "folder" };
type TaggedSidebarItem = TaggedAsList | TaggedAsFolder;

export function useFetchListsPage() {
  const [isPending, setIsPending] = useState(false);

  const fetchListsPage = useCallback(async (folderId: string | "root") => {
    setIsPending(true);
    try {
      const state = useTodoDataStore.getState();
      if (state.fetchingListsQueue[folderId]) {
        setIsPending(false);
        return;
      }

      const currentPagination = state.listsPagination[folderId] ?? {
        page: -1,
        hasMore: true,
      };

      if (!currentPagination.hasMore) {
        setIsPending(false);
        return;
      }

      useTodoDataStore.setState((s) => ({
        fetchingListsQueue: { ...s.fetchingListsQueue, [folderId]: true },
      }));

      const newPage = currentPagination.page + 1;

      const { getPaginatedLists } = await import("@/lib/api/list/actions");
      const targetFolderId = folderId === "root" ? null : folderId;
      const { data } = await getPaginatedLists(targetFolderId, newPage, 200);

      if (!data) return;

      const items = data as TaggedSidebarItem[];
      const newLists = items.filter(
        (i): i is TaggedAsList =>
          i._item_type === "list" || !("_item_type" in i)
      ) as ListsType[];
      const newFolders = items.filter(
        (i): i is TaggedAsFolder => i._item_type === "folder"
      ) as FolderType[];

      const hasMoreFetched = data.length >= 200;

      useTodoDataStore.setState((s) => {
        const existingListIds = new Set(s.lists.map((l) => l.list_id));
        const filteredNewLists = newLists.filter(
          (l) => !existingListIds.has(l.list_id)
        );

        const existingFolderIds = new Set(s.folders.map((f) => f.folder_id));
        const filteredNewFolders = newFolders.filter(
          (f) => !existingFolderIds.has(f.folder_id)
        );

        return {
          lists: [...s.lists, ...filteredNewLists],
          folders: [...s.folders, ...filteredNewFolders],
          listsPagination: {
            ...s.listsPagination,
            [folderId]: { page: newPage, hasMore: hasMoreFetched },
          },
        };
      });
    } catch (err) {
      handleError(err);
    } finally {
      useTodoDataStore.setState((s) => ({
        fetchingListsQueue: { ...s.fetchingListsQueue, [folderId]: false },
      }));
      setIsPending(false);
    }
  }, []);

  return { fetchListsPage, isPending };
}
