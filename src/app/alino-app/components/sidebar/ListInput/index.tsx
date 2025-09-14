"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useShallow } from "zustand/shallow";

import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useInputActions } from "./hooks/useInputActions";

import { ColorPicker } from "@/components/ui/ColorPicker";
import { FolderColorPicker } from "@/components/ui/ColorPicker/FolderColorPicker";
import { DropdownListInput } from "./parts/DropdownListInput";

import { PlusBoxIcon, SendIcon } from "@/components/ui/icons/icons";
import styles from "./ListInput.module.css";

const DEFAULT_COLOR = "#87189d";
const DEFAULT_FOLDER_COLOR = null;

export const ListInput = () => {
  const [activeInput, setActiveInput] = useState<boolean>(false);

  const animations = useUserPreferencesStore(
    useShallow((state) => state.animations)
  );

  const inputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  const {
    color,
    emoji,
    isList,
    inputValue,
    handleSetColor,
    handleSetEmoji,
    setIsList,
    setInputValue,
    resetForm,
    handleSubmit,
  } = useInputActions({
    inputRef,
    setActiveInput,
    DEFAULT_COLOR,
    DEFAULT_FOLDER_COLOR,
  });

  useOnClickOutside(formRef, resetForm, [], "ignore-sidebar-close");

  useEffect(() => {
    if (activeInput) {
      inputRef.current?.focus();
    }
  }, [activeInput]);

  return (
    <div className={styles.formContainer}>
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
            {isList ? (
              <ColorPicker
                color={color}
                setColor={handleSetColor}
                emoji={emoji}
                setEmoji={handleSetEmoji}
                setOriginalColor={() => {
                  handleSetColor(DEFAULT_COLOR);
                  handleSetEmoji(null);
                }}
                uniqueId="navbar-list-card"
              />
            ) : (
              <FolderColorPicker
                color={color}
                setColor={handleSetColor}
                setOriginalColor={() => {
                  handleSetColor(DEFAULT_FOLDER_COLOR);
                }}
              />
            )}
          </div>
          <motion.input
            maxLength={30}
            type="text"
            placeholder={`Cree una ${isList ? "lista" : "carpeta"} nueva`}
            value={inputValue}
            ref={inputRef}
            onChange={(e) => setInputValue(e.target.value)}
            className={styles.inputText}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") resetForm();
            }}
          />
          <DropdownListInput
            isList={isList}
            color={color}
            setIsList={setIsList}
            setColor={handleSetColor}
            DEFAULT_COLOR={DEFAULT_COLOR}
          />
          <button
            className={styles.sendButton}
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <SendIcon
              style={{
                width: 18,
                stroke: "var(--icon-color)",
                strokeWidth: 2,
              }}
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
    </div>
  );
};
