"use client";

import styles from "./listInput.module.css";
import { useEffect, useRef, useState } from "react";
import { useLists } from "@/store/lists";
import { PlusBoxIcon, SendIcon } from "@/lib/ui/icons";
import { ColorPicker } from "@/components";
import { motion } from "motion/react";

export default function ListInput({
  setIsCreating,
}: {
  setIsCreating: (value: boolean) => void;
}) {
  const [input, setInput] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const [color, setColor] = useState<string>("#87189d");
  const [hover, setHover] = useState<boolean>(false);
  const [choosingColor, setChoosingColor] = useState<boolean>(false);
  const [isOpenPicker, setIsOpenPicker] = useState<boolean>(false);

  const setAddList = useLists((state) => state.setAddList);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [emoji, setEmoji] = useState<string>("");

  const handleSubmit = async () => {
    setInput(false);
    setHover(false);
    setIsCreating(false);
    if (input) {
      if (inputRef.current !== null) {
        inputRef.current.focus();
      }
    }
    setValue("");
    setEmoji("");
    setColor("#87189d");
    await setAddList(color, value, emoji as string);
  };

  useEffect(() => {
    if (input) {
      if (inputRef.current !== null) {
        inputRef.current.focus();
      }
    }
  }, [input, color, emoji]);

  useEffect(() => {
    function divOnClick(event: MouseEvent | TouchEvent) {
      if (divRef.current !== null) {
        if (!divRef.current.contains(event.target as Node)) {
          if (value === "" && !isOpenPicker) {
            setEmoji("");
            setColor("#87189d");
            setInput(false);
            setIsCreating(false);
          }
          setHover(false);
        }
      }
    }
    window.addEventListener("mousedown", divOnClick);
    window.addEventListener("mouseup", divOnClick);

    return () => {
      window.removeEventListener("mousedown", divOnClick);
      window.removeEventListener("mouseup", divOnClick);
    };
  });

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
          initial={{ scale: 0, opacity: 0, filter: "blur(30px)" }}
          animate={{
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            transition: { duration: 0.2 },
          }}
          exit={{ scale: 0, opacity: 0, filter: "blur(30px)" }}
          ref={divRef}
        >
          <div className={styles.colorPickerContainer}>
            <ColorPicker
              portalRef={portalRef}
              isOpenPicker={isOpenPicker}
              setIsOpenPicker={setIsOpenPicker}
              color={color}
              setColor={setColor}
              emoji={emoji}
              setEmoji={setEmoji}
            />
          </div>
          <input
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
        </motion.div>
      ) : (
        <motion.button
          onClick={() => {
            setInput(true);
            setIsCreating(true);
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
    </motion.div>
  );
}
