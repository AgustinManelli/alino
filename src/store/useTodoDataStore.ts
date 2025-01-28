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
  updateColorList,
  updateDataList,
  updateCompletedTask,
  updatePinnedList,
  updateIndexList,
  updateAllIndexLists,
  deleteAllLists,
  deleteAllTasks,
} from "@/lib/todo/actions";
import { toast } from "sonner";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];
type TaskType = Database["public"]["Tables"]["tasks"]["Row"];

const POS_INDEX = 16384;

type todo_list = {
  lists: ListsType[];
  tasks: TaskType[];
  loadingQueue: number;
  setLists: (list: ListsType[]) => void;
  getLists: () => void;
  insertList: (color: string, name: string, shortcodeemoji: string) => void;
  deleteList: (id: string, name: string) => void;
  changeColor: (color: string, id: string, shortcodeemoji: string) => void;
  updateListName: (
    id: string,
    newName: string,
    color: string,
    emoji: string | null
  ) => void;
  deleteAllLists: () => void;
  addTask: (list_id: string, task: string) => void;
  deleteTask: (id: string, list_id: string) => void;
  updateTaskCompleted: (id: string, list_id: string, status: boolean) => void;
  updateListPinned: (id: string, pinned: boolean) => void;
  updateListPosition: (id: string, index: number) => void;
  deleteAllTasks: () => void;
};

const ListSchema = z.object({
  index: z.number().int().min(0),
  color: z
    .string()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "El color debe ser un código hexadecimal válido o un emoji"
    ),
  name: z
    .string()
    .min(1, "El nombre no puede estar vacío")
    .max(25, "El nombre de las listas no pueden tener más de 25 caracteres"),
  shortcodeemoji: z.string().optional(),
  tempId: z.string().uuid("ID debe ser un UUID válido"),
});

export const useTodoDataStore = create<todo_list>()((set, get) => ({
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
    } catch (error: any) {
      toast.error(error);
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
    const tempId = uuidv4();
    try {
      const validatedData = ListSchema.parse({
        index,
        color,
        name,
        shortcodeemoji,
        tempId,
      });

      set((state: any) => ({
        lists: [
          ...state.lists,
          {
            color: validatedData.color,
            icon: validatedData.shortcodeemoji,
            id: validatedData.tempId,
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

      set((state) => ({ loadingQueue: state.loadingQueue + 1 }));

      const { data, error } = await insertList(
        index,
        color,
        name,
        shortcodeemoji,
        tempId
      );
      if (!error) {
        set((state: any) => ({
          lists: state.lists.map((list: any) => {
            if (list.id === tempId) {
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
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => err.message).join(". ");
        toast.error(`Error de validación: ${errors}`);
      } else {
        toast.error(`${error}`);
      }

      //eliminado de la lista temporal creada cuando ocurre un error en su creación
      const filtered = lists.filter((all) => all.id !== tempId);
      set(() => ({ lists: filtered }));
    }
  },

  deleteList: async (id, name) => {
    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));
    const { lists } = get();

    set({ lists: lists.filter((list) => list.id !== id) });
    try {
      const result = await deleteList(id);
      if (result?.error) {
        throw new Error(result.error);
      }
      toast.success(`Lista "${name}" eliminada correctamente`);

      set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
    } catch (error: any) {
      // Revertir los cambios en la UI si la eliminación falla
      set(() => ({ lists }));
      toast.error(`${error}`);
    }
  },

  changeColor: async (color, id, shortcodeemoji) => {
    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));

    set((state) => ({
      lists: state.lists.map((list) => {
        if (list.id === id) {
          return {
            ...list,
            color: color,
            icon: shortcodeemoji,
          };
        }
        return list;
      }),
    }));

    try {
      const { error } = await updateColorList(color, id, shortcodeemoji);
      if (!error) {
        set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
      } else {
        throw new Error(error);
      }
    } catch (error: any) {
      toast.error(`${error}`);
    }
  },

  updateListName: async (id, newName, color, emoji) => {
    if (newName.length < 1) {
      toast.error("El nombre de tu lista debe tener un carácter como mínimo");
      return;
    }

    set((state) => ({
      lists: state.lists.map((list) => {
        if (list.id === id) {
          return {
            ...list,
            name: newName,
            color: color,
            icon: emoji,
          };
        }
        return list;
      }),
    }));

    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));

    try {
      const { error } = await updateDataList(id, newName, color, emoji);
      if (!error) {
        set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
      } else {
        throw new Error(error);
      }
    } catch (error: any) {
      toast.error(`${error}`);
    }
  },

  updateListPinned: async (id, pinned) => {
    set((state) => ({
      lists: state.lists.map((list) => {
        if (list.id === id) {
          return {
            ...list,
            pinned: pinned,
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

    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));

    try {
      const { error } = await updatePinnedList(id, pinned);
      if (!error) {
        set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
      } else {
        throw new Error(error);
      }
    } catch (error: any) {
      toast.error(`${error}`);
    }
  },

  updateListPosition: async (id, index) => {
    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));
    try {
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

        const { error } = await updateIndexList(id, index);
        if (!error) {
          set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
        } else {
          throw new Error(error);
        }
      }
    } catch (error: any) {
      toast.error(`${error}`);
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
    } catch (error: any) {
      toast.error(`${error}`);
      set(() => ({
        lists: tempLists,
      }));
    }
  },

  //ACCIONES DE TAREAS

  addTask: async (list_id, task) => {
    if (task.length < 1) {
      toast.error("El nombre de tu tarea debe tener un carácter como mínimo");
      return;
    }

    const tempId = uuidv4();

    set((state) => ({
      lists: state.lists.map((list) => {
        if (list.id === list_id) {
          return {
            ...list,
            tasks: [
              ...list.tasks,
              {
                id: tempId,
                category_id: list_id,
                description: "",
                completed: false,
                index: 0,
                name: task,
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

    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));

    try {
      const { data, error } = await insertTask(list_id, task, tempId);
      if (!error) {
        set((state) => ({
          lists: state.lists.map((list) => {
            if (list.id === list_id) {
              return {
                ...list,
                tasks: list.tasks.map((task) => {
                  if (task.id === tempId) {
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
    } catch (error: any) {
      toast.error(`${error}`);
    }
  },

  deleteTask: async (id, list_id) => {
    set((state) => ({
      lists: state.lists.map((list) => {
        if (list.id === list_id) {
          return {
            ...list,
            tasks: list.tasks.filter((task) => task.id !== id),
          };
        }
        return list;
      }),
    }));

    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));

    try {
      const { error } = await deleteTask(id);
      if (!error) {
        set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
      } else {
        throw new Error(error);
      }
    } catch (error: any) {
      toast.error(`${error}`);
    }
  },

  updateTaskCompleted: async (id, list_id, status) => {
    set((state) => ({
      lists: state.lists.map((list) => {
        if (list.id === list_id) {
          return {
            ...list,
            tasks: list.tasks.map((task) => {
              if (task.id === id) {
                return {
                  ...task,
                  completed: status,
                };
              }
              return task;
            }),
          };
        }
        return list;
      }),
    }));

    set((state) => ({ loadingQueue: state.loadingQueue + 1 }));

    try {
      const { error } = await updateCompletedTask(id, status);
      if (!error) {
        set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
      } else {
        throw new Error(error);
      }
    } catch (error: any) {
      toast.error(`${error}`);
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
    } catch (error: any) {
      toast.error(`${error}`);
      set(() => ({
        lists: tempLists,
      }));
    }
  },
}));
