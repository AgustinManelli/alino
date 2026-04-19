"use client";

import { memo, useMemo, useCallback, useState, useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useSyncStore } from "@/store/useSyncStore";
import { useUpdateTaskRank } from "@/hooks/todo/tasks/useUpdateTaskRank";
import { useFetchTasksPage } from "@/hooks/todo/tasks/useFetchTasksPage";
import { useFetchCompletedTasksPage } from "@/hooks/todo/tasks/useFetchCompletedTasksPage";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  LoadingIcon,
  DeleteIcon,
  TaskRemoveIcon,
} from "@/components/ui/icons/icons";
import { TaskCardStatic } from "../task-card/TaskCard";
import { DragTaskCard } from "../task-card/DragTaskCard";
import styles from "./manager.module.css";

interface ManagerTaskListProps {
  setList?: ListsType;
  showCompleted: boolean;
  isReordering: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  loadingCompleted: boolean;
  currentViewId: string | null;
}

export const ManagerTaskList = memo(function ManagerTaskList({
  setList,
  showCompleted,
  isReordering,
  scrollRef,
  loadingCompleted,
  currentViewId,
}: ManagerTaskListProps) {
  const { tasks, completedTasks, hasMoreTasks, hasMoreCompletedTasks } =
    useTodoDataStore();
  const loadingQueue = useSyncStore((state) => state.loadingQueue);
  const { updateTaskRank } = useUpdateTaskRank();
  const { fetchTasksPage } = useFetchTasksPage();
  const { fetchCompletedTasksPage } = useFetchCompletedTasksPage();

  const [draggedTask, setDraggedTask] = useState<TaskType | null>(null);
  const prevFilteredCountRef = useRef(0);
  const prevListIdRef = useRef<string | null>(null);

  const filteredTasks = useMemo(
    () => tasks.filter((task) => task.list_id === setList?.list_id),
    [tasks, setList?.list_id],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragStart = useCallback(
    (e: DragStartEvent) => {
      const task = tasks.find((t) => t.task_id === e.active.id);
      if (task) setDraggedTask(task);
    },
    [tasks],
  );

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      setDraggedTask(null);
      const { active, over } = e;
      if (!over || active.id === over.id) return;

      const sourceTasks = tasks.filter((t) => t.list_id === setList?.list_id);
      const oldIndex = sourceTasks.findIndex((t) => t.task_id === active.id);
      const newIndex = sourceTasks.findIndex((t) => t.task_id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const mockOrder = arrayMove(sourceTasks, oldIndex, newIndex);
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

  useEffect(() => {
    if (!currentViewId) return;
    if (prevListIdRef.current !== currentViewId) {
      fetchTasksPage(currentViewId, true);
      prevListIdRef.current = currentViewId;
      prevFilteredCountRef.current = 0;
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [currentViewId, fetchTasksPage, scrollRef]);

  useEffect(() => {
    if (showCompleted) return;
    const count = filteredTasks.length;
    if (
      count > prevFilteredCountRef.current &&
      prevFilteredCountRef.current > 0
    ) {
      if (scrollRef.current && scrollRef.current.scrollTop > 0) {
        scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    prevFilteredCountRef.current = count;
  }, [filteredTasks.length, showCompleted, scrollRef]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 150) {
      if (
        showCompleted &&
        hasMoreCompletedTasks &&
        !loadingCompleted &&
        currentViewId
      ) {
        fetchCompletedTasksPage(currentViewId, false);
      } else if (
        !showCompleted &&
        hasMoreTasks &&
        loadingQueue === 0 &&
        currentViewId
      ) {
        fetchTasksPage(currentViewId, false);
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
    scrollRef,
  ]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener("scroll", handleScroll);
      return () => scrollEl.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, scrollRef]);

  if (showCompleted) {
    return (
      <div className={styles.tasks}>
        <AnimatePresence mode="popLayout" initial={false}>
          {completedTasks.map((task) => (
            <TaskCardStatic key={task.task_id} task={task} />
          ))}
        </AnimatePresence>
        {loadingCompleted && (
          <div className={styles.tasks}>
            {Array(3)
              .fill(null)
              .map((_, index) => (
                <Skeleton
                  style={{
                    width: "100%",
                    height: "50px",
                    borderRadius: "15px",
                    backgroundColor: "var(--background-container)",
                  }}
                  delay={index * 0.15}
                  key={`skeleton-${index}`}
                />
              ))}
          </div>
        )}
        {!loadingCompleted && completedTasks.length === 0 && (
          <div className={styles.emptyTrash}>
            <TaskRemoveIcon
              className={styles.emptyTrashIcon}
              style={{
                width: "36px",
                height: "36px",
                stroke: "var(--text-not-available)",
                strokeWidth: 1.5,
              }}
            />
            <p className={styles.emptyTrashText}>No hay tareas completadas</p>
          </div>
        )}
      </div>
    );
  }

  if (filteredTasks.length > 0) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDraggedTask(null)}
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
                  padding: "16px 0",
                  width: "100%",
                }}
              >
                <LoadingIcon
                  style={{ width: "22px", stroke: "var(--text-not-available)" }}
                />
              </div>
            )}
          </div>
        </SortableContext>
        <DragOverlay>
          {draggedTask && <DragTaskCard task={draggedTask} />}
        </DragOverlay>
      </DndContext>
    );
  }

  if (loadingQueue > 0) {
    return (
      <div className={styles.tasks}>
        {Array(3)
          .fill(null)
          .map((_, index) => (
            <Skeleton
              style={{
                width: "100%",
                height: "50px",
                borderRadius: "15px",
                backgroundColor: "var(--background-container)",
              }}
              delay={index * 0.15}
              key={`skeleton-${index}`}
            />
          ))}
      </div>
    );
  }

  return (
    <div className={styles.empty}>
      <p>Sin tareas ni notas, agrega una desde la barra superior.</p>
    </div>
  );
});
