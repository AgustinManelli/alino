"use client";

import styles from "./manager.module.css";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { TaskCard } from "../task-card/task-card";
import { Database } from "@/lib/schemas/todo-schema";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBlurBackgroundStore } from "@/store/useBlurBackgroundStore";
import TaskInput from "../task-input/task-input";
import { EmojiMartComponent } from "@/components/ui/emoji-mart/emoji-mart-component";
import {
  DeleteIcon,
  Edit,
  SquircleIcon,
  Information,
  LogOut,
  Invite,
} from "@/components/ui/icons/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfigMenu } from "@/components/ui/config-menu";
import { ListInfoEdit } from "@/components/ui/list-info-edit";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import ListInformation from "../../list-information";
import ListInviteModal from "../../list-invite-modal";

type MembershipRow = Database["public"]["Tables"]["list_memberships"]["Row"];
type ListsRow = Database["public"]["Tables"]["lists"]["Row"];
type ListsType = MembershipRow & { list: ListsRow };

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

  const [colorTemp, setColorTemp] = useState<string>(setList?.list.color ?? "");
  const [emoji, setEmoji] = useState<string | null>(null);
  const [deleteConfirm, isDeleteConfirm] = useState<boolean>(false);
  const [configActive, setConfigActive] = useState<boolean>(false);
  const [inviteActive, setInviteActive] = useState<boolean>(false);

  const { tasks, deleteList } = useTodoDataStore();

  useEffect(() => {
    if (!setList) return;
    setColorTemp(setList.list.color);
    setEmoji(setList.list.icon);
  }, [setList]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const setBlurredFx = useBlurBackgroundStore((state) => state.setColor);

  useEffect(() => {
    if (setList?.list.color && !h) {
      setBlurredFx(setList.list.color);
    } else {
      setBlurredFx("rgb(106, 195, 255)");
    }
  }, [setList?.list.color, setBlurredFx]);

  const filteredTasks = useMemo(
    () => tasks.filter((task) => task.list_id === setList?.list_id),
    [tasks, setList?.list_id]
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

  const handleConfirm = () => {
    isDeleteConfirm(true);
  };

  const router = useRouter();

  const handleDelete = () => {
    if (!setList) return;
    router.push(`${location.origin}/alino-app`);
    deleteList(setList.list_id);
  };

  const role = setList?.role;

  const canDelete = role === "owner" || role === "admin";
  const canEdit = role === "owner" || role === "admin";
  const owner = role !== "owner";

  const baseConfigOptions = [
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
    {
      name: "Salir de la lista",
      icon: (
        <LogOut
          style={{
            stroke: "var(--text)",
            width: "14px",
            height: "auto",
            strokeWidth: 2,
          }}
        />
      ),
      action: () => {},
    },
    {
      name: "Información",
      icon: (
        <Information
          style={{
            stroke: "var(--text)",
            width: "14px",
            height: "auto",
            strokeWidth: 2,
          }}
        />
      ),
      action: () => {
        setConfigActive(true);
      },
    },
  ];

  const configOptions = baseConfigOptions.filter((option) => {
    switch (option.name) {
      case "Editar lista":
        return canEdit;
      case "Eliminar lista":
        return canDelete;
      case "Salir de la lista":
        return owner;
      default:
        return true;
    }
  });

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

  const handleCloseConfig = () => {
    setConfigActive(false);
  };

  const handleCloseInvite = () => {
    setInviteActive(false);
  };

  return (
    <>
      {deleteConfirm && (
        <ConfirmationModal
          text={`¿Desea eliminar la lista "${setList?.list.list_name}"?`}
          aditionalText="Esta acción es irreversible y eliminará todas las tareas de la lista."
          handleDelete={handleDelete}
          isDeleteConfirm={isDeleteConfirm}
          id={"manager"}
        />
      )}
      <AnimatePresence>
        {configActive && setList && (
          <ListInformation
            handleCloseConfig={handleCloseConfig}
            list={setList}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {inviteActive && setList && (
          <ListInviteModal
            handleCloseConfig={handleCloseInvite}
            list={setList.list_id}
          />
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
                          task.list_id === setList?.list_id
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
                    <TaskCard key={task.task_id} task={task} />
                  ))}
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className={styles.tasks}>
                {filteredTasks.map((task) => (
                  <TaskCard key={task.task_id} task={task} />
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
