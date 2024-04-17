"use client";

import { useEffect, useState } from "react";
import styles from "./navbar.module.css";
import { createClient } from "@/utils/supabase/client";
import { GetSubjects } from "@/lib/todo/actions";
import { SubjectsCards } from "./subjects-cards";
import SubjectsInput from "./subjects-input";
import { useSubjects } from "@/store/todos";
import Skeleton from "@/components/skeleton";

// import { SubjectSchema } from "@/lib/subject-schema";
// type SubjectType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

export default function Navbar() {
  const supabase = createClient();
  const subjects = useSubjects((state) => state.subjects);
  const setSubjects = useSubjects((state) => state.setSubjects);
  const [waiting, setWaiting] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);

  useEffect(() => {
    const fetchTodos = async () => {
      setFetching(true);
      const { data: subjects, error } = (await GetSubjects()) as any;
      if (error) console.log("error", error);
      else setSubjects(subjects);
      setFetching(false);
    };
    fetchTodos();
  }, [supabase]);

  return (
    <div className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        <h2 className={styles.navbarTitle}>Materias</h2>
        <section className={styles.SubjectsCardsSection}>
          {fetching
            ? [
                <Skeleton
                  style={{
                    width: "100%",
                    height: "45px",
                    borderRadius: "15px",
                  }}
                />,
                <Skeleton
                  style={{
                    width: "100%",
                    height: "45px",
                    borderRadius: "15px",
                  }}
                />,
              ]
            : subjects.map((subj) => (
                <SubjectsCards
                  subjectName={subj.subject}
                  id={subj.id}
                  color={subj.color}
                />
              ))}
          {waiting ? (
            <Skeleton
              style={{
                width: "100%",
                height: "45px",
                borderRadius: "15px",
              }}
            />
          ) : (
            ""
          )}
          <SubjectsInput setWaiting={setWaiting} />
        </section>
      </nav>
    </div>
  );
}
