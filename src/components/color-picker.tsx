"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./color-picker.module.css";
import { CopyToClipboardIcon, PaintBoard } from "@/lib/ui/icons";
import { toast } from "sonner";

export function Coloricker({
  color,
  setColor,
  save,
  handleSave,
  width,
  height,
}: {
  color: string;
  setColor: (value: string) => void;
  save?: boolean | null;
  handleSave?: () => void | null;
  width?: string;
  height?: string;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);

  const divRef = useRef<HTMLDivElement>(null);

  useEffect(function mount() {
    function divOnClick(event: MouseEvent | TouchEvent) {
      if (divRef.current !== null) {
        if (!divRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      }
    }
    window.addEventListener("mousedown", divOnClick);

    return function unMount() {
      window.removeEventListener("mousedown", divOnClick);
    };
  });

  const colors = [
    "#87189d",
    "#ff6900",
    "#0693e3",
    "#ff0004",
    "#7ed321",
    "#2ccce4",
  ];

  return (
    <div className={styles.fit} ref={divRef}>
      <button
        className={styles.mainButton}
        style={{
          backgroundColor: `${color}`,
          width: `${width}`,
          height: `${height}`,
        }}
        onClick={() => {
          setOpen(!open);
        }}
      ></button>
      {open ? (
        <section className={styles.container}>
          <section className={styles.titleSection}>
            <p className={styles.title}>color</p>
          </section>
          <div className={styles.separator}></div>
          <section className={styles.buttonSection}>
            {colors.map((colorHex) => (
              <button
                className={styles.button}
                style={{ backgroundColor: `${colorHex}` }}
                onClick={() => {
                  setColor(colorHex);
                }}
              ></button>
            ))}
            <div className={styles.customColorContainer}>
              <PaintBoard
                style={{ strokeWidth: "1.5", stroke: "#1c1c1c", width: "20px" }}
              />
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                }}
                className={styles.colorInput}
              ></input>
            </div>
          </section>
          <div className={styles.separator}></div>
          <footer className={styles.footer}>
            <div className={styles.hexContainer}>
              <p className={styles.hexText}>hex: </p>
              <input
                className={styles.hexCode}
                type="text"
                value={`${color}`}
                onChange={(e) => {
                  setColor(e.target.value);
                }}
              ></input>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(color);
                toast("color copiado al portapapeles");
              }}
              className={styles.copyButton}
            >
              <CopyToClipboardIcon
                style={{ strokeWidth: "1.5", stroke: "#1c1c1c", width: "20px" }}
              />
            </button>
          </footer>
          {save ? (
            <button
              className={styles.saveButton}
              style={{ backgroundColor: hover ? "rgb(240,240,240)" : "" }}
              onMouseEnter={() => {
                setHover(true);
              }}
              onMouseLeave={() => {
                setHover(false);
              }}
              onClick={handleSave}
            >
              save
            </button>
          ) : (
            ""
          )}
        </section>
      ) : (
        ""
      )}
    </div>
  );
}
