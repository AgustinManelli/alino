"use client";

import { useRouter } from "next/navigation";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { Manager } from "./manager";

import { ListsType } from "@/lib/schemas/todo-schema";
import styles from "./todo.module.css";
import { useEffect, useMemo, useState } from "react";

export const Todo = ({ list }: { list: string }) => {
  const router = useRouter();
  const lists = useTodoDataStore((state) => state.lists);
  const initialFetch = useTodoDataStore((state) => state.initialFetch);
  const [isValidating, setIsValidating] = useState(true);

  const setList = useMemo(
    () =>
      lists.find((elemento) => elemento.list_id === list) as
        | ListsType
        | undefined,
    [lists, list]
  );

  useEffect(() => {
    if (!initialFetch) return;
    if (!setList) {
      router.replace("/alino-app");
      return;
    }
    setIsValidating(false);
  }, [initialFetch, lists]);

  if (!initialFetch || isValidating) {
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
  // return (
  //   <section
  //     style={{
  //       width: "100%",
  //       height: "100%",
  //       display: "flex",
  //       justifyContent: "center",
  //       alignItems: "center",
  //       flexDirection: "column",
  //       gap: "10px",
  //     }}
  //   >
  //     <div
  //       style={{
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         flexDirection: "column",
  //         color: "var(--text)",
  //       }}
  //     >
  //       <p>Ups. ¡Nada por aquí!</p>
  //       <p>La lista que buscas no fue encontrada.</p>
  //     </div>
  //     <button
  //       onClick={(e) => {
  //         e.preventDefault();
  //         e.stopPropagation();
  //         router.replace("/alino-app");
  //       }}
  //       style={{
  //         background: "none",
  //         border: "none",
  //         backgroundColor: "var(--background-over-container-hover)",
  //         color: "var(--text)",
  //         padding: "10px 15px",
  //         borderRadius: "15px",
  //         cursor: "pointer",
  //       }}
  //     >
  //       Volver a la home
  //     </button>
  //   </section>
  // );
};
