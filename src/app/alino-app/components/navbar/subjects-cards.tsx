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
    <div
      className={styles.subjectsCardsContainer}
      style={{ backgroundColor: `${color}` }}
    >
      <p>{subjectName}</p>
      <button onClick={handleDelete}>delete</button>
    </div>
  );
}
