"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

import { createClient } from "@/utils/supabase/client";
import { useUserDataStore } from "./useUserDataStore";

import {
  getLists,
  insertList,
  deleteList,
  deleteFolder,
  leaveList,
  insertTask,
  deleteTask,
  updateDataList,
  updateCompletedTask,
  updatePinnedList,
  updateIndexList,
  updateNameTask,
  deleteAllLists,
  getUsersMembersList,
  createListInvitation,
  getSingleLists,
  insertFolder,
  updateIndexFolder,
} from "@/lib/api/actions";

import {
  ListsType,
  ListsRow,
  MembershipRow,
  TaskType,
  UserWithMembershipRole,
  FolderType,
} from "@/lib/schemas/todo-schema";

const POS_INDEX = 16384;

type TodoStore = {
  lists: ListsType[];
  tasks: TaskType[];
  folders: FolderType[];
  loadingQueue: number;
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
  ) => Promise<void>;
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
  deleteAllLists: () => Promise<void>;
  addTask: (
    list_id: string,
    task_content: string,
    target_date: string | null,
    note: boolean
  ) => Promise<{ error: string | null }>;
  deleteTask: (task_id: string) => Promise<void>;
  updateTaskCompleted: (task_id: string, completed: boolean) => Promise<void>;
  updatePinnedList: (list_id: string, pinned: boolean) => Promise<void>;
  updateIndexList: (
    list_id: string,
    index: number,
    folder_id: string | null
  ) => Promise<void>;
  updateIndexFolders: (folder_id: string, index: number) => Promise<void>;
  updateTaskName: (
    task_id: string,
    task_content: string,
    completed: boolean | null
  ) => Promise<{ error: string | null }>;
  getUsersMembersList: (listId: string) => Promise<UserWithMembershipRole[]>;
  createListInvitation: (
    list_id: string,
    invited_user_id: string
  ) => Promise<void>;
  getTaskCountByListId: (listId: string) => number;
};

const calculateNewIndex = (
  a: ListsType[] | FolderType[],
  b: ListsType[] | FolderType[]
) => {
  // extraemos índices, forzando a number (fallback 0)
  const idxA = a
    ? a.length > 0
      ? Math.max(...a.map((x) => x.index ?? 0))
      : 0
    : 0;
  const idxB = b
    ? b.length > 0
      ? Math.max(...b.map((x) => x.index ?? 0))
      : 0
    : 0;

  const maxIdx = Math.max(idxA, idxB);

  return maxIdx <= 0 ? POS_INDEX : maxIdx + POS_INDEX;
};

function handleError(err: unknown) {
  toast.error((err as Error).message || "Error desconocido");
}

async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  return session.user.id;
}

export const useTodoDataStore = create<TodoStore>()((set, get) => ({
  lists: [],
  tasks: [],
  folders: [],
  loadingQueue: 0,

  setLists: async (list) => {
    set(() => ({ lists: list }));
  },

  setFolders: async (folder) => {
    set(() => ({ folders: folder }));
  },

  getLists: async () => {
    set((state) => ({ ...state, loadingQueue: state.loadingQueue + 1 }));

    try {
      const { data, error } = await getLists();

      if (error) {
        throw new Error(error);
      }

      set(() => ({
        lists: data?.lists,
        tasks: data?.tasks,
        folders: data?.folders,
      }));
    } catch (err) {
      handleError(err);
    } finally {
      set((state) => ({ ...state, loadingQueue: state.loadingQueue - 1 }));
    }
  },

  getListById: (list_id: string) => {
    return get().lists.find((list) => list.list_id === list_id);
  },

  getTaskCountByListId: (listId: string) => {
    return get().tasks.filter((task) => task.list_id === listId).length;
  },

  subscriptionAddList: async (membership) => {
    const list = await getSingleLists(membership.list_id);

    if (!list) return;

    const newItemForStore: ListsType = {
      ...membership,
      list: list.data,
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
    const { user } = useUserDataStore.getState();

    if (user && user.user_id && list.user_id !== user.user_id) {
      return;
    }

    set((state) => ({
      lists: state.lists.filter((l) => l.list_id !== list.list_id),
      tasks: state.tasks.filter((t) => t.list_id !== list.list_id),
    }));
  },

  subscriptionUpdateList: (updatedList) => {
    set((state) => ({
      lists: state.lists.map((currentItem) =>
        currentItem.list.list_id === updatedList.list_id
          ? { ...currentItem, list: updatedList }
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

  updateIndexList: async (list_id, index, folder_id) => {
    const originalList = get().lists.find((list) => list.list_id === list_id);
    if (!originalList) return;
    const previousIndex = originalList.index;
    const previousFolder = originalList.folder;

    try {
      set((state) => ({
        lists: state.lists.map((currentItem) =>
          currentItem.list_id === list_id
            ? { ...currentItem, index, folder_id }
            : currentItem
        ),
      }));

      const { error } = await updateIndexList(list_id, index, folder_id);

      if (error) {
        throw new Error(error);
      }
    } catch (err) {
      set((state) => ({
        lists: state.lists.map((currentItem) =>
          currentItem.list_id === list_id
            ? { ...currentItem, index: previousIndex, folder: previousFolder }
            : currentItem
        ),
      }));

      handleError(err);
    }
  },

  updateIndexFolders: async (folder_id, index) => {
    const originalFolders = get().folders.find(
      (folder) => folder.folder_id === folder_id
    );
    if (!originalFolders) return;
    const previousIndex = originalFolders.index;

    try {
      set((state) => ({
        folders: state.folders.map((currentItem) =>
          currentItem.folder_id === folder_id
            ? { ...currentItem, index }
            : currentItem
        ),
      }));

      const { error } = await updateIndexFolder(folder_id, index);

      if (error) {
        throw new Error(error);
      }
    } catch (err) {
      set((state) => ({
        folders: state.folders.map((currentItem) =>
          currentItem.folder_id === folder_id
            ? { ...currentItem, index: previousIndex }
            : currentItem
        ),
      }));

      handleError(err);
    }
  },

  updatePinnedList: async (list_id: string, pinned: boolean) => {
    const originalList = get().lists.find((list) => list.list_id === list_id);
    if (!originalList) return;
    const previousIndex = originalList.pinned;

    try {
      set((state) => ({
        lists: state.lists.map((currentItem) =>
          currentItem.list_id === list_id
            ? { ...currentItem, pinned }
            : currentItem
        ),
      }));

      const { error } = await updatePinnedList(list_id, pinned);

      if (error) {
        throw new Error(error);
      }
    } catch (err) {
      set((state) => ({
        lists: state.lists.map((currentItem) =>
          currentItem.list_id === list_id
            ? { ...currentItem, pinned: previousIndex }
            : currentItem
        ),
      }));
      handleError(err);
    }
  },

  insertList: async (name, color, icon) => {
    const user_id = await getCurrentUserId();

    const optimisticId = uuidv4();
    const lists = get().lists;
    const folders = get().folders;

    const index = calculateNewIndex(lists, folders);
    const now = new Date().toISOString();

    console.log(index);

    const optimistic: ListsType = {
      folder: null,
      index,
      list_id: optimisticId,
      pinned: false,
      role: "owner",
      shared_by: null,
      shared_since: now,
      user_id: user_id || "",
      list: {
        color,
        created_at: now,
        description: null,
        icon: icon ?? null,
        list_id: optimisticId,
        list_name: name,
        owner_id: user_id || "",
        updated_at: null,
        is_shared: false,
        non_owner_count: 0,
      },
    };
    try {
      set((state) => ({ lists: [...state.lists, optimistic] }));

      const { error } = await insertList(optimisticId, name, color, icon);

      if (error) {
        throw new Error(error || "No se recibieron datos del servidor.");
      }
    } catch (err) {
      set((state) => ({
        lists: state.lists.filter((l) => l.list_id !== optimisticId),
      }));

      handleError(err);
    }
  },

  insertFolder: async (folder_name, folder_color) => {
    const user_id = await getCurrentUserId();

    const optimisticId = uuidv4();
    const lists = get().lists;
    const folders = get().folders;

    const index = calculateNewIndex(lists, folders);
    const now = new Date().toISOString();

    const optimistic: FolderType = {
      folder_id: optimisticId,
      folder_name,
      folder_color,
      folder_description: null,
      user_id: user_id || "",
      updated_at: null,
      created_at: now,
      index,
    };
    try {
      set((state) => ({ folders: [...state.folders, optimistic] }));

      const { error } = await insertFolder(
        optimisticId,
        folder_name,
        folder_color,
        index
      );

      if (error) {
        throw new Error(error || "No se recibieron datos del servidor.");
      }
    } catch (err) {
      set((state) => ({
        lists: state.lists.filter((l) => l.list_id !== optimisticId),
      }));

      handleError(err);
    }
  },

  deleteList: async (list_id) => {
    const prevLists = get().lists.slice();
    const prevTasks = get().tasks.slice();

    set((state) => ({
      lists: state.lists.filter((l) => l.list_id !== list_id),
      tasks: state.tasks.filter((t) => t.list_id !== list_id),
    }));

    const result = await deleteList(list_id);

    if (result?.error) {
      handleError(result.error);
      set({ lists: prevLists, tasks: prevTasks });
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

  leaveList: async (list_id) => {
    const prevLists = get().lists.slice();
    const prevTasks = get().tasks.slice();

    set((state) => ({
      lists: state.lists.filter((l) => l.list_id !== list_id),
      tasks: state.tasks.filter((t) => t.list_id !== list_id),
    }));

    const result = await leaveList(list_id);

    if (result?.error) {
      handleError(result.error);
      set({ lists: prevLists, tasks: prevTasks });
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
                list_name: list_name,
                color: color,
                icon: icon,
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

  deleteAllLists: async () => {
    const { error } = await deleteAllLists();

    if (error) {
      handleError(error);
      return;
    }

    set({ lists: [], tasks: [] });
  },

  //TASKS ACTIONS
  addTask: async (list_id, task_content, target_date, note) => {
    const optimisticId = uuidv4();

    const { user } = useUserDataStore.getState();

    if (!user) {
      const errorMsg =
        "No se puede crear la tarea: el usuario no está autenticado.";
      return { error: errorMsg };
    }

    const optimisticTask = {
      task_id: optimisticId,
      task_content,
      list_id,
      target_date,
      completed: note ? null : false,
      index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: {
        user_id: user.user_id,
        display_name: user.display_name,
        username: user.username,
        avatar_url: user.avatar_url,
      },
      description: "",
    };

    const prevTasks = get().tasks.slice();

    set((state) => ({
      tasks: [optimisticTask, ...state.tasks],
    }));

    const { data, error } = await insertTask(
      list_id,
      task_content,
      optimisticId,
      target_date,
      note
    );

    if (error) {
      handleError(error);
      set({ tasks: prevTasks });
      return { error };
    }

    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.task_id === optimisticId) {
          const { created_by, ...restData } = data;
          return { ...t, ...restData, created_by: t.created_by };
        }
        return t;
      }),
    }));

    return { error: null };
  },

  // //ACCIONES DE TAREAS

  deleteTask: async (task_id) => {
    const prevTasks = get().tasks.slice();

    set((state) => ({
      tasks: state.tasks.filter((t) => t.task_id !== task_id),
    }));

    const { error } = await deleteTask(task_id);

    if (error) {
      handleError(error);
      set({ tasks: prevTasks });
      return;
    }
  },

  updateTaskCompleted: async (task_id, completed) => {
    const prevTasks = get().tasks.slice();

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.task_id === task_id ? { ...task, completed: completed } : task
      ),
    }));

    const { error } = await updateCompletedTask(task_id, completed);

    if (error) {
      handleError(error);
      set({ tasks: prevTasks });
      return;
    }
  },

  updateTaskName: async (task_id, task_content, completed) => {
    const prevTasks = get().tasks.slice();

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.task_id === task_id
          ? { ...task, task_content: task_content, completed: completed }
          : task
      ),
    }));

    const { error } = await updateNameTask(task_id, task_content, completed);

    if (error) {
      handleError(error);
      set({ tasks: prevTasks });
      return { error: error };
    }

    return { error: null };
  },

  getUsersMembersList: async (listId: string) => {
    try {
      const res = await getUsersMembersList(listId);
      if (res.data) {
        return res.data;
      } else {
        console.error("Error fetching members:", res.error);
      }
    } catch (err) {
      handleError(err);
    }
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
}));
