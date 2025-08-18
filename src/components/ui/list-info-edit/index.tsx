"use client";

import React, { useCallback, useRef } from "react";
import { motion } from "motion/react";

import { ColorPicker } from "@/components/ui/color-picker";
import { ListsType } from "@/lib/schemas/todo-schema";
//import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { TextTitlesAnimation } from "@/components/ui/text-titles-animation";

import { hexColorSchema } from "@/lib/schemas/validationSchemas";
import { useTodoDataStore } from "@/store/useTodoDataStore";

import { Check } from "@/components/ui/icons/icons";
import styles from "./ListInfoEdit.module.css";

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

export const ListInfoEdit = React.memo(function ListInfoEdit({
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
  //const animations = useUserPreferencesStore((state) => state.animations);
  const updateDataList = useTodoDataStore((state) => state.updateDataList);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const isValidHex = useCallback((value: string) => {
    return hexColorSchema.safeParse(value).success;
  }, []);

  const handleSetColor = useCallback(
    (color: string, typing?: boolean) => {
      if (typing) {
        setColorTemp(color);
        if (emoji) setEmoji(null);
        return;
      }

      if (!isValidHex(color)) {
        setColorTemp(list.list.color);
        if (emoji) {
          setEmoji(list.list.icon);
        }
      }

      setColorTemp(color);
      inputRef.current?.focus();
    },
    [isValidHex, setColorTemp, emoji, setEmoji, list.list.color, list.list.icon]
  );

  const handleSetEmoji = useCallback(
    (newEmoji: string | null) => {
      setEmoji(newEmoji);
      inputRef.current?.focus();
    },
    [setEmoji]
  );

  const setOriginalColor = useCallback(() => {
    setColorTemp(list.list.color);
    setEmoji(list.list.icon);
  }, [list.list.color, list.list.icon, setColorTemp, setEmoji]);

  const handleSaveName = useCallback(async () => {
    const el = inputRef.current;
    if (!el) return;

    const raw = el.value;
    const formatText = raw.replace(/\s+/g, " ").trim();

    if (formatText.length < 1) {
      setIsNameChange(false);
      return;
    }

    if (
      list.list.list_name === formatText &&
      list.list.color === colorTemp &&
      list.list.icon === emoji
    ) {
      setIsNameChange(false);
      return;
    }

    el.value = formatText;
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
  }, [
    updateDataList,
    list.list_id,
    list.list.list_name,
    list.list.color,
    list.list.icon,
    colorTemp,
    emoji,
    setColorTemp,
    setEmoji,
    setIsNameChange,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!inputRef.current) return;
      if (e.key === "Enter") {
        e.preventDefault();
        handleSaveName();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsNameChange(false);
      }
    },
    [handleSaveName, setIsNameChange]
  );

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
            onKeyDown={handleKeyDown}
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
});
