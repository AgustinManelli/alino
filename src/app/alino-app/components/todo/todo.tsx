"use client";

import TodoInput from "./todo-input";
import { SquircleIcon } from "@/components/ui/icons/icons";
import styles from "./todo.module.css";
import { useLists } from "@/store/useLists";
import { Database } from "@/lib/schemas/todo-schema";
import { EmojiMartComponent } from "@/components/ui/emoji-mart/emoji-mart-component";
import { Skeleton } from "@/components/ui/skeleton";
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
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                  }}
                >
                  <EmojiMartComponent shortcodes={setList?.icon} size="20px" />
                </div>
              ) : (
                <SquircleIcon
                  style={{
                    width: "20px",
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
    </div>
  );
}
