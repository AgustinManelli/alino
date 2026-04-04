"use client";
import { useCallback, useRef, useState } from "react";
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

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 700,
  damping: 40,
} as const;

export const ListInput = () => {
  const [activeInput, setActiveInput] = useState(false);

  const animations = useUserPreferencesStore(
    useShallow((state) => state.animations),
  );

  const motionProps = animations
    ? {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0, opacity: 0 },
      }
    : {};

  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  useOnClickOutside(
    containerRef,
    () => {
      if (activeInput) resetForm();
    },
    [],
    "ignore-sidebar-close",
  );

  const resetListColor = useCallback(() => {
    handleSetColor(DEFAULT_COLOR);
    handleSetEmoji(null);
  }, [handleSetColor, handleSetEmoji]);

  const resetFolderColor = useCallback(() => {
    handleSetColor(DEFAULT_FOLDER_COLOR);
  }, [handleSetColor]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSubmit();
      if (e.key === "Escape") resetForm();
    },
    [handleSubmit, resetForm],
  );

  const handleSend = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleSubmit();
    },
    [handleSubmit],
  );

  return (
    <div className={styles.formContainer} ref={containerRef}>
      <AnimatePresence mode="popLayout">
        {activeInput ? (
          <motion.div
            key="form"
            className={styles.form}
            transition={SPRING_TRANSITION}
            {...motionProps}
          >
            <div className={styles.colorPickerContainer}>
              {isList ? (
                <ColorPicker
                  color={color}
                  setColor={handleSetColor}
                  emoji={emoji}
                  setEmoji={handleSetEmoji}
                  setOriginalColor={resetListColor}
                  uniqueId="navbar-list-card"
                />
              ) : (
                <FolderColorPicker
                  color={color}
                  setColor={handleSetColor}
                  setOriginalColor={resetFolderColor}
                />
              )}
            </div>

            <input
              autoFocus
              maxLength={30}
              type="text"
              placeholder={`Cree una ${isList ? "lista" : "carpeta"} nueva`}
              value={inputValue}
              ref={inputRef}
              onChange={(e) => setInputValue(e.target.value)}
              className={styles.inputText}
              onKeyDown={handleKeyDown}
            />

            <DropdownListInput
              isList={isList}
              color={color}
              setIsList={setIsList}
              setColor={handleSetColor}
              DEFAULT_COLOR={DEFAULT_COLOR}
            />

            <button className={styles.sendButton} onClick={handleSend}>
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
            key="trigger"
            onClick={() => setActiveInput(true)}
            className={styles.button}
            transition={SPRING_TRANSITION}
            {...motionProps}
          >
            <PlusBoxIcon
              style={{ width: 18, stroke: "var(--icon-color)", strokeWidth: 2 }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
