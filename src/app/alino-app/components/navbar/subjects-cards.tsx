"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ColorPicker } from "@/components/color-picker";
import { useListSelected } from "@/store/list-selected";
import { useLists } from "@/store/lists";
import { useTodo } from "@/store/todo";
import { SubjectSchema } from "@/lib/subject-schema";
import { DeleteIcon, SquircleIcon } from "@/lib/ui/icons";
import styles from "./subjects-cards.module.css";
import Counter from "@/components/counter";

type ListsType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

export function SubjectsCards({ subject }: { subject: ListsType }) {
  const tasks = useTodo((state) => state.tasks);
  const deleteList = useLists((state) => state.deleteList);
  const changeColor = useLists((state) => state.changeColor);

  const [hover, setHover] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(subject.color);

  const setListSelected = useListSelected((state) => state.setListSelected);
  const listSelected = useListSelected((state) => state.listSelected);

  const handleDelete = () => {
    if (subject.id === listSelected.id) {
      setListSelected({
        id: "home-tasks-static-alino-app",
        user_id: "null",
        subject: "inicio",
        color: "#87189d",
        inserted_at: "null",
      });
    }
    deleteList(subject.id);
    toast.success(`${subject.subject} eliminado correctamente`);
  };

  const handleSave = async () => {
    await changeColor(subject.id, colorTemp);
    toast.success(`Color de ${subject.subject} cambiado correctamente`);
  };

  const contRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={styles.subjectsCardsContainer}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      style={{
        backgroundColor:
          hover || listSelected.id === subject.id
            ? "rgb(240, 240, 240)"
            : "transparent",
        scale: listSelected.id === subject.id ? "1.05" : "1",
        boxShadow:
          listSelected.id === subject.id
            ? "rgba(12, 20, 66, 0.1) 0px 4px 12px, rgba(12, 20, 66, 0.08) 0px 30px 80px, rgb(230, 233, 237) 0px 0px 0px 0px inset"
            : "",
      }}
      ref={contRef}
      onClick={(e) => {
        e.stopPropagation();

        if (
          contRef.current !== null &&
          contRef.current.contains(e.target as Node)
        ) {
          setListSelected(subject);
        }
      }}
    >
      {subject.id === "home-tasks-static-alino-app" ? (
        <SquircleIcon style={{ width: "12px", fill: `${colorTemp}` }} />
      ) : (
        <ColorPicker
          color={colorTemp}
          originalColor={subject.color}
          setColor={setColorTemp}
          save={true}
          handleSave={handleSave}
          width={"12px"}
        />
      )}
      <p className={styles.subjectName}>{subject.subject}</p>
      {subject.id === "home-tasks-static-alino-app" ? (
        ""
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className={styles.button}
          style={{
            opacity: hover ? "1" : "0",
          }}
        >
          <DeleteIcon
            style={{ stroke: "#1c1c1c", width: "15px", strokeWidth: "2" }}
          />
        </button>
      )}
      <p
        className={styles.counter}
        style={{
          opacity:
            subject.id === "home-tasks-static-alino-app"
              ? "1"
              : hover
                ? "0"
                : "1",
        }}
      >
        <Counter
          tasksLength={
            subject.id === "home-tasks-static-alino-app"
              ? tasks.filter((element) => !element.subject_id).length
              : tasks.filter((element) => element.subject_id === subject.id)
                  .length
          }
        />
      </p>
    </div>
  );
}
