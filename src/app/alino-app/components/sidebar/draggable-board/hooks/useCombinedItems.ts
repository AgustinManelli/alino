"use client";

import { useMemo } from "react";
import type { ListsType, FolderType } from "@/lib/schemas/database.types";
import type { NormalizedItem } from "../utils/types";
import { compareRanks } from "@/lib/lexorank";

export type PinnedItem =
  | { kind: "folder"; id: string; data: FolderType; childrens?: ListsType[] }
  | { kind: "list"; id: string; data: ListsType };

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
      rank: f.rank ?? "",
    }));

    const listsNorm: NormalizedItem[] = (lists ?? []).map((l) => ({
      id: l.list_id,
      kind: "list" as const,
      data: l,
      childrens: null,
      rank: l.rank ?? "",
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
          (i) =>
            !(i.kind === "list" && (i.data as ListsType).pinned === true) &&
            !(i.kind === "folder" && (i.data as FolderType).pinned === true),
        )
        .map((i) => i.id),
    [topLevelItems],
  );

  const pinnedItems = useMemo<PinnedItem[]>(() => {
    const pLists: PinnedItem[] = (lists ?? [])
      .filter((l) => l.pinned === true)
      .map((l) => ({ kind: "list" as const, id: l.list_id, data: l }));

    const pFolders: PinnedItem[] = (folders ?? [])
      .filter((f) => f.pinned === true)
      .map((f) => {
        const itemInCombined = combinedItems.find((ci) => ci.id === f.folder_id);
        return {
          kind: "folder" as const,
          id: f.folder_id,
          data: f,
          childrens: itemInCombined?.childrens ?? [],
        };
      });

    const getPinnedTime = (item: ListsType | FolderType): number => {
      const itemAny = item as Record<string, unknown>;
      const dateStr =
        (itemAny.pinned_at as string | undefined) ||
        item.updated_at ||
        (item as FolderType).created_at ||
        (item as ListsType).shared_since;
      if (!dateStr) return 0;
      const time = new Date(dateStr).getTime();
      return isNaN(time) ? 0 : time;
    };

    return [...pLists, ...pFolders].sort((a, b) => {
      const timeA = getPinnedTime(a.data);
      const timeB = getPinnedTime(b.data);
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      return a.id.localeCompare(b.id);
    });
  }, [lists, folders, combinedItems]);

  const pinnedLists = useMemo(
    () => (lists ?? []).filter((l) => l.pinned === true),
    [lists],
  );

  const pinnedFolders = useMemo(
    () => (folders ?? []).filter((f) => f.pinned === true),
    [folders],
  );

  return { combinedItems, topLevelItems, combinedIds, pinnedItems, pinnedLists, pinnedFolders };
}
