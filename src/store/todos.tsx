import { create } from "zustand";
import { Todos } from "../alino-app/components/todos/todos";
import { Database } from "@/lib/task-schema";

type Todos = Database["public"]["Tables"]["todos"]["Row"];

type Tasks = {
  tasks: Todos[];
  setTasks: (task: Todos[]) => void;
};
type Subjects = {
  subjects: Todos[];
  setSubjects: (subject: Todos[]) => void;
};

export const useTask = create<Tasks>()((set) => ({
  tasks: [],
  setTasks: (task) => set(() => ({ tasks: task })),
}));

export const useSubjects = create<Subjects>()((set) => ({
  subjects: [],
  setSubjects: (subject) => set(() => ({ subjects: subject })),
}));
