"use client";

import { RefObject } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { Note } from "@/components/ui/icons/icons";
import styles from "../task-input.module.css";

const TaskIcon = ({
  className,
  style,
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    style={{ ...style, fill: "transparent" }}
    className={className}
    {...props}
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M12,2.5c-7.6,0-9.5,1.9-9.5,9.5s1.9,9.5,9.5,9.5s9.5-1.9,9.5-9.5S19.6,2.5,12,2.5z" />
  </svg>
);

const ITEM_TYPE_OPTIONS = [
  { value: "task", label: "Tarea", icon: TaskIcon },
  { value: "note", label: "Nota", icon: Note },
] as const;

interface Props {
  isNote: boolean;
  setIsNote: (value: boolean) => void;
  inputRef: RefObject<HTMLTextAreaElement>;
}

export const ItemTypeDropdown = ({
  isNote,
  setIsNote,
  inputRef,
}: Props): JSX.Element => {
  const handleSelected = (value: "task" | "note"): void => {
    setIsNote(value === "note");

    if (inputRef.current) {
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
      inputRef.current.focus();
    }
  };

  const renderTriggerContent = (): JSX.Element => {
    const activeOption = ITEM_TYPE_OPTIONS.find((opt) =>
      isNote ? opt.value === "note" : opt.value === "task",
    );
    const Icon = activeOption?.icon || TaskIcon;

    return (
      <div
        className={styles.dropdownItemContainer}
        style={{ justifyContent: "start" }}
      >
        <div style={{ width: "15px", height: "15px", display: "flex" }}>
          <Icon
            style={{
              width: "15px",
              stroke: "var(--icon-colorv2)",
              strokeWidth: "2",
            }}
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
          height: "30px",
          width: "30px",
        }}
      >
        {renderTriggerContent()}
      </Dropdown.Trigger>

      <Dropdown.Content>
        {ITEM_TYPE_OPTIONS.map((opt) => (
          <Dropdown.Item
            key={`item-type-${opt.value}`}
            onClick={() => handleSelected(opt.value)}
            isActive={
              (opt.value === "note" && isNote) ||
              (opt.value === "task" && !isNote)
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
