"use client";

import { useEffect, useState, useTransition } from "react";
import styles from "./navbar.module.css";
import { createClient } from "@/utils/supabase/client";
import { GetSubjects } from "@/lib/todo/actions";
import { SubjectsCards } from "./subjects-cards";
import SubjectsInput from "./subjects-input";
import { useSubjects } from "@/store/subjects";
import Skeleton from "@/components/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

// import { SubjectSchema } from "@/lib/subject-schema";
// type SubjectType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

const containerFMVariant = {
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

const itemFMVariant = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
  },
  exit: { opacity: 0, scale: 0 },
};

export default function Navbar() {
  const supabase = createClient();

  const [waiting, setWaiting] = useState<boolean>(false);
  const [initialFetching, setInitialFetching] = useState<boolean>(true);

  const subjects = useSubjects((state) => state.subjects);
  const setSubjects = useSubjects((state) => state.setSubjects);

  const fetchTodos = async () => {
    setInitialFetching(true);
    const { data: subjects, error } = (await GetSubjects()) as any;
    if (error) toast(error);
    else setSubjects(subjects);
    setInitialFetching(false);
  };

  useEffect(() => {
    fetchTodos();
  }, [supabase]);

  return (
    <aside className={styles.navbarContainer}>
      <div className={styles.navbar}>
        <section className={styles.SubjectsCardsSection}>
          {initialFetching ? (
            Array(4)
              .fill(null)
              .map((_, index) => (
                <Skeleton
                  style={{
                    width: "100%",
                    height: "45px",
                    borderRadius: "15px",
                  }}
                  delay={index * 0.15}
                  key={index}
                />
              ))
          ) : (
            <AnimatePresence>
              <motion.div
                variants={containerFMVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={styles.divCardsContainer}
              >
                <motion.div variants={itemFMVariant}>
                  <SubjectsCards
                    subjectName={"inicio"}
                    id={"home-tasks-static-alino-app"}
                    color={"#87189d"}
                    type={"home"}
                  />
                </motion.div>
                {subjects.map((subj) => (
                  <motion.div variants={itemFMVariant} key={subj.id}>
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
      </div>
    </aside>
  );
}
