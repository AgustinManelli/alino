"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useSidebarStateStore } from "@/store/useSidebarStateStore";
import { useVerifyAndFetchList } from "@/hooks/todo/lists/useVerifyAndFetchList";
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

  const executedRef = useRef(false);
  const { verifyAndFetchList } = useVerifyAndFetchList();

  const verifyListId = useCallback(
    () => lists.find((elemento) => elemento.list_id === list),
    [lists, list],
  );

  const setList = verifyListId();

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
