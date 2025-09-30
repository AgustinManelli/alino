"use client";

import { useMemo } from "react";
import type { ListsType, FolderType } from "@/lib/schemas/database.types";
import type { NormalizedItem } from "../utils/types";

export function useCombinedItems(lists: ListsType[], folders: FolderType[]) {
  const combinedItems = useMemo<NormalizedItem[]>(() => {
    const foldersNorm: NormalizedItem[] = (folders ?? []).map((f) => ({
      id: f.folder_id,
      kind: "folder",
      data: f,
      index: (f as any).index ?? 0,
    }));
    const listsNorm: NormalizedItem[] = (lists ?? [])
      // .filter((l) => l.pinned !== true)
      .map((l) => ({
        id: l.list_id,
        kind: "list",
        data: l,
        index: (l as any).index ?? 0,
      }));
    return [...foldersNorm, ...listsNorm].sort((a, b) => a.index - b.index);
  }, [lists, folders]);

  const topLevelItems = useMemo(
    () =>
      combinedItems.filter(
        (it) =>
          it.kind === "folder" ||
          (it.kind === "list" && (it.data as ListsType).folder == null)
      ),
    [combinedItems]
  );

  const combinedIds = useMemo(
    () => topLevelItems.map((i) => i.id),
    [topLevelItems]
  );

  const pinnedLists = useMemo(
    () => (lists ?? []).filter((l) => l.pinned === true),
    [lists]
  );

  return { combinedItems, topLevelItems, combinedIds, pinnedLists };
}
