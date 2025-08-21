"use client";

import { useState, useRef, useEffect, memo, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { useShallow } from "zustand/shallow";
import { debounce } from "lodash-es";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useEditTaskModalStore } from "@/store/useEditTaskModalStore";
//import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import type { TaskType } from "@/lib/schemas/todo-schema";

import { ConfigMenu } from "@/components/ui/config-menu";
import { TimeLimitBox } from "@/components/ui/time-limit-box";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Check,
  DeleteIcon,
  Edit,
  Information,
  Link,
  Note,
} from "@/components/ui/icons/icons";
import styles from "./task-card.module.css";
import { Dropdown } from "@/components/ui/dropdown";
import { animate } from "motion";

const WavyStrikethrough = memo(
  ({ lines, completed, generateWavePath }: any) => (
    <>
      {lines.map((line: any, index: number) => (
        <motion.div
          key={`${line.top}-${line.left}-${line.width}`}
          style={{
            position: "absolute",
            pointerEvents: "none",
            top: line.top,
            left: line.left - 10,
            width: line.width + 20,
          }}
        >
          <motion.svg
            width="100%"
            height="6"
            viewBox={`0 0 ${line.width + 15} 6`}
            style={{ display: "block" }}
          >
            <motion.path
              d={generateWavePath(line.width + 15)}
              stroke="var(--text)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: completed ? 1 : 0 }}
              transition={{
                duration: 0.2,
                delay: completed
                  ? index * 0.1
                  : (lines.length - index - 1) * 0.1,
                ease: "easeInOut",
              }}
            />
          </motion.svg>
        </motion.div>
      ))}
    </>
  )
);

export const TaskCard = memo(
  ({
    task,
    editionMode = false,
  }: {
    task: TaskType;
    editionMode?: boolean;
  }) => {
    const [completed, setCompleted] = useState<boolean | null>(task.completed);
    const [inputName, setInputName] = useState<string>(task.task_content);
    const [editing, setEditing] = useState<boolean>(editionMode);
    const [lines, setLines] = useState<
      { width: number; top: number; left: number }[]
    >([]);
    const [selected, setSelected] = useState<Date>();
    const [hour, setHour] = useState<string | undefined>();

    const openModal = useEditTaskModalStore((state) => state.openModal);
    const taskEditing = useEditTaskModalStore((state) => state.task);
    const closeModal = useEditTaskModalStore((state) => state.closeModal);

    const textRef = useRef<HTMLParagraphElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const checkButtonRef = useRef<HTMLButtonElement>(null);

    //const animations = useUserPreferencesStore((store) => store.animations);
    const { user, list, updateTaskName, deleteTask, updateTaskCompleted } =
      useTodoDataStore(
        useShallow((state) => ({
          user: state.user,
          list: state.getListById(task.list_id),
          updateTaskName: state.updateTaskName,
          deleteTask: state.deleteTask,
          updateTaskCompleted: state.updateTaskCompleted,
        }))
      );

    const canEditOrDelete = list?.role !== "reader";

    const generateWavePath = useCallback((width: number) => {
      const waveSegments = Math.max(4, Math.floor(width / 20));
      const step = width / waveSegments;
      return `M 0 3 ${Array.from(
        { length: waveSegments },
        (_, i) =>
          `Q ${step * (i + 0.5)} ${i % 2 === 0 ? 0 : 6}, ${step * (i + 1)} 3`
      ).join(" ")}`;
    }, []);

    useEffect(() => {
      setCompleted(task.completed);
      setInputName(task.task_content);
    }, [task.completed, task.task_content]);

    const calculateLines = useCallback(() => {
      const el = textRef.current;
      if (!el) return;

      const parent = el.parentElement;
      if (!parent) return;

      requestAnimationFrame(() => {
        try {
          const range = document.createRange();
          range.selectNodeContents(el);
          const rects = Array.from(range.getClientRects());
          if (!rects.length) {
            setLines([]);
            return;
          }

          const pRect = el.getBoundingClientRect();
          const parentRect = parent.getBoundingClientRect();

          type RectInfo = {
            leftP: number;
            topP: number;
            height: number;
            rightP: number;
            centerYP: number;
          };

          const rectInfos: RectInfo[] = rects
            .filter((r) => r.width > 0 && r.height > 0)
            .map((r) => {
              const leftP = r.left - pRect.left;
              const topP = r.top - pRect.top;
              const height = r.height;
              const rightP = leftP + r.width;
              const centerYP = topP + height / 2;
              return { leftP, topP, height, rightP, centerYP };
            });

          const LINE_MERGE_THRESHOLD = 6;
          const groups: Array<RectInfo[]> = [];
          rectInfos.forEach((ri) => {
            let found = false;
            for (const g of groups) {
              const avgCenter =
                g.reduce((s, x) => s + x.centerYP, 0) / g.length;
              if (Math.abs(avgCenter - ri.centerYP) <= LINE_MERGE_THRESHOLD) {
                g.push(ri);
                found = true;
                break;
              }
            }
            if (!found) groups.push([ri]);
          });

          const SVG_HEIGHT = 6;
          const SVG_CENTER = SVG_HEIGHT / 2;
          const VERTICAL_ADJUST = 0;

          const newLines = groups.map((g) => {
            const minLeftP = Math.min(...g.map((x) => x.leftP));
            const maxRightP = Math.max(...g.map((x) => x.rightP));
            const avgCenterYP =
              g.reduce((s, x) => s + x.centerYP, 0) / g.length;
            const width = maxRightP - minLeftP;

            const pOffsetTopInParent = Math.round(pRect.top - parentRect.top);
            const pOffsetLeftInParent = Math.round(
              pRect.left - parentRect.left
            );

            const topRelativeToParent = Math.round(
              pOffsetTopInParent + (avgCenterYP - SVG_CENTER + VERTICAL_ADJUST)
            );
            const leftRelativeToParent = Math.round(
              pOffsetLeftInParent + minLeftP
            );

            return {
              left: leftRelativeToParent,
              top: topRelativeToParent,
              width: Math.round(width),
            };
          });

          setLines(newLines);
        } catch {
          setLines([]);
        }
      });
    }, []);

    const handleUpdateStatus = useCallback(() => {
      const newCompleted = !completed;
      setCompleted(newCompleted);
      updateTaskCompleted(task.task_id, newCompleted);
    }, [completed, task.task_id, updateTaskCompleted]);

    const handleSaveName = useCallback(async () => {
      setEditing(false);

      if (editionMode) {
        closeModal();
      }

      const formatText = inputName
        .trim()
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n");

      if (
        (task.task_content === formatText && completed === task.completed) ||
        formatText.length < 1
      ) {
        setInputName(task.task_content);
        return;
      }

      setInputName(formatText);

      const { error } = await updateTaskName(
        task.task_id,
        formatText,
        completed
      );
      if (error) setInputName(task.task_content);
    }, [inputName, completed, task.task_content, task.task_id, updateTaskName]);

    const handleEdit = useCallback(() => {
      if (editionMode && !completed) {
        setEditing(true);
      }
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      openModal({
        task: task,
        onConfirm: () => {},
        initialRect: rect,
      });
    }, [openModal, task]);

    const handleDelete = useCallback(
      () => deleteTask(task.task_id),
      [task.task_id, deleteTask]
    );

    useEffect(() => {
      calculateLines();
      const debouncedCalculateLines = debounce(calculateLines, 150);

      // Observador de tamaño para re-calcular cuando cambie el párrafo
      let ro: ResizeObserver | null = null;
      if (textRef.current && typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => debouncedCalculateLines());
        ro.observe(textRef.current);
      }

      window.addEventListener("resize", debouncedCalculateLines);

      return () => {
        debouncedCalculateLines.cancel();
        window.removeEventListener("resize", debouncedCalculateLines);
        if (ro && textRef.current) ro.unobserve(textRef.current);
      };
    }, [calculateLines, editing, task.task_content]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        const dropdownComponent = document.getElementById("dropdown-component");
        const calendarComponent = document.getElementById("calendar-component");

        if (
          inputRef.current &&
          !inputRef.current.contains(event.target as Node) &&
          checkButtonRef.current &&
          !checkButtonRef.current.contains(event.target as Node) &&
          cardRef.current &&
          !cardRef.current.contains(event.target as Node) &&
          !dropdownComponent &&
          !calendarComponent
        ) {
          setEditing(false);
          setInputName(task.task_content);
          setCompleted(task.completed);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [editing, task.task_content]);

    useEffect(() => {
      if (inputRef.current) {
        const length = inputRef.current.value.length;
        inputRef.current.setSelectionRange(length, length);
        inputRef.current.focus();
      }
    }, [editing]);

    function autoResize(textarea: any) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }

    useEffect(() => {
      if (!inputRef.current) return;
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = inputRef.current.scrollHeight + "px";
    }, [editing]);

    const configOptions = useMemo(() => {
      const baseOptions = [
        {
          name: "Editar",
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
          action: handleEdit,
          enabled: canEditOrDelete,
        },
        {
          name: "Eliminar",
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
          action: handleDelete,
          enabled: canEditOrDelete,
        },
        // {
        //   name: "Información",
        //   icon: (
        //     <Information
        //       style={{
        //         stroke: "var(--text)",
        //         width: "14px",
        //         height: "auto",
        //         strokeWidth: 2,
        //       }}
        //     />
        //   ),
        //   action: () => {},
        //   enabled: true,
        // },
      ];
      return baseOptions.filter((option) => option.enabled);
    }, [handleEdit, handleDelete]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!inputRef.current) return;
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSaveName();
        } else if (e.key === "Escape") {
          e.preventDefault();
          setEditing(false);
          setInputName(task.task_content);
        }
      },
      [handleSaveName, setInputName]
    );

    const shortenUrl = (rawUrl: string, maxChars = 36) => {
      const trimmed = rawUrl.trim();
      try {
        const hasScheme = /^https?:\/\//i.test(trimmed);
        const candidate = hasScheme ? trimmed : `https://${trimmed}`;

        if (/^\s*(javascript|data|vbscript):/i.test(candidate))
          throw new Error("invalid scheme");

        // const url = rawUrl.toLowerCase().startsWith("http")
        //   ? rawUrl
        //   : `https://${rawUrl}`;
        const u = new URL(candidate);
        const host = u.hostname.replace(/^www\./, "");
        const path = u.pathname + u.search + u.hash;
        if (path === "/" || path === "") return host;
        const shortPath =
          path.length > maxChars
            ? path.slice(0, Math.max(6, maxChars - 3)) + "..."
            : path;
        return `${host}${shortPath.startsWith("/") ? "" : "/"}${shortPath}`;
      } catch {
        if (trimmed.length <= maxChars) return trimmed;
        return trimmed.slice(0, maxChars - 3) + "...";
      }
    };

    const linkifyWithIcon = useCallback(
      (text: string) => {
        const pattern =
          /(https?:\/\/[^\s\[\]]+|www\.[^\s\[\]]+)(?:\[([^\]]+)\])?/gi;
        const nodes: Array<string | JSX.Element> = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;
        let idx = 0;

        while ((match = pattern.exec(text)) !== null) {
          const start = match.index;
          const end = pattern.lastIndex;

          if (start > lastIndex) nodes.push(text.slice(lastIndex, start));

          const raw = match[1];
          const labelGroup = match[2];
          let label = labelGroup ? labelGroup.trim() : shortenUrl(raw, 30);

          if (label.length > 30) {
            label = label.slice(0, 30) + "…";
          }

          const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
          if (/^\s*(javascript|data|vbscript):/i.test(candidate)) {
            nodes.push(raw);
            lastIndex = end;
            continue;
          }

          const href = candidate;

          nodes.push(
            <a
              key={`link-${start}-${idx}-${raw}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkBox}
              title={href}
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                style={{
                  width: "14px",
                  height: "auto",
                  stroke: "currentColor",
                  strokeWidth: 2,
                }}
                aria-hidden
              />
              <span className={styles.linkText}>{label}</span>
            </a>
          );

          lastIndex = end;
          idx++;
        }

        if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

        return nodes;
      },
      [shortenUrl]
    );

    const linkedContent = useMemo(
      () => linkifyWithIcon(editionMode ? inputName : task.task_content),
      [task.task_content, linkifyWithIcon]
    );

    interface Item {
      id: number;
      label: string;
    }

    const renderItem = (item: Item) => {
      return (
        <div
          className={styles.dropdownItemContainer}
          style={{ justifyContent: "start" }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
            }}
          >
            {item.id === 1 && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                style={{
                  width: "15px",
                  stroke: "var(--icon-colorv2)",
                  strokeWidth: "2",
                  overflow: "visible",
                  fill: "var(--icon-colorv2)",
                  transition: "fill 0.1s ease-in-out",
                  transform: "scale(1)",
                }}
              >
                <path
                  d={
                    "M12,2.5c-7.6,0-9.5,1.9-9.5,9.5s1.9,9.5,9.5,9.5s9.5-1.9,9.5-9.5S19.6,2.5,12,2.5z"
                  }
                />
                <path
                  style={{ stroke: "var(--icon-color-inside)", strokeWidth: 2 }}
                  strokeLinejoin="round"
                  d="m6.68,13.58s1.18,0,2.76,2.76c0,0,3.99-7.22,7.88-8.67"
                />
              </svg>
            )}
            {item.id === 2 && (
              <Note
                style={{
                  width: "15px",
                  stroke: "var(--icon-colorv2)",
                  strokeWidth: "2",
                  overflow: "visible",
                  fill: "transparent",
                  transition: "fill 0.1s ease-in-out",
                  transform: "scale(1)",
                }}
              />
            )}
          </div>
          <p>{item.label}</p>
        </div>
      );
    };

    const triggerLabel = () => {
      return (
        <div
          className={styles.dropdownItemContainer}
          style={{ justifyContent: "start" }}
        >
          <div
            style={{
              width: "15px",
              height: "15px",
              display: "flex",
            }}
          >
            {completed !== null ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                style={{
                  width: "15px",
                  stroke: "var(--icon-colorv2)",
                  strokeWidth: "2",
                  overflow: "visible",
                  fill: "transparent",
                  transition: "fill 0.1s ease-in-out",
                  transform: "scale(1)",
                }}
              >
                <path
                  d={
                    "M12,2.5c-7.6,0-9.5,1.9-9.5,9.5s1.9,9.5,9.5,9.5s9.5-1.9,9.5-9.5S19.6,2.5,12,2.5z"
                  }
                />
              </svg>
            ) : (
              <Note
                style={{
                  width: "15px",
                  stroke: "var(--icon-colorv2)",
                  strokeWidth: "2",
                  overflow: "visible",
                  fill: "transparent",
                  transition: "fill 0.1s ease-in-out",
                  transform: "scale(1)",
                }}
              />
            )}
          </div>
        </div>
      );
    };

    const handleSelected = (item: Item) => {
      if (item.id === 1) {
        setCompleted(false);
        return;
      }
      setCompleted(null);
    };

    const isVisible =
      taskEditing?.task_id === task.task_id && !editionMode ? 0 : 1;

    useEffect(() => {
      if (!cardRef.current) return;

      animate(
        cardRef.current,
        { opacity: isVisible },
        {
          duration: 0,
          delay: isVisible === 1 ? 0.3 : 0,
        }
      );
    }, [isVisible]);

    return (
      <div
        className={styles.cardContainer}
        ref={cardRef}
        style={{
          paddingLeft: editing ? "10px" : "15px",
        }}
      >
        <div className={styles.checkboxContainer}>
          {!editing ? (
            task.completed !== null ? (
              <Checkbox
                status={completed}
                handleUpdateStatus={handleUpdateStatus}
                id={task.task_id}
              />
            ) : (
              <Note
                style={{
                  width: "15px",
                  stroke: "var(--icon-colorv2)",
                  strokeWidth: "2",
                  opacity: "0.2",
                }}
              />
            )
          ) : (
            <Dropdown
              items={[
                { id: 1, label: "Tarea" },
                { id: 2, label: "Nota" },
              ]}
              renderItem={renderItem}
              triggerLabel={triggerLabel}
              selectedListHome={
                completed ? { id: 1, label: "Tarea" } : { id: 2, label: "Nota" }
              }
              setSelectedListHome={handleSelected}
              boxSize={25}
              style={{ borderRadius: "10px" }}
              directionContainerShow={true}
            />
          )}
        </div>
        <div className={styles.textContainer}>
          {editing ? (
            <textarea
              ref={inputRef}
              maxLength={500}
              rows={1}
              className={styles.nameChangerInput}
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
              }}
              onInput={(e) => autoResize(e.target)}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <>
              <p
                ref={textRef}
                className={styles.text}
                style={{
                  opacity: completed ? 0.3 : 1,
                }}
              >
                {linkedContent}
              </p>
              <WavyStrikethrough
                lines={lines}
                completed={completed}
                generateWavePath={generateWavePath}
              />
            </>
          )}
        </div>
        {user?.user_id !== task.created_by?.user_id && (
          <div
            style={{
              width: "25px",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              opacity: 0.2,
            }}
          >
            <div
              style={{
                width: "25px",
                height: "25px",
                backgroundImage: `url(${task.created_by?.avatar_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                borderRadius: "50%",
              }}
            ></div>
          </div>
        )}
        <div className={styles.editingButtons}>
          <TimeLimitBox
            target_date={task.target_date}
            idScrollArea={"task-section-scroll-area"}
            completed={completed}
          />
          {editing ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                handleSaveName();
              }}
              className={styles.checkButton}
              ref={checkButtonRef}
            >
              <Check
                style={{
                  width: "100%",
                  height: "auto",
                  stroke: "var(--icon-color)",
                  strokeWidth: 2,
                }}
              />
            </button>
          ) : (
            <ConfigMenu
              iconWidth={"25px"}
              configOptions={configOptions}
              idScrollArea={"task-section-scroll-area"}
            />
          )}
        </div>
      </div>
    );
  }
);
