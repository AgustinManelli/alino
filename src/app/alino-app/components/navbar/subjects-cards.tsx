"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ColorPicker } from "@/components/color-picker";
import { useLists } from "@/store/lists";
import { Database } from "@/lib/todosSchema";
import { DeleteIcon, SquircleIcon } from "@/lib/ui/icons";
import styles from "./subjects-cards.module.css";
import Counter from "@/components/counter";
import Link from "next/link";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export function SubjectsCards({ list }: { list: ListsType }) {
  const deleteList = useLists((state) => state.deleteList);
  const changeColor = useLists((state) => state.changeColor);
  const origin = window.location.origin;

  const [hover, setHover] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(list.color);

  const handleDelete = () => {
    deleteList(list.id);
    toast.success(`${list.name} eliminado correctamente`);
  };

  const handleSave = async () => {
    toast.success(`Color de ${list.name} cambiado correctamente`);
  };

  const contRef = useRef<HTMLDivElement>(null);

  return (
    <Link
      className={styles.subjectsCardsContainer}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      // style={{
      //   backgroundColor:
      //     hover || listSelected.id === list.id
      //       ? "rgb(240, 240, 240)"
      //       : "transparent",
      //   scale: listSelected.id === list.id ? "1.05" : "1",
      //   boxShadow:
      //     listSelected.id === list.id
      //       ? "rgba(12, 20, 66, 0.1) 0px 4px 12px, rgba(12, 20, 66, 0.08) 0px 30px 80px, rgb(230, 233, 237) 0px 0px 0px 0px inset"
      //       : "",
      // }}
      // ref={contRef}
      href={`${list.name}`}
      as={`${list.name}`}
      // onClick={(e) => {
      //   e.stopPropagation();

      //   if (
      //     contRef.current !== null &&
      //     contRef.current.contains(e.target as Node)
      //   ) {
      //     setListSelected(list);
      //   }
      // }}
    >
      {list.name === "home" ? (
        <SquircleIcon style={{ width: "12px", fill: `${colorTemp}` }} />
      ) : (
        <ColorPicker
          color={colorTemp}
          originalColor={list.color}
          setColor={setColorTemp}
          save={true}
          handleSave={handleSave}
          width={"12px"}
        />
      )}
      <p className={styles.subjectName}>{list.name}</p>
      {list.name !== "home" && (
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
            list.id === "home-tasks-static-alino-app" ? "1" : hover ? "0" : "1",
        }}
      >
        <Counter tasksLength={30} />
      </p>
    </Link>
  );
}
