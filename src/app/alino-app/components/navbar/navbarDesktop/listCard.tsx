"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ColorPicker } from "@/components";
import { useLists } from "@/store/lists";
import { Database } from "@/lib/todosSchema";
import { DeleteIcon } from "@/lib/ui/icons";
import styles from "./listCard.module.css";
import { CounterAnimation } from "@/components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function ListCard({ list }: { list: ListsType }) {
  const deleteList = useLists((state) => state.deleteList);
  const changeColor = useLists((state) => state.changeColor);

  const pathname = usePathname();
  const router = useRouter();

  const [hover, setHover] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(list.color);
  const [emoji, setEmoji] = useState<string>(list.icon);
  const [deleteConfirm, isDeleteConfirm] = useState<boolean>(false);

  const handleDelete = async () => {
    await deleteList(list.id);
    if (pathname === `/alino-app/${list.id}`) {
      router.push(`${location.origin}/alino-app`);
    }
    toast.success(`${list.name} eliminado correctamente`);
  };

  const handleSave = async () => {
    await changeColor(colorTemp, list.id, emoji);
    toast.success(`Color de ${list.name} cambiado correctamente`);
  };

  return (
    <div>
      {deleteConfirm && (
        <ConfirmationModal
          text={`¿Desea eliminar la lista "${list.name}"?`}
          aditionalText="Esta acción es irreversible y eliminará todas las tareas de la lista."
          isDeleteConfirm={isDeleteConfirm}
          handleDelete={handleDelete}
        />
      )}
      <Link
        className={styles.container}
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
        style={{
          backgroundColor:
            hover || pathname === `/alino-app/${list.id}`
              ? "rgb(250, 250, 250)"
              : "transparent",
          pointerEvents: "auto",
        }}
        href={`/alino-app/${list.id}`}
      >
        <div
          className={styles.cardFx}
          style={{
            boxShadow:
              hover || pathname === `/alino-app/${list.id}`
                ? `${colorTemp} 100px 50px 50px`
                : `initial`,
          }}
        ></div>
        <div className={styles.identifierContainer}>
          <ColorPicker
            color={colorTemp}
            originalColor={list.color}
            setColor={setColorTemp}
            save={true}
            handleSave={handleSave}
            width={"20px"}
            setEmoji={setEmoji}
            emoji={emoji}
            originalEmoji={list.icon}
          />
        </div>
        <p className={styles.listName}>{list.name}</p>
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
          <CounterAnimation tasksLength={list.tasks?.length} />
        </p>
      </Link>
    </div>
  );
}
