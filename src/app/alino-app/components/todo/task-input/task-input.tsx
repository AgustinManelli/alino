"use client";

import { useRef, useState } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import styles from "./task-input.module.css";
import { Database } from "@/lib/schemas/todo-schema";
import { Calendar } from "@/components/ui/calendar";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function TaskInput({ setList }: { setList?: ListsType }) {
  const [task, setTask] = useState<string>("");
  const [inputFocus, setInputFocus] = useState<boolean>(false);
  const [selected, setSelected] = useState<Date>();
  const [hour, setHour] = useState<string | undefined>();

  const inputRef = useRef<HTMLInputElement>(null);

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
    const [hours, minutes] = (hour ? hour : "00:00").split(":").map(Number);

    // Establecer las horas y minutos en la nueva fecha
    combined.setHours(hours);
    combined.setMinutes(minutes);
    combined.setSeconds(0); // Opcional: establecer segundos a 0
    combined.setMilliseconds(0); // Opcional: establecer milisegundos a 0

    // Devolver la cadena en formato ISO 8601
    return combined.toISOString();
  }

  const handleAdd = () => {
    const combinedDate = combineDateAndTime(selected, hour);
    setTask("");
    setSelected(undefined);
    setHour(undefined);
    if (!setList) return;
    addTask(setList.id, task, combinedDate);
  };

  return (
    <section className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.form}>
          <input
            ref={inputRef}
            maxLength={200}
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
              if (e.key === "Escape") {
                setTask("");
                inputRef.current?.blur();
              }
            }}
            disabled={!setList}
          ></input>
          <Calendar
            selected={selected}
            setSelected={setSelected}
            hour={hour}
            setHour={setHour}
          />
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
