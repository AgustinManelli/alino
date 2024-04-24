"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./color-picker.module.css";
import {
  CopyToClipboardIcon,
  LoadingIcon,
  PaintBoard,
  SquircleIcon,
} from "@/lib/ui/icons";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

export function ColorPicker({
  color,
  setColor,
  save,
  handleSave,
  width,
  originalColor,
  parentRef,
}: {
  color: string;
  setColor: (value: string) => void;
  save?: boolean | null;
  handleSave?: () => Promise<void>;
  width?: string;
  originalColor?: string;
  parentRef: React.RefObject<HTMLDivElement>;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  const [isSave, setIsSave] = useState<boolean>(false);
  const [wait, setWait] = useState<boolean>(false);

  const divRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);

  useEffect(function mount() {
    if (!divRef.current || !childRef.current) return;
    const parentRect = divRef.current!.getBoundingClientRect();

    childRef.current.style.top = `${parentRect.top + parentRect.width + 10}px`;
    childRef.current.style.left = `${parentRect.left}px`;

    function divOnClick(event: MouseEvent | TouchEvent) {
      if (divRef.current !== null) {
        if (!divRef.current.contains(event.target as Node)) {
          setOpen(false);
          if (save && !isSave && originalColor) {
            setColor(originalColor);
          }
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
          width: `${width}`,
          height: `${width}`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        <SquircleIcon style={{ fill: `${color}` }} />
      </button>
      {createPortal(
        <AnimatePresence>
          {open ? (
            <motion.section
              ref={childRef}
              transition={{
                type: "spring",
                stiffness: 700,
                damping: 40,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className={styles.container}
            >
              <section className={styles.titleSection}>
                <p className={styles.title}>color</p>
              </section>
              <div className={styles.separator}></div>
              <section className={styles.buttonSection}>
                {colors.map((colorHex) => (
                  <button
                    className={styles.button}
                    onClick={(e) => {
                      e.stopPropagation();
                      setColor(colorHex);
                      if (!save) {
                        setOpen(false);
                      } else {
                        setIsSave(false);
                      }
                    }}
                  >
                    <SquircleIcon style={{ fill: `${colorHex}` }} />
                  </button>
                ))}
                <div className={styles.customColorContainer}>
                  <PaintBoard
                    style={{
                      strokeWidth: "1.5",
                      stroke: "#1c1c1c",
                      width: "20px",
                    }}
                  />
                  <div className={styles.inputColorContainer}>
                    <input
                      id="colorInput"
                      type="color"
                      value={color}
                      onChange={(e) => {
                        setColor(e.target.value);
                        setIsSave(false);
                      }}
                      className={styles.colorInput}
                    ></input>
                    <label htmlFor="colorInput" className={styles.labelColor}>
                      <SquircleIcon style={{ fill: `${color}` }} />
                    </label>
                  </div>
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
                    style={{
                      strokeWidth: "1.5",
                      stroke: "#1c1c1c",
                      width: "20px",
                    }}
                  />
                </button>
              </footer>
              {save && handleSave ? (
                <button
                  className={styles.saveButton}
                  style={{ backgroundColor: hover ? "rgb(240,240,240)" : "" }}
                  onMouseEnter={() => {
                    setHover(true);
                  }}
                  onMouseLeave={() => {
                    setHover(false);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setWait(true);
                    handleSave()
                      .then(() => {
                        setOpen(false);
                      })
                      .finally(() => {
                        setWait(false);
                        setIsSave(true);
                      });
                  }}
                >
                  {wait ? (
                    <LoadingIcon
                      style={{
                        width: "20px",
                        height: "auto",
                        stroke: "#1c1c1c",
                        strokeWidth: "3",
                      }}
                    />
                  ) : (
                    "save"
                  )}
                </button>
              ) : (
                ""
              )}
            </motion.section>
          ) : (
            ""
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
