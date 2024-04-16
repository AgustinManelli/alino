"use client";

import styles from "./subjects-cards.module.css";

export function SubjectsCards({
  subjectName,
  id,
}: {
  subjectName: string;
  id: number;
}) {
  return (
    <div className={styles.subjectsCardsContainer}>
      <p>{subjectName}</p>
    </div>
  );
}
