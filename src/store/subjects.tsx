"use client";

import { create } from "zustand";
import { SubjectSchema } from "@/lib/subject-schema";
import { DeleteSubjectToDB, GetSubjects } from "@/lib/todo/actions";

type SubjectsType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

type Subjects = {
  subjects: SubjectsType[];
  setSubjects: (subject: SubjectsType[]) => void;
  deleteSubject: (id: string) => void;
  getSubject: () => void;
};

export const useSubjects = create<Subjects>()((set, get) => ({
  subjects: [],
  setSubjects: (subject) => set(() => ({ subjects: subject })),
  deleteSubject: async (id) => {
    const { subjects } = get();
    const filtered = subjects.filter((all) => all.id !== id);
    set({ subjects: filtered });
    await DeleteSubjectToDB(id);
  },
  getSubject: async () => {
    const { data } = (await GetSubjects()) as any;
    set({ subjects: data });
  },
}));
