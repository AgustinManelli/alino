"use client";

import { DeleteSubjectToDB, GetSubjects } from "@/lib/todo/actions";
import styles from "./subjects-cards.module.css";
import { useSubjects } from "@/store/todos";

export function SubjectsCards({
  subjectName,
  id,
  color,
}: {
  subjectName: string;
  id: number;
  color: string;
}) {
  const setSubjects = useSubjects((state) => state.setSubjects);
  const handleDelete = async () => {
    await DeleteSubjectToDB(id.toString());

    const { data: getSubjects } = (await GetSubjects()) as any;
    setSubjects(getSubjects);
  };
  return (
    <div className={styles.subjectsCardsContainer}>
      <div
        style={{
          width: "50px",
          height: "50px",
          backgroundColor: `${color}`,
          position: "absolute",
          left: "-25px",
          filter: "blur(50px)",
          zIndex: "0",
        }}
      ></div>
      <p>{subjectName}</p>
      <button
        onClick={handleDelete}
        style={{
          position: "absolute",
          right: "7px",
          border: "none",
          backgroundColor: "#fff",
          width: "55px",
          height: "35px",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        delete
      </button>
    </div>
  );
}
