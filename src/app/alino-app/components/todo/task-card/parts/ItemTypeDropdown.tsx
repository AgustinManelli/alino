"use client";

import { RefObject } from "react";
import { Dropdown } from "@/components/ui/dropdown";
import { Note } from "@/components/ui/icons/icons";
import styles from "../task-card.module.css";

interface Item {
  id: number;
  label: string;
}

interface Props {
  completed: boolean | null;
  setCompleted: (value: boolean | null) => void;
  inputRef: RefObject<HTMLTextAreaElement>;
}

const items: Item[] = [
  { id: 1, label: "Tarea" },
  { id: 2, label: "Nota" },
];

export const ItemTypeSelector = ({
  completed,
  setCompleted,
  inputRef,
}: Props) => {
  const handleSelected = (item: Item) => {
    if (item.id === 1) {
      setCompleted(false);
    } else {
      setCompleted(null);
    }

    if (inputRef.current) {
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
      inputRef.current.focus();
    }
  };

  const renderItem = (item: Item) => (
    <div
      className={styles.dropdownItemContainer}
      style={{ justifyContent: "start" }}
    >
      <div style={{ width: "16px", height: "16px" }}>
        {item.id === 1 ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            style={{
              width: "15px",
              stroke: "var(--icon-colorv2)",
              strokeWidth: "2",
              fill: "transparent",
            }}
          >
            <path d="M12,2.5c-7.6,0-9.5,1.9-9.5,9.5s1.9,9.5,9.5,9.5s9.5-1.9,9.5-9.5S19.6,2.5,12,2.5z" />
          </svg>
        ) : (
          <Note
            style={{
              width: "15px",
              stroke: "var(--icon-colorv2)",
              strokeWidth: "2",
            }}
          />
        )}
      </div>
      <p>{item.label}</p>
    </div>
  );

  const renderTrigger = () => (
    <div className={styles.dropdownItemContainer}>
      <div style={{ width: "15px", height: "15px", display: "flex" }}>
        {completed !== null ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            style={{
              width: "15px",
              stroke: "var(--icon-colorv2)",
              strokeWidth: "2",
              fill: completed ? "var(--icon-colorv2)" : "transparent",
              transition: "fill 0.1s ease-in-out",
            }}
          >
            <path d="M12,2.5c-7.6,0-9.5,1.9-9.5,9.5s1.9,9.5,9.5,9.5s9.5-1.9,9.5-9.5S19.6,2.5,12,2.5z" />
            <path
              style={{
                stroke: "var(--icon-color-inside)",
                strokeWidth: 2,
                opacity: completed ? 1 : 0,
              }}
              strokeLinejoin="round"
              d="m6.68,13.58s1.18,0,2.76,2.76c0,0,3.99-7.22,7.88-8.67"
            />
          </svg>
        ) : (
          <Note
            style={{
              width: "15px",
              stroke: "var(--icon-colorv2)",
              strokeWidth: "2",
            }}
          />
        )}
      </div>
    </div>
  );

  return (
    <Dropdown
      items={items}
      renderItem={renderItem}
      triggerLabel={renderTrigger}
      setSelectedItem={handleSelected}
      side
      style={{ borderRadius: "10px", height: "25px", width: "25px" }}
    />
  );
};
