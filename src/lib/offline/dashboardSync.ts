import { v4 as uuidv4 } from "uuid";
import { offlineDb, type SyncQueueItem, type DashboardActionType } from "./db";
import {
  PredefinedWidget,
  WidgetInstance,
  WidgetLimits,
  WidgetLayoutItem,
} from "@/lib/schemas/dashboard.types";
import { ResponsiveLayouts } from "react-grid-layout";
import {
  buildLayoutsFromInstances,
  isResponsiveLayoutPopulated,
} from "@/store/dashboardUtils";
import { useSyncStore } from "@/store/useSyncStore";
import {
  installWidgetAction,
  uninstallWidgetAction,
  saveWidgetLayouts,
} from "@/lib/api/dashboard/actions";
import {
  createEmbeddedWidget,
  updateEmbeddedWidget,
  deleteEmbeddedWidget,
} from "@/lib/api/user-widgets/actions";
import { isNetworkError } from "./sidebarSync";
import { Json } from "@/lib/schemas/database.types";

const DASHBOARD_CACHE_KEY = "user_dashboard_config";

export interface DashboardOfflineState {
  widgetInstances: WidgetInstance[];
  layout: ResponsiveLayouts;
  predefinedWidgets: PredefinedWidget[];
  widgetLimits: WidgetLimits;
}

export async function saveDashboardToIndexedDB(
  widgetInstances: WidgetInstance[],
  layout: ResponsiveLayouts,
  predefinedWidgets: PredefinedWidget[],
  widgetLimits?: WidgetLimits,
): Promise<void> {
  if (!offlineDb?.dashboard) return;
  try {
    await offlineDb.dashboard.put({
      key: DASHBOARD_CACHE_KEY,
      widgetInstances,
      layout,
      predefinedWidgets,
      widgetLimits: widgetLimits ?? {
        free: 1,
        student: 3,
        pro: 99,
        ultra: 99,
      },
      updatedAt: Date.now(),
    });
  } catch {}
}

export async function loadDashboardFromIndexedDB(): Promise<DashboardOfflineState | null> {
  if (!offlineDb?.dashboard) return null;
  try {
    const cached = await offlineDb.dashboard.get(DASHBOARD_CACHE_KEY);
    if (!cached) return null;

    return {
      widgetInstances: cached.widgetInstances ?? [],
      layout: cached.layout ?? { lg: [], md: [], xs: [] },
      predefinedWidgets: cached.predefinedWidgets ?? [],
      widgetLimits: cached.widgetLimits ?? {
        free: 1,
        student: 3,
        pro: 99,
        ultra: 99,
      },
    };
  } catch {
    return null;
  }
}

export async function enqueueDashboardMutation(
  action: DashboardActionType,
  entity: "widget_instance" | "widget_layout" | "user_widget",
  payload: Record<string, unknown>,
): Promise<void> {
  if (!offlineDb?.syncQueue) return;
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
  } catch {}
}

export function compactDashboardSyncQueue(items: SyncQueueItem[]): {
  compacted: SyncQueueItem[];
  discardedIds: string[];
} {
  const discardedIds = new Set<string>();
  const instanceActions = new Map<string, SyncQueueItem[]>();
  const userWidgetActions = new Map<string, SyncQueueItem[]>();
  let latestLayoutAction: SyncQueueItem | null = null;
  const layoutActions: SyncQueueItem[] = [];

  for (const item of items) {
    if (item.entity === "widget_layout") {
      layoutActions.push(item);
      continue;
    }

    if (item.entity === "user_widget") {
      const widgetId = (item.payload?.id as string) ?? "";
      if (widgetId) {
        if (!userWidgetActions.has(widgetId)) {
          userWidgetActions.set(widgetId, []);
        }
        userWidgetActions.get(widgetId)!.push(item);
      }
      continue;
    }

    if (item.entity === "widget_instance") {
      const key =
        ((item.payload?.predefinedId ??
          item.payload?.userWidgetId ??
          item.payload?.widgetKey) as string) ?? "";
      if (key) {
        if (!instanceActions.has(key)) {
          instanceActions.set(key, []);
        }
        instanceActions.get(key)!.push(item);
      }
    }
  }

  for (const item of layoutActions) {
    if (latestLayoutAction) {
      discardedIds.add(latestLayoutAction.id);
    }
    latestLayoutAction = item;
  }

  const compacted: SyncQueueItem[] = [];
  if (latestLayoutAction) {
    compacted.push(latestLayoutAction);
  }

  instanceActions.forEach((actions) => {
    const installAction = actions.find((a) => a.action === "install_widget");
    const uninstallAction = actions.find((a) => a.action === "uninstall_widget");

    if (installAction && uninstallAction) {
      if (installAction.timestamp < uninstallAction.timestamp) {
        for (const a of actions) {
          discardedIds.add(a.id);
        }
        return;
      }
    }

    if (uninstallAction && !installAction) {
      for (const a of actions) {
        if (a !== uninstallAction) {
          discardedIds.add(a.id);
        }
      }
      compacted.push(uninstallAction);
      return;
    }

    const lastAction = actions[actions.length - 1];
    for (const a of actions) {
      if (a !== lastAction) {
        discardedIds.add(a.id);
      }
    }
    compacted.push(lastAction);
  });

  userWidgetActions.forEach((actions) => {
    const createAction = actions.find(
      (a) => a.action === "create_embedded_widget",
    );
    const deleteAction = actions.find(
      (a) => a.action === "delete_embedded_widget",
    );

    if (createAction && deleteAction) {
      for (const a of actions) {
        discardedIds.add(a.id);
      }
      return;
    }

    if (createAction) {
      const mergedPayload = { ...createAction.payload };
      for (const a of actions) {
        if (a === createAction) continue;
        if (a.action === "update_embedded_widget") {
          if (a.payload.title !== undefined) mergedPayload.title = a.payload.title;
          if (a.payload.url !== undefined) mergedPayload.url = a.payload.url;
          if (a.payload.config !== undefined) mergedPayload.config = a.payload.config;
          discardedIds.add(a.id);
        }
      }
      createAction.payload = mergedPayload;
      compacted.push(createAction);
      return;
    }

    const lastAction = actions[actions.length - 1];
    for (const a of actions) {
      if (a !== lastAction) {
        discardedIds.add(a.id);
      }
    }
    compacted.push(lastAction);
  });

  compacted.sort((a, b) => a.timestamp - b.timestamp);
  return { compacted, discardedIds: Array.from(discardedIds) };
}

export async function reconcileDashboardWithOfflineState(
  serverCatalog: PredefinedWidget[],
  serverInstances: WidgetInstance[],
  localState: DashboardOfflineState | null,
): Promise<{
  instances: WidgetInstance[];
  layout: ResponsiveLayouts;
  catalog: PredefinedWidget[];
}> {
  if (!offlineDb?.syncQueue || !localState) {
    return {
      instances: serverInstances,
      layout: buildLayoutsFromInstances(serverInstances),
      catalog: serverCatalog,
    };
  }

  try {
    const queueItems = await offlineDb.syncQueue
      .where("entity")
      .anyOf(["widget_instance", "widget_layout", "user_widget"])
      .toArray();

    if (queueItems.length === 0) {
      return {
        instances: serverInstances,
        layout: buildLayoutsFromInstances(serverInstances),
        catalog: serverCatalog,
      };
    }

    const uninstalledKeys = new Set<string>();
    const installedKeys = new Set<string>();
    let hasPendingLayoutChange = false;

    for (const item of queueItems) {
      if (item.action === "uninstall_widget") {
        const key =
          ((item.payload?.predefinedId ??
            item.payload?.userWidgetId ??
            item.payload?.widgetKey) as string) ?? "";
        if (key) uninstalledKeys.add(key);
      } else if (item.action === "install_widget") {
        const key =
          ((item.payload?.predefinedId ??
            item.payload?.userWidgetId ??
            item.payload?.widgetKey) as string) ?? "";
        if (key) installedKeys.add(key);
      } else if (item.action === "save_layouts") {
        hasPendingLayoutChange = true;
      }
    }

    const localMap = new Map(
      localState.widgetInstances.map((inst) => [inst.widgetKey, inst]),
    );

    const mergedInstances: WidgetInstance[] = serverInstances.map((sInst) => {
      if (uninstalledKeys.has(sInst.widgetKey)) {
        return { ...sInst, isInstalled: false };
      }
      if (installedKeys.has(sInst.widgetKey)) {
        const local = localMap.get(sInst.widgetKey);
        return local ? { ...local, isInstalled: true } : sInst;
      }
      if (hasPendingLayoutChange) {
        const local = localMap.get(sInst.widgetKey);
        if (local) {
          return {
            ...sInst,
            layoutLg: local.layoutLg,
            layoutMd: local.layoutMd,
            layoutXs: local.layoutXs,
          };
        }
      }
      return sInst;
    });

    installedKeys.forEach((key) => {
      if (!mergedInstances.some((i) => i.widgetKey === key)) {
        const local = localMap.get(key);
        if (local) mergedInstances.push(local);
      }
    });

    const effectiveLayout =
      hasPendingLayoutChange && isResponsiveLayoutPopulated(localState.layout)
        ? localState.layout
        : buildLayoutsFromInstances(mergedInstances);

    return {
      instances: mergedInstances,
      layout: effectiveLayout,
      catalog: serverCatalog,
    };
  } catch {
    return {
      instances: serverInstances,
      layout: buildLayoutsFromInstances(serverInstances),
      catalog: serverCatalog,
    };
  }
}

let isProcessingDashboardQueue = false;

export async function processDashboardSyncQueue(): Promise<{
  processed: number;
  errors: number;
}> {
  if (!offlineDb?.syncQueue || isProcessingDashboardQueue) {
    return { processed: 0, errors: 0 };
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { processed: 0, errors: 0 };
  }

  isProcessingDashboardQueue = true;

  try {
    const rawItems = await offlineDb.syncQueue
      .where("entity")
      .anyOf(["widget_instance", "widget_layout", "user_widget"])
      .toArray();

    if (rawItems.length === 0) {
      return { processed: 0, errors: 0 };
    }

    const { compacted, discardedIds } = compactDashboardSyncQueue(rawItems);

    if (discardedIds.length > 0) {
      await offlineDb.syncQueue.bulkDelete(discardedIds);
    }

    if (compacted.length === 0) {
      const remainingCount = await offlineDb.syncQueue.count();
      useSyncStore.getState().setPendingSyncCount?.(remainingCount);
      return { processed: 0, errors: 0 };
    }

    useSyncStore.getState().addLoading();
    let processedCount = 0;
    let errorCount = 0;

    for (const item of compacted) {
      try {
        let opError: string | undefined;

        switch (item.action) {
          case "install_widget": {
            const p = item.payload;
            const res = await installWidgetAction({
              predefinedId: p.predefinedId as string | undefined,
              userWidgetId: p.userWidgetId as string | undefined,
              layoutLg: p.layoutLg as WidgetLayoutItem | undefined,
              layoutMd: p.layoutMd as WidgetLayoutItem | undefined,
              layoutXs: p.layoutXs as WidgetLayoutItem | undefined,
            });
            opError = res.error;
            break;
          }
          case "uninstall_widget": {
            const p = item.payload;
            const res = await uninstallWidgetAction({
              predefinedId: p.predefinedId as string | undefined,
              userWidgetId: p.userWidgetId as string | undefined,
            });
            opError = res.error;
            break;
          }
          case "save_layouts": {
            const layouts = (item.payload.layouts ?? []) as Array<{
              instanceId: string;
              layoutLg: WidgetLayoutItem | null;
              layoutMd: WidgetLayoutItem | null;
              layoutXs: WidgetLayoutItem | null;
            }>;
            const res = await saveWidgetLayouts(layouts);
            opError = res.error;
            break;
          }
          case "create_embedded_widget": {
            const p = item.payload;
            const res = await createEmbeddedWidget({
              title: p.title as string,
              url: p.url as string,
              config: p.config as Json | undefined,
            });
            opError = res.error;
            break;
          }
          case "update_embedded_widget": {
            const p = item.payload;
            const res = await updateEmbeddedWidget(p.id as string, {
              title: p.title as string | undefined,
              url: p.url as string | undefined,
              config: p.config as Json | undefined,
            });
            opError = res.error;
            break;
          }
          case "delete_embedded_widget": {
            const p = item.payload;
            const res = await deleteEmbeddedWidget(p.id as string);
            opError = res.error;
            break;
          }
        }

        if (opError) {
          if (isNetworkError(opError)) {
            errorCount++;
            break;
          }
          await offlineDb.syncQueue.delete(item.id);
          errorCount++;
        } else {
          await offlineDb.syncQueue.delete(item.id);
          processedCount++;
        }
      } catch (err) {
        if (isNetworkError(err)) {
          errorCount++;
          break;
        }
        await offlineDb.syncQueue.delete(item.id);
        errorCount++;
      }
    }

    const remaining = await offlineDb.syncQueue.count();
    useSyncStore.getState().setPendingSyncCount?.(remaining);

    return { processed: processedCount, errors: errorCount };
  } finally {
    useSyncStore.getState().removeLoading();
    isProcessingDashboardQueue = false;
  }
}
