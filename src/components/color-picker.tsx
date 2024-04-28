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

const colors = [
  "#f54275",
  "#ff00ea",
  "#87189d",
  "#0693e3",
  "#2ccce4",
  "#7ed321",
  "#a6ff00",
  "#ffdd00",
  "#ff6900",
  "#ff0004",
];

export function ColorPicker({
  color,
  setColor,
  save,
  handleSave,
  width,
  originalColor,
  choosingColor,
  setChoosingColor,
}: {
  color: string;
  setColor: (value: string) => void;
  save?: boolean | null;
  handleSave?: () => Promise<void>;
  width?: string;
  originalColor?: string;
  choosingColor?: boolean;
  setChoosingColor?: (value: boolean) => void;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  const [isSave, setIsSave] = useState<boolean>(false);
  const [wait, setWait] = useState<boolean>(false);

  const pickerRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);

  useEffect(function mount() {
    function ubication() {
      if (!pickerRef.current || !childRef.current) return;
      const parentRect = pickerRef.current!.getBoundingClientRect();

      childRef.current.style.top = `${parentRect.top + parentRect.width + 10}px`;
      childRef.current.style.left = `${parentRect.left}px`;

      if (
        pickerRef.current.getBoundingClientRect().top >
        window.innerHeight / 2
      ) {
        childRef.current.style.top = `${parentRect.top - childRef.current.offsetHeight - 10}px`;
      }
    }
    function divOnClick(event: MouseEvent | TouchEvent) {
      console.log("pase0");
      if (childRef.current !== null && pickerRef.current !== null) {
        console.log("pase1");
        if (
          !childRef.current.contains(event.target as Node) &&
          !pickerRef.current.contains(event.target as Node)
        ) {
          console.log("pase2");
          setOpen(false);
          setChoosingColor ? setChoosingColor(false) : "";
          if (save && !isSave && originalColor) {
            setColor(originalColor);
          }
        }
      }
    }
    window.addEventListener("mousedown", divOnClick);
    window.addEventListener("mouseup", divOnClick);
    ubication();

    return function unMount() {
      window.removeEventListener("mousedown", divOnClick);
      window.removeEventListener("mouseup", divOnClick);
    };
  });

  return (
    <>
      <div className={styles.fit} ref={pickerRef}>
        <button
          className={styles.mainButton}
          style={{
            width: `${width}`,
            height: `${width}`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setChoosingColor && setChoosingColor(!choosingColor);
            setOpen(!open);
          }}
        >
          <SquircleIcon
            style={{ fill: `${color}`, transition: "fill 0.1s ease-in-out" }}
          />
        </button>
      </div>
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
              initial={{ scale: 0, opacity: 0, filter: "blur(30px)" }}
              animate={{
                scale: 1,
                opacity: 1,
                filter: "blur(0px)",
              }}
              exit={{ scale: 0, opacity: 0, filter: "blur(30px)" }}
              className={styles.container}
            >
              <section className={styles.titleSection}>
                <p className={styles.title}>color</p>
              </section>
              <div className={styles.separator}></div>
              <section className={styles.buttonSection}>
                {colors.map((colorHex, index) => (
                  <button
                    className={styles.button}
                    onClick={(e) => {
                      e.stopPropagation();
                      setColor(colorHex);
                      setChoosingColor ? setChoosingColor(false) : "";
                      if (!save) {
                        setOpen(false);
                      } else {
                        setIsSave(false);
                      }
                    }}
                    key={index}
                  >
                    <SquircleIcon style={{ fill: `${colorHex}` }} />
                    {color === colorHex && (
                      <SquircleIcon
                        style={{
                          fill: "transparent",
                          position: "absolute",
                          width: "30px",
                          strokeWidth: "1.5",
                          stroke: `${colorHex}`,
                        }}
                      />
                    )}
                  </button>
                ))}
              </section>
              <div className={styles.separator}></div>
              <footer className={styles.footer}>
                <div className={styles.hexContainer}>
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
                      {!colors.includes(color) && (
                        <SquircleIcon
                          style={{
                            fill: "transparent",
                            position: "absolute",
                            width: "30px",
                            strokeWidth: "1.5",
                            stroke: `${color}`,
                          }}
                        />
                      )}
                    </label>
                  </div>
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
              {save && handleSave && (
                <div className={styles.saveButtonContainer}>
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
                      "guardar"
                    )}
                  </button>
                </div>
              )}
            </motion.section>
          ) : (
            ""
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
