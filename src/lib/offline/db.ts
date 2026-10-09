import Dexie, { type Table } from "dexie";
import type { ListsType, FolderType, TaskType } from "@/lib/schemas/database.types";
import type {
  PredefinedWidget,
  WidgetInstance,
  WidgetLimits,
} from "@/lib/schemas/dashboard.types";
import type { ResponsiveLayouts } from "react-grid-layout";

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

export type DashboardActionType =
  | "install_widget"
  | "uninstall_widget"
  | "save_layouts"
  | "create_embedded_widget"
  | "update_embedded_widget"
  | "delete_embedded_widget";

export interface SyncQueueItem {
  id: string;
  entity:
    | "list"
    | "folder"
    | "task"
    | "widget_instance"
    | "widget_layout"
    | "user_widget";
  action: SidebarActionType | DashboardActionType | string;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

export interface DashboardCacheItem {
  key: string;
  widgetInstances: WidgetInstance[];
  layout: ResponsiveLayouts;
  predefinedWidgets: PredefinedWidget[];
  widgetLimits?: WidgetLimits;
  updatedAt: number;
  version?: number;
}

export class AlinoOfflineDB extends Dexie {
  lists!: Table<ListsType, string>;
  folders!: Table<FolderType, string>;
  tasks!: Table<TaskType, string>;
  syncQueue!: Table<SyncQueueItem, string>;
  dashboard!: Table<DashboardCacheItem, string>;

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
    this.version(3).stores({
      lists: "list_id, folder, pinned, rank",
      folders: "folder_id, pinned, rank",
      tasks: "task_id, list_id, completed, rank",
      syncQueue: "id, entity, action, timestamp",
      dashboard: "key",
    });
  }
}

export const offlineDb =
  typeof window !== "undefined"
    ? new AlinoOfflineDB()
    : (null as unknown as AlinoOfflineDB);
