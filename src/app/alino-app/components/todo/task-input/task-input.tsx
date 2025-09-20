"use client";

import { useEffect, useRef, useState } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import styles from "./task-input.module.css";
import { ListsType } from "@/lib/schemas/database.types";
import { Calendar } from "@/components/ui/Calendar";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { EmojiMartComponent } from "@/components/ui/EmojiMart/emoji-mart-component";
import {
  NoList,
  Note,
  SendIcon,
  SquircleIcon,
} from "@/components/ui/icons/icons";
import { motion } from "motion/react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { TextAnimation } from "@/components/ui/text-animation";
import { ItemTypeDropdown } from "./parts/ItemTypeDropdown";
import { ListSelectorDropdown } from "./parts/ListSelectorDropdown";

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

    const combined = new Date(selected);

    const [hours, minutes] = (hour ? hour : "23:59").split(":").map(Number);

    combined.setHours(hours);
    combined.setMinutes(minutes);
    combined.setSeconds(0);
    combined.setMilliseconds(0);

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
    console.log(combinedDate);
    console.log(hour);
    console.log(selected);
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
              <ItemTypeDropdown
                isNote={isNote}
                setIsNote={setIsNote}
                inputRef={inputRef}
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
                  <ListSelectorDropdown
                    lists={lists}
                    selectedList={selectedListHome}
                    setSelectedList={setSelectedListHome}
                    inputRef={inputRef}
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
