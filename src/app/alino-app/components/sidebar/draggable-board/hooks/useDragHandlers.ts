"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { calcNewIndex } from "../utils/calcNewIndex";
import type { ListsType, FolderType } from "@/lib/schemas/database.types";
import type { NormalizedItem } from "../utils/types";

type Params = {
  combinedItems: NormalizedItem[];
  lists: ListsType[];
  folders: FolderType[];
  setLists: (ls: ListsType[]) => void;
  setFolders: (fs: FolderType[]) => void;
  updateIndexList: (id: string, index: number, folder: string | null) => void;
  updateIndexFolders: (id: string, index: number) => void;
};

export function useDragHandlers({
  combinedItems,
  lists,
  folders,
  setLists,
  setFolders,
  updateIndexList,
  updateIndexFolders,
}: Params) {
  const combinedRef = useRef(combinedItems);
  useEffect(() => {
    combinedRef.current = combinedItems;
  }, [combinedItems]);

  const [draggedItem, setDraggedItem] = useState<NormalizedItem | null>(null);
  const [tempListLength, setTempListLength] = useState<number>(0);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const current = combinedRef.current.find(
        (it) => it.id === (active.id as string)
      );
      if (!current) return;

      setDraggedItem(current);

      const activeType = active.data?.current?.type;
      if (activeType === "folder") {
        const count = lists.filter((ls) => ls.folder === active.id).length;
        setTempListLength(count);
      }
    },
    [lists]
  );

  function getItemsInContext(
    allItems: NormalizedItem[],
    targetFolderId: string | null,
    itemType: "list" | "folder" | "root"
  ): NormalizedItem[] {
    if (itemType === "folder") {
      return allItems.filter((item) => item.kind === "folder");
    }

    return allItems.filter((item) => {
      if (item.kind !== "list") return false;
      const listData = item.data as ListsType;
      if (listData.pinned === true) return false;
      return listData.folder === targetFolderId;
    });
  }
  

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const currentItems = combinedRef.current;

      if (active.id === over?.id) {
        setDraggedItem(null);
        setTempListLength(0);
        return;
      }

      let newIndex = -1;

      if (over?.data?.current?.type !== "folder-dropzone") {
        newIndex = currentItems.findIndex((it) => it.id === over?.id);
      } else {
        const targetFolderId = over.data.current.folderId;
        const lastInFolder = currentItems.findLastIndex(
          (item) =>
            item.kind === "list" &&
            (item.data as ListsType).folder === targetFolderId
        );
        newIndex =
          lastInFolder !== -1
            ? lastInFolder
            : currentItems.findIndex((item) => item.id === targetFolderId);
      }

      if (newIndex === -1) {
        newIndex = currentItems.length - 1;
      }

      const oldIndex = currentItems.findIndex(
        (it) => it.id === (active.id as string)
      );
      if (oldIndex === -1 || newIndex === -1) {
        setDraggedItem(null);
        setTempListLength(0);
        return;
      }

      const newOrder = arrayMove(currentItems.slice(), oldIndex, newIndex);
      const moved = newOrder[newIndex];
      const activeType = active.data?.current?.type;
      if (over) {
        if (
          over.data?.current?.type === "folder-dropzone" ||
          over.data?.current?.parentId
        ) {
          if (activeType === "item") {
            const movedList = { ...(moved.data as ListsType) };

            const targetFolderId =
            over.data.current.parentId ?? over.data.current.folderId;

            const contextItems = getItemsInContext(
              newOrder,
              targetFolderId,
              "list"
            );

            const contextIndex = contextItems.findIndex(
              (item) => item.id === moved.id
            );

            const computedIndex = calcNewIndex(contextItems, contextIndex);
            movedList.index = computedIndex;
            movedList.folder = targetFolderId;

            newOrder[newIndex] = { ...newOrder[newIndex], data: movedList };
            updateIndexList(
              movedList.list_id,
              computedIndex,
              movedList.folder ?? null
            );
          }
        } else {
          if (activeType === "item") {
            const movedList = { ...(moved.data as ListsType) };

            const computedIndex = calcNewIndex(newOrder, newIndex);

            movedList.index = computedIndex;
            movedList.folder = null;
            newOrder[newIndex] = { ...newOrder[newIndex], data: movedList };
            updateIndexList(movedList.list_id, computedIndex, null);
          }
          if (activeType === "folder") {
            const movedFolder = { ...(moved.data as FolderType) };
            const computedIndex = calcNewIndex(newOrder, newIndex);
            movedFolder.index = computedIndex;
            newOrder[newIndex] = { ...newOrder[newIndex], data: movedFolder };
            updateIndexFolders(movedFolder.folder_id, computedIndex);
          }
        }
      } else {
        if (activeType === "item" && active.data?.current?.parentId) {
          const movedList = { ...(moved.data as ListsType) };
          const computedIndex = calcNewIndex(newOrder, newIndex);
          movedList.index = computedIndex;
          movedList.folder = null;
          newOrder[newIndex] = { ...newOrder[newIndex], data: movedList };
          updateIndexList(movedList.list_id, computedIndex, null);
        }
      }

      const finalFolders = newOrder
        .filter((item) => item.kind === "folder")
        .map((item) => item.data as FolderType);

      const finalLists = newOrder
        .filter((item) => item.kind === "list")
        .map((item) => item.data as ListsType);

      // Commit
      setLists(finalLists);
      setFolders(finalFolders);

      // estado UI
      setDraggedItem(null);
      setTempListLength(0);
    },
    [lists, folders, setLists, setFolders, updateIndexList, updateIndexFolders]
  );

  const onDragCancel = useCallback(() => {
    setDraggedItem(null);
    setTempListLength(0);
  }, []);

  return {
    draggedItem,
    tempListLength,
    handleDragStart,
    handleDragEnd,
    onDragCancel,
  };
}
