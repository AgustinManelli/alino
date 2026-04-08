"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

import type { TaskSortOption } from "@/lib/api/task/actions";
import {
  createListInvitation,
  deleteAllLists,
  deleteFolder,
  deleteFolderWithContents,
  deleteList,
  getLists,
  getSingleLists,
  getUsersMembersList,
  insertFolder,
  insertList,
  leaveList,
  updateDataFolder,
  updateDataList,
  updateIndexFolder,
  updateIndexList,
  updatePinnedList,
  getListPendingInvitations,
  cancelListInvitation,
  updateListMemberRole,
  removeListMember,
} from "@/lib/api/list/actions";
import type { PendingInvitation } from "@/lib/api/list/actions";
import {
  deleteTask,
  insertTask,
  insertTasks,
  updateCompletedTask,
  updateNameTask,
} from "@/lib/api/task/actions";

import {
  FolderType,
  InvitationRow,
  ListsRow,
  ListsType,
  MembershipCountPayload,
  MembershipRow,
  TaskCountPayload,
  TaskType,
  UserProfile,
  UserWithMembershipRole,
} from "@/lib/schemas/database.types";
import { calculateNewRank } from "@/lib/lexorank";
import { globalUserStore } from "@/store/useUserDataStore";

const POS_INDEX = 16384;
const PAGE_SIZE = 40;

function readTaskCount(
  list: ListsType,
  fallbackTasks: TaskType[]
): number {
  const payload = list.list.tasks;
  if (Array.isArray(payload) && payload.length > 0) {
    return payload[0].count;
  }
  return fallbackTasks.filter((t) => t.list_id === list.list_id).length;
}

function readFolderMembershipCount(
  folder: FolderType,
  lists: ListsType[]
): number {
  const payload = folder.memberships;
  if (Array.isArray(payload) && payload.length > 0) {
    return payload[0].count;
  }
  return lists.filter((l) => l.folder === folder.folder_id).length;
}

function makeTaskCountPayload(count: number): TaskCountPayload {
  return [{ count }];
}

function makeMembershipCountPayload(count: number): MembershipCountPayload {
  return [{ count }];
}

const calculateNewIndex = (
  a: ListsType[] | FolderType[],
  b: ListsType[] | FolderType[]
) => {
  const maxOf = (arr: ListsType[] | FolderType[]) =>
    arr.length > 0 ? Math.max(...arr.map((x) => x.index ?? 0)) : 0;

  const maxIdx = Math.max(maxOf(a), maxOf(b));
  return maxIdx <= 0 ? POS_INDEX : maxIdx + POS_INDEX;
};

function handleError(err: unknown) {
  toast.error((err as Error).message || "Error desconocido");
}

// Tipo del store

type TodoStore = {
  lists: ListsType[];
  tasks: TaskType[];
  tasksByList: Record<string, { tasks: TaskType[]; page: number; hasMore: boolean }>;
  folders: FolderType[];
  initialFetch: boolean;
  loadingQueue: number;
  tasksPage: number;
  hasMoreTasks: boolean;
  currentListId: string | "home" | null;
  fetchingListsQueue: Record<string, boolean>;
  listsPagination: Record<string, { page: number; hasMore: boolean }>;
  taskSort: TaskSortOption;

  fetchListsPage: (folderId: string | "root") => Promise<void>;
  fetchTasksPage: (listId: string | "home", reset?: boolean) => Promise<void>;
  setLists: (list: ListsType[]) => Promise<void>;
  setFolders: (folders: FolderType[]) => Promise<void>;
  getLists: () => Promise<void>;
  getListById: (list_id: string) => ListsType | undefined;
  subscriptionAddList: (membership: MembershipRow) => void;
  subscriptionDeleteList: (list: MembershipRow) => void;
  subscriptionUpdateList: (updatedList: ListsRow) => void;
  subscriptionUpdateMembership: (updatedMembership: MembershipRow) => void;
  insertList: (
    name: string,
    color: string,
    icon: string | null
  ) => Promise<{ error: string | null; list_id?: string }>;
  insertFolder: (
    folder_name: string,
    folder_color: string | null
  ) => Promise<void>;
  deleteList: (list_id: string) => Promise<void>;
  deleteFolder: (folder_id: string) => Promise<void>;
  leaveList: (list_id: string) => Promise<void>;
  updateDataList: (
    list_id: string,
    list_name: string,
    color: string,
    icon: string | null
  ) => Promise<{ error: string | null }>;
  updateDataFolder: (
    folder_id: string,
    folder_name: string,
    folder_color: string | null
  ) => Promise<{ error: string | null }>;
  deleteAllLists: () => Promise<void>;
  deleteFolderWithContents: (folder_id: string) => Promise<void>;
  addTask: (
    list_id: string,
    task_content: string,
    target_date: string | null,
    note: boolean
  ) => Promise<{ error: string | null }>;
  addTasks: (
    tasks: {
      list_id: string;
      task_content: string;
      target_date: string | null;
      note: boolean;
    }[]
  ) => Promise<{ error: string | null }>;
  deleteTask: (task_id: string) => Promise<void>;
  updateTaskCompleted: (task_id: string, completed: boolean) => Promise<void>;
  updatePinnedList: (list_id: string, pinned: boolean) => Promise<void>;
  updateIndexList: (
    list_id: string,
    folder_id: string | null,
    rank: string
  ) => Promise<void>;
  updateIndexFolders: (folder_id: string, rank: string) => Promise<void>;
  updateTaskName: (
    task_id: string,
    task_content: string,
    completed: boolean | null,
    target_date: string | null
  ) => Promise<{ error: string | null }>;
  getUsersMembersList: (listId: string) => Promise<UserWithMembershipRole[]>;
  createListInvitation: (
    list_id: string,
    invited_user_id: string
  ) => Promise<void>;
  subscriptionAddTask: (task: TaskType) => void;
  subscriptionUpdateTask: (task: TaskType) => void;
  subscriptionDeleteTask: (task: { task_id: string }) => void;
  getTaskCountByListId: (listId: string) => number;
  setTaskSort: (sort: TaskSortOption) => Promise<void>;
  getListPendingInvitations: (listId: string) => Promise<PendingInvitation[]>;
  cancelListInvitation: (invitationId: string) => Promise<{ error?: string }>;
  updateMemberRole: (
    listId: string,
    targetUserId: string,
    newRole: "admin" | "editor" | "reader"
  ) => Promise<{ error?: string }>,
  removeMember: (listId: string, targetUserId: string) => Promise<{ error?: string }>,
  verifyAndFetchList: (listId: string) => Promise<boolean>,
};

type TaggedAsList = ListsType & { _item_type: "list" };
type TaggedAsFolder = FolderType & { _item_type: "folder" };
type TaggedSidebarItem = TaggedAsList | TaggedAsFolder;

export const useTodoDataStore = create<TodoStore>()((set, get) => ({
  lists: [],
  tasks: [],
  tasksByList: {},
  folders: [],
  initialFetch: false,
  loadingQueue: 0,

  tasksPage: -1,
  hasMoreTasks: true,
  currentListId: null,
  fetchingListsQueue: {},
  listsPagination: {},
  taskSort: "default",

  fetchListsPage: async (folderId) => {
    try {
      const state = get();
      if (state.fetchingListsQueue[folderId]) return;

      const currentPagination = state.listsPagination[folderId] ?? {
        page: -1,
        hasMore: true,
      };

      if (!currentPagination.hasMore) return;

      set((s) => ({
        fetchingListsQueue: { ...s.fetchingListsQueue, [folderId]: true },
      }));

      const newPage = currentPagination.page + 1;

      const { getPaginatedLists } = await import("@/lib/api/list/actions");
      const targetFolderId = folderId === "root" ? null : folderId;
      const { data } = await getPaginatedLists(targetFolderId, newPage, 200);

      if (!data) return;

      const items = data as TaggedSidebarItem[];
      const newLists = items.filter(
        (i): i is TaggedAsList =>
          i._item_type === "list" || !("_item_type" in i)
      ) as ListsType[];
      const newFolders = items.filter(
        (i): i is TaggedAsFolder => i._item_type === "folder"
      ) as FolderType[];

      const hasMoreFetched = data.length >= 200;

      set((s) => {
        const existingListIds = new Set(s.lists.map((l) => l.list_id));
        const filteredNewLists = newLists.filter(
          (l) => !existingListIds.has(l.list_id)
        );

        const existingFolderIds = new Set(s.folders.map((f) => f.folder_id));
        const filteredNewFolders = newFolders.filter(
          (f) => !existingFolderIds.has(f.folder_id)
        );

        return {
          lists: [...s.lists, ...filteredNewLists],
          folders: [...s.folders, ...filteredNewFolders],
          listsPagination: {
            ...s.listsPagination,
            [folderId]: { page: newPage, hasMore: hasMoreFetched },
          },
        };
      });
    } catch (err) {
      handleError(err);
    } finally {
      set((s) => ({
        fetchingListsQueue: { ...s.fetchingListsQueue, [folderId]: false },
      }));
    }
  },

  fetchTasksPage: async (listId, reset = false) => {
    try {
      const state = get();

      if (reset) {
        const savedCache: Record<
          string,
          { tasks: TaskType[]; page: number; hasMore: boolean }
        > = {};

        if (state.currentListId) {
          savedCache[state.currentListId] = {
            tasks: state.tasks,
            page: state.tasksPage,
            hasMore: state.hasMoreTasks,
          };
        }

        const cached = state.tasksByList[listId] ?? savedCache[listId];

        if (cached) {
          set((s) => ({
            tasks: cached.tasks,
            tasksPage: cached.page,
            hasMoreTasks: cached.hasMore,
            currentListId: listId,
            tasksByList: {
              ...s.tasksByList,
              ...(state.currentListId
                ? {
                    [state.currentListId]: {
                      tasks: state.tasks,
                      page: state.tasksPage,
                      hasMore: state.hasMoreTasks,
                    },
                  }
                : {}),
            },
          }));
          if (cached.tasks.length > 0) return;
        } else {
          set((s) => ({
            tasks: [],
            tasksPage: -1,
            hasMoreTasks: true,
            currentListId: listId,
            tasksByList: {
              ...s.tasksByList,
              ...(state.currentListId
                ? {
                    [state.currentListId]: {
                      tasks: state.tasks,
                      page: state.tasksPage,
                      hasMore: state.hasMoreTasks,
                    },
                  }
                : {}),
            },
          }));
        }
      }

      const currentState = get();
      if (!currentState.hasMoreTasks || currentState.loadingQueue > 0) return;

      const newPage = currentState.tasksPage + 1;
      set({ loadingQueue: currentState.loadingQueue + 1 });

      const listIdsToFetch: string[] =
        listId === "home"
          ? currentState.lists.map((l) => l.list_id)
          : [listId];

      const { getPaginatedTasks } = await import("@/lib/api/task/actions");
      const { data } = await getPaginatedTasks(
        listIdsToFetch,
        newPage,
        PAGE_SIZE,
        currentState.taskSort
      );

      const newTasks = reset || currentState.tasksPage === -1
        ? (data ?? [])
        : [...currentState.tasks, ...(data ?? [])];
      const newHasMore = Boolean(data && data.length === PAGE_SIZE);

      set((s) => ({
        tasks: newTasks as TaskType[],
        tasksPage: newPage,
        hasMoreTasks: newHasMore,
        tasksByList: {
          ...s.tasksByList,
          [listId]: {
            tasks: newTasks as TaskType[],
            page: newPage,
            hasMore: newHasMore,
          },
        },
      }));
    } catch (err) {
      handleError(err);
    } finally {
      set((state) => ({ loadingQueue: Math.max(0, state.loadingQueue - 1) }));
    }
  },

  setTaskSort: async (sort) => {
    const { currentListId } = get();
    set({
      taskSort: sort,
      tasksByList: {},
      tasks: [],
      tasksPage: -1,
      hasMoreTasks: true,
    });
    if (currentListId) {
      await get().fetchTasksPage(currentListId, false);
    }
  },

  setLists: async (list) => {
    set(() => ({ lists: list }));
  },

  setFolders: async (folder) => {
    set(() => ({ folders: folder }));
  },

  getLists: async () => {
    if (get().initialFetch) {
      return;
    }

    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));

    try {
      const { data, error } = await getLists();

      if (error) {
        throw new Error(error);
      }

      set(() => ({
        lists: data?.lists ?? [],
        tasks: data?.tasks ?? [],
        folders: data?.folders ?? [],
        listsPagination: {
          root: { page: 0, hasMore: data?.hasMoreRoot ?? false },
        },
        initialFetch: true,
      }));
    } catch (err) {
      handleError(err);
    } finally {
      set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
    }
  },

  getListById: (list_id: string) => {
    return get().lists.find((list) => list.list_id === list_id);
  },

  getTaskCountByListId: (listId: string) => {
    const listMem = get().lists.find((list) => list.list_id === listId);
    if (!listMem) return 0;
    return readTaskCount(listMem, get().tasks);
  },

  subscriptionAddList: async (membership) => {
    const result = await getSingleLists(membership.list_id);

    if (!result?.data) return;

    const newItemForStore: ListsType = {
      ...membership,
      list: result.data as ListsRow,
    };

    set((state) => {
      const listExists = state.lists.some(
        (l) => l.list_id === newItemForStore.list_id
      );
      if (listExists) {
        return {
          lists: state.lists.map((item) =>
            item.list_id === newItemForStore.list_id ? newItemForStore : item
          ),
        };
      } else {
        return {
          lists: [...state.lists, newItemForStore],
        };
      }
    });
  },

  subscriptionDeleteList: async (list) => {
    const user = globalUserStore?.getState().user;

    if (user && user.user_id && list.user_id !== user.user_id) {
      return;
    }

    set((state) => {
      const deletedList = state.lists.find((l) => l.list_id === list.list_id);
      const folderId = deletedList?.folder ?? null;

      const updatedFolders = folderId
        ? state.folders.map((f) => {
            if (f.folder_id !== folderId) return f;
            const currentCount = readFolderMembershipCount(f, state.lists);
            return {
              ...f,
              memberships: makeMembershipCountPayload(
                Math.max(0, currentCount - 1)
              ),
            };
          })
        : state.folders;

      return {
        lists: state.lists.filter((l) => l.list_id !== list.list_id),
        tasks: state.tasks.filter((t) => t.list_id !== list.list_id),
        folders: updatedFolders,
      };
    });
  },

  subscriptionUpdateList: (updatedList) => {
    set((state) => ({
      lists: state.lists.map((currentItem) =>
        currentItem.list.list_id === updatedList.list_id
          ? { ...currentItem, list: { ...currentItem.list, ...updatedList } }
          : currentItem
      ),
    }));
  },

  subscriptionUpdateMembership: (updatedMembership) => {
    set((state) => ({
      lists: state.lists.map((currentItem) =>
        currentItem.list_id === updatedMembership.list_id
          ? { ...currentItem, ...updatedMembership }
          : currentItem
      ),
    }));
  },

  subscriptionAddTask: (task) => {
    set((state) => {
      const taskExists = state.tasks.some((t) => t.task_id === task.task_id);

      let updatedLists = state.lists;
      if (!taskExists) {
        updatedLists = state.lists.map((currentItem) => {
          if (currentItem.list.list_id === task.list_id) {
            const currentCount = readTaskCount(currentItem, state.tasks);
            return {
              ...currentItem,
              list: {
                ...currentItem.list,
                tasks: makeTaskCountPayload(currentCount + 1),
              },
            };
          }
          return currentItem;
        });
      }

      return {
        tasks: [task, ...state.tasks].filter(
          (t, index, self) =>
            index === self.findIndex((tt) => tt.task_id === t.task_id)
        ),
        lists: updatedLists,
      };
    });
  },

  subscriptionUpdateTask: (task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.task_id === task.task_id ? task : t)),
    }));
  },

  subscriptionDeleteTask: (task) => {
    set((state) => {
      const existingTask = state.tasks.find((t) => t.task_id === task.task_id);

      let updatedLists = state.lists;
      if (existingTask) {
        updatedLists = state.lists.map((currentItem) => {
          if (currentItem.list.list_id === existingTask.list_id) {
            const currentCount = readTaskCount(currentItem, state.tasks);
            return {
              ...currentItem,
              list: {
                ...currentItem.list,
                tasks: makeTaskCountPayload(Math.max(0, currentCount - 1)),
              },
            };
          }
          return currentItem;
        });
      }

      return {
        tasks: state.tasks.filter((t) => t.task_id !== task.task_id),
        lists: updatedLists,
      };
    });
  },

  updateIndexList: async (list_id, folder_id, rank) => {
    const originalList = get().lists.find((list) => list.list_id === list_id);
    if (!originalList) return;
    const previousFolder = originalList.folder;
    const previousRank = originalList.rank;

    try {
      set((state) => {
        const newFolders = state.folders.map((f) => {
          let countChange = 0;
          if (f.folder_id === folder_id && previousFolder !== folder_id)
            countChange++;
          if (f.folder_id === previousFolder && previousFolder !== folder_id)
            countChange--;

          if (countChange !== 0) {
            const currentCount = readFolderMembershipCount(f, state.lists);
            return {
              ...f,
              memberships: makeMembershipCountPayload(
                Math.max(0, currentCount + countChange)
              ),
            };
          }
          return f;
        });

        return {
          folders: newFolders,
          lists: state.lists.map((currentItem) =>
            currentItem.list_id === list_id
              ? { ...currentItem, folder: folder_id, rank }
              : currentItem
          ),
        };
      });

      const { error } = await updateIndexList(list_id, folder_id, rank);

      if (error) {
        throw new Error(error);
      }
    } catch (err) {
      set((state) => ({
        lists: state.lists.map((currentItem) =>
          currentItem.list_id === list_id
            ? { ...currentItem, folder: previousFolder, rank: previousRank }
            : currentItem
        ),
      }));
      handleError(err);
    }
  },

  updateIndexFolders: async (folder_id, rank) => {
    const originalFolder = get().folders.find(
      (folder) => folder.folder_id === folder_id
    );
    if (!originalFolder) return;
    const previousRank = originalFolder.rank;

    try {
      set((state) => ({
        folders: state.folders.map((currentItem) =>
          currentItem.folder_id === folder_id
            ? { ...currentItem, rank }
            : currentItem
        ),
      }));

      const { error } = await updateIndexFolder(folder_id, rank);

      if (error) {
        throw new Error(error);
      }
    } catch (err) {
      set((state) => ({
        folders: state.folders.map((currentItem) =>
          currentItem.folder_id === folder_id
            ? { ...currentItem, rank: previousRank }
            : currentItem
        ),
      }));

      handleError(err);
    }
  },

  updatePinnedList: async (list_id: string, pinned: boolean) => {
    const originalList = get().lists.find((list) => list.list_id === list_id);
    if (!originalList) return;
    const previousPinned = originalList.pinned;
    const previousFolder = originalList.folder;
    let errorResult: string | undefined;

    try {
      if (pinned === true) {
        set((state) => {
          let updatedFolders = state.folders;
          if (previousFolder) {
            updatedFolders = state.folders.map((f) => {
              if (f.folder_id === previousFolder) {
                const currentCount = readFolderMembershipCount(f, state.lists);
                return {
                  ...f,
                  memberships: makeMembershipCountPayload(
                    Math.max(0, currentCount - 1)
                  ),
                };
              }
              return f;
            });
          }

          return {
            folders: updatedFolders,
            lists: state.lists.map((currentItem) =>
              currentItem.list_id === list_id
                ? { ...currentItem, pinned, folder: null }
                : currentItem
            ),
          };
        });
        const result = await updatePinnedList(list_id, pinned, null);
        errorResult = result?.error;
      } else {
        const lists = get().lists;
        const folders = get().folders;
        const index = calculateNewIndex(lists, folders);
        set((state) => ({
          lists: state.lists.map((currentItem) =>
            currentItem.list_id === list_id
              ? { ...currentItem, pinned, index }
              : currentItem
          ),
        }));
        const result = await updatePinnedList(list_id, pinned, index);
        errorResult = result?.error;
      }

      if (errorResult) {
        throw new Error(errorResult);
      }
    } catch (err) {
      set((state) => ({
        lists: state.lists.map((currentItem) =>
          currentItem.list_id === list_id
            ? { ...currentItem, pinned: previousPinned, folder: previousFolder }
            : currentItem
        ),
      }));
      handleError(err);
    }
  },

  insertList: async (name, color, icon) => {
    const user = globalUserStore?.getState().user;
    const user_id = user?.user_id ?? "";

    const optimisticId = uuidv4();
    const lists = get().lists;
    const folders = get().folders;

    const index = calculateNewIndex(lists, folders);
    const rank = calculateNewRank(lists, folders);
    const now = new Date().toISOString();

    const optimistic: ListsType = {
      folder: null,
      index,
      list_id: optimisticId,
      pinned: false,
      rank: rank,
      role: "owner",
      shared_by: null,
      shared_since: now,
      updated_at: null,
      user_id,
      list: {
        color: color ?? "#87189d",
        created_at: now,
        description: null,
        icon: icon ?? null,
        list_id: optimisticId,
        list_name: name,
        owner_id: user_id,
        updated_at: null,
        is_shared: false,
        non_owner_count: 0,
      },
    };

    try {
      set((state) => ({ lists: [...state.lists, optimistic] }));

      const { error } = await insertList(
        optimisticId,
        name,
        color,
        icon,
        rank,
        index
      );

      if (error) {
        throw new Error(error || "No se recibieron datos del servidor.");
      }
      return { error: null, list_id: optimisticId };
    } catch (err) {
      set((state) => ({
        lists: state.lists.filter((l) => l.list_id !== optimisticId),
      }));

      handleError(err);
      return { error: (err as Error).message };
    }
  },

  insertFolder: async (folder_name, folder_color) => {
    const user = globalUserStore?.getState().user;
    const user_id = user?.user_id ?? "";

    const optimisticId = uuidv4();
    const lists = get().lists;
    const folders = get().folders;

    const index = calculateNewIndex(lists, folders);
    const rank = calculateNewRank(lists, folders);
    const now = new Date().toISOString();

    const optimistic: FolderType = {
      folder_id: optimisticId,
      folder_name,
      folder_color,
      folder_description: null,
      index,
      rank,
      user_id,
      updated_at: null,
      created_at: now,
    };

    try {
      set((state) => ({ folders: [...state.folders, optimistic] }));

      const { error } = await insertFolder(
        optimisticId,
        folder_name,
        folder_color,
        index,
        rank
      );

      if (error) {
        throw new Error(error || "No se recibieron datos del servidor.");
      }
    } catch (err) {
      set((state) => ({
        folders: state.folders.filter((f) => f.folder_id !== optimisticId),
      }));

      handleError(err);
    }
  },

  deleteList: async (list_id) => {
    const state = get();
    const deletedList = state.lists.find((l) => l.list_id === list_id);
    const folderId = deletedList?.folder ?? null;

    const prevLists = state.lists.slice();
    const prevTasks = state.tasks.slice();
    const prevFolders = state.folders.slice();

    set((s) => {
      const updatedFolders = folderId
        ? s.folders.map((f) => {
            if (f.folder_id !== folderId) return f;
            const currentCount = readFolderMembershipCount(f, s.lists);
            return {
              ...f,
              memberships: makeMembershipCountPayload(
                Math.max(0, currentCount - 1)
              ),
            };
          })
        : s.folders;

      return {
        lists: s.lists.filter((l) => l.list_id !== list_id),
        tasks: s.tasks.filter((t) => t.list_id !== list_id),
        folders: updatedFolders,
      };
    });

    const result = await deleteList(list_id);

    if (result?.error) {
      handleError(result.error);
      set({ lists: prevLists, tasks: prevTasks, folders: prevFolders });
      return;
    }
  },

  deleteFolder: async (folder_id) => {
    const prevFolders = get().folders.slice();
    const prevLists = get().lists.slice();

    set((state) => ({
      folders: state.folders.filter((f) => f.folder_id !== folder_id),
      lists: state.lists.map((l) =>
        l.folder === folder_id ? { ...l, folder: null } : l
      ),
    }));

    const result = await deleteFolder(folder_id);

    if (result?.error) {
      handleError(result.error);
      set({ folders: prevFolders, lists: prevLists });
      return;
    }
  },

  deleteFolderWithContents: async (folder_id) => {
    const state = get();
    const listIdsInFolder = state.lists
      .filter((l) => l.folder === folder_id)
      .map((l) => l.list_id);

    const prevFolders = state.folders.slice();
    const prevLists = state.lists.slice();
    const prevTasks = state.tasks.slice();

    set((s) => ({
      folders: s.folders.filter((f) => f.folder_id !== folder_id),
      lists: s.lists.filter((l) => l.folder !== folder_id),
      tasks: s.tasks.filter((t) => !listIdsInFolder.includes(t.list_id)),
    }));

    const result = await deleteFolderWithContents(folder_id, listIdsInFolder);

    if (result?.error) {
      handleError(result.error);
      set({ folders: prevFolders, lists: prevLists, tasks: prevTasks });
      return;
    }
  },

  leaveList: async (list_id) => {
    const state = get();
    const leavingList = state.lists.find((l) => l.list_id === list_id);
    const folderId = leavingList?.folder ?? null;

    const prevLists = state.lists.slice();
    const prevTasks = state.tasks.slice();
    const prevFolders = state.folders.slice();

    set((s) => {
      const updatedFolders = folderId
        ? s.folders.map((f) => {
            if (f.folder_id !== folderId) return f;
            const currentCount = readFolderMembershipCount(f, s.lists);
            return {
              ...f,
              memberships: makeMembershipCountPayload(
                Math.max(0, currentCount - 1)
              ),
            };
          })
        : s.folders;

      return {
        lists: s.lists.filter((l) => l.list_id !== list_id),
        tasks: s.tasks.filter((t) => t.list_id !== list_id),
        folders: updatedFolders,
      };
    });

    const result = await leaveList(list_id);

    if (result?.error) {
      handleError(result.error);
      set({ lists: prevLists, tasks: prevTasks, folders: prevFolders });
      return;
    }
  },

  updateDataList: async (list_id, list_name, color, icon) => {
    const prevLists = get().lists.slice();

    set((state) => ({
      lists: state.lists.map((list) =>
        list.list_id === list_id
          ? {
              ...list,
              list: {
                ...list.list,
                list_name,
                color,
                icon,
              },
            }
          : list
      ),
    }));

    const result = await updateDataList(list_id, list_name, color, icon);

    if (result?.error) {
      handleError(result.error);
      set({ lists: prevLists });
      return { error: result.error };
    }

    return { error: null };
  },

  updateDataFolder: async (folder_id, folder_name, folder_color) => {
    const prevFolders = get().folders.slice();

    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.folder_id === folder_id
          ? {
              ...folder,
              folder_name,
              folder_color,
            }
          : folder
      ),
    }));

    const result = await updateDataFolder(folder_id, folder_name, folder_color);

    if (result?.error) {
      handleError(result.error);
      set({ folders: prevFolders });
      return { error: result.error };
    }

    return { error: null };
  },

  deleteAllLists: async () => {
    const { error } = await deleteAllLists();

    if (error) {
      handleError(error);
      return;
    }

    set({ lists: [], tasks: [] });
  },

  // TASKS

  addTask: async (list_id, task_content, target_date, note) => {
    const optimisticId = uuidv4();

    const user = globalUserStore?.getState().user;

    if (!user) {
      const errorMsg =
        "No se puede crear la tarea: el usuario no está autenticado.";
      return { error: errorMsg };
    }

    const createdBy: UserProfile = {
      user_id: user.user_id,
      display_name: user.display_name,
      username: user.username,
      avatar_url: user.avatar_url,
    };

    const optimisticTask: TaskType = {
      task_id: optimisticId,
      task_content,
      list_id,
      target_date,
      completed: note ? null : false,
      index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: createdBy,
      description: "",
    };

    const prevTasks = get().tasks.slice();
    const prevLists = get().lists.slice();

    set((state) => {
      const updatedLists = state.lists.map((currentItem) => {
        if (currentItem.list.list_id === list_id) {
          const currentCount = readTaskCount(currentItem, state.tasks);
          return {
            ...currentItem,
            list: {
              ...currentItem.list,
              tasks: makeTaskCountPayload(currentCount + 1),
            },
          };
        }
        return currentItem;
      });

      return {
        tasks: [optimisticTask, ...state.tasks],
        lists: updatedLists,
      };
    });

    const { data, error } = await insertTask(
      list_id,
      task_content,
      optimisticId,
      target_date,
      note
    );

    if (error) {
      handleError(error);
      set({ tasks: prevTasks, lists: prevLists });
      return { error };
    }

    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.task_id === optimisticId && data) {
          const { created_by: _discarded, ...restData } = data;
          return { ...t, ...restData, created_by: t.created_by };
        }
        return t;
      }),
    }));

    return { error: null };
  },

  addTasks: async (tasksData) => {
    const user = globalUserStore?.getState().user;

    if (!user) {
      const errorMsg =
        "No se puede crear las tareas: el usuario no está autenticado.";
      return { error: errorMsg };
    }

    const now = new Date().toISOString();
    const createdBy: UserProfile = {
      user_id: user.user_id,
      display_name: user.display_name,
      username: user.username,
      avatar_url: user.avatar_url,
    };

    const optimisticTasks: TaskType[] = tasksData.map((t) => ({
      task_id: uuidv4(),
      task_content: t.task_content,
      list_id: t.list_id,
      target_date: t.target_date,
      completed: t.note ? null : false,
      index: 0,
      created_at: now,
      updated_at: now,
      created_by: createdBy,
      description: "",
    }));

    const prevTasks = get().tasks.slice();

    set((state) => ({
      tasks: [...optimisticTasks, ...state.tasks],
    }));

    const { data, error } = await insertTasks(
      optimisticTasks.map((t) => ({
        task_id: t.task_id,
        list_id: t.list_id,
        task_content: t.task_content,
        target_date: t.target_date,
        completed: t.completed,
      }))
    );

    if (error) {
      handleError(error);
      set({ tasks: prevTasks });
      return { error };
    }

    set((state) => ({
      tasks: state.tasks.map((t) => {
        const found = data?.find((d) => d.task_id === t.task_id);
        if (found) {
          const { created_by: _discarded, ...restData } = found;
          return { ...t, ...restData, created_by: t.created_by };
        }
        return t;
      }),
    }));

    return { error: null };
  },

  deleteTask: async (task_id) => {
    const originalTask = get().tasks.find((t) => t.task_id === task_id);
    const prevTasks = get().tasks.slice();
    const prevLists = get().lists.slice();

    set((state) => {
      let updatedLists = state.lists;
      if (originalTask) {
        updatedLists = state.lists.map((currentItem) => {
          if (currentItem.list.list_id === originalTask.list_id) {
            const currentCount = readTaskCount(currentItem, state.tasks);
            return {
              ...currentItem,
              list: {
                ...currentItem.list,
                tasks: makeTaskCountPayload(Math.max(0, currentCount - 1)),
              },
            };
          }
          return currentItem;
        });
      }

      return {
        tasks: state.tasks.filter((task) => task.task_id !== task_id),
        lists: updatedLists,
      };
    });

    const result = await deleteTask(task_id);

    if (result?.error) {
      handleError(result.error);
      set({ tasks: prevTasks, lists: prevLists });
      return;
    }
  },

  updateTaskCompleted: async (task_id, completed) => {
    const prevTasks = get().tasks.slice();

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.task_id === task_id ? { ...task, completed } : task
      ),
    }));

    const { error } = await updateCompletedTask(task_id, completed);

    if (error) {
      handleError(error);
      set({ tasks: prevTasks });
      return;
    }
  },

  updateTaskName: async (task_id, task_content, completed, target_date) => {
    const prevTasks = get().tasks.slice();

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.task_id === task_id
          ? { ...task, task_content, completed, target_date }
          : task
      ),
    }));

    const { error } = await updateNameTask(
      task_id,
      task_content,
      completed,
      target_date
    );

    if (error) {
      handleError(error);
      set({ tasks: prevTasks });
      return { error };
    }

    return { error: null };
  },

  getUsersMembersList: async (listId: string) => {
    try {
      const res = await getUsersMembersList(listId);
      if (res.data) {
        return res.data;
      }
    } catch (err) {
      handleError(err);
    }
    return [];
  },

  createListInvitation: async (
    list_id: string,
    invited_user_username: string
  ) => {
    try {
      const { error } = await createListInvitation(
        list_id,
        invited_user_username
      );
      if (error) {
        throw new Error(error);
      }
      toast.success(`${invited_user_username} fue invitado correctamente.`);
    } catch (err) {
      handleError(err);
    }
  },

  getListPendingInvitations: async (listId: string) => {
    try {
      const res = await getListPendingInvitations(listId);
      console.log('DATOS QUE DEVUELVE LA BD: ', res.data)
      if (res.data) return res.data;
    } catch (err) {
      handleError(err);
    }
    return [];
  },
 
  cancelListInvitation: async (invitationId: string) => {
    try {
      const { error } = await cancelListInvitation(invitationId);
      if (error) throw new Error(error);
      toast.success("Invitación cancelada.");
      return {};
    } catch (err) {
      handleError(err);
      return { error: (err as Error).message };
    }
  },
 
  updateMemberRole: async (
    listId: string,
    targetUserId: string,
    newRole: "admin" | "editor" | "reader"
  ) => {
    try {
      const { error } = await updateListMemberRole(listId, targetUserId, newRole);
      if (error) throw new Error(error);
      toast.success("Rol actualizado correctamente.");
      return {};
    } catch (err) {
      handleError(err);
      return { error: (err as Error).message };
    }
  },
 
  removeMember: async (listId: string, targetUserId: string) => {
    try {
      const { error } = await removeListMember(listId, targetUserId);
      if (error) throw new Error(error);
      toast.success("Miembro eliminado de la lista.");
      return {};
    } catch (err) {
      handleError(err);
      return { error: (err as Error).message };
    }
  },

  verifyAndFetchList: async (listId: string) => {
    const state = get();
    if (state.lists.some((l) => l.list_id === listId)) {
      return true;
    }

    try {
      const { getSingleListsAsMembership } = await import(
        "@/lib/api/list/actions"
      );
      const result = await getSingleListsAsMembership(listId);

      if (result?.data) {
        set((s) => ({
          lists: [...s.lists, result.data as ListsType],
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error verifying list:", err);
      return false;
    }
  },
}));
