"use client";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useShopStore } from "@/store/useShopStore";
import { useStreakStore } from "@/store/useStreakStore";
import { useAchievementsStore } from "@/store/useAchievementsStore";
import { getLists } from "@/lib/api/list/actions";
import { getPaginatedTasks, getSummary } from "@/lib/api/task/actions";
import { PAGE_SIZE } from "@/store/todoUtils";
import { TaskType } from "@/lib/schemas/database.types";

export async function syncFrontendAfterAIOperation(
  executedTools?: { toolName: string; params?: Record<string, unknown> }[]
) {
  try {
    const toolList = executedTools || [];
    const toolNames = toolList.map((t) => t.toolName);

    if (toolNames.includes("delete_workspace_data")) {
      useTodoDataStore.setState({
        lists: [],
        folders: [],
        tasks: [],
        tasksByList: {},
        completedTasks: [],
        listsPagination: { root: { page: 0, hasMore: false } },
        currentListId: "home",
      });
      useDashboardStore.setState({
        total_tasks: 0,
        completed_tasks: 0,
        overdue_tasks: 0,
        upcoming_tasks: [],
        due_today_tasks: [],
      });
    } else if (toolNames.includes("delete_all_lists")) {
      useTodoDataStore.setState({
        lists: [],
        tasks: [],
        tasksByList: {},
        completedTasks: [],
        listsPagination: { root: { page: 0, hasMore: false } },
        currentListId: "home",
      });
      useDashboardStore.setState({
        total_tasks: 0,
        completed_tasks: 0,
        overdue_tasks: 0,
        upcoming_tasks: [],
        due_today_tasks: [],
      });
    } else if (toolNames.includes("delete_all_tasks")) {
      useTodoDataStore.setState({
        tasks: [],
        tasksByList: {},
        completedTasks: [],
      });
      useDashboardStore.setState({
        total_tasks: 0,
        completed_tasks: 0,
        overdue_tasks: 0,
        upcoming_tasks: [],
        due_today_tasks: [],
      });
    } else {
      for (const tool of toolList) {
        const p = tool.params || {};
        if (tool.toolName === "delete_list") {
          const listId = p.list_id as string | undefined;
          const listName = p.list_name as string | undefined;
          useTodoDataStore.setState((s) => ({
            lists: s.lists.filter((l) =>
              listId ? l.list_id !== listId : l.list.list_name !== listName
            ),
            tasks: s.tasks.filter((t) => (listId ? t.list_id !== listId : true)),
          }));
        } else if (tool.toolName === "delete_folder") {
          const folderId = p.folder_id as string | undefined;
          const folderName = p.folder_name as string | undefined;
          useTodoDataStore.setState((s) => ({
            folders: s.folders.filter((f) =>
              folderId ? f.folder_id !== folderId : f.folder_name !== folderName
            ),
            lists: s.lists.map((l) =>
              folderId && l.folder === folderId ? { ...l, folder: null } : l
            ),
          }));
        } else if (tool.toolName === "delete_task") {
          const taskId = p.task_id as string | undefined;
          if (taskId) {
            useTodoDataStore.setState((s) => ({
              tasks: s.tasks.filter((t) => t.task_id !== taskId),
              completedTasks: s.completedTasks.filter((t) => t.task_id !== taskId),
            }));
          }
        }
      }
    }

    const hasListOrFolderMutations =
      toolNames.length === 0 ||
      toolNames.some((t) =>
        [
          "create_workspace_hierarchy",
          "create_list",
          "update_list",
          "move_list_to_folder",
          "delete_list",
          "delete_all_lists",
          "create_folder",
          "update_folder",
          "delete_folder",
          "move_folder_lists_to_root",
          "delete_workspace_data",
        ].includes(t)
      );

    const hasTaskMutations =
      toolNames.length === 0 ||
      toolNames.some((t) =>
        [
          "create_workspace_hierarchy",
          "create_task",
          "update_task",
          "move_task",
          "toggle_task_status",
          "batch_toggle_tasks",
          "complete_all_tasks_in_list",
          "delete_task",
          "delete_all_tasks",
          "delete_workspace_data",
          "delete_all_lists",
          "clear_completed_tasks",
        ].includes(t)
      );

    if (hasListOrFolderMutations && !toolNames.includes("delete_workspace_data")) {
      const { data: listsData } = await getLists();
      if (listsData) {
        useTodoDataStore.setState({
          lists: listsData.lists ?? [],
          folders: listsData.folders ?? [],
          tasks: listsData.tasks ?? [],
          listsPagination: {
            root: { page: 0, hasMore: listsData.hasMoreRoot ?? false },
          },
        });
      }
    }

    if (
      (hasTaskMutations || hasListOrFolderMutations) &&
      !toolNames.includes("delete_workspace_data") &&
      !toolNames.includes("delete_all_lists")
    ) {
      const state = useTodoDataStore.getState();
      const currentListId = state.currentListId;
      const listIds =
        !currentListId || currentListId === "home"
          ? state.lists.map((l) => l.list_id)
          : [currentListId];

      if (listIds.length > 0) {
        const { data: tasksData } = await getPaginatedTasks(
          listIds,
          0,
          PAGE_SIZE,
          state.taskSort
        );

        if (tasksData) {
          useTodoDataStore.setState((s) => ({
            tasks: tasksData as TaskType[],
            tasksPage: 0,
            hasMoreTasks: tasksData.length === PAGE_SIZE,
            tasksByList:
              currentListId && currentListId !== "home"
                ? {
                  ...s.tasksByList,
                  [currentListId]: {
                    tasks: tasksData as TaskType[],
                    page: 0,
                    hasMore: tasksData.length === PAGE_SIZE,
                  },
                }
                : s.tasksByList,
          }));
        }
      }
    }

    const summaryRes = await getSummary();
    if (summaryRes.data?.summary) {
      const sum = summaryRes.data.summary;
      useDashboardStore.setState({
        total_tasks: Number(sum.total_tasks ?? 0),
        completed_tasks: Number(sum.completed_tasks ?? 0),
        overdue_tasks: Number(sum.overdue_tasks ?? 0),
        upcoming_tasks: sum.upcoming_tasks || [],
        due_today_tasks: sum.due_today_tasks || [],
        hasFetchedData: true,
      });
    }

    useShopStore.getState().fetchShopData(true).catch(() => { });
    useStreakStore.getState().fetchStreak().catch(() => { });
    useAchievementsStore.getState().fetchAchievements().catch(() => { });
  } catch (err) {
    console.warn("[syncFrontendAfterAIOperation] Error sincronizando estado frontend:", err);
  }
}
