"use client";

import styles from "./alerts.module.css";
import { Alert } from "@/lib/ui/icons";
import { useRef, useState } from "react";
import { ModalBox, OptionBox } from "@/components";

export default function Alerts() {
  const iconRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<boolean>(false);

  const handleClose = () => {
    setActive(false);
  };

  const handleToggle = () => {
    setActive(!active);
  };

  return (
    <div className={styles.configSection}>
      <div className={styles.configButton} onClick={handleToggle} ref={iconRef}>
        <Alert
          style={{
            width: "25px",
            height: "auto",
            stroke: "#1c1c1c",
            strokeWidth: "2",
          }}
        />
      </div>
      {active && (
        <ModalBox
          title={"Alertas y noticias"}
          footer={"alino"}
          onClose={handleClose}
          iconRef={iconRef}
        >
          <div
            style={{
              width: "fit-content",
              height: "fit-content",
              display: "flex",
              gap: "5px",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              minWidth: "200px",
            }}
          >
            {/* <OptionBox text={"alerta testing"} action={() => alert("alerta")} /> */}
          </div>
        </ModalBox>
      )}
    </div>
  );
}
