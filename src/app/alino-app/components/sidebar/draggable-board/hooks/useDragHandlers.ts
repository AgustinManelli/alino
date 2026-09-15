"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import type { ListsType, FolderType } from "@/lib/schemas/database.types";
import type { NormalizedItem } from "../utils/types";
import { calcRankForInsertion, compareRanks, parseRank } from "@/lib/lexorank";
import { LexoRank } from "lexorank";
import { useTodoDataStore } from "@/store/useTodoDataStore";

type Params = {
  combinedItems: NormalizedItem[];
  lists: ListsType[];
  folders: FolderType[];
  setLists: (ls: ListsType[]) => void;
  setFolders: (fs: FolderType[]) => void;
  updateIndexList: (
    id: string,
    folder: string | null,
    rank: string,
    explicitPreviousFolder?: string | null
  ) => void;
  updateIndexFolders: (id: string, rank: string) => void;
};

export function useDragHandlers({
  combinedItems,
  lists,
  folders,
  updateIndexList,
  updateIndexFolders,
}: Params) {
  const combinedRef = useRef(combinedItems);
  useEffect(() => {
    combinedRef.current = combinedItems;
  }, [combinedItems]);

  const [draggedItem, setDraggedItem] = useState<NormalizedItem | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch { }
    }
    const current = combinedRef.current.find(
      (it) => it.id === (active.id as string)
    );
    if (!current) return;
    setDraggedItem(current);
  }, []);

  const handleDragOver = useCallback((_event: DragOverEvent) => { }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        setDraggedItem(null);
        return;
      }

      const activeId = active.id as string;
      const activeType = active.data?.current?.type as string | undefined;

      if (activeType === "folder") {
        const targetId =
          over.data?.current?.type === "folder-dropzone"
            ? (over.data.current.folderId as string)
            : (over.id as string);

        const rootPeers = combinedRef.current.filter(
          (it) =>
            (it.kind === "folder" && !(it.data as FolderType).pinned) ||
            (it.kind === "list" &&
              (it.data as ListsType).folder == null &&
              !(it.data as ListsType).pinned)
        );

        const oldIndex = rootPeers.findIndex((it) => it.id === activeId);
        const overIndex = rootPeers.findIndex((it) => it.id === targetId);

        if (oldIndex === -1 || overIndex === -1 || oldIndex === overIndex) {
          setDraggedItem(null);
          return;
        }

        const remaining = rootPeers.filter((it) => it.id !== activeId);
        const targetIndexInRemaining = remaining.findIndex(
          (it) => it.id === targetId
        );
        const insertIndex =
          oldIndex < overIndex
            ? targetIndexInRemaining + 1
            : targetIndexInRemaining;

        const computedRank = calcRankForInsertion(remaining, insertIndex);
        updateIndexFolders(activeId, computedRank);
        setDraggedItem(null);
        return;
      }

      if (activeType === "item") {
        const sourceList = lists.find((l) => l.list_id === activeId);
        if (!sourceList) {
          setDraggedItem(null);
          return;
        }
        const sourceFolderId = sourceList.folder ?? null;

        let targetFolderId: string | null = null;
        let targetItemId: string | null = null;

        if (over.data?.current?.type === "folder-dropzone") {
          targetFolderId = (over.data.current.folderId as string) ?? null;
          targetItemId = null;
        } else if (over.data?.current?.type === "folder") {
          targetFolderId = over.id as string;
          targetItemId = null;
        } else if (over.data?.current?.type === "item") {
          targetFolderId =
            (over.data.current.parentId as string | null) ?? null;
          targetItemId = over.id as string;
        }

        if (targetFolderId !== null) {
          const folderLists = lists
            .filter((l) => l.folder === targetFolderId && !l.pinned)
            .sort((a, b) =>
              compareRanks(
                { rank: a.rank, id: a.list_id },
                { rank: b.rank, id: b.list_id }
              )
            );

          const remaining = folderLists.filter((l) => l.list_id !== activeId);

          let insertIndex = remaining.length;
          if (targetItemId !== null) {
            const overIndexInRemaining = remaining.findIndex(
              (l) => l.list_id === targetItemId
            );
            if (overIndexInRemaining !== -1) {
              if (sourceFolderId === targetFolderId) {
                const oldIndex = folderLists.findIndex(
                  (l) => l.list_id === activeId
                );
                const overIndexInOriginal = folderLists.findIndex(
                  (l) => l.list_id === targetItemId
                );
                if (oldIndex === overIndexInOriginal) {
                  setDraggedItem(null);
                  return;
                }
                insertIndex =
                  oldIndex < overIndexInOriginal
                    ? overIndexInRemaining + 1
                    : overIndexInRemaining;
              } else {
                insertIndex = overIndexInRemaining;
              }
            }
          }

          const targetFolder = folders.find(
            (f) => f.folder_id === targetFolderId
          );
          const maxRankDB = targetFolder?.max_rank ?? null;
          const paginationCheck =
            useTodoDataStore.getState().listsPagination[targetFolderId];
          const hasMore = !paginationCheck || paginationCheck.hasMore;

          let computedRank: string;
          if (insertIndex >= remaining.length && hasMore && maxRankDB) {
            const localPrev =
              remaining.length > 0 ? remaining[remaining.length - 1].rank : null;
            let highestRank = parseRank(maxRankDB) ?? LexoRank.middle();
            if (localPrev) {
              const localRankParsed = parseRank(localPrev);
              if (localRankParsed && localRankParsed.compareTo(highestRank) > 0) {
                highestRank = localRankParsed;
              }
            }
            computedRank = highestRank.genNext().toString();
          } else {
            computedRank = calcRankForInsertion(remaining, insertIndex);
          }

          updateIndexList(activeId, targetFolderId, computedRank, sourceFolderId);
          setDraggedItem(null);
          return;
        }

        const rootItems = combinedRef.current.filter(
          (it) =>
            (it.kind === "folder" && !(it.data as FolderType).pinned) ||
            (it.kind === "list" &&
              (it.data as ListsType).folder == null &&
              !(it.data as ListsType).pinned)
        );

        const remaining = rootItems.filter((it) => it.id !== activeId);

        let insertIndex = remaining.length;
        if (targetItemId !== null) {
          const overIndexInRemaining = remaining.findIndex(
            (it) => it.id === targetItemId
          );
          if (overIndexInRemaining !== -1) {
            if (sourceFolderId === null) {
              const oldIndex = rootItems.findIndex((it) => it.id === activeId);
              const overIndexInOriginal = rootItems.findIndex(
                (it) => it.id === targetItemId
              );
              if (oldIndex === overIndexInOriginal) {
                setDraggedItem(null);
                return;
              }
              insertIndex =
                oldIndex < overIndexInOriginal
                  ? overIndexInRemaining + 1
                  : overIndexInRemaining;
            } else {
              insertIndex = overIndexInRemaining;
            }
          }
        }

        const computedRank = calcRankForInsertion(remaining, insertIndex);
        updateIndexList(activeId, null, computedRank, sourceFolderId);
        setDraggedItem(null);
      }
    },
    [lists, folders, updateIndexList, updateIndexFolders]
  );

  const onDragCancel = useCallback(() => {
    setDraggedItem(null);
  }, []);

  return {
    draggedItem,
    handleDragStart,
    handleDragEnd,
    onDragCancel,
    handleDragOver,
  };
}
