"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";

import { useTodoDataStore } from "@/store/useTodoDataStore";

import { ColorPicker } from "@/components/ui/color-picker";
import { hexColorSchema } from "@/lib/schemas/validationSchemas";

import { PlusBoxIcon, SendIcon } from "@/components/ui/icons/icons";
import styles from "./ListInput.module.css";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useUIStore } from "@/store/useUIStore";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

export const ListInput = memo(() => {
  const [input, setInput] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const [color, setColor] = useState<string>("#87189d");
  const [emoji, setEmoji] = useState<string | null>(null);

  const setIsCreating = useUIStore((state) => state.setIsCreating);

  const { insertList } = useTodoDataStore();
  const { animations } = useUserPreferencesStore();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

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

    if (input) {
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
    setInput(false);
    setIsCreating(false);
    if (input) {
      if (inputRef.current !== null) {
        inputRef.current.focus();
      }
    }
    const formatText = value.replace(/\s+/g, " ").trim();

    if (formatText.length < 1) {
      setValue("");
      setEmoji(null);
      setColor("#87189d");
      return;
    }

    insertList(color, formatText, emoji as string);
    setValue("");
    setEmoji(null);
    setColor("#87189d");
  };

  useEffect(() => {
    if (input) {
      if (inputRef.current !== null) {
        inputRef.current.focus();
      }
    }
  }, [input]);

  useOnClickOutside(divRef, () => {
    const colorPickerContainer = document.getElementById(
      "color-picker-container-navbar-list-card"
    );
    if (value === "" && !colorPickerContainer) {
      setEmoji("");
      setColor("#87189d");
      setInput(false);
      setIsCreating(false);
    }
  });

  const content = useMemo(() => {
    return (
      <motion.div className={styles.formContainer} layout>
        {input || value !== "" ? (
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
              value={value}
              ref={inputRef}
              onChange={(e) => {
                setValue(e.target.value);
              }}
              className={styles.inputText}
              onKeyDown={(e) => {
                if (!inputRef.current) return;
                if (e.key === "Enter") {
                  handleSubmit();
                }
                if (e.key === "Escape") {
                  setInput(false);
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
              setInput(true);
              setIsCreating(true);
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
  }, [input, value, color, emoji, animations]);

  return <>{content}</>;
});
