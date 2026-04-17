"use client";

import { useCallback, useRef, memo, CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";

import { FolderType } from "@/lib/schemas/database.types";

import { hexColorSchema } from "@/lib/schemas/list/validation";
import { useUpdateDataFolder } from "@/hooks/todo/folders/useUpdateDataFolder";

import { Check, FolderClosed, FolderOpen } from "@/components/ui/icons/icons";
import styles from "./FolderInfoEdit.module.css";
import { FolderColorPicker } from "../ColorPicker/FolderColorPicker";

interface Props {
  folder: FolderType;
  isNameChange: boolean;
  setIsNameChange: (value: boolean) => void;
  colorTemp: string | null;
  setColorTemp: (value: string | null) => void;
  folderOpen?: boolean;
}

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

export const FolderInfoEdit = memo(function ListInfoEdit({
  folder,
  isNameChange,
  setIsNameChange,
  colorTemp,
  setColorTemp,
  folderOpen = false,
}: Props) {
  const { updateDataFolder } = useUpdateDataFolder();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const isValidHex = useCallback((value: string) => {
    return hexColorSchema.safeParse(value).success;
  }, []);

  const handleSetColor = useCallback(
    (color: string, typing?: boolean) => {
      if (typing) {
        setColorTemp(color);
        return;
      }

      if (!isValidHex(color)) {
        setColorTemp(folder.folder_color);
        return;
      }

      setColorTemp(color);
      inputRef.current?.focus();
    },
    [isValidHex, setColorTemp, folder],
  );

  const setOriginalColor = useCallback(() => {
    setColorTemp(folder.folder_color);
  }, [folder, setColorTemp]);

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
      folder.folder_name === formatText &&
      folder.folder_color === colorTemp
    ) {
      setIsNameChange(false);
      return;
    }

    if (colorTemp && !isValidHex(colorTemp)) {
      setColorTemp(folder.folder_color);
      setIsNameChange(false);
      return;
    }

    el.value = formatText;
    setIsNameChange(false);

    const { error } = await updateDataFolder(
      folder.folder_id,
      formatText,
      colorTemp,
    );

    if (error) {
      setColorTemp(folder.folder_color);
    }
  }, [updateDataFolder, folder, colorTemp, setColorTemp, setIsNameChange]);

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

  return (
    <>
      <div className={styles.colorPickerContainer}>
        <AnimatePresence mode="wait">
          {isNameChange ? (
            <motion.div key="picker-view" style={{ height: "100%" }}>
              <FolderColorPicker
                color={colorTemp}
                setColor={handleSetColor}
                active={isNameChange}
                setOriginalColor={setOriginalColor}
                folderOpen={folderOpen}
              />
            </motion.div>
          ) : folderOpen ? (
            <motion.div
              key="emoji-view"
              transition={motionTransition}
              className={styles.emojiContainer}
            >
              <FolderOpen
                className={styles.folderIcon}
                style={
                  {
                    "--color":
                      folder.folder_color ?? "var(--text-not-available)",
                  } as CSSProperties
                }
              />
            </motion.div>
          ) : (
            <motion.div
              key="emoji-view"
              transition={motionTransition}
              className={styles.emojiContainer}
            >
              <FolderClosed
                className={styles.folderIcon}
                style={
                  {
                    "--color":
                      folder.folder_color ?? "var(--text-not-available)",
                  } as CSSProperties
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className={styles.textContainer}>
        <AnimatePresence mode="wait">
          {isNameChange ? (
            <motion.input
              key="input"
              style={{
                fontSize: "14px",
                fontWeight: "initial",
              }}
              maxLength={30}
              initial={motionInputInitialState}
              animate={motionInputFinalState}
              exit={motionInputInitialState}
              transition={motionTransition}
              className={styles.nameChangerInput}
              type="text"
              defaultValue={folder.folder_name}
              ref={inputRef}
              onKeyDown={handleKeyDown}
              id={`folder-info-edit-container`}
            />
          ) : (
            <span className={styles.listName}>{folder.folder_name}</span>
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
