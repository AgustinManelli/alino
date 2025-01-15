"use client";

import { create } from "zustand";
import { Database, tasks } from "@/lib/todosSchema";
import { v4 as uuidv4 } from "uuid";
import {
  AddTaskToDB,
  DeleteListToDB,
  DeleteTaskToDB,
  GetLists,
  UpdateDataListToDB,
  UpdateListNameToDB,
  UpdateTasksCompleted,
  UpdatePinnedListToDB,
  UpdateIndexListToDB,
  UpdateAllIndexLists,
} from "@/lib/todo/actions";
import { AddListToDB } from "@/lib/todo/actions";
import { toast } from "sonner";
import { useCloudStore } from "./useCloudStore";

const addToQueue = useCloudStore.getState().addToQueue;

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

const posIndex = 16384;

type todo_list = {
  lists: ListsType[];
  tasks: tasks[];
  setLists: (list: ListsType[]) => void;
  setAddList: (color: string, name: string, shortcodeemoji: string) => void;
  deleteList: (id: string, name: string) => void;
  getLists: () => void;
  changeColor: (color: string, id: string, shortcodeemoji: string) => void;
  updateListName: (
    id: string,
    newName: string,
    color: string,
    emoji: string
  ) => void;
  addTask: (list_id: string, task: string) => void;
  deleteTask: (id: string, list_id: string) => void;
  updateTaskCompleted: (id: string, list_id: string, status: boolean) => void;
  updateListPinned: (id: string, pinned: boolean) => void;
  updateListPosition: (id: string, index: number) => void;
};

export const useLists = create<todo_list>()((set, get) => ({
  lists: [],
  tasks: [],
  setLists: (list) => {
    set(() => ({ lists: list }));
  },

  setAddList: async (color, name, shortcodeemoji) => {
    addToQueue(1);
    //Comprobar que el nombre de la lista no esté vacío
    if (name.length < 1) {
      toast.error("El nombre de tu lista debe tener un carácter como mínimo");
      return;
    }

    //Obtener las listas actuales
    const { lists } = get();

    //obtener el índice máximo de las listas
    const maxIndex = lists.reduce<number>(
      (max, current) =>
        current.index !== null && current.index > max ? current.index : max,
      0
    );

    //Calcular el índice de la nueva lista
    const index = lists.length === 0 ? posIndex : maxIndex + posIndex;

    //Lista temporal
    const tempId = uuidv4();
    set((state: any) => ({
      lists: [
        ...state.lists,
        {
          color: color,
          icon: shortcodeemoji,
          id: tempId,
          index: index,
          inserted_at: "0",
          name: name,
          pinned: false,
          tasks: [],
          updated_at: "0",
          user_id: "0",
        },
      ],
    }));

    try {
      const result = await AddListToDB(
        index,
        color,
        name,
        shortcodeemoji,
        tempId
      );
      if (!result.error) {
        const data = result?.data;
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
        addToQueue(-1);
      } else {
        throw new Error(result.error.message);
      }
    } catch (error: any) {
      toast.error("Hubo un problema al agregar la lista, inténtalo de nuevo.");

      //eliminado de la lista temporal creada cuando ocurre un error en su creación
      const filtered = lists.filter((all) => all.id !== tempId);
      set(() => ({ lists: filtered }));
    }
  },

  deleteList: async (id, name) => {
    addToQueue(1);
    const { lists } = get();

    set({ lists: lists.filter((list) => list.id !== id) });
    try {
      const result = await DeleteListToDB(id);
      if (result.error) {
        throw new Error(result.error.message);
      }
      toast.success(`Lista "${name}" eliminada correctamente`);
      addToQueue(-1);
    } catch {
      // Revertir los cambios en la UI si la eliminación falla
      set(() => ({ lists }));
      toast.error("Hubo un error al eliminar la lista, inténtalo nuevamente.");
    }
  },

  getLists: async () => {
    addToQueue(1);
    try {
      const result = (await GetLists()) as any;
      if (!result.error) {
        set(() => ({ lists: result.data || [] }));
        addToQueue(-1);
      } else {
        throw new Error(result.error.message);
      }
    } catch {
      toast.error(`Hubo un error al cargar las listas, inténtalo nuevamente.`);
    }
  },

  changeColor: async (color, id, shortcodeemoji) => {
    addToQueue(1);
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
      const result = await UpdateDataListToDB(color, id, shortcodeemoji);
      if (result.error) {
        throw new Error(result.error.message);
      }
      addToQueue(-1);
    } catch {
      toast.error(`Hubo un error al modificar la lista, inténtalo nuevamente.`);
    }
  },

  updateListName: async (id, newName, color, emoji) => {
    addToQueue(1);
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

    try {
      const result = await UpdateListNameToDB(id, newName, color, emoji);
      if (result.error) {
        throw new Error(result.error.message);
      }
      addToQueue(-1);
    } catch {
      toast.error("Hubo un error al modificar la lista, inténtalo nuevamente.");
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

    try {
      const result = await UpdatePinnedListToDB(id, pinned);
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch {
      toast.error("Hubo un error al modificar la lista, inténtalo nuevamente.");
    }
  },

  updateListPosition: async (id, index) => {
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

        const result = await UpdateAllIndexLists(id);
        if (result.error) {
          throw new Error(result.error.message);
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

        const result = await UpdateIndexListToDB(id, index);
        if (result.error) {
          throw new Error(result.error.message);
        }
      }
    } catch {
      toast.error("Hubo un error al modificar la lista, inténtalo nuevamente.");
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
              },
            ],
          };
        }
        return list;
      }),
    }));

    try {
      const result = await AddTaskToDB(list_id, task, tempId);
      if (!result.error) {
        const data = result?.data;
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
                    };
                  }
                  return task; // Devolver otras tareas sin cambios
                }),
              };
            }
            return list;
          }),
        }));
      } else {
        throw new Error(result.error.message);
      }
    } catch {
      toast.error("Hubo un error al agregar la tarea, inténtalo nuevamente.");
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

    try {
      const result = await DeleteTaskToDB(id);
      if (result?.error) {
        throw new Error(result.error.message);
      }
    } catch {
      toast.error("Hubo un error al eliminar la tarea, inténtalo nuevamente.");
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

    try {
      const result = await UpdateTasksCompleted(id, status);
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch {
      toast.error(
        "Hubo un error al actualizar la tarea, inténtalo nuevamente."
      );
    }
  },
}));
