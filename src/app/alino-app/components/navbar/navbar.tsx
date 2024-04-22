"use client";

import { useEffect, useState } from "react";
import styles from "./navbar.module.css";
import { createClient } from "@/utils/supabase/client";
import { GetSubjects } from "@/lib/todo/actions";
import { SubjectsCards } from "./subjects-cards";
import SubjectsInput from "./subjects-input";
import { useSubjects } from "@/store/subjects";
import Skeleton from "@/components/skeleton";
import { AnimatePresence, motion } from "framer-motion";

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

  const container = {
    hidden: { opacity: 1, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0, scale: 0 },
  };
  const item = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
    },
    exit: { opacity: 0, scale: 0 },
  };

  return (
    <div className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        {/* <h2 className={styles.navbarTitle}>Materias</h2> */}
        <section className={styles.SubjectsCardsSection}>
          {fetching ? (
            [
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
                delay={0.15}
              />,
              <Skeleton
                style={{
                  width: "100%",
                  height: "45px",
                  borderRadius: "15px",
                }}
                delay={0.3}
              />,
            ]
          ) : (
            <AnimatePresence>
              <motion.div
                variants={container}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={styles.divCardsContainer}
              >
                <motion.div variants={item}>
                  <SubjectsCards
                    subjectName={"inicio"}
                    id={"home-tasks-static-alino-app"}
                    color={"#87189d"}
                    type={"home"}
                  />
                </motion.div>
                {subjects.map((subj) => (
                  <motion.div variants={item} key={subj.id}>
                    <SubjectsCards
                      subjectName={subj.subject}
                      id={subj.id}
                      color={subj.color}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
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
