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
} from "@/lib/todo/actions";
import { AddListToDB } from "@/lib/todo/actions";
import { toast } from "sonner";

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
  updateListName: (id: string, newName: string) => void;
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
      } else {
        throw new Error(result.error.message);
      }
    } catch (error: any) {
      toast.error(
        "Hubo un problema al agregar la lista. Por favor, inténtalo de nuevo."
      );

      //eliminado de la lista temporal creada cuando ocurre un error en su creación
      const filtered = lists.filter((all) => all.id !== tempId);
      set(() => ({ lists: filtered }));
    }
  },

  deleteList: async (id, name) => {
    const { lists } = get();
    const filtered = lists.filter((all) => all.id !== id);
    set(() => ({ lists: filtered }));

    try {
      const result = await DeleteListToDB(id);
      if (result.error) {
        throw new Error(result.error.message);
      }
      toast.success(`Lista "${name}" eliminada correctamente`);
    } catch {
      // Revertir los cambios en la UI si la eliminación falla
      set(() => ({ lists }));
      toast.error("Hubo un error al eliminar la lista, intentalo nuevamente.");
    }
  },

  getLists: async () => {
    try {
      const result = (await GetLists()) as any;
      if (!result.error) {
        set(() => ({ lists: result.data || [] }));
      } else {
        throw new Error(result.error.message);
      }
    } catch {
      toast.error(`Hubo un error al cargar las listas, instentalo nuevamente.`);
    }
  },

  changeColor: async (color, id, shortcodeemoji) => {
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
      toast.success(`Color de lista modificado correctamente`);
    } catch {
      toast.error(`Hubo un error al modificar la lista, intentalo nuevamente.`);
    }
  },

  updateListName: async (id, newName) => {
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
          };
        }
        return list;
      }),
    }));

    try {
      const result = await UpdateListNameToDB(id, newName);
      if (result.error) {
        throw new Error(result.error.message);
      }
      toast.success(`Nombre de lista modificado correctamente`);
    } catch {
      toast.error("Hubo un error al modificar la lista, intentalo nuevamente.");
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
      if (!result.error) {
        pinned
          ? toast.success(`Lista fijada correctamente`)
          : toast.success(`Lista desfijada correctamente`);
      } else {
        throw new Error(result.error.message);
      }
    } catch {
      toast.error("Hubo un error al modificar la lista, intentalo nuevamente.");
    }
  },

  updateListPosition: async (id, index) => {
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
    try {
      const result = await UpdateIndexListToDB(id, index);
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch {
      toast.error("Hubo un error al modificar la lista, intentalo nuevamente.");
    }
  },

  //ACCIONES DE TAREAS

  addTask: async (list_id, task) => {
    const result = await AddTaskToDB(list_id, task);

    if (result?.error) {
      toast.error(`Error al agregar tarea: ${result.error.message}`);
      return;
    }

    const data = result?.data;

    set((state) => ({
      lists: state.lists.map((list) => {
        if (list.id === list_id) {
          return {
            ...list,
            tasks: [data, ...list.tasks],
          };
        }
        return list;
      }),
    }));
  },

  deleteTask: async (id, list_id) => {
    const result = await DeleteTaskToDB(id);

    if (result?.error) {
      toast.error(`Error al eliminar tarea: ${result.error.message}`);
      return;
    }

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
  },

  updateTaskCompleted: async (id, list_id, status) => {
    const result = await UpdateTasksCompleted(id, status);

    if (result.error) {
      toast.error(`Error al actualizar tarea: ${result.error.message}`);
      return;
    }

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
  },
}));
