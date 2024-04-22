"use client";

import { create } from "zustand";
import { SubjectSchema } from "@/lib/subject-schema";

type SubjectsType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

type Subjects = {
  subjects: SubjectsType[];
  setSubjects: (subject: SubjectsType[]) => void;
  deleteSubject: (id: string) => void;
};

export const useSubjects = create<Subjects>()((set, get) => ({
  subjects: [],
  setSubjects: (subject) => set(() => ({ subjects: subject })),
  deleteSubject: (id) => {
    const { subjects } = get();
    const filtered = subjects.filter((all) => all.id !== id);
    set({ subjects: filtered });
  },
}));
