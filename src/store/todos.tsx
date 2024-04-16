import { create } from "zustand";
import { SubjectSchema } from "@/lib/subject-schema";

type SubjectsType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

type Subjects = {
  subjects: SubjectsType[];
  setSubjects: (subject: SubjectsType[]) => void;
};

export const useSubjects = create<Subjects>()((set) => ({
  subjects: [],
  setSubjects: (subject) => set(() => ({ subjects: subject })),
}));
