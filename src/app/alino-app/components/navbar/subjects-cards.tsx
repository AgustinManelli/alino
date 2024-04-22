"use client";

import { DeleteSubjectToDB, UpdateSubjectToDB } from "@/lib/todo/actions";
import styles from "./subjects-cards.module.css";
import { useSubjects } from "@/store/todos";
import { DeleteIcon } from "@/lib/ui/icons";
import { useState } from "react";
import { ColorPicker } from "@/components/color-picker";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function SubjectsCards({
  subjectName,
  id,
  color,
}: {
  subjectName: string;
  id: number;
  color: string;
}) {
  const deleteSubject = useSubjects((state) => state.deleteSubject);
  const [hover, setHover] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(color);
  const [wait, setWait] = useState<boolean>(false);
  const handleDelete = async () => {
    deleteSubject(id);
    await DeleteSubjectToDB(id.toString());
  };
  const handleSave = async () => {
    setWait(true);
    await UpdateSubjectToDB(id.toString(), colorTemp);
    toast(`Color de ${subjectName} cambiado correctamente`);
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
      style={{ backgroundColor: hover ? "rgb(240, 240, 240)" : "transparent" }}
    >
      {/* <div
        style={{
          opacity: hover ? "1" : "0",
          transition: "opacity 0.3s ease-in-out",
          width: "20px",
          height: "20px",
          backgroundColor: `${color}`,
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
      <ColorPicker
        color={colorTemp}
        setColor={setColorTemp}
        save={true}
        handleSave={handleSave}
        width={"12px"}
        height={"12px"}
        wait={wait}
      />
      <p className={styles.subjectName}>{subjectName}</p>
      <button
        onClick={handleDelete}
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
    </div>
  );
}
