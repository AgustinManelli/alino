"use client";

import styles from "./subjects-cards.module.css";
import { UpdateSubjectToDB } from "@/lib/todo/actions";
import { useSubjects } from "@/store/subjects";
import { DeleteIcon, SquircleIcon } from "@/lib/ui/icons";
import { useState } from "react";
import { ColorPicker } from "@/components/color-picker";
import { toast } from "sonner";
import { useSubjectSelected } from "@/store/subject-selected";
import { useTodo } from "@/store/todo";
import { SubjectSchema } from "@/lib/subject-schema";

type SubjectsType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

export function SubjectsCards({ subject }: { subject: SubjectsType }) {
  const tasks = useTodo((state) => state.tasks);
  const deleteSubject = useSubjects((state) => state.deleteSubject);
  const getSubject = useSubjects((state) => state.getSubject);
  const [hover, setHover] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(subject.color);
  const [wait, setWait] = useState<boolean>(false);

  const setSubjects = useSubjectSelected((state) => state.setSubjects);
  const setSubjectId = useSubjectSelected((state) => state.setSubjectId);
  const setSubjectColor = useSubjectSelected((state) => state.setSubjectColor);
  const subjectId = useSubjectSelected((state) => state.subjectId);

  const handleDelete = () => {
    if (subject.id === subjectId) {
      setSubjects("inicio");
      setSubjectId("home-tasks-static-alino-app");
      setSubjectColor("#87189d");
    }
    deleteSubject(subject.id);
    getSubject();
  };
  const handleSave = async () => {
    setWait(true);
    await UpdateSubjectToDB(subject.id, colorTemp);
    toast(`Color de ${subject.subject} cambiado correctamente`);
    setWait(false);
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
          hover || subjectId === subject.id
            ? "rgb(240, 240, 240)"
            : "transparent",
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSubjects(subject.subject);
        setSubjectId(subject.id);
        setSubjectColor(subject.color);
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
          setColor={setColorTemp}
          save={true}
          handleSave={handleSave}
          width={"12px"}
          height={"12px"}
          wait={wait}
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
        }}
      >
        {tasks.filter((element) => element.subject_id === subject.id).length}
      </p>
    </div>
  );
}
