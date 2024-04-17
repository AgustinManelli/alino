"use client";

import { useState } from "react";
import styles from "./color-picker.module.css";
import { CopyToClipboardIcon, PaintBoard } from "@/lib/ui/icons";
import { toast } from "sonner";

export function Coloricker({
  color,
  setColor,
}: {
  color: string;
  setColor: (value: string) => void;
}) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className={styles.fit}>
      <button
        className={styles.mainButton}
        style={{ backgroundColor: `${color}` }}
        onClick={() => {
          setOpen(!open);
        }}
      ></button>
      {open ? (
        <section className={styles.container}>
          <section className={styles.titleSection}>
            <p>color picker</p>
          </section>
          <div className={styles.separator}></div>
          <section className={styles.buttonSection}>
            <button
              className={styles.button}
              style={{ backgroundColor: "#87189d" }}
              onClick={() => {
                setColor("#87189d");
              }}
            ></button>
            <button
              className={styles.button}
              style={{ backgroundColor: "#ff6900" }}
              onClick={() => {
                setColor("#ff6900");
              }}
            ></button>
            <button
              className={styles.button}
              style={{ backgroundColor: "#0693e3" }}
              onClick={() => {
                setColor("#0693e3");
              }}
            ></button>
            <button
              className={styles.button}
              style={{ backgroundColor: "#ff0004" }}
              onClick={() => {
                setColor("#ff0004");
              }}
            ></button>
            <button
              className={styles.button}
              style={{ backgroundColor: "#7ed321" }}
              onClick={() => {
                setColor("#7ed321");
              }}
            ></button>
            <button
              className={styles.button}
              style={{ backgroundColor: "#2ccce4" }}
              onClick={() => {
                setColor("#2ccce4");
              }}
            ></button>
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
        </section>
      ) : (
        ""
      )}
    </div>
  );
}
