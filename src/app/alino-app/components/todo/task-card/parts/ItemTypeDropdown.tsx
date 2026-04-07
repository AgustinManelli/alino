"use client";

import { RefObject } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { Note } from "@/components/ui/icons/icons";
import styles from "../task-card.module.css";

const TaskIcon = ({
  className,
  style,
  completed = false,
  ...props
}: React.SVGProps<SVGSVGElement> & { completed?: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    style={{
      ...style,
      fill: completed ? "var(--icon-colorv2)" : "transparent",
      transition: "fill 0.1s ease-in-out",
    }}
    className={className}
    {...props}
    stroke="currentColor"
    strokeWidth="1.5"
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
);

const ITEM_TYPE_OPTIONS = [
  { value: "task", label: "Tarea", icon: TaskIcon },
  { value: "note", label: "Nota", icon: Note },
] as const;

interface Props {
  completed: boolean | null;
  setCompleted: (value: boolean | null) => void;
  inputRef: RefObject<HTMLTextAreaElement>;
}

export const ItemTypeDropdown = ({
  completed,
  setCompleted,
  inputRef,
}: Props) => {
  const handleSelected = (value: "task" | "note") => {
    if (value === "task") {
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

  const renderTriggerContent = (): JSX.Element => {
    const isNote = completed === null;
    const Icon = isNote ? Note : TaskIcon;

    return (
      <div className={styles.dropdownItemContainer}>
        <div style={{ width: "15px", height: "15px", display: "flex" }}>
          <Icon
            style={{
              width: "15px",
              stroke: "var(--icon-colorv2)",
              strokeWidth: "2",
            }}
            completed={completed === true}
          />
        </div>
      </div>
    );
  };

  return (
    <Dropdown side>
      <Dropdown.Trigger
        style={{
          borderRadius: "10px",
          height: "25px",
          width: "25px",
        }}
      >
        {renderTriggerContent()}
      </Dropdown.Trigger>
      <Dropdown.Content className="no-close-edit">
        {ITEM_TYPE_OPTIONS.map((opt) => (
          <Dropdown.Item
            key={`item-type-${opt.value}`}
            onClick={() => handleSelected(opt.value)}
            isActive={
              (opt.value === "note" && completed === null) ||
              (opt.value === "task" && completed !== null)
            }
          >
            <opt.icon
              style={{
                width: "16px",
                height: "16px",
                strokeWidth: "2",
              }}
            />
            <p style={{ margin: 0 }}>{opt.label}</p>
          </Dropdown.Item>
        ))}
      </Dropdown.Content>
    </Dropdown>
  );
};
