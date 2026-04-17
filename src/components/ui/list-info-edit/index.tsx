"use client";

import { useCallback, useRef, memo } from "react";
import { AnimatePresence, motion } from "motion/react";

import { ColorPicker } from "@/components/ui/ColorPicker/ListColorPicker";
import { ListsType } from "@/lib/schemas/database.types";

import { hexColorSchema } from "@/lib/schemas/list/validation";
import { useUpdateDataList } from "@/hooks/todo/lists/useUpdateDataList";

import { Check, SquircleIcon } from "@/components/ui/icons/icons";
import styles from "./ListInfoEdit.module.css";
import { EmojiMartComponent } from "../EmojiMart/emoji-mart-component";

interface Props {
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

const isValidHex = (value: string) => {
  return hexColorSchema.safeParse(value).success;
};

const motionInputInitialState = {
  backgroundColor: "transparent",
  paddingLeft: "0px",
};

const motionInputFinalState = {
  backgroundColor: "var(--background-over-container)",
  paddingLeft: "10px",
};

const motionTransition = {
  duration: 0.3,
};

export const ListInfoEdit = memo(function ListInfoEdit({
  list,
  isNameChange,
  setIsNameChange,
  colorTemp,
  setColorTemp,
  emoji,
  setEmoji,
  uniqueId = "default",
  big = false,
}: Props) {
  const { updateDataList } = useUpdateDataList();
  const inputRef = useRef<HTMLInputElement | null>(null);

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
        return;
      }

      setColorTemp(color);
      inputRef.current?.focus();
    },
    [setColorTemp, emoji, setEmoji, list.list.color, list.list.icon],
  );

  const handleSetEmoji = useCallback(
    (newEmoji: string | null) => {
      setEmoji(newEmoji);
      inputRef.current?.focus();
    },
    [setEmoji],
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

    if (!isValidHex(colorTemp)) {
      setColorTemp(list.list.color);
      setEmoji(list.list.icon);
      setIsNameChange(false);
      return;
    }

    el.value = formatText;
    setIsNameChange(false);

    const { error } = await updateDataList(
      list.list_id,
      formatText,
      colorTemp,
      emoji,
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
    [handleSaveName, setIsNameChange],
  );

  const handleSaveClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleSaveName();
    },
    [handleSaveName],
  );

  const inputStyle = {
    fontSize: big ? "18px" : "14px",
    fontWeight: big ? "600" : "initial",
  };

  return (
    <>
      <div className={styles.colorPickerContainer}>
        <AnimatePresence mode="wait">
          {isNameChange ? (
            <motion.div key="picker-view" style={{ height: "100%" }}>
              <ColorPicker
                key={uniqueId}
                color={colorTemp}
                setColor={handleSetColor}
                emoji={emoji}
                setEmoji={handleSetEmoji}
                setOriginalColor={setOriginalColor}
                uniqueId={uniqueId}
                big={big}
              />
            </motion.div>
          ) : emoji ? (
            <motion.div key="emoji-view" className={styles.emojiContainer}>
              <EmojiMartComponent
                shortcodes={emoji}
                size={big ? "20px" : "16px"}
              />
            </motion.div>
          ) : (
            <motion.div key="squircle-view" className={styles.emojiContainer}>
              <SquircleIcon
                style={{
                  fill: colorTemp,
                  width: big ? "16px" : "12px",
                  height: big ? "16px" : "12px",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className={styles.textContainer}>
        <AnimatePresence mode="wait">
          {isNameChange ? (
            <motion.input
              style={inputStyle}
              maxLength={30}
              initial={motionInputInitialState}
              animate={motionInputFinalState}
              exit={motionInputInitialState}
              transition={motionTransition}
              className={styles.nameChangerInput}
              type="text"
              defaultValue={list.list.list_name}
              ref={inputRef}
              onKeyDown={handleKeyDown}
              id={`list-info-edit-container-${uniqueId}`}
            />
          ) : (
            <span className={styles.listName} style={inputStyle}>
              {list.list.list_name}
            </span>
          )}
        </AnimatePresence>
      </div>
      {isNameChange && (
        <button onClick={handleSaveClick} className={styles.checkButton}>
          <Check className={styles.checkIconStyle} />
        </button>
      )}
    </>
  );
});
