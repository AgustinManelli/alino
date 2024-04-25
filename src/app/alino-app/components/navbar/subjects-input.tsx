"use client";

import styles from "./subjects-input.module.css";
import { AddSubjectToDB, GetSubjects } from "@/lib/todo/actions";
import { useEffect, useRef, useState } from "react";
import { useLists } from "@/store/lists";
import { LoadingIcon, PlusBoxIcon } from "@/lib/ui/icons";
import { ColorPicker } from "@/components/color-picker";

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
  const setLists = useLists((state) => state.setLists);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const divRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    setWaiting(true);
    setTransition(true);
    await AddSubjectToDB(value, color);
    const { data: getSubjects } = (await GetSubjects()) as any;
    setLists(getSubjects);
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
    <div ref={divRef}>
      {input || value !== "" ? (
        <div className={styles.form}>
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
              }}
            />
          ) : (
            ""
          )}
          <ColorPicker
            color={color}
            setColor={setColor}
            choosingColor={choosingColor}
            setChoosingColor={setChoosingColor}
          />
        </div>
      ) : (
        <button
          onClick={() => {
            setInput(true);
          }}
          className={styles.button}
          style={{
            backgroundColor: hover
              ? "rgb(240, 240, 240)"
              : "rgb(255, 255, 255)",
          }}
          onMouseEnter={() => {
            setHover(true);
          }}
          onMouseLeave={() => {
            setHover(false);
          }}
        >
          <PlusBoxIcon
            style={{
              stroke: "#1c1c1c",
              strokeWidth: "1.5",
              width: "20px",
            }}
          />
        </button>
      )}
    </div>
  );
}
