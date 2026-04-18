"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useSidebarStateStore } from "@/store/useSidebarStateStore";
import { useVerifyAndFetchList } from "@/hooks/todo/lists/useVerifyAndFetchList";
import { Manager } from "./manager";

import styles from "./todo.module.css";

export const Todo = ({ list }: { list: string }) => {
  const router = useRouter();

  const setList = useTodoDataStore((state) =>
    state.lists.find((elemento) => elemento.list_id === list),
  );
  const initialFetch = useTodoDataStore((state) => state.initialFetch);

  const pendingListId = useSidebarStateStore((state) => state.pendingListId);
  const setPendingListId = useSidebarStateStore(
    (state) => state.setPendingListId,
  );

  const [isValidating, setIsValidating] = useState(
    () => pendingListId !== list,
  );
  const { verifyAndFetchList } = useVerifyAndFetchList();

  useEffect(() => {
    if (pendingListId === list) {
      setPendingListId(null);
    }
  }, [pendingListId, list, setPendingListId]);

  useEffect(() => {
    let isMounted = true;

    const validate = async () => {
      if (!initialFetch) return;

      if (setList) {
        if (isMounted) setIsValidating(false);
        return;
      }
      const found = await verifyAndFetchList(list);

      if (!isMounted) return;

      if (!found) {
        router.replace("/alino-app");
      } else {
        setIsValidating(false);
      }
    };

    validate();

    return () => {
      isMounted = false;
    };
  }, [initialFetch, list, setList, verifyAndFetchList, router]);

  if (isValidating) return null;
  if (!setList) return null;

  return (
    <div className={styles.todoContainerPage}>
      <Manager setList={setList} />
    </div>
  );
};
