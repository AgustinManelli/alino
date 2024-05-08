"use client";

import { useEffect, useRef, useState } from "react";
import { useLists } from "@/store/lists";
import styles from "./todo-input.module.css";
import PriorityPicker from "@/components/priority-picker";
import { Checkbox } from "@/components/inputs/checkbox/checkbox";
import { motion } from "framer-motion";
import { AddTaskToDB } from "@/lib/todo/actions";
import { Database } from "@/lib/todosSchema";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

const priorityFocus = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
  },
  exit: { opacity: 0, scale: 0 },
};

export default function TodoInput({ setList }: { setList: ListsType }) {
  // const setAddTask = useLists((state) => state.setAddList);

  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [task, setTask] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false);
  const [priority, setPriority] = useState<number>(3);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(function mount() {
    function formOnClick(event: MouseEvent | TouchEvent) {
      if (formRef.current !== null) {
        if (!formRef.current.contains(event.target as Node)) {
          setIsFocus(false);
          setPriority(0);
        } else {
          setIsFocus(true);
        }
      }
    }

    window.addEventListener("mousedown", formOnClick);
    window.addEventListener("mouseup", formOnClick);

    return function unMount() {
      window.removeEventListener("mousedown", formOnClick);
      window.removeEventListener("mouseup", formOnClick);
    };
  });

  const addTask = useLists((state) => state.addTask);

  const handleAdd = async () => {
    // await setAddTask(task, status, priority, listSelected.id);
    // await AddTaskToDB(setList.id, task);
    await addTask(setList.id, task);

    setTask("");
  };

  return (
    <section className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.form} ref={formRef}>
          {/* <Checkbox status={status} setStatus={setStatus} /> */}
          <input
            className={styles.input}
            type="text"
            placeholder="ingrese una tarea"
            value={task}
            onChange={(e) => {
              setTask(e.target.value);
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleAdd();
              }
            }}
          ></input>
          {isFocus ? (
            <motion.div
              variants={priorityFocus}
              transition={{ ease: "easeOut", duration: 0.2 }}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <PriorityPicker />
            </motion.div>
          ) : (
            ""
          )}
        </div>
      </div>
    </section>
  );
}
