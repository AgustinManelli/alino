"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import { motion } from "motion/react";
import { useShallow } from "zustand/shallow";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { ColorPicker } from "@/components/ui/color-picker";
import { hexColorSchema } from "@/lib/schemas/validationSchemas";
import { PlusBoxIcon, SendIcon } from "@/components/ui/icons/icons";
import styles from "./ListInput.module.css";

const DEFAULT_COLOR = "#87189d";

export const ListInput = memo(() => {
  const [activeInput, setActiveInput] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [emoji, setEmoji] = useState<string | null>(null);

  const { insertList } = useTodoDataStore();
  const animations = useUserPreferencesStore(
    useShallow((state) => state.animations)
  );

  const inputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const resetForm = useCallback(() => {
    setInputValue("");
    setEmoji(null);
    setColor(DEFAULT_COLOR);
    setActiveInput(false);
  }, []);

  const handleSetColor = useCallback(
    (newColor: string, isTyping?: boolean) => {
      setColor(newColor);
      if (emoji && isTyping) {
        setEmoji(null);
      }
      if (isTyping) return;

      const validation = hexColorSchema.safeParse(newColor);
      if (!validation.success) {
        setColor(DEFAULT_COLOR);
        if (emoji) setEmoji(null);
      }
      inputRef.current?.focus();
    },
    [emoji]
  );

  const handleSetEmoji = useCallback((newEmoji: string | null) => {
    setEmoji(newEmoji);
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    const formatText = inputValue.replace(/\s+/g, " ").trim();
    if (formatText.length < 1) {
      resetForm();
      return;
    }

    insertList(formatText, color, emoji as string);

    resetForm();
  }, [inputValue, color, emoji, insertList, resetForm]);

  const handleClickOutside = useCallback(() => {
    const colorPickerContainer = document.getElementById(
      "color-picker-container-navbar-list-card"
    );
    if (inputValue === "" && !colorPickerContainer) {
      resetForm();
    }
  }, [inputValue, resetForm]);

  useOnClickOutside(formRef, handleClickOutside);

  useEffect(() => {
    if (activeInput) {
      inputRef.current?.focus();
    }
  }, [activeInput]);

  return (
    <motion.div className={styles.formContainer} layout>
      {activeInput ? (
        <motion.div
          className={styles.form}
          ref={formRef}
          transition={{ type: "spring", stiffness: 700, damping: 40 }}
          initial={animations ? { scale: 0, opacity: 0 } : undefined}
          animate={animations ? { scale: 1, opacity: 1 } : undefined}
          exit={animations ? { scale: 0, opacity: 0 } : undefined}
        >
          <div className={styles.colorPickerContainer}>
            <ColorPicker
              color={color}
              setColor={handleSetColor}
              emoji={emoji}
              setEmoji={handleSetEmoji}
              setOriginalColor={() => {
                setColor(DEFAULT_COLOR);
                setEmoji(null);
              }}
              uniqueId="navbar-list-card"
            />
          </div>
          <motion.input
            maxLength={30}
            type="text"
            placeholder="Cree una lista nueva"
            value={inputValue}
            ref={inputRef}
            onChange={(e) => setInputValue(e.target.value)}
            className={styles.inputText}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") resetForm();
            }}
          />
          <button
            className={styles.sendButton}
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <SendIcon
              style={{ width: 18, stroke: "var(--icon-color)", strokeWidth: 2 }}
            />
          </button>
        </motion.div>
      ) : (
        <motion.button
          onClick={() => setActiveInput(true)}
          className={styles.button}
          transition={{ type: "spring", stiffness: 700, damping: 40 }}
          initial={animations ? { scale: 0, opacity: 0 } : undefined}
          animate={animations ? { scale: 1, opacity: 1 } : undefined}
          exit={animations ? { scale: 0, opacity: 0 } : undefined}
        >
          <PlusBoxIcon
            style={{ width: 18, stroke: "var(--icon-color)", strokeWidth: 2 }}
          />
        </motion.button>
      )}
    </motion.div>
  );
});
