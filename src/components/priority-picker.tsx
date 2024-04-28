import { FaceIcon1, FaceIcon2, FaceIcon3 } from "@/lib/ui/icons";
import styles from "./priority-picker.module.css";
import { useState } from "react";

export default function () {
  const [open, setOpen] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  return (
    <div className={styles.priorityPickerContainer}>
      <button
        className={styles.priorityPickerButton}
        style={{ backgroundColor: hover ? "rgb(240,240,240)" : "transparent" }}
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
        onClick={() => {
          setOpen(!open);
        }}
      >
        <FaceIcon1
          style={{
            width: "20px",
            height: "auto",
            stroke: "#7ed321",
            strokeWidth: "1.5",
          }}
        />
      </button>
      {open && (
        <section className={styles.boxContainer}>
          <p className={styles.title}>prioridad</p>
          <div className={styles.separator}></div>
          <div className={styles.priorityButtonSelectorContainer}>
            <FaceIcon1
              style={{
                width: "25px",
                height: "auto",
                stroke: "#7ed321",
                strokeWidth: "1.5",
              }}
            />
            <FaceIcon2
              style={{
                width: "25px",
                height: "auto",
                stroke: "#ff6900",
                strokeWidth: "1.5",
              }}
            />
            <FaceIcon3
              style={{
                width: "25px",
                height: "auto",
                stroke: "#ff0004",
                strokeWidth: "1.5",
              }}
            />
          </div>
        </section>
      )}
    </div>
  );
}
