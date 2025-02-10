"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar as Icon } from "@/components/ui/icons/icons";
import styles from "./Calendar.module.css";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import "./DayPicker.css";

interface props {
  selected: Date | undefined;
  setSelected: (value: Date | undefined) => void;
}

export function Calendar({ selected, setSelected }: props) {
  const [open, setOpen] = useState<boolean>(false);
  //   const [selected, setSelected] = useState<Date>();

  const Ref = useRef<HTMLButtonElement>(null);
  const sRef = useRef<HTMLDivElement>(null);

  useEffect(function mount() {
    ubication();
    function ubication() {
      if (!Ref.current || !sRef.current) return;
      const parentRect = Ref.current!.getBoundingClientRect();
      const sRect = sRef.current!.getBoundingClientRect();

      sRef.current.style.top = `${parentRect.top + parentRect.width + 5}px`;
      sRef.current.style.left = `${parentRect.right - sRect.width}px`;

      if (Ref.current.getBoundingClientRect().top > window.innerHeight / 2) {
        sRef.current.style.top = `${parentRect.top - sRef.current.offsetHeight - 5}px`;
      }
    }
    function divOnClick(event: MouseEvent | TouchEvent) {
      if (sRef.current !== null && Ref.current !== null) {
        if (
          !sRef.current.contains(event.target as Node) &&
          !Ref.current.contains(event.target as Node)
        ) {
          //functions
          setOpen(false);
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
    <>
      <button
        ref={Ref}
        className={styles.button}
        style={{
          height: "30px",
          width: "auto",
          aspectRatio: "1 / 1",
          backgroundColor: open ? "rgb(240, 240, 240)" : "rgb(250,250,250)",
        }}
        onClick={() => {
          setOpen((prev) => !prev);
        }}
      >
        <Icon
          style={{
            width: "100%",
            height: "auto",
            stroke: "#1c1c1c",
            strokeWidth: "1.5",
          }}
        />
      </button>
      {createPortal(
        <>
          {open && (
            <section className={styles.container} ref={sRef}>
              <div className={styles.optionsContainer}>
                <DayPicker
                  mode="single"
                  selected={selected}
                  onSelect={setSelected}
                  footer={
                    selected
                      ? `Selección: ${selected.toLocaleDateString()}`
                      : "Pick a day."
                  }
                />
              </div>
            </section>
          )}
        </>,
        document.body
      )}
    </>
  );
}
