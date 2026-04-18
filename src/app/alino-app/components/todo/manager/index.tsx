"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  memo,
  useLayoutEffect,
} from "react";

import { useUIStore } from "@/store/useUIStore";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useFetchCompletedTasksPage } from "@/hooks/todo/tasks/useFetchCompletedTasksPage";

import { ManagerHeader } from "./ManagerHeader";
import { ManagerConfig } from "./ManagerConfig";
import { ManagerInput } from "./ManagerInput";
import { ManagerTaskList } from "./ManagerTaskList";

import { ListsType } from "@/lib/schemas/database.types";

import styles from "./manager.module.css";

export const Manager = memo(function Manager({
  setList,
}: {
  setList?: ListsType;
}) {
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [isReordering, setIsReordering] = useState<boolean>(false);
  const [isNameChange, setIsNameChange] = useState<boolean>(false);

  const taskSort = useTodoDataStore((state) => state.taskSort);
  const { fetchCompletedTasksPage, isPending: loadingCompleted } =
    useFetchCompletedTasksPage();
  const setBlurredFx = useUIStore((state) => state.setColor);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const section1Ref = useRef<HTMLDivElement>(null);

  const currentViewId = setList?.list_id || null;

  useEffect(() => {
    if (taskSort !== "default") setIsReordering(false);
  }, [taskSort]);

  const handleToggleCompleted = useCallback(() => {
    const next = !showCompleted;
    setShowCompleted(next);
    if (next) {
      setIsReordering(false);
      if (currentViewId) fetchCompletedTasksPage(currentViewId, true);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [showCompleted, currentViewId, fetchCompletedTasksPage]);

  useEffect(() => {
    if (setList?.list.color) {
      setBlurredFx(setList.list.color);
    }
  }, [setList?.list.color, setBlurredFx]);

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

    return () => ro.disconnect();
  }, []);

  return (
    <div className={styles.container}>
      <section className={styles.section1} ref={section1Ref}>
        <div className={styles.header}>
          <ManagerHeader
            setList={setList}
            isNameChange={isNameChange}
            setIsNameChange={setIsNameChange}
          />

          <ManagerConfig
            setList={setList}
            showCompleted={showCompleted}
            handleToggleCompleted={handleToggleCompleted}
            isReordering={isReordering}
            setIsReordering={setIsReordering}
            setIsNameChange={setIsNameChange}
          />
        </div>

        <ManagerInput
          setList={setList}
          showCompleted={showCompleted}
          setShowCompleted={setShowCompleted}
          loadingCompleted={loadingCompleted}
        />
      </section>

      <section className={styles.section2}>
        <div
          className={styles.tasksSection}
          id="task-section-scroll-area"
          ref={scrollRef}
        >
          <ManagerTaskList
            setList={setList}
            showCompleted={showCompleted}
            isReordering={isReordering}
            scrollRef={scrollRef}
            loadingCompleted={loadingCompleted}
            currentViewId={currentViewId}
          />
        </div>
      </section>
    </div>
  );
});
