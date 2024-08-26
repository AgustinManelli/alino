"use client";

import { useEffect, useRef, useState } from "react";
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
import ConfirmationModal from "@/components/confirmationModal/confirmation-modal";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

interface emoji {
  id: string;
  keywords: string[];
  name: string;
  native: string;
  shortcodes: string;
  unified: string;
}

export function SubjectsCards({ list }: { list: ListsType }) {
  const deleteList = useLists((state) => state.deleteList);
  const changeColor = useLists((state) => state.changeColor);

  const pathname = usePathname();
  const router = useRouter();

  const [hover, setHover] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(list.data.color);
  const [emoji, setEmoji] = useState<string>(list.data.icon);
  const [deleteConfirm, isDeleteConfirm] = useState<boolean>(false);

  const handleDelete = async () => {
    await deleteList(list.id);
    if (pathname === `/alino-app/${list.name}`) {
      router.push(`${location.origin}/alino-app`);
    }
    toast.success(`${list.name} eliminado correctamente`);
  };

  const handleSave = async () => {
    await changeColor(list.data, colorTemp, list.id, emoji);
    toast.success(`Color de ${list.name} cambiado correctamente`);
  };

  return (
    <div>
      {deleteConfirm && (
        <ConfirmationModal
          text={`¿Desea eliminar la lista "${list.data.type}"?`}
          aditionalText="Esta acción es irreversible y eliminará todas las tareas de la lista."
          isDeleteConfirm={isDeleteConfirm}
          handleDelete={handleDelete}
        />
      )}
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
          pointerEvents: "auto",
        }}
        href={`/alino-app/${list.name}`}
      >
        <div
          className={styles.cardFx}
          style={{
            backgroundColor:
              hover || pathname === `/alino-app/${list.name}` || hover
                ? `${colorTemp}`
                : "transparent",
          }}
        ></div>
        <div className={styles.identifierContainer}>
          <ColorPicker
            color={colorTemp}
            originalColor={list.data.color}
            setColor={setColorTemp}
            save={true}
            handleSave={handleSave}
            width={"20px"}
            setEmoji={setEmoji}
            emoji={emoji}
            originalEmoji={list.data.icon}
          />
        </div>
        <p className={styles.subjectName}>{list.data.type}</p>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // handleDelete();
            isDeleteConfirm(true);
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
        <p
          className={styles.counter}
          style={{
            opacity: hover ? "0" : "1",
          }}
        >
          <Counter tasksLength={list.tasks?.length} />
        </p>
      </Link>
    </div>
  );
}
