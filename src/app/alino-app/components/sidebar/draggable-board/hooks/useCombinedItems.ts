"use client";

import { useMemo } from "react";
import { LexoRank } from "lexorank";
import type { ListsType, FolderType } from "@/lib/schemas/database.types";
import type { NormalizedItem } from "../utils/types";

export function useCombinedItems(lists: ListsType[], folders: FolderType[]) {
  const combinedItems = useMemo<NormalizedItem[]>(() => {
    const foldersNorm: NormalizedItem[] = (folders ?? []).map((f) => ({
      id: f.folder_id,
      kind: "folder",
      data: f,
      childrens: lists.filter((ls) => ls.folder === f.folder_id),
      rank: (f as any).rank ?? LexoRank.middle().toString(),
    }));
    
    const listsNorm: NormalizedItem[] = (lists ?? [])
      .map((l) => ({
        id: l.list_id,
        kind: "list",
        data: l,
        childrens: null,
        rank: (l as any).rank ?? LexoRank.middle().toString(),
      }));
    
    // Ordenar por rank lexicográficamente
    return [...foldersNorm, ...listsNorm].sort((a, b) => {
      // Comparación lexicográfica simple de strings
      if (a.rank < b.rank) return -1;
      if (a.rank > b.rank) return 1;
      return 0;
    });
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
    () => topLevelItems.filter((i) => !(i.kind === 'list' && (i.data as ListsType).pinned === true)).map((i) => i.id),
    [topLevelItems]
  );

  const pinnedLists = useMemo(
    () => (lists ?? []).filter((l) => l.pinned === true),
    [lists]
  );

  return { combinedItems, topLevelItems, combinedIds, pinnedLists };
}