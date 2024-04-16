import { create } from "zustand";
import { SubjectSchema } from "@/lib/subject-schema";

type SubjectsType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

type Subjects = {
  subjects: Subjects[];
  setSubjects: (subject: Subjects[]) => void;
};

export const useSubjects = create<Subjects>()((set) => ({
  subjects: [],
  setSubjects: (subject) => set(() => ({ subjects: subject })),
}));
