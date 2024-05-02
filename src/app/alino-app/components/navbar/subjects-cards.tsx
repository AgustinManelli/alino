"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ColorPicker } from "@/components/color-picker";
import { useLists } from "@/store/lists";
import { Database } from "@/lib/todosSchema";
import { DeleteIcon, HomeIcon2 } from "@/lib/ui/icons";
import styles from "./subjects-cards.module.css";
import Counter from "@/components/counter";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export function SubjectsCards({ list }: { list: ListsType }) {
  const deleteList = useLists((state) => state.deleteList);
  const changeColor = useLists((state) => state.changeColor);

  const pathname = usePathname();
  const router = useRouter();

  const [hover, setHover] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(list.data.color);

  const handleDelete = async () => {
    await deleteList(list.id);
    if (pathname === `/alino-app/${list.name}`) {
      router.push(`${location.origin}/alino-app/home`);
    }
    toast.success(`${list.name} eliminado correctamente`);
  };

  const handleSave = async () => {
    await changeColor(list.data, colorTemp, list.id);
    toast.success(`Color de ${list.name} cambiado correctamente`);
  };

  // const contRef = useRef<HTMLDivElement>(null);

  return (
    <Link
      className={styles.subjectsCardsContainer}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      style={{
        backgroundColor:
          hover || pathname === `/alino-app/${list.name}`
            ? "rgb(250, 250, 250)"
            : "transparent",
      }}
      // ref={contRef}
      href={`${location.origin}/alino-app/${list.name}`}
      as={`${location.origin}/alino-app/${list.name}`}
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
      <div
        className={styles.cardFx}
        style={{
          backgroundColor:
            hover || pathname === `/alino-app/${list.name}` || hover
              ? `${list.data.color}`
              : "transparent",
        }}
      ></div>
      <div className={styles.identifierContainer}>
        {list.name === "home" ? (
          // <SquircleIcon style={{ width: "12px", fill: `${colorTemp}` }} />
          <HomeIcon2
            style={{
              width: "14px",
              height: "14px",
              strokeWidth: "2",
              stroke: "#1c1c1c",
            }}
          />
        ) : (
          <ColorPicker
            color={colorTemp}
            originalColor={list.data.color}
            setColor={setColorTemp}
            save={true}
            handleSave={handleSave}
            width={"12px"}
          />
        )}
      </div>
      <p className={styles.subjectName}>{list.data.type}</p>
      {list.name !== "home" && (
        <button
          onClick={(e) => {
            e.preventDefault();
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
          opacity: list.data.url === "home" ? "1" : hover ? "0" : "1",
        }}
      >
        <Counter tasksLength={list.tasks?.length} />
      </p>
    </Link>
  );
}
