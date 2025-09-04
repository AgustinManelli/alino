"use client";

import { useEffect, useRef, useState } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import styles from "./task-input.module.css";
import { ListsType } from "@/lib/schemas/todo-schema";
import { Calendar } from "@/components/ui/calendar";
import { Dropdown } from "@/components/ui/dropdown";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { EmojiMartComponent } from "@/components/ui/emoji-mart/emoji-mart-component";
import {
  NoList,
  Note,
  SendIcon,
  SquircleIcon,
} from "@/components/ui/icons/icons";
import { motion } from "motion/react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { TextAnimation } from "@/components/ui/text-animation";

const MAX_HEIGHT = 200;

export default function TaskInput({ setList }: { setList?: ListsType }) {
  const lists = useTodoDataStore((state) => state.lists);
  const [task, setTask] = useState<string>("");
  const [focus, setFocus] = useState<boolean>(false);
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState<string | undefined>(undefined);
  const [isNote, setIsNote] = useState<boolean>(false);
  const executedRef = useRef(false);
  const [selectedListHome, setSelectedListHome] = useState<
    ListsType | undefined
  >(lists[0]);

  useEffect(() => {
    executedRef.current = true;
    if (
      (lists.length > 0 && !selectedListHome) ||
      (lists.length > 0 &&
        !lists.find((list) => list.list_id === selectedListHome?.list_id))
    ) {
      setSelectedListHome(lists[0]);
    } else if (selectedListHome) {
      setSelectedListHome(
        lists[
          lists.findIndex((list) => list.list_id === selectedListHome.list_id)
        ]
      );
    }
  }, [lists]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const addTask = useTodoDataStore((state) => state.addTask);

  function combineDateAndTime(
    selected: Date | undefined,
    hour: string | undefined
  ) {
    if (!selected) {
      return null;
    }

    // Crear una nueva instancia de Date basada en 'selected'
    const combined = new Date(selected);

    // Dividir la cadena 'hour' en horas y minutos
    const [hours, minutes] = (hour ? hour : "23:59").split(":").map(Number);

    // Establecer las horas y minutos en la nueva fecha
    combined.setHours(hours);
    combined.setMinutes(minutes);
    combined.setSeconds(0); // Opcional: establecer segundos a 0
    combined.setMilliseconds(0); // Opcional: establecer milisegundos a 0

    // Devolver la cadena en formato ISO 8601
    return combined.toISOString();
  }

  const handleAdd = () => {
    const formatText = task
      .replace(/\r\n/g, "\n")
      .replace(/ {2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^[ ]+|[ ]+$/g, "");
    if (formatText.length < 1) {
      setTask("");
      setSelected(undefined);
      setHour(undefined);
      return;
    }
    const combinedDate = combineDateAndTime(selected, hour);
    setTask("");
    setSelected(undefined);
    setHour(undefined);
    if (setList) {
      addTask(setList.list_id, formatText, combinedDate, isNote);
    } else {
      if (!selectedListHome) return;
      addTask(selectedListHome.list_id, formatText, combinedDate, isNote);
    }
  };

  const handleSetHour = (value: string | undefined) => {
    setHour(value);
  };

  const pathname = usePathname();
  const isHome = pathname === "/alino-app";

  const renderItem = (list: ListsType) => {
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
          {list &&
            (list.list.icon !== null ? (
              <EmojiMartComponent shortcodes={list.list.icon} size="16px" />
            ) : (
              <SquircleIcon
                style={{
                  width: "14px",
                  fill: `${list.list.color}`,
                  transition: "fill 0.2s ease-in-out",
                  display: "flex",
                }}
              />
            ))}
        </div>
        <p>{list.list.list_name}</p>
      </div>
    );
  };

  const triggerLabel = () => {
    return (
      <div className={styles.dropdownItemContainer}>
        {selectedListHome ? (
          selectedListHome.list.icon !== null ? (
            <div
              style={{
                width: "18px",
                height: "18px",
              }}
            >
              <EmojiMartComponent
                shortcodes={selectedListHome.list.icon}
                size="18px"
              />
            </div>
          ) : (
            <SquircleIcon
              style={{
                width: "14px",
                fill: `${selectedListHome?.list.color}`,
                transition: "fill 0.2s ease-in-out",
              }}
            />
          )
        ) : (
          <NoList
            style={{
              width: "15px",
              height: "auto",
              stroke: "#1c1c1c",
              strokeWidth: 2,
              opacity: 0.3,
            }}
          />
        )}
        {/* <p>{selectedListHome?.name}</p> */}
      </div>
    );
  };

  interface Item {
    id: number;
    label: string;
  }

  const renderItemType = (item: Item) => {
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

  const triggerLabelType = () => {
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
          {!isNote ? (
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
      setIsNote(false);
      return;
    }
    setIsNote(true);
  };

  const [height, setHeight] = useState("40px");
  const [isScrollable, setIsScrollable] = useState(false);
  const tempRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tempRef.current && inputRef.current) {
      tempRef.current.style.height = "auto";

      const newHeight = inputRef.current.scrollHeight + 13;
      const clamped = Math.min(newHeight, MAX_HEIGHT);
      setHeight(clamped + "px");

      setIsScrollable(newHeight > MAX_HEIGHT);
    }
  }, [task, focus]);

  const handleFocusToParentInput = () => {
    if (inputRef) inputRef.current?.focus();
  };

  const Ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(Ref, () => {
    const calendarComponent = document.getElementById("calendar-component");
    const dropdownComponent = document.getElementById("dropdown-component");
    if (calendarComponent || dropdownComponent) return;
    if (task) return;
    setFocus(false);
    setTask("");
    setHour(undefined);
    setSelected(undefined);
    setHeight("40px");
    setIsScrollable(false);
  });

  const handleOnClick = () => {
    setFocus(true);
    const calendarComponent = document.getElementById("calendar-component");
    const dropdownComponent = document.getElementById("dropdown-component");
    if (!inputRef || calendarComponent || dropdownComponent) return;
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [focus]);

  const texts = [
    "Planificar las vacaciones 🏖️",
    "Sacar a pasear al perro 🐶❣️",
    "Estudiar para el examen",
    "Ponerme al día con los estudios",
    "Pagar las facturas de servicios 💸",
    "Lavar la ropa 🫧",
    "Hacer la compra semanal",
    "Regar las plantas 🪴",
    "Organizar mi semana escolar",
    "Entregar trabajo",
  ];

  const randomIndex = Math.floor(Math.random() * texts.length);
  const [currentText, setCurrentText] = useState(texts[randomIndex]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * texts.length);
    setCurrentText(texts[randomIndex]);
    const interval = setInterval(() => {
      setCurrentText((prev) => {
        const currentIndex = texts.indexOf(prev);
        return texts[(currentIndex + 1) % texts.length];
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [focus]);

  return (
    <section
      className={styles.container}
      ref={Ref}
      onClick={handleOnClick}
      style={{ cursor: "text" }}
    >
      <div className={styles.formContainer}>
        <div className={styles.form}>
          <div
            className={styles.inputManagerContainer}
            style={{ marginTop: "12.5px" }}
          >
            <motion.div
              key="dropdown"
              initial={{ scale: 0 }}
              animate={{ scale: focus ? 1 : 0 }}
              exit={{ scale: 0 }}
            >
              <Dropdown
                items={[
                  { id: 1, label: "Tarea" },
                  { id: 2, label: "Nota" },
                ]}
                renderItem={renderItemType}
                triggerLabel={triggerLabelType}
                selectedListHome={
                  isNote ? { id: 1, label: "Tarea" } : { id: 2, label: "Nota" }
                }
                setSelectedListHome={handleSelected}
                boxSize={25}
                style={{ borderRadius: "10px" }}
                directionContainerShow={true}
              />
            </motion.div>
          </div>
          <motion.div
            className={styles.inputContainer}
            ref={tempRef}
            initial={{ height: 40 }}
            animate={{ height }}
            transition={{ duration: 0.2 }}
          >
            {focus && (
              <textarea
                ref={inputRef}
                maxLength={1000}
                rows={1}
                className={styles.input}
                // placeholder="ingrese una tarea"
                value={task}
                onChange={(e) => {
                  setTask(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const el = e.currentTarget as HTMLTextAreaElement;
                    const start = el.selectionStart;
                    const end = el.selectionEnd;
                    const value = el.value;
                    const newValue =
                      value.substring(0, start) + "\t" + value.substring(end);
                    setTask(newValue);
                    requestAnimationFrame(() => {
                      el.selectionStart = el.selectionEnd = start + 1;
                    });
                    return;
                  }
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAdd();
                    setFocus(false);
                    setHeight("40px");
                    setIsScrollable(false);
                  }
                  if (e.key === "Escape") {
                    setTask("");
                    setFocus(false);
                    setHeight("40px");
                    setIsScrollable(false);
                    inputRef.current?.blur();
                  }
                }}
                style={{
                  overflowY: isScrollable ? "auto" : "hidden",
                }}
              />
            )}
          </motion.div>
          {!focus && (
            <div className={styles.placeholder}>
              <TextAnimation
                style={{
                  fontSize: "14px",
                  height: "17px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                text={currentText}
                textColor="var(--placeholder-text-color)"
                opacity={0.3}
              />
            </div>
          )}
          <div className={styles.inputManagerContainer}>
            <AnimatePresence mode="popLayout">
              {isHome && (
                <motion.div
                  key="dropdown"
                  initial={{ scale: 0 }}
                  animate={{ scale: focus ? 1 : 0 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <Dropdown
                    items={lists}
                    renderItem={renderItem}
                    triggerLabel={triggerLabel}
                    selectedListHome={selectedListHome}
                    setSelectedListHome={setSelectedListHome}
                    handleFocusToParentInput={handleFocusToParentInput}
                  />
                </motion.div>
              )}
              {!isNote && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: focus ? 1 : 0 }}
                  exit={{ scale: 0 }}
                  transition={{ delay: 0.05 }}
                  key="calendar"
                  layout
                >
                  <Calendar
                    selected={selected}
                    setSelected={setSelected}
                    hour={hour}
                    setHour={handleSetHour}
                    focusToParentInput={handleFocusToParentInput}
                  />
                </motion.div>
              )}
              <motion.div
                key="separator"
                initial={{ height: 0 }}
                animate={{ height: focus ? 30 : 0 }}
                exit={{ height: 0 }}
                style={{
                  width: "1px",
                  height: "30px",
                  backgroundColor: "var(--icon-color)",
                  opacity: 0.2,
                }}
              ></motion.div>
              <motion.button
                key="send-button"
                className={styles.taskSendButton}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAdd();
                  setFocus(false);
                  setHeight("40px");
                  setIsScrollable(false);
                }}
                initial={{ scale: 0 }}
                animate={{ scale: focus ? 1 : 0 }}
                exit={{ scale: 0 }}
                transition={{ delay: 0.1 }}
              >
                <SendIcon
                  style={{
                    width: "20px",
                    height: "auto",
                    stroke: "var(--icon-color)",
                    strokeWidth: 1.5,
                  }}
                />
              </motion.button>
            </AnimatePresence>
          </div>
          {task.length > 0 && (
            <p
              className={styles.limitIndicator}
              style={{
                color:
                  task.length > 700
                    ? task.length > 800
                      ? task.length > 900
                        ? "#fc0303"
                        : "#fc8003"
                      : "#ffb300"
                    : "#8a8a8a",
              }}
            >
              {task.length}/1000
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
