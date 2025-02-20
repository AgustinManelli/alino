"use client";

import { useEffect, useRef, useState } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import styles from "./task-input.module.css";
import { Database } from "@/lib/schemas/todo-schema";
import { Calendar } from "@/components/ui/calendar";
import { Dropdown } from "@/components/ui/dropdown";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { EmojiMartComponent } from "@/components/ui/emoji-mart/emoji-mart-component";
import {
  LoadingIcon,
  NoList,
  SendIcon,
  SquircleIcon,
} from "@/components/ui/icons/icons";
import { motion } from "motion/react";
import { easeInOut } from "motion";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function TaskInput({ setList }: { setList?: ListsType }) {
  const lists = useTodoDataStore((state) => state.lists);
  const [task, setTask] = useState<string>("");
  const [focus, setFocus] = useState<boolean>(false);
  const [selected, setSelected] = useState<Date>();
  const [hour, setHour] = useState<string | undefined>();
  const isMobile = usePlatformInfoStore((state) => state.isMobile);
  const executedRef = useRef(false);
  const [selectedListHome, setSelectedListHome] = useState<
    ListsType | undefined
  >(lists[0]);

  useEffect(() => {
    // if (executedRef.current) return;
    executedRef.current = true;
    if (
      (lists.length > 0 && !selectedListHome) ||
      (lists.length > 0 &&
        !lists.find((list) => list.id === selectedListHome?.id))
    ) {
      setSelectedListHome(lists[0]);
    } else if (selectedListHome) {
      setSelectedListHome(
        lists[lists.findIndex((list) => list.id === selectedListHome.id)]
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
    if (task.length === 0) return;
    const combinedDate = combineDateAndTime(selected, hour);
    setTask("");
    setSelected(undefined);
    setHour(undefined);
    if (setList) {
      addTask(setList.id, task, combinedDate);
    } else {
      if (!selectedListHome) return;
      addTask(selectedListHome.id, task, combinedDate);
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
            (list.icon !== null ? (
              <EmojiMartComponent shortcodes={list.icon} size="16px" />
            ) : (
              <SquircleIcon
                style={{
                  width: "14px",
                  fill: `${list.color}`,
                  transition: "fill 0.2s ease-in-out",
                  display: "flex",
                }}
              />
            ))}
        </div>
        <p>{list.name}</p>
      </div>
    );
  };

  const triggerLabel = () => {
    return (
      <div className={styles.dropdownItemContainer}>
        {selectedListHome ? (
          selectedListHome.icon !== null ? (
            <div
              style={{
                width: "18px",
                height: "18px",
              }}
            >
              <EmojiMartComponent
                shortcodes={selectedListHome.icon}
                size="18px"
              />
            </div>
          ) : (
            <SquircleIcon
              style={{
                width: "14px",
                fill: `${selectedListHome?.color}`,
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

  const [height, setHeight] = useState("40px");
  const tempRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tempRef.current && inputRef.current) {
      tempRef.current.style.height = "auto";

      const newHeight = inputRef.current.scrollHeight + 13 + "px";
      setHeight(newHeight);
    }
  }, [task]);

  const handleFocusToParentInput = () => {
    if (inputRef) inputRef.current?.focus();
  };

  const Ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(Ref, () => {
    const calendarComponent = document.getElementById("calendar-component");
    const dropdownComponent = document.getElementById("dropdown-component");
    if (calendarComponent || dropdownComponent) return;
    setFocus(false);
  });

  const handleOnClick = () => {
    setFocus(true);
    const calendarComponent = document.getElementById("calendar-component");
    const dropdownComponent = document.getElementById("dropdown-component");
    if (!inputRef || calendarComponent || dropdownComponent) return;
    inputRef.current?.focus();
  };

  return (
    <section
      className={styles.container}
      ref={Ref}
      onClick={handleOnClick}
      style={{ cursor: "text" }}
    >
      <div className={styles.formContainer}>
        <div className={styles.form}>
          <motion.div
            className={styles.inputContainer}
            ref={tempRef}
            initial={{ height: 40 }}
            animate={{ height }}
            transition={{ duration: 0.2 }}
          >
            <textarea
              ref={inputRef}
              maxLength={200}
              rows={1}
              className={styles.input}
              placeholder="ingrese una tarea"
              value={task}
              onChange={(e) => {
                setTask(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
                if (e.key === "Escape") {
                  setTask("");
                  inputRef.current?.blur();
                }
              }}
              style={{ cursor: "text" }}
            />
          </motion.div>
          <div className={styles.inputManagerContainer}>
            <AnimatePresence>
              {isHome && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: focus || isMobile ? 1 : 0 }}
                  exit={{ scale: 0 }}
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: focus || isMobile ? 1 : 0 }}
                exit={{ scale: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Calendar
                  selected={selected}
                  setSelected={setSelected}
                  hour={hour}
                  setHour={handleSetHour}
                  focusToParentInput={handleFocusToParentInput}
                />
              </motion.div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: focus || isMobile ? 30 : 0 }}
                exit={{ height: 0 }}
                style={{
                  width: "1px",
                  height: "30px",
                  backgroundColor: "rgb(240, 240, 240)",
                }}
              ></motion.div>
              <motion.button
                className={styles.taskSendButton}
                onClick={handleAdd}
                initial={{ scale: 0 }}
                animate={{ scale: focus || isMobile ? 1 : 0 }}
                exit={{ scale: 0 }}
                transition={{ delay: 0.1 }}
              >
                <SendIcon
                  style={{
                    width: "20px",
                    height: "auto",
                    stroke: "#1c1c1c",
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
                  task.length > 150
                    ? task.length > 180
                      ? task.length > 195
                        ? "#fc0303"
                        : "#fc8003"
                      : "#ffb300"
                    : "#8a8a8a",
              }}
            >
              {task.length}/200
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
