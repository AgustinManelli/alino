"use client";

import { Database } from "@/lib/schemas/todo-schema";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import Manager from "./manager";

import styles from "./todo.module.css";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function Todo({ params }: { params: { list: string } }) {
  const lists = useTodoDataStore((state) => state.lists);
  const setList = lists.find(
    (elemento) => elemento.id === params.list
  ) as ListsType;

  if (!setList) console.log("si");

  return (
    <div className={styles.todoContainerPage}>
      <Manager setList={setList} />
    </div>
  );
}
