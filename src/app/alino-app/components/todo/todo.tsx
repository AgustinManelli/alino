"use client";

import { ListsType } from "@/lib/schemas/todo-schema";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { Manager } from "./manager";

import styles from "./todo.module.css";

export function Todo({ params }: { params: { list: string } }) {
  const lists = useTodoDataStore((state) => state.lists);

  const setList = lists.find(
    (elemento) => elemento.list_id === params.list
  ) as ListsType;

  return (
    <div className={styles.todoContainerPage}>
      <Manager setList={setList} />
    </div>
  );
}
