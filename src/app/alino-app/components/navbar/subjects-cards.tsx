"use client";

import { DeleteSubjectToDB, GetSubjects } from "@/lib/todo/actions";
import styles from "./subjects-cards.module.css";
import { useSubjects } from "@/store/todos";
import { DeleteIcon } from "@/lib/ui/icons";

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
          filter: "blur(40px) saturate(200%)",
          zIndex: "0",
        }}
      ></div>
      <div
        style={{
          width: "12px",
          height: "12px",
          backgroundColor: `${color}`,
          position: "relative",
          zIndex: "0",
          borderRadius: "5px",
        }}
      ></div>
      <p>{subjectName}</p>
      <button
        onClick={handleDelete}
        style={{
          position: "absolute",
          right: "10px",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        <DeleteIcon style={{ stroke: "#1c1c1c", width: "20px" }} />
      </button>
    </div>
  );
}
