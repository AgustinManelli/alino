"use client";
import { useSubjectSelected } from "@/store/subject-selected";
import { useTodo } from "@/store/todo";
import TodoInput from "./todo-input";
import TodoTasksSection from "./todo-tasks-section";
import { GetTasks } from "@/lib/todo/actions";
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";

export default function Todo() {
  const subjectName = useSubjectSelected((state) => state.subjectName);
  const subjectColor = useSubjectSelected((state) => state.subjectColor);
  const setTasks = useTodo((state) => state.setTasks);
  const tasks = useTodo((state) => state.tasks);
  const supabase = createClient();
  useEffect(() => {
    const fetchTodos = async () => {
      const { data: tasks, error } = (await GetTasks()) as any;
      if (error) console.log("error", error);
      else setTasks(tasks);
    };
    fetchTodos();
  }, [supabase]);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "20px",
        display: "flex",
        justifyContent: "start",
        alignItems: "center",
        flexDirection: "column",
        padding: "25px",
        gap: "20px",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "60%",
          height: "260px",
          top: "0px",
          pointerEvents: "none",
          borderRadius: "100%",
          opacity: "0.15",
          boxShadow: `${subjectColor} 20px 250px 300px`,
          transform: "translateY(-175%) translateZ(0px)",
          transition: "opacity 1.5s cubic-bezier(0.17, 0.17, 0, 1) 0s",
        }}
      ></div>
      <section
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "start",
          gap: "10px",
          width: "100%",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            backgroundColor: `${subjectColor}`,
            borderRadius: "5px",
          }}
        ></div>
        <h2>{subjectName}</h2>
      </section>
      <section
        style={{
          position: "relative",
          width: "100%",
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          flexDirection: "column",
          gap: "30px",
        }}
      >
        <TodoInput />
        <TodoTasksSection tasks={tasks} />
      </section>
    </div>
  );
}
