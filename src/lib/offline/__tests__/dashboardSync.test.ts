import { describe, it, expect, vi } from "vitest";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: (fn: (...args: unknown[]) => unknown) => fn,
  };
});

vi.mock("@/lib/api/dashboard/actions", () => ({
  installWidgetAction: vi.fn().mockResolvedValue({}),
  uninstallWidgetAction: vi.fn().mockResolvedValue({}),
  saveWidgetLayouts: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/api/user-widgets/actions", () => ({
  createEmbeddedWidget: vi.fn().mockResolvedValue({ data: {} }),
  updateEmbeddedWidget: vi.fn().mockResolvedValue({ data: {} }),
  deleteEmbeddedWidget: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/offline/db", () => ({
  offlineDb: {
    syncQueue: {
      where: vi.fn().mockReturnValue({
        anyOf: () => ({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
      put: vi.fn(),
      delete: vi.fn(),
      bulkDelete: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
    },
    dashboard: {
      get: vi.fn(),
      put: vi.fn(),
    },
  },
}));

import {
  compactDashboardSyncQueue,
  reconcileDashboardWithOfflineState,
} from "../dashboardSync";
import type { SyncQueueItem } from "../db";
import type {
  PredefinedWidget,
  WidgetInstance,
  WidgetLimits,
} from "@/lib/schemas/dashboard.types";

describe("compactDashboardSyncQueue", () => {
  it("cancels install_widget followed by uninstall_widget for the same widget", () => {
    const items: SyncQueueItem[] = [
      {
        id: "op-1",
        entity: "widget_instance",
        action: "install_widget",
        payload: { predefinedId: "summary", widgetKey: "summary" },
        timestamp: 1000,
        retryCount: 0,
      },
      {
        id: "op-2",
        entity: "widget_instance",
        action: "uninstall_widget",
        payload: { predefinedId: "summary", widgetKey: "summary" },
        timestamp: 2000,
        retryCount: 0,
      },
    ];

    const result = compactDashboardSyncQueue(items);

    expect(result.compacted).toHaveLength(0);
    expect(result.discardedIds).toContain("op-1");
    expect(result.discardedIds).toContain("op-2");
  });

  it("keeps only the latest save_layouts operation discarding previous ones", () => {
    const items: SyncQueueItem[] = [
      {
        id: "layout-1",
        entity: "widget_layout",
        action: "save_layouts",
        payload: { layouts: [{ instanceId: "inst-1", layoutLg: { x: 0, y: 0, w: 1, h: 2, i: "summary" } }] },
        timestamp: 1000,
        retryCount: 0,
      },
      {
        id: "layout-2",
        entity: "widget_layout",
        action: "save_layouts",
        payload: { layouts: [{ instanceId: "inst-1", layoutLg: { x: 1, y: 0, w: 1, h: 2, i: "summary" } }] },
        timestamp: 2000,
        retryCount: 0,
      },
      {
        id: "layout-3",
        entity: "widget_layout",
        action: "save_layouts",
        payload: { layouts: [{ instanceId: "inst-1", layoutLg: { x: 2, y: 0, w: 1, h: 2, i: "summary" } }] },
        timestamp: 3000,
        retryCount: 0,
      },
    ];

    const result = compactDashboardSyncQueue(items);

    expect(result.compacted).toHaveLength(1);
    expect(result.compacted[0].id).toBe("layout-3");
    expect(result.discardedIds).toContain("layout-1");
    expect(result.discardedIds).toContain("layout-2");
  });

  it("cancels create_embedded_widget followed by delete_embedded_widget for the same id", () => {
    const items: SyncQueueItem[] = [
      {
        id: "create-1",
        entity: "user_widget",
        action: "create_embedded_widget",
        payload: { id: "uw-123", title: "My Notes", url: "https://notes.example.com" },
        timestamp: 1000,
        retryCount: 0,
      },
      {
        id: "delete-1",
        entity: "user_widget",
        action: "delete_embedded_widget",
        payload: { id: "uw-123" },
        timestamp: 2000,
        retryCount: 0,
      },
    ];

    const result = compactDashboardSyncQueue(items);

    expect(result.compacted).toHaveLength(0);
    expect(result.discardedIds).toContain("create-1");
    expect(result.discardedIds).toContain("delete-1");
  });

  it("merges update_embedded_widget into create_embedded_widget", () => {
    const items: SyncQueueItem[] = [
      {
        id: "create-1",
        entity: "user_widget",
        action: "create_embedded_widget",
        payload: { id: "uw-456", title: "Original Title", url: "https://v1.example.com" },
        timestamp: 1000,
        retryCount: 0,
      },
      {
        id: "update-1",
        entity: "user_widget",
        action: "update_embedded_widget",
        payload: { id: "uw-456", title: "Updated Title" },
        timestamp: 2000,
        retryCount: 0,
      },
    ];

    const result = compactDashboardSyncQueue(items);

    expect(result.compacted).toHaveLength(1);
    expect(result.compacted[0].id).toBe("create-1");
    expect(result.compacted[0].payload.title).toBe("Updated Title");
    expect(result.compacted[0].payload.url).toBe("https://v1.example.com");
    expect(result.discardedIds).toContain("update-1");
  });
});

describe("reconcileDashboardWithOfflineState", () => {
  const dummyCatalog: PredefinedWidget[] = [
    {
      id: "summary",
      name: "Summary",
      description: null,
      localizedName: null,
      localizedDescription: null,
      category: "productivity",
      tierRequired: "free",
      isActive: true,
      isResizable: true,
      componentKey: "summary",
      defaultLayoutLg: null,
      defaultLayoutMd: null,
      defaultLayoutXs: null,
      sortOrder: 1,
    },
    {
      id: "pomodoro",
      name: "Pomodoro",
      description: null,
      localizedName: null,
      localizedDescription: null,
      category: "wellness",
      tierRequired: "free",
      isActive: true,
      isResizable: true,
      componentKey: "pomodoro",
      defaultLayoutLg: null,
      defaultLayoutMd: null,
      defaultLayoutXs: null,
      sortOrder: 2,
    },
  ];

  const dummyServerInstances: WidgetInstance[] = [
    {
      instanceId: "inst-1",
      widgetKey: "summary",
      widgetSource: "predefined",
      componentKey: "summary",
      pwName: "Summary",
      pwDescription: null,
      pwCategory: "productivity",
      pwTierRequired: "free",
      pwIsResizable: true,
      pwIsActive: true,
      uwTitle: null,
      uwUrl: null,
      uwConfig: null,
      uwIsPublic: null,
      uwModerationStatus: null,
      layoutLg: { i: "summary", x: 0, y: 0, w: 1, h: 2 },
      layoutMd: { i: "summary", x: 0, y: 0, w: 1, h: 2 },
      layoutXs: { i: "summary", x: 0, y: 0, w: 1, h: 2 },
      isInstalled: true,
    },
    {
      instanceId: "inst-2",
      widgetKey: "pomodoro",
      widgetSource: "predefined",
      componentKey: "pomodoro",
      pwName: "Pomodoro",
      pwDescription: null,
      pwCategory: "wellness",
      pwTierRequired: "free",
      pwIsResizable: true,
      pwIsActive: true,
      uwTitle: null,
      uwUrl: null,
      uwConfig: null,
      uwIsPublic: null,
      uwModerationStatus: null,
      layoutLg: { i: "pomodoro", x: 1, y: 0, w: 1, h: 2 },
      layoutMd: { i: "pomodoro", x: 0, y: 2, w: 1, h: 2 },
      layoutXs: { i: "pomodoro", x: 0, y: 2, w: 1, h: 2 },
      isInstalled: true,
    },
  ];

  const dummyLimits: WidgetLimits = { free: 1, student: 3, pro: 99, ultra: 99 };

  it("returns server state when there are no pending offline mutations", async () => {
    const localState = {
      widgetInstances: dummyServerInstances,
      layout: { lg: [], md: [], xs: [] },
      predefinedWidgets: dummyCatalog,
      widgetLimits: dummyLimits,
    };

    const result = await reconcileDashboardWithOfflineState(
      dummyCatalog,
      dummyServerInstances,
      localState,
    );

    expect(result.instances).toHaveLength(2);
    expect(result.instances[0].isInstalled).toBe(true);
    expect(result.instances[1].isInstalled).toBe(true);
  });

  it("prioritizes offline uninstall (tombstone) over server active state", async () => {
    const { offlineDb } = await import("@/lib/offline/db");
    vi.mocked(offlineDb.syncQueue.where).mockReturnValueOnce({
      anyOf: () => ({
        toArray: vi.fn().mockResolvedValue([
          {
            id: "uninst-1",
            entity: "widget_instance",
            action: "uninstall_widget",
            payload: { predefinedId: "summary", widgetKey: "summary" },
            timestamp: 1000,
            retryCount: 0,
          },
        ]),
      }),
    } as unknown as ReturnType<typeof offlineDb.syncQueue.where>);

    const localState = {
      widgetInstances: dummyServerInstances.map((i) =>
        i.widgetKey === "summary" ? { ...i, isInstalled: false } : i,
      ),
      layout: { lg: [], md: [], xs: [] },
      predefinedWidgets: dummyCatalog,
      widgetLimits: dummyLimits,
    };

    const result = await reconcileDashboardWithOfflineState(
      dummyCatalog,
      dummyServerInstances,
      localState,
    );

    const summaryInst = result.instances.find((i) => i.widgetKey === "summary");
    expect(summaryInst?.isInstalled).toBe(false);
  });

  it("preserves offline layout coordinates when there is a pending save_layouts mutation", async () => {
    const { offlineDb } = await import("@/lib/offline/db");
    vi.mocked(offlineDb.syncQueue.where).mockReturnValueOnce({
      anyOf: () => ({
        toArray: vi.fn().mockResolvedValue([
          {
            id: "save-1",
            entity: "widget_layout",
            action: "save_layouts",
            payload: { layouts: [] },
            timestamp: 1000,
            retryCount: 0,
          },
        ]),
      }),
    } as unknown as ReturnType<typeof offlineDb.syncQueue.where>);

    const modifiedLocalInstances = dummyServerInstances.map((i) =>
      i.widgetKey === "summary"
        ? { ...i, layoutLg: { i: "summary", x: 2, y: 5, w: 1, h: 2 } }
        : i,
    );

    const localState = {
      widgetInstances: modifiedLocalInstances,
      layout: { lg: [{ i: "summary", x: 2, y: 5, w: 1, h: 2 }], md: [], xs: [] },
      predefinedWidgets: dummyCatalog,
      widgetLimits: dummyLimits,
    };

    const result = await reconcileDashboardWithOfflineState(
      dummyCatalog,
      dummyServerInstances,
      localState,
    );

    const summaryInst = result.instances.find((i) => i.widgetKey === "summary");
    expect(summaryInst?.layoutLg?.x).toBe(2);
    expect(summaryInst?.layoutLg?.y).toBe(5);
  });
});
