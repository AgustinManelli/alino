"use client";

import { create, StoreApi } from "zustand";
import { Database } from "@/lib/schemas/todo-schema";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
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
import { toast } from "sonner";

import { ListSchema } from "@/lib/schemas/listValidationSchema";
import { TaskSchema } from "@/lib/schemas/taskValidationSchema";
import { produce } from "immer";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];
type TaskType = Database["public"]["Tables"]["tasks"]["Row"];

const POS_INDEX = 16384;
const UNKNOWN_ERROR_MESSAGE = "An unknown error occurred.";

type todo_list = {
  lists: ListsType[];
  tasks: TaskType[];
  loadingQueue: number;
  setLists: (list: ListsType[]) => void;
  getLists: () => void;
  insertList: (color: string, name: string, shortcodeemoji: string) => void;
  deleteList: (id: string) => void;
  updateDataList: (
    id: string,
    newName: string,
    color: string,
    emoji: string | null
  ) => Promise<{ error: string | null }>;
  deleteAllLists: () => void;
  addTask: (category_id: string, task: string) => void;
  deleteTask: (id: string, category_id: string) => void;
  updateTaskCompleted: (
    id: string,
    category_id: string,
    completed: boolean
  ) => void;
  updatePinnedList: (id: string, pinned: boolean) => void;
  updateIndexList: (id: string, index: number) => void;
  deleteAllTasks: () => void;
};

type SetState = (fn: (state: todo_list) => Partial<todo_list>) => void;

const withLoading = async <T>(
  action: () => Promise<T>,
  set: SetState
): Promise<T> => {
  set((state: todo_list) => ({ loadingQueue: state.loadingQueue + 1 }));
  try {
    return await action();
  } finally {
    set((state: todo_list) => ({ loadingQueue: state.loadingQueue - 1 }));
  }
};

const createCRUDHandler = <T>(schema: z.ZodSchema<T>) => ({
  interact: async (
    data: unknown,
    action: (validated: T) => Promise<void>,
    set: SetState
  ) => {
    await withLoading(async () => {
      const validated = schema.parse(data);
      await action(validated);
    }, set);
  },
});

const handleError = (error: unknown, revert?: () => void) => {
  let errorMessage = UNKNOWN_ERROR_MESSAGE;

  if (error instanceof z.ZodError) {
    errorMessage = `${error.errors.map((e) => e.message).join(". ")}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    console.error(errorMessage);
  }

  toast.error(errorMessage);
  if (revert) revert();

  return errorMessage;
};

export const useTodoDataStore = create<todo_list>()((set, get) => ({
  lists: [],
  tasks: [],
  loadingQueue: 0,

  setLists: (list) => {
    set(() => ({ lists: list }));
  },

  getLists: async () => {
    try {
      await withLoading(async () => {
        const { data, error } = await getLists();

        if (error) throw new Error(error);

        const processLists = (lists: ListsType[] = []) =>
          lists.map((list) => ({
            ...list,
            tasks: (list.tasks || []).sort(
              (a, b) => (b.index ?? 0) - (a.index ?? 0)
            ),
          }));

        set({ lists: processLists(data) });
      }, set);
    } catch (error: unknown) {
      handleError(error, () => {
        // Revertir a estado anterior si es necesario
        set({ lists: get().lists });
      });
    }
  },

  insertList: async (color, name, shortcodeemoji) => {
    //obtención de lista
    const { lists } = get();

    //creación de UUID
    const id = uuidv4();

    //obtención del nuevo índice
    const newIndex =
      lists.length === 0
        ? POS_INDEX
        : Math.max(...lists.map((l) => l.index || 0)) + POS_INDEX;

    //Helper para actualización optimista
    const optimisticUpdate = () => {
      set((state: todo_list) => ({
        lists: [
          ...state.lists,
          {
            color: color,
            icon: shortcodeemoji,
            id: id,
            index: newIndex,
            inserted_at: "0",
            name: name,
            pinned: false,
            tasks: [],
            updated_at: "0",
            user_id: "0",
          },
        ],
      }));
    };

    // Helper para revertir en caso de error
    const revert = () => set({ lists: lists.filter((all) => all.id !== id) });

    await createCRUDHandler(
      ListSchema.pick({
        index: true,
        color: true,
        name: true,
        shortcodeemoji: true,
        id: true,
      })
    )
      .interact(
        { index: newIndex, color, name, shortcodeemoji, id },
        async (validated) => {
          optimisticUpdate();

          const { data, error } = await insertList(
            validated.index,
            validated.color,
            validated.name,
            validated.shortcodeemoji,
            validated.id
          );

          if (error) throw new Error(error);

          set((state: todo_list) => ({
            lists: state.lists.map((list: any) => {
              if (list.id === id) {
                return {
                  ...list,
                  ...data,
                  // user_id: data.user_id,
                  // inserted_at: data.inserted_at,
                  // updated_at: data.updated_at,
                };
              }
              return list;
            }),
          }));
        },
        set
      )
      .catch((error) => handleError(error, revert));
  },

  deleteList: async (id) => {
    const originalLists = [...get().lists];

    await createCRUDHandler(
      ListSchema.pick({
        id: true,
      })
    )
      .interact(
        { id },
        async (validated) => {
          set((state: todo_list) => ({
            lists: state.lists.filter((list) => list.id !== validated.id),
          }));

          const result = await deleteList(validated.id);

          if (result?.error) throw new Error(result.error);
        },
        set
      )
      .catch((error) =>
        handleError(error, () => {
          set({ lists: originalLists });
        })
      );
  },

  updateDataList: async (id, name, color, shortcodeemoji) => {
    const originalLists = [...get().lists];
    let errorResult: string | null = null;

    await createCRUDHandler(
      ListSchema.pick({
        color: true,
        name: true,
        shortcodeemoji: true,
        id: true,
      })
    )
      .interact(
        { id, name, color, shortcodeemoji },
        async (validated) => {
          set((state: todo_list) => ({
            lists: state.lists.map((list) => {
              if (list.id === id) {
                return {
                  ...list,
                  name: validated.name,
                  color: validated.color,
                  icon: validated.shortcodeemoji,
                };
              }
              return list;
            }),
          }));

          const { error } = await updateDataList(
            validated.id,
            validated.name,
            validated.color,
            validated.shortcodeemoji
          );

          if (error) throw new Error(error);
        },
        set
      )
      .catch(
        (error: unknown) =>
          (errorResult = handleError(error, () => {
            set({ lists: originalLists });
          }))
      );
    return { error: errorResult };
  },

  updatePinnedList: async (id, pinned) => {
    const originalLists = [...get().lists];

    await createCRUDHandler(
      ListSchema.pick({
        id: true,
        pinned: true,
      })
    )
      .interact(
        { id, pinned },
        async (validated) => {
          set((state: todo_list) => ({
            lists: state.lists
              .map((list) => {
                if (list.id === id) {
                  return {
                    ...list,
                    pinned: validated.pinned,
                  };
                }
                return list;
              })
              .sort((a, b) => {
                const aIndex = a.index ?? Number.MAX_SAFE_INTEGER;
                const bIndex = b.index ?? Number.MAX_SAFE_INTEGER;
                return aIndex - bIndex;
              }),
          }));

          const { error } = await updatePinnedList(
            validated.id,
            validated.pinned
          );

          if (error) throw new Error(error);
        },
        set
      )
      .catch((error: unknown) =>
        handleError(error, () => {
          set({ lists: originalLists });
        })
      );
  },

  updateIndexList: async (id, index) => {
    const originalLists = [...get().lists];

    await createCRUDHandler(
      ListSchema.pick({
        id: true,
        index: true,
      })
    )
      .interact(
        { id, index },
        async (validated) => {
          if (!Number.isInteger(validated.index)) {
            // Actualización masiva optimista
            set((state) => ({
              lists: state.lists.map((list, idx) => ({
                ...list,
                index: POS_INDEX * (idx + 1),
              })),
            }));

            const { error } = await updateAllIndexLists();
            if (error) throw new Error(error);
          } else {
            // Actualización individual optimista
            set((state) => ({
              lists: state.lists.map((list) =>
                list.id === validated.id
                  ? { ...list, index: validated.index }
                  : list
              ),
            }));

            const { error } = await updateIndexList(
              validated.id,
              validated.index
            );
            if (error) throw new Error(error);
          }
        },
        set
      )
      .catch((error) =>
        handleError(error, () => set({ lists: originalLists }))
      );
  },

  deleteAllLists: async () => {
    const originalLists = [...get().lists];

    try {
      await withLoading(async () => {
        // Actualización optimista
        set({ lists: [] });

        // Llamada a la API
        const { error } = await deleteAllLists();
        if (error) throw new Error(error);
      }, set);
    } catch (error: unknown) {
      handleError(error, () => {
        // Revertir en caso de error
        set({ lists: originalLists });
      });
    }
  },

  //ACCIONES DE TAREAS

  addTask: async (category_id, name) => {
    const id = uuidv4();

    const optimisticUpdate = () => {
      const newTask = {
        id: uuidv4(),
        category_id,
        name,
        completed: false,
        index: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "temp",
        description: "",
      };

      set(
        produce((state) => {
          const list = state.lists.find(
            (list: ListsType) => list.id === category_id
          );
          if (list) {
            list.tasks.unshift({ ...newTask });
          }
        })
      );
    };

    const revert = () => {
      set(
        produce((draft: todo_list) => {
          const targetList = draft.lists.find(
            (list: ListsType) => list.id === category_id
          );
          if (!targetList) return;

          // Filtrar la tarea temporal
          targetList.tasks = targetList.tasks.filter((task) => task.id !== id);
        })
      );
    };

    await createCRUDHandler(
      TaskSchema.pick({
        id: true,
        category_id: true,
        name: true,
      })
    )
      .interact(
        { id, category_id, name },
        async (validated) => {
          optimisticUpdate();
          const { data, error } = await insertTask(
            validated.category_id,
            validated.name,
            validated.id
          );

          if (error) throw new Error(error);

          set(
            produce((draft) => {
              const targetList = draft.lists.find(
                (list: ListsType) => list.id === category_id
              );
              if (!targetList) return;

              const targetTask = targetList.tasks.find(
                (task: TaskType) => task.id === id
              );
              if (!targetTask || !data) return;

              Object.assign(targetTask, {
                index: data.index ?? targetTask.index,
                created_at: data.created_at,
                updated_at: data.updated_at,
                user_id: data.user_id ?? targetTask.user_id,
              });
            })
          );
        },
        set
      )
      .catch((error) => handleError(error, revert));
  },

  deleteTask: async (id, category_id) => {
    const originalLists = [...get().lists];

    await createCRUDHandler(
      TaskSchema.pick({
        id: true,
        category_id: true,
      })
    )
      .interact(
        { id, category_id },
        async (validated) => {
          set((state: todo_list) => ({
            lists: state.lists.map((list) => {
              if (list.id === validated.category_id) {
                return {
                  ...list,
                  tasks: list.tasks.filter((task) => task.id !== id),
                };
              }
              return list;
            }),
          }));

          const { error } = await deleteTask(validated.id);

          if (error) throw new Error(error);
        },
        set
      )
      .catch((error) =>
        handleError(error, () => set({ lists: originalLists }))
      );
  },

  updateTaskCompleted: async (id, category_id, completed) => {
    set((state: todo_list) => ({ loadingQueue: state.loadingQueue + 1 }));

    try {
      const pickSchema = TaskSchema.pick({
        id: true,
        category_id: true,
        completed: true,
      });
      const validatedData = pickSchema.parse({ id, category_id, completed });

      set((state: todo_list) => ({
        lists: state.lists.map((list) => {
          if (list.id === validatedData.category_id) {
            return {
              ...list,
              tasks: list.tasks.map((task) => {
                if (task.id === id) {
                  return {
                    ...task,
                    completed: completed,
                  };
                }
                return task;
              }),
            };
          }
          return list;
        }),
      }));

      const { error } = await updateCompletedTask(
        validatedData.id,
        validatedData.completed
      );
      if (!error) {
        set((state: todo_list) => ({ loadingQueue: state.loadingQueue - 1 }));
      } else {
        throw new Error(error);
      }
    } catch (error: unknown) {
      let errorMessage = UNKNOWN_ERROR_MESSAGE;

      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => err.message).join(". ");
        errorMessage = `Error de validación: ${errors}`;
      }

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      console.error(errorMessage);
    }
  },

  deleteAllTasks: async () => {
    const { lists } = get();
    const tempLists = lists;

    set((state: todo_list) => ({
      lists: state.lists.map((list) => ({
        ...list,
        tasks: [],
      })),
    }));

    set((state: todo_list) => ({ loadingQueue: state.loadingQueue + 1 }));

    try {
      const result = await deleteAllTasks();
      if (!result.error) {
        set((state: todo_list) => ({ loadingQueue: state.loadingQueue - 1 }));
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      let errorMessage = UNKNOWN_ERROR_MESSAGE;

      if (error instanceof Error) {
        errorMessage = error.message;
        set(() => ({
          lists: tempLists,
        }));
      }

      toast.error(errorMessage);
      console.error(errorMessage);
      set(() => ({
        lists: tempLists,
      }));
    }
  },
}));
