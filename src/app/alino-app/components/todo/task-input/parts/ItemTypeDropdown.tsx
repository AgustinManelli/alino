"use client";

import { Dropdown } from "@/components/ui/Dropdown";
import { Note } from "@/components/ui/icons/icons";
import styles from "../task-input.module.css";

interface Item {
  id: number;
  label: string;
}

interface Props {
  isNote: boolean;
  setIsNote: (value: boolean) => void;
}

const items: Item[] = [
  { id: 1, label: "Tarea" },
  { id: 2, label: "Nota" },
];

export const ItemTypeDropdown = ({ isNote, setIsNote }: Props) => {
  const handleSelected = (item: Item) => {
    setIsNote(item.id === 2);
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
    <div
      className={styles.dropdownItemContainer}
      style={{ justifyContent: "start" }}
    >
      <div style={{ width: "15px", height: "15px", display: "flex" }}>
        {!isNote ? (
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
