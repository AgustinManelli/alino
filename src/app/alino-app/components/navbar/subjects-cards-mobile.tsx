"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLists } from "@/store/lists";
import { Database } from "@/lib/todosSchema";
import { DeleteIcon, SquircleIcon } from "@/lib/ui/icons";
import styles from "./subjects-cards.module.css";
import { CounterAnimation } from "@/components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components";
import { EmojiComponent } from "@/components";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export function SubjectsCardsMobile({
  list,
  action,
}: {
  list: ListsType;
  action: () => void;
}) {
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
        style={{
          backgroundColor:
            pathname === `/alino-app/${list.name}`
              ? "rgb(250, 250, 250)"
              : "transparent",
          pointerEvents: "auto",
        }}
        href={`/alino-app/${list.name}`}
        onClick={action}
      >
        <div
          className={styles.cardFx}
          style={{
            backgroundColor:
              pathname === `/alino-app/${list.name}`
                ? `${colorTemp}`
                : "transparent",
          }}
        ></div>
        {list?.data.icon !== "" ? (
          <EmojiComponent shortcodes={list.data.icon} size="16px" />
        ) : (
          <SquircleIcon
            style={{
              width: "16px",
              fill: `${list?.data.color}`,
              transition: "fill 0.2s ease-in-out",
            }}
          />
        )}
        <p className={styles.subjectName}>{list.data.type}</p>
        <p className={styles.counter}>
          <CounterAnimation tasksLength={list.tasks?.length} />
        </p>
      </Link>
    </div>
  );
}
