"use client";

import { Database } from "@/lib/schemas/todo-schema";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import Manager from "./manager";

import styles from "./todo.module.css";

type MembershipRow = Database["public"]["Tables"]["list_memberships"]["Row"];
type ListsRow = Database["public"]["Tables"]["lists"]["Row"];
type ListsType = MembershipRow & { list: ListsRow };

export default function Todo({ params }: { params: { list: string } }) {
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
