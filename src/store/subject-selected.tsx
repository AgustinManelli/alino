"use client";

import { create } from "zustand";
import { SubjectSchema } from "@/lib/subject-schema";

type SubjectsType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

type Subjects = {
  subjectName: string;
  subjectId: string;
  subjectColor: string;
  setSubjects: (subject: string) => void;
  setSubjectId: (id: string) => void;
  setSubjectColor: (color: string) => void;
};

export const useSubjectSelected = create<Subjects>()((set) => ({
  subjectName: "home",
  subjectId: "home-tasks-static-alino-app",
  subjectColor: "#87189d",
  setSubjects: (subject) => set(() => ({ subjectName: subject })),
  setSubjectId: (id) => set(() => ({ subjectId: id })),
  setSubjectColor: (color) => set(() => ({ subjectColor: color })),
}));
