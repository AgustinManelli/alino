"use client";

import TodoTasksSection from "./todo-tasks-section";
import TodoInput from "./todo-input";
import { SquircleIcon } from "@/lib/ui/icons";
import styles from "./todo.module.css";
import { useLists } from "@/store/lists";
import { Database } from "@/lib/todosSchema";
import { EmojiComponent } from "@/components";
import { Skeleton } from "@/components";
import Manager from "../manager";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function Todo({ params }: { params: { list: string } }) {
  const lists = useLists((state) => state.lists);
  const setList = lists.find(
    (elemento) => elemento.id === params.list
  ) as ListsType;

  return (
    <div className={styles.todoContainerPage}>
      <Manager setList={setList}>
        <section className={styles.todoContainer}>
          <div className={styles.titleContainer}>
            {setList ? (
              setList?.icon !== "" ? (
                <EmojiComponent shortcodes={setList?.icon} size="16px" />
              ) : (
                <SquircleIcon
                  style={{
                    width: "12px",
                    fill: `${setList?.color}`,
                    transition: "fill 0.2s ease-in-out",
                  }}
                />
              )
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Skeleton
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "5px",
                    backgroundColor: "rgb(230,230,230)",
                  }}
                />
                <Skeleton
                  style={{
                    width: "100px",
                    height: "28px",
                    borderRadius: "5px",
                    backgroundColor: "rgb(230,230,230)",
                  }}
                />
              </div>
            )}
            <h2 className={styles.referenceText}>{setList?.name}</h2>
          </div>
          <TodoInput setList={setList} />
        </section>
      </Manager>
      {/* <section className={styles.todoManagerContainer}>
          <TodoTasksSection setList={setList} />
        </section> */}
    </div>
  );
}
