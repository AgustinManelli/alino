"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { produce } from "immer";
import { toast } from "sonner";

import {
  getLists,
  insertList,
  deleteList,
  insertTask,
  deleteTask,
  updateDataList,
  updateCompletedTask,
  updatePinnedList,
  updateIndexList,
  updateAllIndexLists,
  deleteAllLists,
  deleteAllTasks,
} from "@/lib/todo/actions";
import { Database } from "@/lib/schemas/todo-schema";

import { ListSchema, TaskSchema } from "@/lib/schemas/validationSchemas";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];
type TaskType = Database["public"]["Tables"]["tasks"]["Row"];

const POS_INDEX = 16384;
const UNKNOWN_ERROR_MESSAGE = "An unknown error occurred.";

type TodoStore = {
  lists: ListsType[];
  tasks: TaskType[];
  loadingQueue: number;
  setLists: (list: ListsType[]) => Promise<void>;
  getLists: () => Promise<void>;
  insertList: (
    color: string,
    name: string,
    shortcodeemoji: string
  ) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  updateDataList: (
    id: string,
    newName: string,
    color: string,
    emoji: string | null
  ) => Promise<{ error: string | null }>;
  deleteAllLists: () => Promise<void>;
  addTask: (category_id: string, task: string) => Promise<void>;
  deleteTask: (id: string, category_id: string) => Promise<void>;
  updateTaskCompleted: (
    id: string,
    category_id: string,
    completed: boolean
  ) => Promise<void>;
  updatePinnedList: (id: string, pinned: boolean) => Promise<void>;
  updateIndexList: (id: string, index: number) => Promise<void>;
  deleteAllTasks: () => Promise<void>;
};

const createCRUDHandler = <T>(schema?: z.ZodSchema<T>) => ({
  interact: async (
    payload: unknown,
    actions: {
      optimisticUpdate: (draft: TodoStore) => void;
      apiCall: (validated: T) => Promise<void>;
      rollback: () => void;
    },
    set: (fn: (state: TodoStore) => Partial<TodoStore>) => void
  ) => {
    try {
      set((state) => ({ ...state, loadingQueue: state.loadingQueue + 1 }));

      set(produce(actions.optimisticUpdate));

      const validated = schema ? schema.parse(payload) : (payload as T);

      await actions.apiCall(validated);
    } catch (error) {
      handleError(error, () => {
        actions.rollback();
      });
    } finally {
      set((state) => ({ ...state, loadingQueue: state.loadingQueue - 1 }));
    }
  },
});

const handleError = (error: unknown, revert?: () => void) => {
  let errorMessage = UNKNOWN_ERROR_MESSAGE;

  if (error instanceof z.ZodError) {
    errorMessage = `${error.errors.map((e) => e.message).join(". ")}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  toast.error(errorMessage);
  revert?.();

  if (errorMessage.includes("User is not logged in or authentication failed")) {
    setTimeout(() => {
      window.location.href = "/sign-in";
    }, 1000);
  }

  return errorMessage;
};

const calculateNewIndex = (lists: ListsType[]) =>
  lists.length > 0
    ? Math.max(...lists.map((l) => l.index ?? 0)) + POS_INDEX
    : POS_INDEX;

export const useTodoDataStore = create<TodoStore>()((set, get) => ({
  lists: [],
  tasks: [],
  loadingQueue: 0,

  setLists: async (list) => {
    set(() => ({ lists: list }));
  },

  getLists: async () => {
    await createCRUDHandler().interact(
      null,
      {
        optimisticUpdate: () => {},
        apiCall: async () => {
          const { data, error } = await getLists();
          if (error) throw new Error(error);

          set({
            lists: data?.map((list: ListsType) => ({
              ...list,
              tasks: (list.tasks || []).sort(
                (a, b) => (b.index ?? 0) - (a.index ?? 0)
              ),
            })),
          });
        },
        rollback: () => {},
      },
      set
    );
  },

  // Operaciones CRUD para listas
  insertList: async (color, name, shortcodeemoji) => {
    const { lists } = get();
    const id = uuidv4();
    const newIndex = calculateNewIndex(lists);
    console.error(shortcodeemoji);

    await createCRUDHandler(
      ListSchema.pick({
        index: true,
        color: true,
        name: true,
        shortcodeemoji: true,
        id: true,
      })
    ).interact(
      { index: newIndex, color, name, shortcodeemoji, id },
      {
        optimisticUpdate: (draft) => {
          draft.lists.push({
            color,
            icon: shortcodeemoji,
            id,
            index: newIndex,
            created_at: new Date().toISOString(),
            name,
            pinned: false,
            tasks: [],
            updated_at: new Date().toISOString(),
            user_id: "",
          });
        },
        apiCall: async (validated) => {
          const { data, error } = await insertList(
            validated.index,
            validated.color,
            validated.name,
            validated.shortcodeemoji,
            validated.id
          );
          if (error) {
            throw new Error(error);
          }
          set((state) => ({
            lists: state.lists.map((list) =>
              list.id === id ? { ...list, ...data } : list
            ),
          }));
        },
        rollback: () => set({ lists: lists.filter((list) => list.id !== id) }),
      },
      set
    );
  },

  deleteList: async (id) => {
    const listIndex = get().lists.findIndex((l) => l.id === id);
    const listToRestore = structuredClone(get().lists[listIndex]);

    const revert = () => {
      set((state) => ({
        lists: [
          ...state.lists.slice(0, listIndex),
          listToRestore,
          ...state.lists.slice(listIndex),
        ],
      }));
    };

    await createCRUDHandler(ListSchema.pick({ id: true })).interact(
      { id },
      {
        optimisticUpdate: (draft) => {
          draft.lists = draft.lists.filter((l) => l.id !== id);
        },
        apiCall: async (validated) => {
          const result = await deleteList(validated.id);
          if (result?.error) throw new Error(result.error);
        },
        rollback: revert,
      },
      set
    );
  },

  updateDataList: async (id, name, color, shortcodeemoji) => {
    let errorResult: string | null = null;

    const listIndex = get().lists.findIndex((list) => list.id === id);
    const originalList = structuredClone(get().lists[listIndex]);

    const revert = () => {
      set((state) => ({
        lists: state.lists.map((list) =>
          list.id === id ? { ...list, ...originalList } : list
        ),
      }));
    };

    await createCRUDHandler(
      ListSchema.pick({
        id: true,
        name: true,
        color: true,
        shortcodeemoji: true,
      })
    )
      .interact(
        { id, name: name, color, shortcodeemoji },
        {
          optimisticUpdate: (draft) => {
            draft.lists = draft.lists.map((list) =>
              list.id === id
                ? {
                    ...list,
                    name: name,
                    color,
                    icon: shortcodeemoji,
                  }
                : list
            );
          },
          apiCall: async (validated) => {
            const { error } = await updateDataList(
              validated.id,
              validated.name,
              validated.color,
              validated.shortcodeemoji
            );
            if (error) throw new Error(error);
          },
          rollback: revert,
        },
        set
      )
      .catch((error) => {
        errorResult = error;
      });
    return { error: errorResult };
  },

  updatePinnedList: async (id, pinned) => {
    const listIndex = get().lists.findIndex((list) => list.id === id);
    const originalList = structuredClone(get().lists[listIndex]);

    const revert = () => {
      set((state) => ({
        lists: state.lists.map((list) =>
          list.id === id ? { ...list, ...originalList } : list
        ),
      }));
    };

    await createCRUDHandler(
      ListSchema.pick({ id: true, pinned: true })
    ).interact(
      { id, pinned },
      {
        optimisticUpdate: (draft) => {
          draft.lists = draft.lists
            .map((list) =>
              list.id === id ? { ...list, pinned: pinned } : list
            )
            .sort((a, b) => {
              const aIndex = a.index ?? Number.MAX_SAFE_INTEGER;
              const bIndex = b.index ?? Number.MAX_SAFE_INTEGER;
              return aIndex - bIndex;
            });
        },
        apiCall: async (validated) => {
          const { error } = await updatePinnedList(
            validated.id,
            validated.pinned
          );
          if (error) throw new Error(error);
        },
        rollback: revert,
      },
      set
    );
  },

  updateIndexList: async (id, index) => {
    const originalIndex =
      get().lists.find((list) => list.id === id)?.index ?? null;

    const revert = () => {
      set((state) => ({
        lists: state.lists.map((list) =>
          list.id === id ? { ...list, index: originalIndex } : list
        ),
      }));
    };

    await createCRUDHandler(
      ListSchema.pick({ id: true, index: true })
    ).interact(
      { id, index },
      {
        optimisticUpdate: (draft) => {
          draft.lists = draft.lists.map((list, idx) =>
            list.id === id
              ? {
                  ...list,
                  index: !Number.isInteger(index)
                    ? POS_INDEX * (idx + 1)
                    : index,
                }
              : list
          );
        },
        apiCall: async (validated) => {
          if (!Number.isInteger(index)) {
            const result = await updateAllIndexLists();
            if (result.error) {
              throw new Error(result.error);
            }
          } else {
            const { error } = await updateIndexList(
              validated.id,
              validated.index
            );
            if (error) throw new Error(error);
          }
        },
        rollback: revert,
      },
      set
    );
  },

  deleteAllLists: async () => {
    // const originalLists = get().lists;

    await createCRUDHandler(z.void()).interact(
      undefined,
      {
        optimisticUpdate: (draft) => {
          draft.lists = [];
        },
        apiCall: async () => {
          const { error } = await deleteAllLists();
          if (error) throw new Error(error);
        },
        rollback: () => {},
        //set({ lists: originalLists }),
      },
      set
    );
  },

  //ACCIONES DE TAREAS

  addTask: async (category_id, task) => {
    const id = uuidv4();

    const revert = () => {
      set(
        produce((draft: TodoStore) => {
          const targetList = draft.lists.find(
            (list: ListsType) => list.id === category_id
          );
          if (!targetList || !targetList.tasks) return;

          // Filtrar la tarea temporal
          targetList.tasks = targetList.tasks.filter((task) => task.id !== id);
        })
      );
    };

    await createCRUDHandler(
      TaskSchema.pick({ id: true, category_id: true, name: true })
    ).interact(
      { id, category_id, name: task },
      {
        optimisticUpdate: (draft) => {
          draft.lists = draft.lists.map((list) =>
            list.id === category_id
              ? {
                  ...list,
                  tasks: [
                    {
                      id,
                      name: task,
                      completed: false,
                      index: 0,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      user_id: "",
                      category_id,
                      description: "",
                    },
                    ...list.tasks,
                  ],
                }
              : list
          );
        },
        apiCall: async (validated) => {
          const { data, error } = await insertTask(
            validated.category_id,
            validated.name,
            validated.id
          );
          if (error) throw new Error(error);
          set(
            produce((draft) => {
              const list = draft.lists.find(
                (l: ListsType) => l.id === category_id
              );
              if (!list) return;

              const taskIndex = list.tasks.findIndex(
                (t: TaskType) => t.id === id
              );
              if (taskIndex === -1) return;

              list.tasks[taskIndex] = {
                ...list.tasks[taskIndex],
                ...data,
              };
            })
          );
        },
        rollback: revert,
      },
      set
    );
  },

  deleteTask: async (id, category_id) => {
    const currentLists = get().lists;

    const listIndex = currentLists.findIndex((list) => list.id === category_id);
    if (listIndex === -1) return;

    const taskIndex = currentLists[listIndex].tasks.findIndex(
      (task) => task.id === id
    );
    if (taskIndex === -1) return;

    const taskToRestore = structuredClone(
      currentLists[listIndex].tasks[taskIndex]
    );

    const revert = () => {
      set(
        produce((draft) => {
          const list = draft.lists[listIndex];
          list.tasks.splice(taskIndex, 0, taskToRestore);
        })
      );
    };

    await createCRUDHandler(
      TaskSchema.pick({ id: true, category_id: true })
    ).interact(
      { id, category_id },
      {
        optimisticUpdate: (draft) => {
          draft.lists = draft.lists.map((list) =>
            list.id === category_id
              ? {
                  ...list,
                  tasks: list.tasks.filter((task) => task.id !== id),
                }
              : list
          );
        },
        apiCall: async (validated) => {
          const { error } = await deleteTask(validated.id);
          if (error) throw new Error(error);
        },
        rollback: revert,
      },
      set
    );
  },

  updateTaskCompleted: async (id, category_id, completed) => {
    const currentLists = get().lists;

    const listIndex = currentLists.findIndex((list) => list.id === category_id);
    if (listIndex === -1) return;

    const taskIndex = currentLists[listIndex].tasks.findIndex(
      (task) => task.id === id
    );
    if (taskIndex === -1) return;

    const originalCompleted =
      currentLists[listIndex].tasks[taskIndex].completed;

    const revert = () => {
      set(
        produce((draft) => {
          draft.lists[listIndex].tasks[taskIndex].completed = originalCompleted;
        })
      );
    };

    await createCRUDHandler(
      TaskSchema.pick({ id: true, category_id: true, completed: true })
    ).interact(
      { id, category_id, completed },
      {
        optimisticUpdate: (draft) => {
          draft.lists = draft.lists.map((list) =>
            list.id === category_id
              ? {
                  ...list,
                  tasks: list.tasks.map((task) =>
                    task.id === id ? { ...task, completed } : task
                  ),
                }
              : list
          );
        },
        apiCall: async (validated) => {
          const { error } = await updateCompletedTask(
            validated.id,
            validated.completed
          );
          if (error) throw new Error(error);
        },
        rollback: revert,
      },
      set
    );
  },

  deleteAllTasks: async () => {
    const originalLists = get().lists;

    await createCRUDHandler(z.void()).interact(
      undefined,
      {
        optimisticUpdate: (draft) => {
          draft.lists = draft.lists.map((list) => ({
            ...list,
            tasks: [],
          }));
        },
        apiCall: async () => {
          const { error } = await deleteAllTasks();
          if (error) throw new Error(error);
        },
        rollback: () => set({ lists: originalLists }),
      },
      set
    );
  },
}));
