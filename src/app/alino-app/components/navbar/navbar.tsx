"use client";

import { useEffect, useState } from "react";
import styles from "./navbar.module.css";
import { SubjectSchema } from "@/lib/subject-schema";
import { createClient } from "@/utils/supabase/client";
import { GetSubjects } from "@/lib/todo/actions";
import { SubjectsCards } from "./subjects-cards";
import SubjectsInput from "./subjects-input";

type SubjectType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

export default function Navbar() {
  const supabase = createClient();
  const [todos, setTodos] = useState<SubjectType[]>([]);

  useEffect(() => {
    const fetchTodos = async () => {
      const { data: subjects, error } = await GetSubjects();
      if (error) console.log("error", error);
      else setTodos(subjects);
    };

    fetchTodos();
  }, [supabase]);

  return (
    <div className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        <h2 className={styles.navbarTitle}>Materias</h2>
        <section className={styles.SubjectsCardsSection}>
          {todos.map((subj) => (
            <SubjectsCards subjectName={subj.subject} id={subj.id} />
          ))}
          <SubjectsInput />
        </section>
      </nav>
    </div>
  );
}
