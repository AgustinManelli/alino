"use client";

import styles from "./subjects-cards.module.css";
import { UpdateSubjectToDB } from "@/lib/todo/actions";
import { useLists } from "@/store/lists";
import { DeleteIcon, SquircleIcon } from "@/lib/ui/icons";
import { useState } from "react";
import { ColorPicker } from "@/components/color-picker";
import { toast } from "sonner";
import { useListSelected } from "@/store/list-selected";
import { useTodo } from "@/store/todo";
import { SubjectSchema } from "@/lib/subject-schema";

type SubjectsType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

export function SubjectsCards({ subject }: { subject: SubjectsType }) {
  const tasks = useTodo((state) => state.tasks);
  const deleteList = useLists((state) => state.deleteList);
  const getLists = useLists((state) => state.getLists);
  const [hover, setHover] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(subject.color);

  const setListSelected = useListSelected((state) => state.setListSelected);
  const listSelected = useListSelected((state) => state.listSelected);

  const handleDelete = () => {
    if (subject.id === listSelected.id) {
      setListSelected(subject);
    }
    deleteList(subject.id);
    getLists();
  };

  const handleSave = async () => {
    await UpdateSubjectToDB(subject.id, colorTemp);
    toast(`Color de ${subject.subject} cambiado correctamente`);
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
      {/* <div
        style={{
          opacity: hover || subjectId === subject.id ? "1" : "0",
          transition: "opacity 0.3s ease-in-out",
          width: "20px",
          height: "20px",
          backgroundColor: `${subject.color}`,
          position: "absolute",
          left: "6px",
          filter: "blur(30px) saturate(200%)",
          zIndex: "0",
        }}
      ></div> */}
      {/* <div
        style={{
          width: "12px",
          height: "12px",
          backgroundColor: `${color}`,
          position: "relative",
          zIndex: "0",
          borderRadius: "5px",
        }}
      ></div> */}
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
          style={{
            opacity: hover ? "1" : "0",
            position: "absolute",
            right: "10px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            backgroundColor: "transparent",
            transition: "opacity 0.2s ease-in-out",
            zIndex: "1",
          }}
        >
          <DeleteIcon
            style={{ stroke: "#1c1c1c", width: "15px", strokeWidth: "1.5" }}
          />
        </button>
      )}
      <p
        style={{
          opacity:
            subject.id === "home-tasks-static-alino-app"
              ? "1"
              : hover
                ? "0"
                : "1",
          position: "absolute",
          right: "10px",
          backgroundColor: "transparent",
          transition: "opacity 0.2s ease-in-out",
          width: "15px",
          height: "15px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: "0",
          color: "rgb(200,200,200)",
        }}
      >
        {tasks.filter((element) => element.subject_id === subject.id).length}
      </p>
    </div>
  );
}
