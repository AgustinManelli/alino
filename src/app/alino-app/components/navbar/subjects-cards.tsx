"use client";

import { DeleteSubjectToDB } from "@/lib/todo/actions";
import styles from "./subjects-cards.module.css";
import { useSubjects } from "@/store/todos";
import { DeleteIcon } from "@/lib/ui/icons";
import { useState } from "react";

export function SubjectsCards({
  subjectName,
  id,
  color,
}: {
  subjectName: string;
  id: number;
  color: string;
}) {
  const deleteSubject = useSubjects((state) => state.deleteSubject);
  const [hover, setHover] = useState<boolean>(false);
  const handleDelete = async () => {
    deleteSubject(id);
    await DeleteSubjectToDB(id.toString());
  };

  return (
    <div
      className={styles.subjectsCardsContainer}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      style={{ backgroundColor: hover ? "rgb(240, 240, 240)" : "transparent" }}
    >
      <div
        style={{
          opacity: hover ? "1" : "0",
          transition: "opacity 0.3s ease-in-out",
          width: "50px",
          height: "50px",
          backgroundColor: `${color}`,
          position: "absolute",
          left: "-25px",
          filter: "blur(70px) saturate(200%)",
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
      <p className={styles.subjectName}>{subjectName}</p>
      <button
        onClick={handleDelete}
        style={{
          opacity: hover ? "1" : "0",
          position: "absolute",
          right: "10px",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          backgroundColor: "transparent",
          transition: "opacity 0.2s ease-in-out",
        }}
      >
        <DeleteIcon
          style={{ stroke: "#1c1c1c", width: "15px", strokeWidth: "1.5" }}
        />
      </button>
    </div>
  );
}
