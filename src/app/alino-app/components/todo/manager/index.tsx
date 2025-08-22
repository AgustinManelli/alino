"use client";

import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useBlurBackgroundStore } from "@/store/useBlurBackgroundStore";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useConfirmationModalStore } from "@/store/useConfirmationModalStore";
import { ListsType } from "@/lib/schemas/todo-schema";

import ListInformation from "@/app/alino-app/components/list-information";
import { ListInfoEdit } from "@/components/ui/list-info-edit";
import { ConfigMenu } from "@/components/ui/config-menu";
import TaskInput from "../task-input/task-input";

import styles from "./manager.module.css";
import {
  DeleteIcon,
  Edit,
  Information,
  LogOut,
} from "@/components/ui/icons/icons";
import { TaskCardStatic } from "../task-card/task-card-static";

export const Manager = memo(function Manager({
  setList,
  h,
}: {
  setList?: ListsType;
  h?: boolean;
}) {
  const [isNameChange, setIsNameChange] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(setList?.list.color ?? "");
  const [emoji, setEmoji] = useState<string | null>(setList?.list.icon ?? null);
  const [infoActive, setInfoActive] = useState<boolean>(false);

  const { user, tasks, deleteList, leaveList } = useTodoDataStore();
  const openModal = useConfirmationModalStore((state) => state.openModal);
  const setBlurredFx = useBlurBackgroundStore((state) => state.setColor);

  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(tasks.length);

  const displayName = useMemo(
    () => user?.display_name.split(" ")[0] ?? "Bienvenido",
    [user]
  );
  const filteredTasks = useMemo(
    () => tasks.filter((task) => task.list_id === setList?.list_id),
    [tasks, setList?.list_id]
  );
  const activeTaskCount = useMemo(() => {
    const source = h ? tasks : filteredTasks;
    return source.filter((task) => !task.completed).length;
  }, [tasks, filteredTasks, h]);
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const role = setList?.role;
  const canDelete = role === "owner" || role === "admin";
  const canEdit = role === "owner" || role === "admin";
  const owner = role !== "owner";

  const handleNameChange = useCallback(() => setIsNameChange(true), []);
  const handleCloseInfo = useCallback(() => setInfoActive(false), []);

  const handleDelete = useCallback(() => {
    if (!setList) return;
    router.push(`${location.origin}/alino-app`);
    deleteList(setList.list_id);
  }, [setList, router, deleteList]);

  const handleLeave = useCallback(() => {
    if (!setList) return;
    router.push(`${location.origin}/alino-app`);
    leaveList(setList.list_id);
  }, [setList, router, leaveList]);

  const handleConfirmDelete = useCallback(() => {
    openModal({
      text: `¿Desea eliminar la lista "${setList?.list.list_name}"?`,
      onConfirm: handleDelete,
      aditionalText:
        "Esta acción es irreversible y eliminará todas las tareas de la lista.",
    });
  }, [openModal, setList, handleDelete]);

  const handleConfirmLeave = useCallback(() => {
    openModal({
      text: `¿Desea salir de la lista "${setList?.list.list_name}"?`,
      onConfirm: handleLeave,
      aditionalText: "Puedes regresar a ella con otra invitación.",
      actionButton: "Salir",
    });
  }, [openModal, setList, handleLeave]);

  const configOptions = useMemo(() => {
    const baseOptions = [
      {
        name: "Editar lista",
        icon: <Edit style={iconStyle} />,
        action: handleNameChange,
        enabled: canEdit,
      },
      {
        name: "Eliminar lista",
        icon: <DeleteIcon style={iconStyle} />,
        action: handleConfirmDelete,
        enabled: canDelete,
      },
      {
        name: "Salir de la lista",
        icon: <LogOut style={iconStyle} />,
        action: handleConfirmLeave,
        enabled: owner,
      },
      {
        name: "Información",
        icon: <Information style={iconStyle} />,
        action: () => {
          setInfoActive(true);
        },
        enabled: true,
      },
    ];
    return baseOptions.filter((option) => option.enabled);
  }, [
    canEdit,
    canDelete,
    owner,
    handleNameChange,
    handleConfirmDelete,
    handleConfirmLeave,
  ]);

  useEffect(() => {
    if (!setList) return;
    setColorTemp(setList.list.color);
    setEmoji(setList.list.icon);
  }, [setList]);

  useEffect(() => {
    if (setList?.list.color && !h) {
      setBlurredFx(setList.list.color);
    } else {
      setBlurredFx("rgb(106, 195, 255)");
    }
  }, [setList?.list.color, setBlurredFx]);

  useEffect(() => {
    if (scrollRef.current && tasks.length > prevLengthRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      prevLengthRef.current = tasks.length;
    }
  }, [tasks.length]);

  useOnClickOutside(divRef, () => {
    const colorPickerContainer = document.getElementById(
      "color-picker-container-navbar-list-card"
    );
    if (colorPickerContainer) return;
    setIsNameChange(false);
    setColorTemp(setList?.list.color || "rgb(106, 195, 255)");
    setEmoji(setList?.list.icon || null);
  });

  useEffect(() => {
    const input = document.getElementById(
      "list-info-edit-container-todo-manager"
    );
    if (input) {
      input.focus();
    }
  }, [isNameChange]);

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
      <AnimatePresence>
        {infoActive && setList && (
          <ListInformation handleCloseConfig={handleCloseInfo} list={setList} />
        )}
      </AnimatePresence>
      <div className={styles.container}>
        <section className={styles.section1} ref={section1Ref}>
          <div className={styles.header}>
            {h ? (
              <section className={styles.homeContainer}>
                <div className={styles.homeSubContainer}>
                  <h1 className={styles.homeTitle}>
                    <span>Hola, </span>
                    <span>{displayName}</span>
                  </h1>
                  <div className={styles.homeTimeContainer}>
                    <p>
                      <span>Hoy es </span>
                      {formattedDate} <br />
                      <span>Tienes {activeTaskCount} tareas activas</span>
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              <div className={styles.listContainer}>
                <div className={styles.titleSection} ref={divRef}>
                  {!h && setList && (
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
                  <span>Tienes {activeTaskCount} tareas activas</span>
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
                {tasks.map((task) => (
                  <TaskCardStatic key={task.task_id} task={task} />
                ))}
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className={styles.tasks}>
                {filteredTasks.map((task) => (
                  <TaskCardStatic key={task.task_id} task={task} />
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
});

const iconStyle = {
  width: "14px",
  height: "auto",
  stroke: "var(--text)",
  strokeWidth: 2,
};
