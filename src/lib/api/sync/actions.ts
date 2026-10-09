"use server";

import { createClient as createClientServer } from "@/utils/supabase/server";
import {
  insertList,
  updateDataList,
  updateIndexList,
  updatePinnedList,
  deleteList,
  insertFolder,
  updateDataFolder,
  updateIndexFolder,
  updatePinnedFolder,
  deleteFolder,
} from "@/lib/api/list/actions";
import { SyncQueueItem } from "@/lib/offline/db";

export interface BatchSyncResult {
  success: boolean;
  processedIds: string[];
  failedIds: string[];
  error?: string | null;
}

const ACTION_PRIORITY: Record<string, number> = {
  insert_folder: 1,
  update_folder_data: 2,
  update_folder_index: 2,
  update_folder_pinned: 2,
  insert_list: 3,
  update_list_data: 4,
  update_list_index: 4,
  update_list_pinned: 4,
  delete_list: 5,
  delete_folder: 6,
};

function sortOperationsByDependency(operations: SyncQueueItem[]): SyncQueueItem[] {
  return [...operations].sort((a, b) => {
    const priorityA = ACTION_PRIORITY[a.action] ?? 99;
    const priorityB = ACTION_PRIORITY[b.action] ?? 99;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return a.timestamp - b.timestamp;
  });
}

interface SidebarPayload {
  list_id?: string;
  folder_id?: string;
  name?: string;
  folder_name?: string;
  color?: string;
  folder_color?: string;
  icon?: string;
  rank?: string;
  index?: number;
  pinned?: boolean;
}

async function executeServerFallback(
  operations: SyncQueueItem[]
): Promise<BatchSyncResult> {
  const processedIds: string[] = [];
  const failedIds: string[] = [];

  for (const item of operations) {
    try {
      let res: { error?: string | null } = {};
      const p = item.payload as SidebarPayload;

      switch (item.action) {
        case "insert_folder": {
          if (!p.folder_id || !p.folder_name || !p.folder_color || p.index === undefined || !p.rank) {
            failedIds.push(item.id);
            continue;
          }
          res =
            (await insertFolder(
              p.folder_id,
              p.folder_name,
              p.folder_color,
              p.index,
              p.rank
            )) ?? {};
          break;
        }
        case "update_folder_data": {
          if (!p.folder_id || !p.folder_name || !p.folder_color) {
            failedIds.push(item.id);
            continue;
          }
          res =
            (await updateDataFolder(
              p.folder_id,
              p.folder_name,
              p.folder_color
            )) ?? {};
          break;
        }
        case "update_folder_index": {
          if (!p.folder_id || !p.rank) {
            failedIds.push(item.id);
            continue;
          }
          res = (await updateIndexFolder(p.folder_id, p.rank)) ?? {};
          break;
        }
        case "update_folder_pinned": {
          if (!p.folder_id || p.pinned === undefined || !p.rank) {
            failedIds.push(item.id);
            continue;
          }
          res =
            (await updatePinnedFolder(p.folder_id, p.pinned, p.rank)) ?? {};
          break;
        }
        case "delete_folder": {
          if (!p.folder_id) {
            failedIds.push(item.id);
            continue;
          }
          res = (await deleteFolder(p.folder_id)) ?? {};
          break;
        }
        case "insert_list": {
          if (!p.list_id || !p.name || !p.color || !p.icon || !p.rank || p.index === undefined || !p.folder_id) {
            failedIds.push(item.id);
            continue;
          }
          res =
            (await insertList(
              p.list_id,
              p.name,
              p.color,
              p.icon,
              p.rank,
              p.index,
              p.folder_id
            )) ?? {};
          break;
        }
        case "update_list_data": {
          if (!p.list_id || !p.name || !p.color || !p.icon) {
            failedIds.push(item.id);
            continue;
          }
          res =
            (await updateDataList(
              p.list_id,
              p.name,
              p.color,
              p.icon
            )) ?? {};
          break;
        }
        case "update_list_index": {
          if (!p.list_id || !p.folder_id || !p.rank) {
            failedIds.push(item.id);
            continue;
          }
          res = (await updateIndexList(p.list_id, p.folder_id, p.rank)) ?? {};
          break;
        }
        case "update_list_pinned": {
          if (!p.list_id || p.pinned === undefined || !p.rank) {
            failedIds.push(item.id);
            continue;
          }
          res = (await updatePinnedList(p.list_id, p.pinned, p.index ?? null, p.rank)) ?? {};
          break;
        }
        case "delete_list": {
          if (!p.list_id) {
            failedIds.push(item.id);
            continue;
          }
          res = (await deleteList(p.list_id)) ?? {};
          break;
        }
        default:
          console.warn(`[BatchSync Fallback] Acción desconocida: ${item.action}`);
          processedIds.push(item.id);
          continue;
      }

      if (res?.error) {
        console.error(
          `[BatchSync Fallback] Error en acción ${item.action}:`,
          res.error
        );
        failedIds.push(item.id);
      } else {
        processedIds.push(item.id);
      }
    } catch (err) {
      console.error(`[BatchSync Fallback] Excepción en ${item.action}:`, err);
      failedIds.push(item.id);
    }
  }

  return {
    success: true,
    processedIds,
    failedIds,
  };
}

export async function syncBatchSidebar(
  operations: SyncQueueItem[]
): Promise<BatchSyncResult> {
  if (!operations || operations.length === 0) {
    return { success: true, processedIds: [], failedIds: [] };
  }

  try {
    const supabase = createClientServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        processedIds: [],
        failedIds: operations.map((o) => o.id),
        error: "Usuario no autenticado o sesión expirada.",
      };
    }

    const sortedOperations = sortOperationsByDependency(operations);

    const { data: rpcData, error: rpcError } = await (supabase.rpc as any)(
      "sync_sidebar_batch",
      {
        p_operations: sortedOperations,
      }
    );

    if (!rpcError && rpcData) {
      return {
        success: rpcData.success ?? true,
        processedIds: (rpcData.processed_ids as string[]) ?? [],
        failedIds: (rpcData.failed_ids as string[]) ?? [],
      };
    }

    if (rpcError) {
      console.warn(
        "[BatchSync] sync_sidebar_batch RPC no disponible o falló, usando fallback en servidor:",
        rpcError.message
      );
    }

    return await executeServerFallback(sortedOperations);
  } catch (error: any) {
    console.error("[BatchSync] Error general en syncBatchSidebar:", error);
    return {
      success: false,
      processedIds: [],
      failedIds: operations.map((o) => o.id),
      error: error?.message || "Error inesperado al sincronizar en lote.",
    };
  }
}
