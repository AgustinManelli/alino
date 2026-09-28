import Dexie, { type Table } from "dexie";
import type { ListsType, FolderType, TaskType } from "@/lib/schemas/database.types";

export type SidebarActionType =
  | "insert_list"
  | "update_list_data"
  | "update_list_index"
  | "update_list_pinned"
  | "delete_list"
  | "insert_folder"
  | "update_folder_data"
  | "update_folder_index"
  | "update_folder_pinned"
  | "delete_folder";

export interface SyncQueueItem {
  id: string;
  entity: "list" | "folder" | "task";
  action: SidebarActionType | string;
  payload: any;
  timestamp: number;
  retryCount: number;
}

export class AlinoOfflineDB extends Dexie {
  lists!: Table<ListsType, string>;
  folders!: Table<FolderType, string>;
  tasks!: Table<TaskType, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super("AlinoOfflineDB");
    this.version(1).stores({
      lists: "list_id, folder, pinned, rank",
      folders: "folder_id, pinned, rank",
      syncQueue: "id, entity, action, timestamp",
    });
    this.version(2).stores({
      lists: "list_id, folder, pinned, rank",
      folders: "folder_id, pinned, rank",
      tasks: "task_id, list_id, completed, rank",
      syncQueue: "id, entity, action, timestamp",
    });
  }
}

export const offlineDb =
  typeof window !== "undefined"
    ? new AlinoOfflineDB()
    : (null as unknown as AlinoOfflineDB);

