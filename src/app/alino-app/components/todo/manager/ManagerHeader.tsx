"use client";

import { useMemo, useState, useRef, memo, useEffect } from "react";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { ListInfoEdit } from "@/components/ui/list-info-edit";
import { ListsType } from "@/lib/schemas/database.types";
import styles from "./manager.module.css";

export const ManagerHeader = memo(function ManagerHeader({
  setList,
  isNameChange,
  setIsNameChange,
}: {
  setList?: ListsType;
  isNameChange: boolean;
  setIsNameChange: (value: boolean) => void;
}) {
  const [colorTemp, setColorTemp] = useState<string>(setList?.list.color ?? "");
  const [emoji, setEmoji] = useState<string | null>(setList?.list.icon ?? null);

  useEffect(() => {
    if (isNameChange) {
      const input = document.getElementById(
        "list-info-edit-container-todo-manager",
      );
      if (input) input.focus();
    }
  }, [isNameChange]);

  const tasks = useTodoDataStore((state) => state.tasks);
  const hasMoreTasks = useTodoDataStore((state) => state.hasMoreTasks);

  const divRef = useRef<HTMLDivElement>(null);

  const activeTaskCount = useMemo(() => {
    const source = tasks.filter((task) => task.list_id === setList?.list_id);
    return source.filter((task) => task.completed === false).length;
  }, [tasks, setList?.list_id]);

  useOnClickOutside(divRef, (e) => {
    const target = e.target as HTMLElement;
    if (
      target.closest(".color-picker-portal") ||
      target.closest(".config-menu-portal")
    )
      return;

    setIsNameChange(false);
    setColorTemp(setList?.list.color || "rgb(106, 195, 255)");
    setEmoji(setList?.list.icon || null);
  });

  return (
    <div className={styles.listContainer}>
      <div className={styles.titleSection} ref={divRef}>
        {setList && (
          <ListInfoEdit
            list={setList}
            isNameChange={isNameChange}
            setIsNameChange={setIsNameChange}
            colorTemp={colorTemp}
            setColorTemp={setColorTemp}
            emoji={emoji}
            setEmoji={setEmoji}
            uniqueId="todo-manager"
            big
          />
        )}
      </div>
      <p className={styles.listSubtitle}>
        <span>
          {activeTaskCount === 0
            ? "No tienes tareas..."
            : `Tienes ${activeTaskCount} ${activeTaskCount > 1 ? "tareas activas" : "tarea activa"}${hasMoreTasks ? "+" : ""}`}
        </span>
      </p>
    </div>
  );
});
