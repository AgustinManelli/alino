"use client";
import { useSubjectSelected } from "@/store/subject-selected";
import TodoInput from "./todo-input";
export default function Todo() {
  const subjectName = useSubjectSelected((state) => state.subjectName);
  const subjectColor = useSubjectSelected((state) => state.subjectColor);
  return (
    <div
      style={{
        backgroundColor: "#fff",
        width: "100%",
        height: "100%",
        borderRadius: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <section>
        <h2>{subjectName}</h2>
      </section>
      <TodoInput />
    </div>
  );
}
