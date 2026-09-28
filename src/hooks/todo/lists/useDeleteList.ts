"use client"

import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { deleteList } from "@/lib/api/list/actions";
import { readFolderMembershipCount, makeMembershipCountPayload, handleError } from "@/store/todoUtils";

import {
  removeListFromIndexedDB,
  saveSingleListToIndexedDB,
  enqueueSyncMutation,
  isNetworkError,
  markListAsDeleted,
  unmarkListAsDeleted,
} from "@/lib/offline/sidebarSync";

export function useDeleteList() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleDeleteList = useCallback(async (list_id: string) => {
    setIsPending(true);
    markListAsDeleted(list_id);

    if (pathname === `/alino-app/${list_id}`) {
      router.replace("/alino-app");
    }
    const state = useTodoDataStore.getState();
    const deletedList = state.lists.find((l) => l.list_id === list_id);
    const folderId = deletedList?.folder ?? null;

    const prevLists = state.lists.slice();
    const prevTasks = state.tasks.slice();
    const prevFolders = state.folders.slice();

    useTodoDataStore.setState((s) => {
      const updatedFolders = folderId
        ? s.folders.map((f) => {
          if (f.folder_id !== folderId) return f;
          const currentCount = readFolderMembershipCount(f, s.lists);
          return {
            ...f,
            memberships: makeMembershipCountPayload(
              Math.max(0, currentCount - 1)
            ),
          };
        })
        : s.folders;

      return {
        lists: s.lists.filter((l) => l.list_id !== list_id),
        tasks: s.tasks.filter((t) => t.list_id !== list_id),
        folders: updatedFolders,
      };
    });

    await removeListFromIndexedDB(list_id);

    const payload = { list_id };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await enqueueSyncMutation("delete_list", "list", payload);
      setIsPending(false);
      return;
    }

    try {
      const result = await deleteList(list_id);

      if (result?.error) {
        if (isNetworkError(result.error)) {
          await enqueueSyncMutation("delete_list", "list", payload);
          setIsPending(false);
          return;
        }
        unmarkListAsDeleted(list_id);
        handleError(result.error);
        if (deletedList) await saveSingleListToIndexedDB(deletedList);
        useTodoDataStore.setState({ lists: prevLists, tasks: prevTasks, folders: prevFolders });
      }
    } catch (err) {
      if (isNetworkError(err)) {
        await enqueueSyncMutation("delete_list", "list", payload);
        setIsPending(false);
        return;
      }
      unmarkListAsDeleted(list_id);
      handleError(err);
      if (deletedList) await saveSingleListToIndexedDB(deletedList);
      useTodoDataStore.setState({ lists: prevLists, tasks: prevTasks, folders: prevFolders });
    }

    setIsPending(false);
  }, [pathname, router]);

  return { deleteList: handleDeleteList, isPending };
}
