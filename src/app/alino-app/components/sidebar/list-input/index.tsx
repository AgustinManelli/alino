"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import { motion } from "motion/react";
import { useShallow } from "zustand/shallow";
import { toast } from "sonner";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

import { ColorPicker } from "@/components/ui/color-picker";
import { Dropdown } from "@/components/ui/dropdown";
import { FolderColorPicker } from "@/components/ui/color-picker/folder-color-picker";

import {
  hexColorSchema,
  shortcodeEmojiSchema,
} from "@/lib/schemas/validationSchemas";
import {
  FolderOpen,
  ListIcon,
  PlusBoxIcon,
  SendIcon,
} from "@/components/ui/icons/icons";
import styles from "./ListInput.module.css";

const DEFAULT_COLOR = "#87189d";
const DEFAULT_FOLDER_COLOR = null;

interface Item {
  id: number;
  label: string;
}

export const ListInput = () => {
  const [activeInput, setActiveInput] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [color, setColor] = useState<string | null>(DEFAULT_COLOR);
  const [emoji, setEmoji] = useState<string | null>(null);
  const [isList, setIsList] = useState<boolean>(true);

  const { insertList, insertFolder } = useTodoDataStore(
    useShallow((state) => ({
      insertList: state.insertList,
      insertFolder: state.insertFolder,
    }))
  );
  const animations = useUserPreferencesStore(
    useShallow((state) => state.animations)
  );

  const inputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  const resetForm = useCallback(() => {
    setActiveInput(false);
    setInputValue("");
    setColor(DEFAULT_COLOR);
    setEmoji(null);
    setIsList(true);
  }, []);

  const handleSetColor = useCallback(
    (newColor: string | null, isTyping?: boolean) => {
      setColor(newColor);

      if (emoji && isTyping) {
        setEmoji(null);
      }

      if (isTyping) {
        return;
      }

      const validation = hexColorSchema.safeParse(newColor);
      if (!validation.success) {
        setColor(isList ? DEFAULT_COLOR : DEFAULT_FOLDER_COLOR);
        if (emoji) setEmoji(null);
        toast.error(validation.error.issues[0].message);
      }
      inputRef.current?.focus();
    },
    [emoji, isList]
  );

  const handleSetEmoji = useCallback((newEmoji: string | null) => {
    const validation = shortcodeEmojiSchema.safeParse(newEmoji);
    if (!validation.success) {
      setEmoji(null);
      toast.error(validation.error.issues[0].message);
    } else {
      setEmoji(newEmoji);
    }
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    const formatText = inputValue.replace(/\s+/g, " ").trim();

    if (formatText.length < 1) {
      resetForm();
      return;
    }

    isList && color
      ? insertList(formatText, color, emoji as string)
      : insertFolder(formatText, color);

    const scrollElement = document.getElementById("list-container");
    if (scrollElement) {
      setTimeout(() => {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
    }
    resetForm();
  }, [inputValue, color, emoji, insertList, insertFolder, resetForm, isList]);

  useOnClickOutside(formRef, resetForm, [], "ignore-sidebar-close");

  useEffect(() => {
    if (activeInput) {
      inputRef.current?.focus();
    }
  }, [activeInput]);

  const renderItemType = (item: Item) => {
    return (
      <div
        className={styles.dropdownItemContainer}
        style={{ justifyContent: "start" }}
      >
        <p>{item.label}</p>
      </div>
    );
  };

  const triggerLabelType = () => {
    return (
      <div
        className={styles.dropdownItemContainer}
        style={{ justifyContent: "start" }}
      >
        <div
          style={{
            width: "15px",
            height: "15px",
            display: "flex",
          }}
        >
          {isList ? (
            <ListIcon
              style={{
                stroke: "var(--text-not-available)",
                width: "15px",
                height: "15px",
                strokeWidth: 2,
              }}
            />
          ) : (
            <FolderOpen
              style={{
                stroke: "var(--text-not-available)",
                width: "15px",
                height: "15px",
                strokeWidth: 2,
              }}
            />
          )}
        </div>
      </div>
    );
  };

  const handleSelected = (item: Item) => {
    if (item.id === 1) {
      setIsList(true);
      if (color === null) setColor(DEFAULT_COLOR);
      return;
    }
    if (item.id === 2) {
      setIsList(false);
      setColor(null);
      return;
    }
  };

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
            {isList ? (
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
            ) : (
              <FolderColorPicker
                color={color}
                setColor={handleSetColor}
                setOriginalColor={() => {
                  setColor(DEFAULT_FOLDER_COLOR);
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
          <div className={styles.typeSelectorContainer}>
            <Dropdown
              items={[
                { id: 1, label: "Lista" },
                { id: 2, label: "Carpeta" },
              ]}
              renderItem={renderItemType}
              triggerLabel={triggerLabelType}
              selectedListHome={
                isList ? { id: 1, label: "Tarea" } : { id: 2, label: "Nota" }
              }
              setSelectedListHome={handleSelected}
              boxSize={30}
              style={{ borderRadius: "10px" }}
              directionContainerShow={false}
            />
          </div>
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
    </motion.div>
  );
};
