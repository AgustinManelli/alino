"use client";

import { create } from "zustand";
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

export const useTodoDataStoreDEPRECATED = create<todo_list>()((set, get) => ({
  lists: [],
  tasks: [],
  loadingQueue: 0,

  setLists: (list) => {
    set(() => ({ lists: list }));
  },

  getLists: async () => {
    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));
    try {
      const { data, error } = await getLists();

      if (!error) {
        data?.forEach((todo: ListsType) => {
          todo.tasks = todo.tasks.sort(
            (a: TaskType, b: TaskType) => (b.index ?? 0) - (a.index ?? 0)
          );
        });

        set(() => ({ lists: data || [] }));
        set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
      } else {
        throw new Error(error);
      }
    } catch (error: unknown) {
      let errorMessage = UNKNOWN_ERROR_MESSAGE;

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      console.error(errorMessage);
    }
  },

  insertList: async (color, name, shortcodeemoji) => {
    //Obtener las listas actuales
    const { lists } = get();

    //obtener el índice máximo de las listas
    const maxIndex = lists.reduce<number>(
      (max, current) =>
        current.index !== null && current.index > max ? current.index : max,
      0
    );

    //Calcular el índice de la nueva lista
    const index = lists.length === 0 ? POS_INDEX : maxIndex + POS_INDEX;

    //Lista temporal
    const id = uuidv4();

    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));
    try {
      const pickSchema = ListSchema.pick({
        index: true,
        color: true,
        name: true,
        shortcodeemoji: true,
        id: true,
      });
      const validatedData = pickSchema.parse({
        index,
        color,
        name,
        shortcodeemoji,
        id,
      });

      set((state: any) => ({
        lists: [
          ...state.lists,
          {
            color: validatedData.color,
            icon: validatedData.shortcodeemoji,
            id: validatedData.id,
            index: validatedData.index,
            inserted_at: "0",
            name: validatedData.name,
            pinned: false,
            tasks: [],
            updated_at: "0",
            user_id: "0",
          },
        ],
      }));

      const { data, error } = await insertList(
        index,
        color,
        name,
        shortcodeemoji,
        id
      );
      if (!error) {
        set((state: any) => ({
          lists: state.lists.map((list: any) => {
            if (list.id === id) {
              return {
                ...list,
                id: data.id,
                user_id: data.user_id,
                inserted_at: data.inserted_at,
                updated_at: data.updated_at,
              };
            }
            return list;
          }),
        }));
        set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
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
        //eliminado de la lista temporal creada cuando ocurre un error en su creación
        const filtered = lists.filter((all) => all.id !== id);
        set(() => ({ lists: filtered }));
      }

      toast.error(errorMessage);
      console.error(errorMessage);

      //eliminado de la lista temporal creada cuando ocurre un error en su creación
      const filtered = lists.filter((all) => all.id !== id);
      set(() => ({ lists: filtered }));
    }
  },

  deleteList: async (id) => {
    const { lists } = get();

    set({ lists: lists.filter((list) => list.id !== id) });
    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));
    try {
      const pickSchema = ListSchema.pick({ id: true });
      const validatedData = pickSchema.parse({ id });

      const result = await deleteList(validatedData.id);
      if (result?.error) {
        throw new Error(result.error);
      }

      set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
    } catch (error: unknown) {
      let errorMessage = UNKNOWN_ERROR_MESSAGE;

      if (error instanceof z.ZodError) {
        const errors = error.errors[0].message;
        errorMessage = `Error de validación: ${errors}`;
      }

      if (error instanceof Error) {
        errorMessage = error.message;
        // Revertir los cambios en la UI si la eliminación falla
        set(() => ({ lists }));
      }

      toast.error(errorMessage);
      console.error(errorMessage);

      // Revertir los cambios en la UI si la eliminación falla
      set(() => ({ lists }));
    }
  },

  updateDataList: async (id, name, color, shortcodeemoji) => {
    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));

    try {
      const pickSchema = ListSchema.pick({
        id: true,
        name: true,
        color: true,
        shortcodeemoji: true,
      });
      const validatedData = pickSchema.parse({
        id,
        name,
        color,
        shortcodeemoji,
      });

      set((state) => ({
        lists: state.lists.map((list) => {
          if (list.id === id) {
            return {
              ...list,
              name: validatedData.name,
              color: validatedData.color,
              icon: validatedData.shortcodeemoji,
            };
          }
          return list;
        }),
      }));

      const { error } = await updateDataList(
        validatedData.id,
        validatedData.name,
        validatedData.color,
        validatedData.shortcodeemoji
      );
      if (!error) {
        set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
      } else {
        throw new Error(error);
      }

      return { error: error || null };
    } catch (error: unknown) {
      let errorMessage = UNKNOWN_ERROR_MESSAGE;

      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => err.message).join(". ");
        errorMessage = `Error de validación: ${errors}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
        return { error: error.message };
      }

      toast.error(errorMessage);
      console.error(errorMessage);

      return { error: errorMessage };
    }
  },

  updatePinnedList: async (id, pinned) => {
    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));

    try {
      const pickSchema = ListSchema.pick({
        pinned: true,
        id: true,
      });
      const validatedData = pickSchema.parse({ pinned, id });

      set((state) => ({
        lists: state.lists.map((list) => {
          if (list.id === id) {
            return {
              ...list,
              pinned: validatedData.pinned,
            };
          }
          return list;
        }),
      }));

      set((state) => ({
        lists: state.lists.sort((a, b) => {
          if (a.index === null) return 1;
          if (b.index === null) return -1;
          return a.index - b.index;
        }),
      }));

      const { error } = await updatePinnedList(
        validatedData.id,
        validatedData.pinned
      );

      if (!error) {
        set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
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

  updateIndexList: async (id, index) => {
    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));
    try {
      const pickSchema = ListSchema.pick({
        id: true,
        index: true,
      });
      const validatedData = pickSchema.parse({ id, index });

      if (!Number.isInteger(index)) {
        set((state) => {
          const updatedLists = state.lists.map((list, idx) => {
            return {
              ...list,
              index: 16384 * (idx + 1),
            };
          });

          return { lists: updatedLists };
        });

        const result = await updateAllIndexLists();
        if (result.error) {
          throw new Error(result.error);
        }
      } else {
        set((state) => ({
          lists: state.lists.map((list) => {
            if (list.id === id) {
              return {
                ...list,
                index: index,
              };
            }
            return list;
          }),
        }));

        const { error } = await updateIndexList(
          validatedData.id,
          validatedData.index
        );
        if (!error) {
          set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
        } else {
          throw new Error(error);
        }
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

  deleteAllLists: async () => {
    const { lists } = get();
    const tempLists = lists;

    set(() => ({
      lists: [],
    }));

    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));
    try {
      const { error } = await deleteAllLists();
      if (!error) {
        set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
      } else {
        throw new Error(error);
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

  //ACCIONES DE TAREAS

  addTask: async (category_id, name) => {
    const id = uuidv4();

    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));
    try {
      const pickSchema = TaskSchema.pick({
        category_id: true,
        name: true,
        id: true,
      });
      const validatedData = pickSchema.parse({ category_id, name, id });

      set((state) => ({
        lists: state.lists.map((list) => {
          if (list.id === category_id) {
            return {
              ...list,
              tasks: [
                ...list.tasks,
                {
                  id: validatedData.id,
                  category_id: validatedData.category_id,
                  description: "",
                  completed: false,
                  index: 0,
                  name: name,
                  created_at: "0",
                  updated_at: "0",
                  user_id: "0",
                },
              ],
            };
          }
          return list;
        }),
      }));

      const { data, error } = await insertTask(
        validatedData.category_id,
        validatedData.name,
        validatedData.id
      );
      if (!error) {
        set((state) => ({
          lists: state.lists.map((list) => {
            if (list.id === category_id) {
              return {
                ...list,
                tasks: list.tasks.map((task) => {
                  if (task.id === id) {
                    // Actualizar la tarea específica
                    return {
                      ...task,
                      index: data.id,
                      created_at: data.created_at,
                      updated_at: data.updated_at,
                      user_id: data.id,
                    };
                  }
                  return task; // Devolver otras tareas sin cambios
                }),
              };
            }
            return list;
          }),
        }));
        set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
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

  deleteTask: async (id, category_id) => {
    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));

    try {
      const pickSchema = TaskSchema.pick({
        id: true,
        category_id: true,
      });
      const validatedData = pickSchema.parse({ id, category_id });

      set((state) => ({
        lists: state.lists.map((list) => {
          if (list.id === validatedData.category_id) {
            return {
              ...list,
              tasks: list.tasks.filter((task) => task.id !== id),
            };
          }
          return list;
        }),
      }));

      const { error } = await deleteTask(validatedData.id);

      if (!error) {
        set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
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

  updateTaskCompleted: async (id, category_id, completed) => {
    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));

    try {
      const pickSchema = TaskSchema.pick({
        id: true,
        category_id: true,
        completed: true,
      });
      const validatedData = pickSchema.parse({ id, category_id, completed });

      set((state) => ({
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
        set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
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

    set((state) => ({
      lists: state.lists.map((list) => ({
        ...list,
        tasks: [],
      })),
    }));

    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));

    try {
      const result = await deleteAllTasks();
      if (!result.error) {
        set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
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
