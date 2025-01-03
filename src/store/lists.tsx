"use client";

import { create } from "zustand";
import { Database, tasks } from "@/lib/todosSchema";
import {
  AddTaskToDB,
  DeleteListToDB,
  DeleteTaskToDB,
  GetLists,
  UpdateDataListToDB,
  UpdateListNameToDB,
  UpdateTasksCompleted,
  UpdatePinnedListToDB,
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
};

export const useLists = create<todo_list>()((set, get) => ({
  lists: [],
  tasks: [],
  setLists: (list) => {
    set(() => ({ lists: list }));
  },

  setAddList: async (color, name, shortcodeemoji) => {
    if (name.length < 1) {
      toast.error("El nombre de tu lista debe tener un carácter como mínimo");
      return;
    }

    const { lists } = get();

    //obtener el índice máximo de las listas
    const maxIndex = lists.reduce<number>(
      (max, current) =>
        current.index !== null && current.index > max ? current.index : max,
      0
    );

    const index = lists.length === 0 ? posIndex : maxIndex + posIndex;

    const result = await AddListToDB(index, color, name, shortcodeemoji);

    if (!result.error) {
      const data = result?.data;
      const final = { ...data, tasks: [] };
      set((state: any) => ({ lists: [...state.lists, final] }));
      toast.success(`Lista "${name}" agregada correctamente`);
    } else {
      toast.error(result.error.message);
    }
  },

  deleteList: async (id, name) => {
    const result = await DeleteListToDB(id);

    const { lists } = get();
    const filtered = lists.filter((all) => all.id !== id);
    set(() => ({ lists: filtered }));

    if (result.error) {
      // Revertir los cambios en la UI si la eliminación falla
      set(() => ({ lists }));
    }

    if (result.error) {
      toast.error(`Error al eliminar la lista: ${result.error.message}`);
      return;
    }

    toast.success(`Lista "${name}" eliminada correctamente`);
  },

  getLists: async () => {
    const result = (await GetLists()) as any;

    if (result.error) {
      toast.error(`Error al cargar las listas: ${result.error.message}`);
      return;
    }

    set(() => ({ lists: result.data || [] }));
  },

  changeColor: async (color, id, shortcodeemoji) => {
    const result = await UpdateDataListToDB(color, id, shortcodeemoji);

    if (result.error) {
      toast.error(`Error al modificar lista: ${result.error.message}`);
      return;
    }

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

    toast.success(`Lista modificada correctamente`);
  },

  updateListName: async (id, newName) => {
    if (newName.length < 1) {
      toast.error("El nombre de tu lista debe tener un carácter como mínimo");
      return;
    }
    const result = await UpdateListNameToDB(id, newName);

    if (result.error) {
      toast.error(`Error al modificar lista: ${result.error.message}`);
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

    toast.success(`Nombre de lista modificado correctamente`);
  },

  updateListPinned: async (id, pinned) => {
    const result = await UpdatePinnedListToDB(id, pinned);

    if (result.error) {
      toast.error(`Error al modificar lista: ${result.error.message}`);
      return;
    }

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

    pinned
      ? toast.success(`Lista fijada correctamente`)
      : toast.success(`Lista desfijada correctamente`);
  },

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
