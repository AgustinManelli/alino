"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  memo,
  useLayoutEffect,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useUIStore } from "@/store/useUIStore";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useDeleteList } from "@/hooks/todo/lists/useDeleteList";
import { useLeaveList } from "@/hooks/todo/lists/useLeaveList";
import { useFetchTasksPage } from "@/hooks/todo/tasks/useFetchTasksPage";
import { useUpdateTaskRank } from "@/hooks/todo/tasks/useUpdateTaskRank";
import { useFetchCompletedTasksPage } from "@/hooks/todo/tasks/useFetchCompletedTasksPage";
import { useSetTaskSort } from "@/hooks/todo/tasks/useSetTaskSort";
import { useSyncStore } from "@/store/useSyncStore";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { calcNewRank, LexorankItem } from "@/lib/lexorank";
import { ListsType, TaskType } from "@/lib/schemas/database.types";
import ListInformation from "@/app/alino-app/components/list-information";
import { ListInfoEdit } from "@/components/ui/list-info-edit";
import { ConfigMenu } from "@/components/ui/ConfigMenu";
import { Dropdown } from "@/components/ui/Dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import TaskInput from "../task-input/task-input";
import styles from "./manager.module.css";
import {
  DeleteIcon,
  Edit,
  Information,
  LoadingIcon,
  LogOut,
  Check,
  Cross,
  DefaultSortIcon,
  DueAscSortIcon,
  DueDescSortIcon,
  AlphaAscSortIcon,
  AlphaDescSortIcon,
  DragIcon,
} from "@/components/ui/icons/icons";
import { TaskCardStatic } from "../task-card/task-card-static";
import { DragTaskCard } from "../task-card/drag-task-card";
import { useUserDataStore } from "@/store/useUserDataStore";
import { useModalStore } from "@/store/useModalStore";

const SORT_OPTIONS = [
  { value: "default", label: "Por defecto", icon: DefaultSortIcon },
  { value: "due_asc", label: "Fecha (asc.)", icon: DueAscSortIcon },
  { value: "due_desc", label: "Fecha (desc.)", icon: DueDescSortIcon },
  { value: "alpha_asc", label: "Nomb. (asc.)", icon: AlphaAscSortIcon },
  { value: "alpha_desc", label: "Nomb. (desc.)", icon: AlphaDescSortIcon },
] as const;

export const Manager = memo(function Manager({
  setList,
  h = false,
}: {
  setList?: ListsType;
  h?: boolean;
}) {
  const [isNameChange, setIsNameChange] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(setList?.list.color ?? "");
  const [emoji, setEmoji] = useState<string | null>(setList?.list.icon ?? null);
  const [infoActive, setInfoActive] = useState<boolean>(false);
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const {
    tasks,
    hasMoreTasks,
    taskSort,
    completedTasks,
    hasMoreCompletedTasks,
  } = useTodoDataStore();

  const { setTaskSort, isPending: isSorting } = useSetTaskSort();

  const loadingQueue = useSyncStore((state) => state.loadingQueue);

  const { deleteList } = useDeleteList();
  const { leaveList } = useLeaveList();
  const { fetchTasksPage } = useFetchTasksPage();
  const { updateTaskRank } = useUpdateTaskRank();
  const { fetchCompletedTasksPage, isPending: loadingCompleted } = useFetchCompletedTasksPage();
  const user = useUserDataStore((state) => state.user);
  const openConfirmationModal = useModalStore((s) => s.open);

  const [draggedTask, setDraggedTask] = useState<TaskType | null>(null);
  const [isReordering, setIsReordering] = useState<boolean>(false);

  useEffect(() => {
    if (taskSort !== "default") {
      setIsReordering(false);
    }
  }, [taskSort]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const handleDragStart = useCallback(
    (e: DragStartEvent) => {
      const { active } = e;
      const task = tasks.find((t) => t.task_id === active.id);
      if (task) setDraggedTask(task);
    },
    [tasks],
  );

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      setDraggedTask(null);

      if (!over || active.id === over.id) return;

      const sourceTasks = tasks.filter((t) => t.list_id === setList?.list_id);

      const oldIndex = sourceTasks.findIndex((t) => t.task_id === active.id);
      const newIndex = sourceTasks.findIndex((t) => t.task_id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const mockOrder = arrayMove(sourceTasks, oldIndex, newIndex);

      // We reverse it conceptually to pass an ASCENDING array to calcNewRank
      const ascOrder = mockOrder.slice().reverse();
      const newAscIndex = ascOrder.findIndex((t) => t.task_id === active.id);
      const lexoOrder = ascOrder.map((t) => ({
        rank: t.rank ?? "",
      })) as any as LexorankItem[];

      const newRank = calcNewRank(lexoOrder, newAscIndex);

      updateTaskRank(active.id as string, newRank);
    },
    [tasks, setList?.list_id, updateTaskRank],
  );

  const handleDragCancel = useCallback(() => setDraggedTask(null), []);
  const setBlurredFx = useUIStore((state) => state.setColor);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(tasks.length);
  const prevListIdRef = useRef<string | null>(null);
  const prevFilteredCountRef = useRef(0);

  const displayName = useMemo(
    () => user?.display_name.split(" ")[0] ?? "Bienvenido",
    [user],
  );

  const filteredTasks = useMemo(
    () => tasks.filter((task) => task.list_id === setList?.list_id),
    [tasks, setList?.list_id],
  );

  const activeTaskCount = useMemo(() => {
    const source = h ? tasks : filteredTasks;
    return source.filter((task) => task.completed === false).length;
  }, [tasks, filteredTasks, h]);

  const currentViewId = h ? "home" : setList?.list_id || null;

  useEffect(() => {
    if (!currentViewId) return;
    if (prevListIdRef.current !== currentViewId) {
      fetchTasksPage(currentViewId, true);
      prevListIdRef.current = currentViewId;
      prevFilteredCountRef.current = 0;
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }
  }, [currentViewId, fetchTasksPage]);

  // Scroll al top cuando se agrega una nueva tarea
  useEffect(() => {
    if (showCompleted) return;
    const count = filteredTasks.length + (h ? tasks.length : 0);
    if (
      count > prevFilteredCountRef.current &&
      prevFilteredCountRef.current > 0
    ) {
      if (scrollRef.current && scrollRef.current.scrollTop > 0) {
        scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    prevFilteredCountRef.current = count;
  }, [filteredTasks.length, tasks.length, h, showCompleted]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 150) {
      if (showCompleted) {
        if (hasMoreCompletedTasks && !loadingCompleted && currentViewId) {
          fetchCompletedTasksPage(currentViewId, false);
        }
      } else {
        if (hasMoreTasks && loadingQueue === 0 && currentViewId) {
          fetchTasksPage(currentViewId, false);
        }
      }
    }
  }, [
    hasMoreTasks,
    loadingQueue,
    currentViewId,
    fetchTasksPage,
    showCompleted,
    hasMoreCompletedTasks,
    loadingCompleted,
    fetchCompletedTasksPage,
  ]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener("scroll", handleScroll);
      return () => scrollEl.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

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
    deleteList(setList.list_id);
  }, [setList, deleteList]);

  const handleLeave = useCallback(() => {
    if (!setList) return;
    leaveList(setList.list_id);
  }, [setList, leaveList]);

  const handleConfirmDelete = useCallback(() => {
    openConfirmationModal({
      type: "confirmation",
      props: {
        text: `¿Desea eliminar la lista "${setList?.list.list_name}"?`,
        onConfirm: handleDelete,
        additionalText:
          "Esta acción es irreversible y eliminará todas las tareas de la lista.",
      },
    });
  }, [openConfirmationModal, setList, handleDelete]);

  const handleConfirmLeave = useCallback(() => {
    openConfirmationModal({
      type: "confirmation",
      props: {
        text: `¿Desea salir de la lista "${setList?.list.list_name}"?`,
        onConfirm: handleLeave,
        additionalText: "Puedes regresar a ella con otra invitación.",
        actionButton: "Salir",
      },
    });
  }, [openConfirmationModal, setList, handleLeave]);

  const handleToggleCompleted = useCallback(() => {
    const next = !showCompleted;
    setShowCompleted(next);
    if (next) {
      setIsReordering(false);
      if (currentViewId) {
        fetchCompletedTasksPage(currentViewId, true);
      }
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }
  }, [showCompleted, currentViewId, fetchCompletedTasksPage]);

  const configOptions = useMemo(() => {
    const baseOptions = [
      {
        name: "Editar lista",
        icon: <Edit style={iconStyle} />,
        action: handleNameChange,
        enabled: canEdit,
      },
      {
        name: isReordering ? "Fin de reordenar" : "Reordenar tareas",
        icon: <DragIcon style={iconStyle} />,
        action: () => setIsReordering((prev) => !prev),
        enabled: canEdit && taskSort === "default" && !showCompleted,
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
    isReordering,
    taskSort,
    handleNameChange,
    handleConfirmDelete,
    handleConfirmLeave,
  ]);

  useEffect(() => {
    if (setList) {
      setColorTemp(setList.list.color);
      setEmoji(setList.list.icon);
    }
  }, [setList]);

  useEffect(() => {
    if (setList?.list.color && !h) {
      setBlurredFx(setList.list.color);
    } else {
      setBlurredFx("rgb(106, 195, 255)");
    }
  }, [setList?.list.color, setBlurredFx]);

  useEffect(() => {
    if (
      scrollRef.current &&
      tasks.length > 0 &&
      tasks.length !== prevLengthRef.current
    ) {
      prevLengthRef.current = tasks.length;
    }
  }, [tasks.length]);

  useOnClickOutside(divRef, () => {
    const colorPickerContainer = document.getElementById(
      "color-picker-container-navbar-list-card",
    );
    if (colorPickerContainer) return;
    setIsNameChange(false);
    setColorTemp(setList?.list.color || "rgb(106, 195, 255)");
    setEmoji(setList?.list.icon || null);
  });

  useEffect(() => {
    const input = document.getElementById(
      "list-info-edit-container-todo-manager",
    );
    if (input) {
      input.focus();
    }
  }, [isNameChange]);

  useLayoutEffect(() => {
    const sectionEl = section1Ref.current;
    const scrollEl = scrollRef.current;
    if (!sectionEl || !scrollEl) return;
    scrollEl.style.paddingTop = `${sectionEl.offsetHeight}px`;
  }, []);

  useEffect(() => {
    const sectionEl = section1Ref.current;
    const scrollEl = scrollRef.current;
    if (!sectionEl || !scrollEl) return;

    // Guardamos la altura inicial
    let prevHeight = sectionEl.offsetHeight;

    const applyPadding = () => {
      if (sectionEl && scrollEl) {
        const currentHeight = sectionEl.offsetHeight;

        if (currentHeight < prevHeight) {
          scrollEl.style.transition = "none";
          scrollEl.style.paddingTop = `${currentHeight}px`;
        } else {
          scrollEl.style.transition = "padding-top 0.1s ease-in-out";
          scrollEl.style.paddingTop = `${currentHeight}px`;
        }

        prevHeight = currentHeight;
      }
    };

    const ro = new ResizeObserver(applyPadding);
    ro.observe(sectionEl);

    return () => {
      ro.disconnect();
    };
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
                      <span>
                        {activeTaskCount === 0
                          ? "No tienes tareas activas por aquí"
                          : `Viendo ${activeTaskCount} ${activeTaskCount > 1 ? "tareas activas" : "tarea activa"}${hasMoreTasks ? "+" : ""}`}
                      </span>
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
                  <span>
                    {activeTaskCount === 0
                      ? "No tienes tareas activas por aquí"
                      : `Viendo ${activeTaskCount} ${activeTaskCount > 1 ? "tareas activas" : "tarea activa"}${hasMoreTasks ? "+" : ""}`}
                  </span>
                </p>
              </div>
            )}
            <div className={styles.configSection}>
              {!h && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  {isReordering && (
                    <button
                      onClick={() => setIsReordering(false)}
                      title={"Finalizar reordenamiento"}
                      style={{
                        background: "transparent",
                        border: "none",
                        width: "25px",
                        height: "25px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "var(--text)",
                      }}
                    >
                      <Check
                        style={{
                          width: "20px",
                          height: "auto",
                          stroke: "var(--text)",
                          strokeWidth: 2,
                        }}
                      />
                    </button>
                  )}

                  <button
                    onClick={handleToggleCompleted}
                    title={
                      showCompleted
                        ? "Salir de las tareas completadas"
                        : "Ver tareas completadas"
                    }
                    className={`${styles.trashButton} ${showCompleted ? styles.trashButtonActive : ""}`}
                  >
                    <DeleteIcon
                      style={{
                        width: "18px",
                        height: "18px",
                        stroke: "currentColor",
                        strokeWidth: 2,
                      }}
                    />
                  </button>

                  <Dropdown>
                    <Dropdown.Trigger
                      style={{
                        width: "25px",
                        height: "25px",
                        borderRadius: "7px",
                        color: "var(--text)",
                        padding: 0,
                      }}
                    >
                      {(() => {
                        const Icon =
                          SORT_OPTIONS.find((o) => o.value === taskSort)
                            ?.icon || DefaultSortIcon;
                        return (
                          <Icon
                            style={{
                              width: "18px",
                              height: "18px",
                              strokeWidth: 2,
                            }}
                          />
                        );
                      })()}
                    </Dropdown.Trigger>
                    <Dropdown.Content>
                      {SORT_OPTIONS.map((opt) => (
                        <Dropdown.Item
                          key={opt.value}
                          onClick={() => setTaskSort(opt.value)}
                          isActive={taskSort === opt.value}
                        >
                          <opt.icon
                            style={{
                              width: "16px",
                              height: "16px",
                              strokeWidth: 2,
                            }}
                          />
                          {opt.label}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Content>
                  </Dropdown>

                  <ConfigMenu
                    iconWidth={"25px"}
                    configOptions={configOptions}
                  />
                </div>
              )}
            </div>
          </div>
          <div className={styles.inputSection}>
            <AnimatePresence mode="wait" initial={false}>
              {showCompleted && !h ? (
                <motion.div
                  key="trash-banner"
                  className={styles.trashBanner}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
                  }}
                  exit={{
                    opacity: 0,
                    y: 6,
                    transition: { duration: 0.15, ease: "easeIn" },
                  }}
                >
                  <div className={styles.trashBannerGlow} />
                  <div className={styles.trashBannerLeft}>
                    <DeleteIcon
                      className={styles.trashBannerIcon}
                      style={{
                        width: "14px",
                        height: "14px",
                        stroke: "hsl(340, 85%, 68%)",
                        strokeWidth: 2,
                      }}
                    />
                    <span className={styles.trashBannerText}>
                      Tareas completadas
                    </span>
                    <span className={styles.trashBannerSub}>
                      {loadingCompleted
                        ? "Cargando..."
                        : completedTasks.length === 0
                          ? "Sin tareas completadas"
                          : `${completedTasks.length}${hasMoreCompletedTasks ? "+" : ""} tarea${completedTasks.length !== 1 ? "s" : ""}`}
                    </span>
                  </div>
                  <button
                    className={styles.trashBannerClose}
                    onClick={() => setShowCompleted(false)}
                    title="Cerrar papelera"
                  >
                    <Cross
                      style={{
                        width: "14px",
                        height: "14px",
                        stroke: "currentColor",
                        strokeWidth: 2.5,
                      }}
                    />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="task-input"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.18, ease: "easeOut" },
                  }}
                  exit={{
                    opacity: 0,
                    y: -4,
                    transition: { duration: 0.12, ease: "easeIn" },
                  }}
                >
                  <TaskInput setList={setList} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
        <section className={styles.section2}>
          <div
            className={styles.tasksSection}
            id={"task-section-scroll-area"}
            ref={scrollRef}
          >
            {showCompleted && !h ? (
              <div className={styles.tasks}>
                <AnimatePresence mode="popLayout" initial={false}>
                  {completedTasks.map((task) => (
                    <TaskCardStatic key={task.task_id} task={task} inTrash />
                  ))}
                </AnimatePresence>
                {loadingCompleted && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "16px 0",
                      width: "100%",
                    }}
                  >
                    <LoadingIcon
                      style={{
                        width: "22px",
                        stroke: "var(--text-not-available)",
                      }}
                    />
                  </div>
                )}
                {!loadingCompleted && completedTasks.length === 0 && (
                  <div className={styles.emptyTrash}>
                    <DeleteIcon
                      className={styles.emptyTrashIcon}
                      style={{
                        width: "36px",
                        height: "36px",
                        stroke: "var(--text-not-available)",
                        strokeWidth: 1.5,
                      }}
                    />
                    <p className={styles.emptyTrashText}>
                      No hay tareas completadas
                    </p>
                  </div>
                )}
              </div>
            ) : h && !setList ? (
              <div className={styles.tasks}>
                <AnimatePresence mode="popLayout" initial={false}>
                  {tasks.map((task) => (
                    <TaskCardStatic key={task.task_id} task={task} />
                  ))}
                </AnimatePresence>
                {loadingQueue > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      marginTop: "10px",
                    }}
                  >
                    {Array(3)
                      .fill(null)
                      .map((_, index) => (
                        <Skeleton
                          style={{
                            width: "100%",
                            height: "50px",
                            borderRadius: "15px",
                          }}
                          delay={index * 0.15}
                          key={`skeleton-${index}`}
                        />
                      ))}
                  </div>
                )}
              </div>
            ) : filteredTasks.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={filteredTasks.map((t) => t.task_id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={styles.tasks}>
                    <AnimatePresence mode="popLayout" initial={false}>
                      {filteredTasks.map((task) => (
                        <TaskCardStatic
                          key={task.task_id}
                          task={task}
                          isReordering={isReordering}
                        />
                      ))}
                    </AnimatePresence>
                    {loadingQueue > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: "16px 0",
                          width: "100%",
                        }}
                      >
                        <LoadingIcon
                          style={{
                            width: "22px",
                            stroke: "var(--text-not-available)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {draggedTask && <DragTaskCard task={draggedTask} />}
                </DragOverlay>
              </DndContext>
            ) : loadingQueue > 0 ? (
              <div className={styles.tasks}>
                {Array(3)
                  .fill(null)
                  .map((_, index) => (
                    <Skeleton
                      style={{
                        width: "100%",
                        height: "50px",
                        borderRadius: "15px",
                      }}
                      delay={index * 0.15}
                      key={`skeleton-${index}`}
                    />
                  ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <p>Sin tareas ni notas, agrega una desde la barra superior.</p>
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
