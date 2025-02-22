"use client";

import styles from "./manager.module.css";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { TaskCard } from "../task-card/task-card";
import { Database } from "@/lib/schemas/todo-schema";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBlurBackgroundStore } from "@/store/useBlurBackgroundStore";
import TaskInput from "../task-input/task-input";
import { EmojiMartComponent } from "@/components/ui/emoji-mart/emoji-mart-component";
import { DeleteIcon, Edit, SquircleIcon } from "@/components/ui/icons/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfigMenu } from "@/components/ui/config-menu";
import { ListInfoEdit } from "@/components/ui/list-info-edit";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useRouter } from "next/navigation";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function Manager({
  setList,
  h,
  userName = "bienvenido",
}: {
  setList?: ListsType;
  h?: boolean;
  userName?: string;
}) {
  const [isNameChange, setIsNameChange] = useState<boolean>(false);

  const [colorTemp, setColorTemp] = useState<string>(setList?.color ?? "");
  const [emoji, setEmoji] = useState<string | null>(null);
  const [deleteConfirm, isDeleteConfirm] = useState<boolean>(false);

  const { tasks, deleteList } = useTodoDataStore();

  useEffect(() => {
    if (!setList) return;
    setColorTemp(setList.color);
    setEmoji(setList.icon);
  }, [setList]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const setBlurredFx = useBlurBackgroundStore((state) => state.setColor);

  useEffect(() => {
    if (setList?.color && !h) {
      setBlurredFx(setList.color);
    } else {
      setBlurredFx("rgb(106, 195, 255)");
    }
  }, [setList?.color, setBlurredFx]);

  const filteredTasks = useMemo(
    () => tasks.filter((task) => task.category_id === setList?.id),
    [tasks, setList?.id]
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const [prevLength, setPrevLength] = useState(tasks.length);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current && tasks.length > prevLength) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setPrevLength(tasks.length);
    }
  }, [tasks.length, prevLength]);

  const handleNameChange = () => {
    setIsNameChange(true);
  };

  const divRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(divRef, () => {
    const colorPickerContainer = document.getElementById(
      "color-picker-container-navbar-list-card"
    );
    if (colorPickerContainer) return;
    setIsNameChange(false);
    setColorTemp(setList?.color || "rgb(106, 195, 255)");
    setEmoji(setList?.icon || null);
  });

  useEffect(() => {
    const input = document.getElementById(
      "list-info-edit-container-todo-manager"
    );
    if (input) {
      input.focus();
    }
  }, [isNameChange]);

  const handleConfirm = () => {
    isDeleteConfirm(true);
  };

  const router = useRouter();

  const handleDelete = () => {
    if (!setList) return;
    router.push(`${location.origin}/alino-app`);
    deleteList(setList.id);
  };

  const configOptions = [
    {
      name: "Editar lista",
      icon: (
        <Edit
          style={{
            width: "14px",
            height: "auto",
            stroke: "var(--text)",
            strokeWidth: 2,
          }}
        />
      ),
      action: handleNameChange,
    },
    {
      name: "Eliminar lista",
      icon: (
        <DeleteIcon
          style={{
            stroke: "var(--text)",
            width: "14px",
            height: "auto",
            strokeWidth: 2,
          }}
        />
      ),
      action: handleConfirm,
    },
  ];

  const section1Ref = useRef<HTMLDivElement>(null);
  const [sectionHeight, setSectionHeight] = useState<number>(0);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (section1Ref.current && scrollRef.current) {
        scrollRef.current.style.paddingTop = `${section1Ref.current.offsetHeight}px`;
      }
    });

    if (section1Ref.current) {
      observer.observe(section1Ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {deleteConfirm && (
        <ConfirmationModal
          text={`¿Desea eliminar la lista "${setList?.name}"?`}
          aditionalText="Esta acción es irreversible y eliminará todas las tareas de la lista."
          isDeleteConfirm={isDeleteConfirm}
          handleDelete={handleDelete}
        />
      )}
      <div className={styles.container}>
        <section className={styles.section1} ref={section1Ref}>
          <div className={styles.header}>
            {h ? (
              <section className={styles.homeContainer}>
                <div className={styles.homeSubContainer}>
                  <h1 className={styles.homeTitle}>
                    <span>Hola, </span>
                    <span>{userName.split(" ")[0]}</span>
                  </h1>
                  <div className={styles.homeTimeContainer}>
                    <p>
                      <span>Hoy es </span>
                      {formatDate(currentTime)} <br />
                      <span>
                        Tienes{" "}
                        {tasks.filter((task) => task.completed !== true).length}{" "}
                        tareas activas
                      </span>
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              <div className={styles.listContainer}>
                <div className={styles.titleSection} ref={divRef}>
                  {!h && setList ? (
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
                  ) : (
                    ""
                  )}
                </div>
                <p className={styles.listSubtitle}>
                  <span>
                    Tienes{" "}
                    {
                      tasks.filter(
                        (task) =>
                          task.completed !== true &&
                          task.category_id === setList?.id
                      ).length
                    }{" "}
                    tareas activas
                  </span>
                </p>
              </div>
            )}
            <div className={styles.configSection}>
              {!h && (
                <ConfigMenu iconWidth={"25px"} configOptions={configOptions} />
              )}
            </div>
          </div>
          <div className={styles.inputSection}>
            <TaskInput setList={setList} />
          </div>
        </section>
        <section className={styles.section2}>
          <div
            className={styles.tasksSection}
            id={"task-section-scroll-area"}
            ref={scrollRef}
          >
            {h && !setList ? (
              <div className={styles.tasks}>
                {tasks
                  // .sort(
                  //   (a, b) =>
                  //     new Date(b.created_at).getTime() -
                  //     new Date(a.created_at).getTime()
                  // )
                  .map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className={styles.tasks}>
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <p>No hay tareas...</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
