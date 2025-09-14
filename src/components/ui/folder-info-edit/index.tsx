"use client";

import { useCallback, useRef, memo } from "react";
import { motion } from "motion/react";

import { FolderType } from "@/lib/schemas/todo-schema";
import { TextTitlesAnimation } from "@/components/ui/text-titles-animation";

import { hexColorSchema } from "@/lib/schemas/validationSchemas";
import { useTodoDataStore } from "@/store/useTodoDataStore";

import { Check } from "@/components/ui/icons/icons";
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

export const FolderInfoEdit = memo(function ListInfoEdit({
  folder,
  isNameChange,
  setIsNameChange,
  colorTemp,
  setColorTemp,
  folderOpen = false,
}: Props) {
  const updateDataFolder = useTodoDataStore((state) => state.updateDataFolder);

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
      }

      setColorTemp(color);
      inputRef.current?.focus();
    },
    [isValidHex, setColorTemp, folder]
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

    el.value = formatText;
    setIsNameChange(false);

    const { error } = await updateDataFolder(
      folder.folder_id,
      formatText,
      colorTemp
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
    [handleSaveName, setIsNameChange]
  );

  return (
    <>
      <div className={styles.colorPickerContainer}>
        <FolderColorPicker
          color={colorTemp}
          setColor={handleSetColor}
          active={isNameChange ? true : false}
          setOriginalColor={setOriginalColor}
          folderOpen={folderOpen}
        />
      </div>
      <div className={styles.textContainer}>
        {isNameChange ? (
          <motion.input
            style={{
              fontSize: "14px",
              fontWeight: "initial",
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
            defaultValue={folder.folder_name}
            ref={inputRef}
            onKeyDown={handleKeyDown}
            id={`folder-info-edit-container`}
          />
        ) : (
          <TextTitlesAnimation
            text={folder.folder_name}
            delay={0.3}
            duration={0.1}
            stagger={0.03}
            color={"var(--text)"}
            colorEffect={folder.folder_color ?? "var(--text-not-available)"}
            charSize={"14px"}
            fontWeight={"initial"}
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
