"use client";

import { useMemo } from "react";
import type { ListsType, FolderType } from "@/lib/schemas/database.types";
import type { NormalizedItem } from "../utils/types";
import { compareRanks } from "@/lib/lexorank";

export function useCombinedItems(lists: ListsType[], folders: FolderType[]) {
  const combinedItems = useMemo<NormalizedItem[]>(() => {
    const foldersNorm: NormalizedItem[] = (folders ?? []).map((f) => ({
      id: f.folder_id,
      kind: "folder" as const,
      data: f,
      childrens: lists
        .filter((ls) => ls.folder === f.folder_id)
        .map((ls) => ({ ...ls, _sortId: ls.list_id }))
        .sort((a, b) => compareRanks({ rank: a.rank, id: a.list_id }, { rank: b.rank, id: b.list_id })),
      rank: (f as any).rank ?? null,
    }));

    const listsNorm: NormalizedItem[] = (lists ?? []).map((l) => ({
      id: l.list_id,
      kind: "list" as const,
      data: l,
      childrens: null,
      rank: (l as any).rank ?? null,
    }));

    return [...foldersNorm, ...listsNorm].sort((a, b) => compareRanks(a, b));
  }, [lists, folders]);


  const topLevelItems = useMemo(
    () =>
      combinedItems.filter(
        (it) =>
          it.kind === "folder" ||
          (it.kind === "list" && (it.data as ListsType).folder == null),
      ),
    [combinedItems],
  );

  const combinedIds = useMemo(
    () =>
      topLevelItems
        .filter(
          (i) => !(i.kind === "list" && (i.data as ListsType).pinned === true),
        )
        .map((i) => i.id),
    [topLevelItems],
  );

  const pinnedLists = useMemo(
    () => (lists ?? []).filter((l) => l.pinned === true),
    [lists],
  );

  return { combinedItems, topLevelItems, combinedIds, pinnedLists };
}
