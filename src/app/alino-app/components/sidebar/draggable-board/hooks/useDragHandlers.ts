"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { calcNewIndex } from "../utils/calcNewIndex";
import type { ListsType, FolderType } from "@/lib/schemas/todo-schema";
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
        // contar listas dentro de la carpeta activa
        const count = lists.filter((ls) => ls.folder === active.id).length;
        setTempListLength(count);
      }
    },
    [lists]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const currentItems = combinedRef.current;

      if (!over || active.id === over.id) {
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
        // fallback: al final
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
            const computedIndex = calcNewIndex(newOrder, newIndex);
            const sameParent =
              active.data?.current?.parentId === over.data?.current?.parentId ||
              active.data?.current?.parentId === over.data?.current?.folderId;

            movedList.index = computedIndex;
            movedList.folder = sameParent
              ? movedList.folder
              : (over.data.current.parentId ?? over.data.current.folderId);

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

      // Sincronizar con Zustand (optimista)
      const updatedFolders = newOrder
        .filter((it) => it.kind === "folder")
        .map((it) => it.data as FolderType);
      const updatedLists = newOrder
        .filter((it) => it.kind === "list")
        .map((it) => it.data as ListsType);

      const movedListsMap = new Map(updatedLists.map((l) => [l.list_id, l]));
      const movedFoldersMap = new Map(
        updatedFolders.map((f) => [f.folder_id, f])
      );

      const finalLists = lists.map(
        (orig) => movedListsMap.get(orig.list_id) ?? orig
      );
      updatedLists.forEach((l) => {
        if (!finalLists.find((x) => x.list_id === l.list_id))
          finalLists.push(l);
      });

      const finalFolders = folders.map(
        (orig) => movedFoldersMap.get(orig.folder_id) ?? orig
      );
      updatedFolders.forEach((f) => {
        if (!finalFolders.find((x) => x.folder_id === f.folder_id))
          finalFolders.push(f);
      });

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
