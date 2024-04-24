"use client";

import { UpdateSubjectToDB } from "@/lib/todo/actions";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ColorPicker } from "@/components/color-picker";
import { useListSelected } from "@/store/list-selected";
import { useLists } from "@/store/lists";
import { useTodo } from "@/store/todo";
import { SubjectSchema } from "@/lib/subject-schema";
import { DeleteIcon, SquircleIcon } from "@/lib/ui/icons";
import styles from "./subjects-cards.module.css";

type ListsType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

export function SubjectsCards({ subject }: { subject: ListsType }) {
  const tasks = useTodo((state) => state.tasks);
  const deleteList = useLists((state) => state.deleteList);
  const getLists = useLists((state) => state.getLists);

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
    getLists();
    toast.success(`${subject.subject} eliminado correctamente`);
  };

  const handleSave = async () => {
    await UpdateSubjectToDB(subject.id, colorTemp);
    toast.success(`Color de ${subject.subject} cambiado correctamente`);
  };

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
      }}
      onClick={(e) => {
        e.stopPropagation();
        setListSelected(subject);
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
            style={{ stroke: "#1c1c1c", width: "15px", strokeWidth: "1.5" }}
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
        {tasks.filter((element) => element.subject_id === subject.id).length}
      </p>
    </div>
  );
}
