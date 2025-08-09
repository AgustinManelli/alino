"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useShallow } from "zustand/shallow";

import { useTodoDataStore } from "@/store/useTodoDataStore";

import { ColorPicker } from "@/components/ui/color-picker";
import { hexColorSchema } from "@/lib/schemas/validationSchemas";

import { PlusBoxIcon, SendIcon } from "@/components/ui/icons/icons";
import styles from "./ListInput.module.css";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

export const ListInput = () => {
  const [activeInput, setActiveInput] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [color, setColor] = useState<string>("#87189d");
  const [emoji, setEmoji] = useState<string | null>(null);

  const { insertList } = useTodoDataStore();
  const animations = useUserPreferencesStore(
    useShallow((state) => state.animations)
  );

  const inputRef = useRef<HTMLInputElement | null>(null);
  const divRef = useRef<HTMLDivElement>(null);

  const handleSetColor = (color: string, typing?: boolean) => {
    setColor(color);

    if (emoji && typing) {
      setEmoji(null);
    }

    if (typing) return;

    const validation = hexColorSchema.safeParse(color);
    if (!validation.success) {
      setColor("#87189d");
      if (emoji) {
        setEmoji(null);
      }
    }

    if (activeInput) {
      if (inputRef.current !== null) {
        inputRef.current.focus();
      }
    }
  };

  const setOriginalColor = () => {
    setColor("#87189d");
    setEmoji(null);
  };

  const handleSetEmoji = (emoji: string | null) => {
    setEmoji(emoji);
    if (inputRef.current !== null) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = () => {
    setActiveInput(false);
    if (activeInput) {
      if (inputRef.current !== null) {
        inputRef.current.focus();
      }
    }
    const formatText = inputValue.replace(/\s+/g, " ").trim();

    if (formatText.length < 1) {
      setInputValue("");
      setEmoji(null);
      setColor("#87189d");
      return;
    }

    insertList(formatText, color, emoji as string);

    const scrollElement = document.getElementById("list-container");

    if (scrollElement) {
      setTimeout(() => {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight + 30,
          behavior: "smooth",
        });
      }, 0);
    }

    setInputValue("");
    setEmoji(null);
    setColor("#87189d");
  };

  useEffect(() => {
    if (activeInput) {
      if (inputRef.current !== null) {
        inputRef.current.focus();
      }
    }
  }, [activeInput]);

  useOnClickOutside(divRef, () => {
    const colorPickerContainer = document.getElementById(
      "color-picker-container-navbar-list-card"
    );
    if (inputValue === "" && !colorPickerContainer) {
      setEmoji("");
      setColor("#87189d");
      setActiveInput(false);
    }
  });

  const content = useMemo(() => {
    return (
      <motion.div className={styles.formContainer} layout>
        {activeInput || inputValue !== "" ? (
          <motion.div
            className={styles.form}
            transition={{
              type: "spring",
              stiffness: 700,
              damping: 40,
            }}
            initial={
              animations
                ? { scale: 0, opacity: 0, filter: "blur(30px)" }
                : undefined
            }
            animate={{
              scale: 1,
              opacity: 1,
              filter: "blur(0px)",
              transition: { duration: 0.2 },
            }}
            exit={
              animations
                ? { scale: 0, opacity: 0, filter: "blur(30px)" }
                : undefined
            }
            ref={divRef}
          >
            <div className={styles.colorPickerContainer}>
              <ColorPicker
                color={color}
                setColor={handleSetColor}
                emoji={emoji}
                setEmoji={handleSetEmoji}
                setOriginalColor={setOriginalColor}
                uniqueId="navbar-list-card"
              />
            </div>
            <motion.input
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
              type="text"
              placeholder="cree una lista nueva"
              value={inputValue}
              ref={inputRef}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
              className={styles.inputText}
              onKeyDown={(e) => {
                if (!inputRef.current) return;
                if (e.key === "Enter") {
                  handleSubmit();
                }
                if (e.key === "Escape") {
                  setActiveInput(false);
                }
              }}
            ></motion.input>

            <button
              style={{
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                display: "flex",
              }}
              onClick={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <SendIcon
                style={{
                  width: "18px",
                  stroke: "var(--icon-color)",
                  strokeWidth: "2",
                }}
              />
            </button>
          </motion.div>
        ) : (
          <motion.button
            onClick={() => {
              setActiveInput(true);
            }}
            className={styles.button}
            transition={{
              type: "spring",
              stiffness: 700,
              damping: 40,
            }}
            initial={animations ? { scale: 0, opacity: 0 } : undefined}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={animations ? { scale: 0, opacity: 0 } : undefined}
          >
            <PlusBoxIcon
              style={{
                stroke: "var(--icon-color)",
                strokeWidth: "1.5",
                width: "20px",
              }}
            />
          </motion.button>
        )}
      </motion.div>
    );
  }, [activeInput, inputValue, color, emoji, animations]);

  return <>{content}</>;
};
