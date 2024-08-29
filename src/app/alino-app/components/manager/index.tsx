"use client";

import styles from "./manager.module.css";
import { useLists } from "@/store/lists";
import TodoCard from "../todo/todo-card";
import { Database } from "@/lib/todosSchema";
import { useEffect } from "react";
import { useBlurredFxStore } from "@/store/useBlurredFx";
type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function Manager({
  h,
  children,
  setList,
}: {
  h?: boolean;
  children?: React.ReactNode;
  setList?: ListsType;
}) {
  const lists = useLists((state) => state.lists);
  const setBlurredFx = useBlurredFxStore((state) => state.setColor);

  useEffect(() => {
    if (setList?.data.color !== undefined) setBlurredFx(setList?.data?.color);
  });

  return (
    <div className={styles.container}>
      <section className={styles.section1}>{children}</section>
      <section className={styles.section2}>
        <div className={styles.tasks}>
          {h && !setList
            ? lists?.map((list) =>
                list?.tasks?.map((task) => <TodoCard task={task} />)
              )
            : setList?.tasks?.map((task) => <TodoCard task={task} />)}
        </div>
      </section>
    </div>
  );
}
