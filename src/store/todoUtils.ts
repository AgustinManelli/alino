"use client"

import { FolderType, ListsType, TaskCountPayload, MembershipCountPayload, TaskType } from "@/lib/schemas/database.types";
import { customToast } from "@/lib/toasts";

export const POS_INDEX = 16384;
export const PAGE_SIZE = 40;

export function readTaskCount(
  list: ListsType,
  fallbackTasks: TaskType[]
): number {
  const payload = list.list.tasks;
  if (Array.isArray(payload) && payload.length > 0) {
    return payload[0].count;
  }
  return fallbackTasks.filter((t) => t.list_id === list.list_id).length;
}

export function readFolderMembershipCount(
  folder: FolderType,
  lists: ListsType[]
): number {
  const payload = folder.memberships;
  if (Array.isArray(payload) && payload.length > 0) {
    return payload[0].count;
  }
  return lists.filter((l) => l.folder === folder.folder_id).length;
}

export function makeTaskCountPayload(count: number): TaskCountPayload {
  return [{ count }];
}

export function makeMembershipCountPayload(count: number): MembershipCountPayload {
  return [{ count }];
}

export function getBatchInjectedState(
  newTasks: TaskType[],
  currentTasks: TaskType[],
  currentLists: ListsType[]
): { tasks: TaskType[]; lists: ListsType[] } {
  if (!newTasks || newTasks.length === 0) return { tasks: currentTasks, lists: currentLists };

  const existingIds = new Set(currentTasks.map((t) => t.task_id));
  const toAdd = newTasks.filter((t) => !existingIds.has(t.task_id));
  
  if (toAdd.length === 0) return { tasks: currentTasks, lists: currentLists };

  const countsByList: Record<string, number> = {};
  for (const t of toAdd) {
    countsByList[t.list_id] = (countsByList[t.list_id] ?? 0) + 1;
  }

  const updatedLists = currentLists.map((l) => {
    const addCount = countsByList[l.list_id] ?? 0;
    if (addCount === 0) return l;
    const currentCount = readTaskCount(l, currentTasks);
    return {
      ...l,
      list: {
        ...l.list,
        tasks: makeTaskCountPayload(currentCount + addCount),
      },
    };
  });

  return {
    tasks: [...toAdd, ...currentTasks],
    lists: updatedLists,
  };
}

export const calculateNewIndex = (
  a: ListsType[] | FolderType[],
  b: ListsType[] | FolderType[]
) => {
  const maxOf = (arr: ListsType[] | FolderType[]) =>
    arr.length > 0 ? Math.max(...arr.map((x) => x.index ?? 0)) : 0;

  const maxIdx = Math.max(maxOf(a), maxOf(b));
  return maxIdx <= 0 ? POS_INDEX : maxIdx + POS_INDEX;
};

export function handleError(err: unknown) {
  if (err instanceof Error) {
    customToast.error(err.message || "Error desconocido");
  } else if (typeof err === "string") {
    customToast.error(err || "Error desconocido");
  } else {
    customToast.error("Error desconocido");
  }
}
