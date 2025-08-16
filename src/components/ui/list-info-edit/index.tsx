"use client";

import { useRef } from "react";
import { motion } from "motion/react";

import { ColorPicker } from "../color-picker";
import { ListsType } from "@/lib/schemas/todo-schema";
import { hexColorSchema } from "@/lib/schemas/validationSchemas";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { TextTitlesAnimation } from "../text-titles-animation";

import styles from "./ListInfoEdit.module.css";
import { Check } from "../icons/icons";

interface props {
  list: ListsType;
  isNameChange: boolean;
  setIsNameChange: (value: boolean) => void;
  colorTemp: string;
  setColorTemp: (value: string) => void;
  emoji: string | null;
  setEmoji: (value: string | null) => void;
  uniqueId?: string;
  big?: boolean;
}

export function ListInfoEdit({
  list,
  isNameChange,
  setIsNameChange,
  colorTemp,
  setColorTemp,
  emoji,
  setEmoji,
  uniqueId = "default",
  big = false,
}: props) {
  const animations = useUserPreferencesStore((state) => state.animations);
  useUserPreferencesStore;
  const updateDataList = useTodoDataStore((state) => state.updateDataList);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSetColor = (color: string, typing?: boolean) => {
    setColorTemp(color);

    if (emoji && typing) setEmoji(null);

    if (typing) return;

    const validation = hexColorSchema.safeParse(color);

    if (!validation.success) {
      setColorTemp(list.list.color);
      if (emoji) {
        setEmoji(list.list.icon);
      }
    }

    inputRef.current?.focus();
  };

  const handleSetEmoji = (newEmoji: string | null) => {
    setEmoji(newEmoji);
    inputRef.current?.focus();
  };

  const setOriginalColor = () => {
    setColorTemp(list.list.color);
    setEmoji(list.list.icon);
  };

  const handleSaveName = async () => {
    if (
      !inputRef.current ||
      inputRef.current === null ||
      inputRef.current.value.length < 1
    ) {
      return;
    }

    const formatText = inputRef.current.value.replace(/\s+/g, " ").trim();

    if (formatText.length < 1) {
      setIsNameChange(false);
      return;
    }

    if (
      list.list.list_name === inputRef.current.value &&
      list.list.color === colorTemp &&
      list.list.icon === emoji
    ) {
      setIsNameChange(false);
      return;
    }

    inputRef.current.value = formatText;

    setIsNameChange(false);

    const { error } = await updateDataList(
      list.list_id,
      formatText,
      colorTemp,
      emoji
    );
    if (error) {
      setColorTemp(list.list.color);
      setEmoji(list.list.icon);
    }
  };

  return (
    <>
      <div className={styles.colorPickerContainer}>
        <ColorPicker
          color={colorTemp}
          setColor={handleSetColor}
          emoji={emoji}
          setEmoji={handleSetEmoji}
          active={isNameChange ? true : false}
          setOriginalColor={setOriginalColor}
          uniqueId={"navbar-list-card"}
          big={big ? true : false}
        />
      </div>
      <div className={styles.textContainer}>
        {isNameChange ? (
          <motion.input
            style={{
              fontSize: big ? "18px" : "14px",
              fontWeight: big ? "600" : "initial",
            }}
            maxLength={30}
            initial={{
              backgroundColor: "var(--background-over-container)",
            }}
            animate={{
              backgroundColor: "var(--background-over-container)",
            }}
            transition={{
              backgroundColor: {
                duration: 0.3,
              },
            }}
            className={styles.nameChangerInput}
            type="text"
            defaultValue={list.list.list_name}
            ref={inputRef}
            onKeyDown={(e) => {
              if (!inputRef.current) return;
              if (e.key === "Enter") {
                handleSaveName();
              }
              if (e.key === "Escape") {
                setIsNameChange(false);
              }
            }}
            id={`list-info-edit-container-${uniqueId}`}
          />
        ) : (
          <TextTitlesAnimation
            text={list.list.list_name}
            delay={0.3}
            duration={0.1}
            stagger={0.03}
            color={"var(--text)"}
            colorEffect={list.list.color}
            charSize={big ? "18px" : "14px"}
            fontWeight={big ? "600" : "initial"}
            onceAnimation={isNameChange}
          />
        )}
      </div>
      {isNameChange && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSaveName();
          }}
          className={styles.checkButton}
        >
          <Check
            style={{
              width: "23px",
              height: "auto",
              stroke: "var(--icon-color)",
              strokeWidth: 2,
            }}
          />
        </button>
      )}
    </>
  );
}
