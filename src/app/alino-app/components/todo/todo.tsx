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
        backgroundColor: "#fff",
        width: "100%",
        height: "100%",
        borderRadius: "20px",
        display: "flex",
        justifyContent: "start",
        alignItems: "center",
        flexDirection: "column",
        padding: "25px",
      }}
    >
      <section>
        <h2>{subjectName}</h2>
      </section>
      <TodoInput />
      <TodoTasksSection tasks={tasks} />
    </div>
  );
}
