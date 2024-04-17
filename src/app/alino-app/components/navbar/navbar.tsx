"use client";

import { useEffect, useState } from "react";
import styles from "./navbar.module.css";
import { SubjectSchema } from "@/lib/subject-schema";
import { createClient } from "@/utils/supabase/client";
import { GetSubjects } from "@/lib/todo/actions";
import { SubjectsCards } from "./subjects-cards";
import SubjectsInput from "./subjects-input";
import { useSubjects } from "@/store/todos";
import { LoadingIcon } from "@/lib/ui/icons";

type SubjectType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

const SubjectAddCardSkeleton = () => {
  return (
    <div className={styles.subjectAddCardSkeletonContainer}>
      <div className={styles.subjectAddCardSkeleton}></div>
    </div>
  );
};

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
            ? [<SubjectAddCardSkeleton />, <SubjectAddCardSkeleton />]
            : subjects.map((subj) => (
                <SubjectsCards
                  subjectName={subj.subject}
                  id={subj.id}
                  color={subj.color}
                />
              ))}
          {waiting ? (
            <div className={styles.subjectAddCardSkeletonContainer}>
              <div className={styles.subjectAddCardSkeleton}></div>
              <LoadingIcon
                style={{
                  width: "20px",
                  height: "auto",
                  stroke: "#000",
                  strokeWidth: "3",
                  opacity: "0.2",
                }}
              />
            </div>
          ) : (
            ""
          )}
          <SubjectsInput setWaiting={setWaiting} />
        </section>
      </nav>
    </div>
  );
}
