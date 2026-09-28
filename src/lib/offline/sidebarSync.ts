import { v4 as uuidv4 } from "uuid";
import { offlineDb, type SyncQueueItem, type SidebarActionType } from "./db";
import type { ListsType, FolderType } from "@/lib/schemas/database.types";
import { syncBatchSidebar } from "@/lib/api/sync/actions";
import { useSyncStore } from "@/store/useSyncStore";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { customToast } from "@/lib/toasts";

export function isNetworkError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return true;
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("failed to fetch") ||
      msg.includes("networkerror") ||
      msg.includes("fetch failed") ||
      msg.includes("network request failed") ||
      msg.includes("load failed")
    );
  }
  if (typeof error === "string") {
    const msg = error.toLowerCase();
    return (
      msg.includes("failed to fetch") ||
      msg.includes("networkerror") ||
      msg.includes("fetch failed")
    );
  }
  return false;
}

export async function saveSidebarToIndexedDB(
  lists: ListsType[],
  folders: FolderType[]
): Promise<void> {
  if (!offlineDb) return;
  try {
    const pendingCount = await offlineDb.syncQueue.count();
    if (pendingCount > 0) {
      return;
    }

    await offlineDb.transaction("rw", [offlineDb.lists, offlineDb.folders], async () => {
      await offlineDb.lists.clear();
      await offlineDb.folders.clear();
      if (lists.length > 0) {
        await offlineDb.lists.bulkPut(lists);
      }
      if (folders.length > 0) {
        await offlineDb.folders.bulkPut(folders);
      }
    });
  } catch (error) {
    console.error("[IndexedDB] Error al guardar estado del sidebar:", error);
  }
}

const recentlyDeletedListIds = new Map<string, number>();
const DELETION_TTL_MS = 15000;

export function markListAsDeleted(listId: string): void {
  recentlyDeletedListIds.set(listId, Date.now());
}

export function isListDeleted(listId: string): boolean {
  const timestamp = recentlyDeletedListIds.get(listId);
  if (!timestamp) return false;
  if (Date.now() - timestamp > DELETION_TTL_MS) {
    recentlyDeletedListIds.delete(listId);
    return false;
  }
  return true;
}

export function unmarkListAsDeleted(listId: string): void {
  recentlyDeletedListIds.delete(listId);
}

export async function reconcileWithOfflineState(
  serverLists: ListsType[],
  serverFolders: FolderType[]
): Promise<{ lists: ListsType[]; folders: FolderType[] }> {
  if (!offlineDb) {
    return {
      lists: serverLists.filter((l) => !isListDeleted(l.list_id)),
      folders: serverFolders,
    };
  }

  try {
    const queueItems = await offlineDb.syncQueue.toArray();
    if (queueItems.length === 0) {
      return {
        lists: serverLists.filter((l) => !isListDeleted(l.list_id)),
        folders: serverFolders,
      };
    }

    const { compacted } = compactSyncQueue(queueItems);
    const local = await loadSidebarFromIndexedDB();

    const localListMap = new Map(local.lists.map((l) => [l.list_id, l]));
    const localFolderMap = new Map(local.folders.map((f) => [f.folder_id, f]));

    const deletedListIds = new Set<string>();
    const deletedFolderIds = new Set<string>();
    const insertedListIds = new Set<string>();
    const insertedFolderIds = new Set<string>();

    for (const item of compacted) {
      if (item.action === "delete_list") {
        deletedListIds.add(item.payload.list_id);
      } else if (item.action === "delete_folder") {
        deletedFolderIds.add(item.payload.folder_id);
      } else if (item.action === "insert_list") {
        insertedListIds.add(item.payload.list_id);
      } else if (item.action === "insert_folder") {
        insertedFolderIds.add(item.payload.folder_id);
      }
    }

    const mergedLists: ListsType[] = [];
    for (const sList of serverLists) {
      if (deletedListIds.has(sList.list_id) || isListDeleted(sList.list_id)) {
        continue;
      }
      if (localListMap.has(sList.list_id)) {
        mergedLists.push(localListMap.get(sList.list_id)!);
      } else {
        mergedLists.push(sList);
      }
    }

    insertedListIds.forEach((listId) => {
      if (isListDeleted(listId)) return;
      const localList = localListMap.get(listId);
      if (localList && !mergedLists.some((l) => l.list_id === listId)) {
        mergedLists.push(localList);
      }
    });

    const mergedFolders: FolderType[] = [];
    for (const sFolder of serverFolders) {
      if (deletedFolderIds.has(sFolder.folder_id)) {
        continue;
      }
      if (localFolderMap.has(sFolder.folder_id)) {
        mergedFolders.push(localFolderMap.get(sFolder.folder_id)!);
      } else {
        mergedFolders.push(sFolder);
      }
    }

    insertedFolderIds.forEach((folderId) => {
      const localFolder = localFolderMap.get(folderId);
      if (localFolder && !mergedFolders.some((f) => f.folder_id === folderId)) {
        mergedFolders.push(localFolder);
      }
    });

    return { lists: mergedLists, folders: mergedFolders };
  } catch (error) {
    console.error("[OfflineSync] Error al reconciliar estado offline:", error);
    return { lists: serverLists, folders: serverFolders };
  }
}


export async function loadSidebarFromIndexedDB(): Promise<{
  lists: ListsType[];
  folders: FolderType[];
}> {
  if (!offlineDb) return { lists: [], folders: [] };
  try {
    const [lists, folders] = await Promise.all([
      offlineDb.lists.toArray(),
      offlineDb.folders.toArray(),
    ]);
    return { lists, folders };
  } catch (error) {
    console.error("[IndexedDB] Error al cargar sidebar local:", error);
    return { lists: [], folders: [] };
  }
}

export async function saveSingleListToIndexedDB(list: ListsType): Promise<void> {
  if (!offlineDb) return;
  try {
    await offlineDb.lists.put(list);
  } catch (error) {
    console.error("[IndexedDB] Error al guardar lista:", error);
  }
}

export async function removeListFromIndexedDB(list_id: string): Promise<void> {
  if (!offlineDb) return;
  try {
    await offlineDb.lists.delete(list_id);
  } catch (error) {
    console.error("[IndexedDB] Error al eliminar lista de IDB:", error);
  }
}

export async function saveSingleFolderToIndexedDB(folder: FolderType): Promise<void> {
  if (!offlineDb) return;
  try {
    await offlineDb.folders.put(folder);
  } catch (error) {
    console.error("[IndexedDB] Error al guardar carpeta en IDB:", error);
  }
}

export async function removeFolderFromIndexedDB(folder_id: string): Promise<void> {
  if (!offlineDb) return;
  try {
    await offlineDb.folders.delete(folder_id);
  } catch (error) {
    console.error("[IndexedDB] Error al eliminar carpeta de IDB:", error);
  }
}

export async function enqueueSyncMutation(
  action: SidebarActionType,
  entity: "list" | "folder",
  payload: any
): Promise<void> {
  if (!offlineDb) return;
  try {
    const item: SyncQueueItem = {
      id: uuidv4(),
      entity,
      action,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };
    await offlineDb.syncQueue.put(item);
    const count = await offlineDb.syncQueue.count();
    useSyncStore.getState().setPendingSyncCount?.(count);
  } catch (error) {
    console.error("[IndexedDB] Error al encolar mutación offline:", error);
  }
}

export function compactSyncQueue(items: SyncQueueItem[]): {
  compacted: SyncQueueItem[];
  discardedIds: string[];
} {
  const discardedIds = new Set<string>();
  const entityActions = new Map<string, SyncQueueItem[]>();

  for (const item of items) {
    const entityId = item.payload?.list_id || item.payload?.folder_id;
    if (!entityId) {
      continue;
    }
    const key = `${item.entity}:${entityId}`;
    if (!entityActions.has(key)) {
      entityActions.set(key, []);
    }
    entityActions.get(key)!.push(item);
  }

  const compacted: SyncQueueItem[] = [];

  entityActions.forEach((actions) => {
    const insertAction = actions.find(
      (a: SyncQueueItem) => a.action === "insert_list" || a.action === "insert_folder"
    );
    const deleteAction = actions.find(
      (a: SyncQueueItem) => a.action === "delete_list" || a.action === "delete_folder"
    );

    if (insertAction && deleteAction) {
      for (const a of actions) {
        discardedIds.add(a.id);
      }
      return;
    }

    if (insertAction) {
      const mergedPayload = { ...insertAction.payload };

      for (const a of actions) {
        if (a === insertAction) continue;

        if (a.action === "update_list_data") {
          mergedPayload.name = a.payload.name;
          mergedPayload.color = a.payload.color;
          mergedPayload.icon = a.payload.icon;
          discardedIds.add(a.id);
        } else if (a.action === "update_list_index") {
          mergedPayload.folder_id = a.payload.folder_id;
          mergedPayload.rank = a.payload.rank;
          discardedIds.add(a.id);
        } else if (a.action === "update_folder_data") {
          mergedPayload.folder_name = a.payload.folder_name;
          mergedPayload.folder_color = a.payload.folder_color;
          discardedIds.add(a.id);
        } else if (a.action === "update_folder_index") {
          mergedPayload.rank = a.payload.rank;
          discardedIds.add(a.id);
        } else {
          compacted.push(a);
        }
      }

      insertAction.payload = mergedPayload;
      compacted.push(insertAction);
      return;
    }

    if (deleteAction) {
      for (const a of actions) {
        if (a !== deleteAction) {
          discardedIds.add(a.id);
        }
      }
      compacted.push(deleteAction);
      return;
    }

    let latestData: SyncQueueItem | null = null;
    let latestIndex: SyncQueueItem | null = null;
    let latestPinned: SyncQueueItem | null = null;

    for (const a of actions) {
      if (a.action === "update_list_data" || a.action === "update_folder_data") {
        if (latestData) discardedIds.add(latestData.id);
        latestData = a;
      } else if (a.action === "update_list_index" || a.action === "update_folder_index") {
        if (latestIndex) discardedIds.add(latestIndex.id);
        latestIndex = a;
      } else if (a.action === "update_list_pinned" || a.action === "update_folder_pinned") {
        if (latestPinned) discardedIds.add(latestPinned.id);
        latestPinned = a;
      } else {
        compacted.push(a);
      }
    }

    if (latestData) compacted.push(latestData);
    if (latestIndex) compacted.push(latestIndex);
    if (latestPinned) compacted.push(latestPinned);
  });

  compacted.sort((a, b) => a.timestamp - b.timestamp);

  return { compacted, discardedIds: Array.from(discardedIds) };
}

let isProcessingQueue = false;

export async function processSyncQueue(): Promise<{
  processed: number;
  errors: number;
}> {
  if (!offlineDb || isProcessingQueue) return { processed: 0, errors: 0 };
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { processed: 0, errors: 0 };
  }

  isProcessingQueue = true;

  try {
    const rawItems = await offlineDb.syncQueue.orderBy("timestamp").toArray();
    if (rawItems.length === 0) {
      useSyncStore.getState().setPendingSyncCount?.(0);
      return { processed: 0, errors: 0 };
    }

    const { compacted, discardedIds } = compactSyncQueue(rawItems);

    if (discardedIds.length > 0) {
      await offlineDb.syncQueue.bulkDelete(discardedIds);
    }

    if (compacted.length === 0) {
      useSyncStore.getState().setPendingSyncCount?.(0);
      return { processed: 0, errors: 0 };
    }

    useSyncStore.getState().addLoading();

    const result = await syncBatchSidebar(compacted);

    if (result.processedIds && result.processedIds.length > 0) {
      await offlineDb.syncQueue.bulkDelete(result.processedIds);
    }

    const remaining = await offlineDb.syncQueue.count();
    useSyncStore.getState().setPendingSyncCount?.(remaining);

    if (result.processedIds && result.processedIds.length > 0 && remaining === 0) {
      const { lists: currentLists, folders: currentFolders } = useTodoDataStore.getState();
      await saveSidebarToIndexedDB(currentLists, currentFolders);
      customToast.success("Cambios sincronizados correctamente con la nube");
    }

    return {
      processed: result.processedIds?.length ?? 0,
      errors: result.failedIds?.length ?? 0,
    };
  } catch (error) {
    if (!isNetworkError(error)) {
      console.error("[SyncQueue] Error al procesar sincronización en lote:", error);
    }
    return { processed: 0, errors: 1 };
  } finally {
    useSyncStore.getState().removeLoading();
    isProcessingQueue = false;
  }
}
