"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useSidebarStateStore } from "@/store/useSidebarStateStore";
import { Manager } from "./manager";

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

  const verifyAndFetchList = useTodoDataStore(
    (state) => state.verifyAndFetchList,
  );

  const setList = useMemo(
    () => lists.find((elemento) => elemento.list_id === list),
    [lists, list],
  );

  useEffect(() => {
    if (pendingListId === list) {
      setPendingListId(null);
    }
  }, [pendingListId, list, setPendingListId]);

  useEffect(() => {
    const validate = async () => {
      if (!initialFetch) return;

      if (!setList) {
        const found = await verifyAndFetchList(list);
        if (!found) {
          router.replace("/alino-app");
          return;
        }
        return;
      }

      setIsValidating(false);
    };

    validate();
  }, [initialFetch, list, setList, verifyAndFetchList, router]);

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
