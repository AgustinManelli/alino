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
  updateNameTask,
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
  deleteTask: (id: string) => Promise<void>;
  updateTaskCompleted: (id: string, completed: boolean) => Promise<void>;
  updatePinnedList: (id: string, pinned: boolean) => Promise<void>;
  updateIndexList: (id: string, index: number) => Promise<void>;
  updateTaskName: (
    id: string,
    name: string
  ) => Promise<{ error: string | null }>;
  deleteAllTasks: () => Promise<void>;
  getTaskCountByListId: (listId: string) => number;
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
          set(() => ({ lists: data?.lists, tasks: data?.tasks }));
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

    // Obtener tareas relacionadas para posible rollback
    const relatedTasks = get().tasks.filter((t) => t.category_id === id);
    const originalTasks = get().tasks;

    const revert = () => {
      set((state) => ({
        lists: [
          ...state.lists.slice(0, listIndex),
          listToRestore,
          ...state.lists.slice(listIndex),
        ],
        tasks: originalTasks, // Restaurar todas las tareas originales
      }));
    };

    await createCRUDHandler(ListSchema.pick({ id: true })).interact(
      { id },
      {
        optimisticUpdate: (draft) => {
          // Eliminar lista
          draft.lists = draft.lists.filter((l) => l.id !== id);
          // Eliminar tareas relacionadas
          draft.tasks = draft.tasks.filter((t) => t.category_id !== id);
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
    // Guardar copia de ambos estados para el rollback
    const originalLists = structuredClone(get().lists);
    const originalTasks = structuredClone(get().tasks);

    await createCRUDHandler(z.void()).interact(
      undefined,
      {
        optimisticUpdate: (draft) => {
          draft.lists = [];
          draft.tasks = [];
        },
        apiCall: async () => {
          const { error: listsError } = await deleteAllLists();
          if (listsError) throw new Error(listsError);
        },
        rollback: () => {
          set({ lists: originalLists, tasks: originalTasks });
        },
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
          draft.tasks = draft.tasks.filter((t) => t.id !== id);
        })
      );
    };

    await createCRUDHandler(
      TaskSchema.pick({ id: true, category_id: true, name: true })
    ).interact(
      { id, category_id, name: task },
      {
        optimisticUpdate: (draft) => {
          draft.tasks.unshift({
            id,
            name: task,
            completed: false,
            index: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: "",
            category_id,
            description: "",
          });
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
              const taskIndex = draft.tasks.findIndex(
                (t: TaskType) => t.id === id
              );
              if (taskIndex === -1) return;
              draft.tasks[taskIndex] = { ...draft.tasks[taskIndex], ...data };
            })
          );
        },
        rollback: revert,
      },
      set
    );
  },

  deleteTask: async (id) => {
    const taskToRestore = get().tasks.find((t) => t.id === id);
    if (!taskToRestore) return;

    const revert = () => {
      set(
        produce((draft) => {
          draft.tasks.push(taskToRestore);
        })
      );
    };

    await createCRUDHandler(TaskSchema.pick({ id: true })).interact(
      { id },
      {
        optimisticUpdate: (draft) => {
          draft.tasks = draft.tasks.filter((task) => task.id !== id);
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

  updateTaskCompleted: async (id, completed) => {
    const taskIndex = get().tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) return;

    const originalCompleted = get().tasks[taskIndex].completed;

    const revert = () => {
      set(
        produce((draft) => {
          draft.tasks[taskIndex].completed = originalCompleted;
        })
      );
    };

    await createCRUDHandler(
      TaskSchema.pick({ id: true, completed: true })
    ).interact(
      { id, completed },
      {
        optimisticUpdate: (draft) => {
          draft.tasks[taskIndex].completed = completed;
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

  updateTaskName: async (id, name) => {
    let errorResult: string | null = null;
    const taskIndex = get().tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) return;

    const originalName = get().tasks[taskIndex].name;

    const revert = () => {
      set(
        produce((draft) => {
          draft.tasks[taskIndex].name = originalName;
        })
      );
    };

    await createCRUDHandler(TaskSchema.pick({ id: true, name: true }))
      .interact(
        { id, name },
        {
          optimisticUpdate: (draft) => {
            draft.tasks[taskIndex].name = name;
          },
          apiCall: async (validated) => {
            const { error } = await updateNameTask(
              validated.id,
              validated.name
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

  deleteAllTasks: async () => {
    const originalTasks = get().tasks;

    await createCRUDHandler(z.void()).interact(
      undefined,
      {
        optimisticUpdate: (draft) => {
          draft.tasks = [];
        },
        apiCall: async () => {
          const { error } = await deleteAllTasks();
          if (error) throw new Error(error);
        },
        rollback: () => set({ tasks: originalTasks }),
      },
      set
    );
  },

  getTaskCountByListId: (listId: string) => {
    return get().tasks.filter((task) => task.category_id === listId).length;
  },
}));
