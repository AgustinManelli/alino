"use client";

import { useEffect, useState } from "react";
import styles from "./navbar.module.css";
import { SubjectSchema } from "@/lib/subject-schema";
import { createClient } from "@/utils/supabase/client";
import { GetSubjects } from "@/lib/todo/actions";
import { SubjectsCards } from "./subjects-cards";
import SubjectsInput from "./subjects-input";
import { useSubjects } from "@/store/todos";

type SubjectType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

export default function Navbar() {
  const supabase = createClient();
  const subjects = useSubjects((state) => state.subjects);
  const setSubjects = useSubjects((state) => state.setSubjects);

  useEffect(() => {
    const fetchTodos = async () => {
      const { data: subjects, error } = (await GetSubjects()) as any;
      if (error) console.log("error", error);
      else setSubjects(subjects);
    };

    fetchTodos();
  }, [supabase]);

  return (
    <div className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        <h2 className={styles.navbarTitle}>Materias</h2>
        <section className={styles.SubjectsCardsSection}>
          {subjects.map((subj) => (
            <SubjectsCards subjectName={subj.subject} id={subj.id} />
          ))}
          <SubjectsInput />
        </section>
      </nav>
    </div>
  );
}
