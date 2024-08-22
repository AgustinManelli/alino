"use client";

import TodoTasksSection from "./todo-tasks-section";
import TodoInput from "./todo-input";
import { SquircleIcon } from "@/lib/ui/icons";
import styles from "./todo.module.css";
import { useLists } from "@/store/lists";
import { Database } from "@/lib/todosSchema";
import { useRouter } from "next/navigation";
import EmojiComponent from "@/components/emoji-mart-component";
import Skeleton from "@/components/skeleton";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function Todo({ params }: { params: { list: string } }) {
  const lists = useLists((state) => state.lists);
  const setList = lists.find(
    (elemento) => elemento.name === params.list
  ) as ListsType;

  /*const router = useRouter();

  if (lists && !setList) {
    router.push(`${location.origin}/alino-app/home`);
  }*/

  return (
    <div className={styles.todoContainerPage}>
      <div
        className={styles.blurredReference}
        style={{
          boxShadow: `${setList ? setList?.data.color : "#87189d"} 20px 200px 240px`,
        }}
      ></div>
      <div className={styles.container}>
        <section className={styles.todoContainer}>
          {setList ? (
            setList?.data.icon !== "" ? (
              <EmojiComponent shortcodes={setList?.data.icon} size="16px" />
            ) : (
              <SquircleIcon
                style={{
                  width: "12px",
                  fill: `${setList?.data.color}`,
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
                style={{ width: "16px", height: "16px", borderRadius: "5px" }}
              />
              <Skeleton
                style={{ width: "100px", height: "28px", borderRadius: "5px" }}
              />
            </div>
          )}
          <h2 className={styles.referenceText}>{setList?.data.type}</h2>
        </section>
        <section className={styles.todoManagerContainer}>
          <TodoInput setList={setList} />
          <TodoTasksSection setList={setList} />
        </section>
      </div>
    </div>
  );
}
