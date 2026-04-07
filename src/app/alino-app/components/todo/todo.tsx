"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useSidebarStateStore } from "@/store/useSidebarStateStore";
import { Manager } from "./manager";

import { ListsType } from "@/lib/schemas/database.types";
import styles from "./todo.module.css";

export const Todo = ({ list }: { list: string }) => {
  const router = useRouter();
  const lists = useTodoDataStore((state) => state.lists);
  const initialFetch = useTodoDataStore((state) => state.initialFetch);
  const pendingListId = useSidebarStateStore((state) => state.pendingListId);
  const setPendingListId = useSidebarStateStore(
    (state) => state.setPendingListId,
  );

  const [isValidating, setIsValidating] = useState(
    () => pendingListId !== list,
  );

  const setList = useMemo(
    () =>
      lists.find((elemento) => elemento.list_id === list) as
        | ListsType
        | undefined,
    [lists, list],
  );

  useEffect(() => {
    if (pendingListId === list) {
      setPendingListId(null);
    }
  }, []);

  useEffect(() => {
    if (!isValidating) return;
    if (!initialFetch) return;
    if (!setList) {
      router.replace("/alino-app");
      return;
    }
    setIsValidating(false);
  }, [initialFetch, lists]);

  useEffect(() => {
    if (!initialFetch || isValidating) return;
    if (!setList) {
      router.replace("/alino-app");
    }
  }, [lists]);

  if (isValidating) {
    return null;
  }

  if (setList) {
    return (
      <div className={styles.todoContainerPage}>
        <Manager setList={setList} />
      </div>
    );
  }
  return null;
};
