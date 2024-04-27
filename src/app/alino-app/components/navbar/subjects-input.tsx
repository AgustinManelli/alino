"use client";

import styles from "./subjects-input.module.css";
import { useEffect, useRef, useState } from "react";
import { useLists } from "@/store/lists";
import { LoadingIcon, PlusBoxIcon, SendIcon } from "@/lib/ui/icons";
import { ColorPicker } from "@/components/color-picker";
import { AnimatePresence, motion } from "framer-motion";

export default function SubjectsInput({
  setWaiting,
}: {
  setWaiting: (value: boolean) => void;
}) {
  const [input, setInput] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const [color, setColor] = useState<string>("#87189d");
  const [hover, setHover] = useState<boolean>(false);
  const [choosingColor, setChoosingColor] = useState<boolean>(false);
  const [transition, setTransition] = useState<boolean>(false);
  const setAddList = useLists((state) => state.setAddList);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const divRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    setWaiting(true);
    setTransition(true);
    await setAddList(value, color);
    setValue("");
    setTransition(false);
    setWaiting(false);
    setInput(false);
    setHover(false);
  };

  useEffect(() => {
    if (input) {
      if (inputRef.current !== null) {
        inputRef.current.focus();
      }
    }
  }, [input, color]);

  useEffect(function mount() {
    function divOnClick(event: MouseEvent | TouchEvent) {
      if (divRef.current !== null) {
        if (!divRef.current.contains(event.target as Node)) {
          if (value === "" && !choosingColor) {
            setColor("#87189d");
            setInput(false);
          }
          setHover(false);
        }
      }
    }
    window.addEventListener("mousedown", divOnClick);
    window.addEventListener("mouseup", divOnClick);

    return function unMount() {
      window.removeEventListener("mousedown", divOnClick);
      window.removeEventListener("mouseup", divOnClick);
    };
  });

  return (
    <div ref={divRef} className={styles.formContainer}>
      <AnimatePresence>
        {input || value !== "" ? (
          <motion.div
            className={styles.form}
            transition={{
              type: "spring",
              stiffness: 700,
              damping: 40,
            }}
            initial={{ scale: 0, opacity: 0, filter: "blur(30px)" }}
            animate={{
              scale: 1,
              opacity: 1,
              filter: "blur(0px)",
              transition: { duration: 0.2 },
            }}
            exit={{ scale: 0, opacity: 0, filter: "blur(30px)" }}
          >
            <ColorPicker
              color={color}
              setColor={setColor}
              choosingColor={choosingColor}
              setChoosingColor={setChoosingColor}
            />
            <input
              disabled={transition}
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
            ></input>
            {transition ? (
              <LoadingIcon
                style={{
                  width: "20px",
                  height: "auto",
                  stroke: "#000",
                  strokeWidth: "3",
                  opacity: "0.5",
                }}
              />
            ) : (
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
                    width: "20px",
                    stroke: "#1c1c1c",
                    strokeWidth: "2",
                    opacity: "0.5",
                  }}
                />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.button
            onClick={() => {
              setInput(true);
            }}
            className={styles.button}
            style={{
              backgroundColor: hover ? "rgb(240, 240, 240)" : "transparent",
            }}
            onMouseEnter={() => {
              setHover(true);
            }}
            onMouseLeave={() => {
              setHover(false);
            }}
            transition={{
              type: "spring",
              stiffness: 700,
              damping: 40,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <PlusBoxIcon
              style={{
                stroke: "#1c1c1c",
                strokeWidth: "1.5",
                width: "20px",
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
