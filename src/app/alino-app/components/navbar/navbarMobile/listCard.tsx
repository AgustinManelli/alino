"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLists } from "@/store/lists";
import { Database } from "@/lib/todosSchema";
import { DeleteIcon, SquircleIcon } from "@/lib/ui/icons";
import styles from "../navbarDesktop/listCard.module.css";
import { CounterAnimation } from "@/components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components";
import { EmojiComponent } from "@/components";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function ListCard({
  list,
  action,
}: {
  list: ListsType;
  action: () => void;
}) {
  const deleteList = useLists((state) => state.deleteList);

  const pathname = usePathname();
  const router = useRouter();
  const [colorTemp, setColorTemp] = useState<string>(list.color);
  const [deleteConfirm, isDeleteConfirm] = useState<boolean>(false);

  const handleDelete = async () => {
    await deleteList(list.id);
    if (pathname === `/alino-app/${list.id}`) {
      router.push(`${location.origin}/alino-app`);
    }
    toast.success(`${list.name} eliminado correctamente`);
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
        style={{
          backgroundColor:
            pathname === `/alino-app/${list.id}`
              ? "rgb(250, 250, 250)"
              : "transparent",
          pointerEvents: "auto",
        }}
        href={`/alino-app/${list.id}`}
        onClick={action}
      >
        <div
          className={styles.cardFx}
          style={{
            boxShadow:
              pathname === `/alino-app/${list.id}`
                ? `${colorTemp} 100px 50px 50px`
                : `initial`,
          }}
        ></div>
        {list?.icon !== "" ? (
          <EmojiComponent shortcodes={list.icon} size="16px" />
        ) : (
          <SquircleIcon
            style={{
              width: "16px",
              fill: `${list?.color}`,
              transition: "fill 0.2s ease-in-out",
            }}
          />
        )}
        <p className={styles.listName}>{list.name}</p>
        <p className={styles.counter}>
          <CounterAnimation tasksLength={list.tasks?.length} />
        </p>
      </Link>
    </div>
  );
}
