"use client";

import styles from "./config-section.module.css";
import { ConfigIcon } from "@/lib/ui/icons";
import { useRef, useState } from "react";
import { ModalBox, OptionBox } from "@/components";
import { signout } from "@/lib/auth/actions";
import { useLoaderStore } from "@/store/useLoaderStore";

export default function ConfigSection() {
  const iconRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<boolean>(false);
  const setLoading = useLoaderStore((state) => state.setLoading);
  const logout = () => {
    setLoading(true);
    signout();
  };

  const handleClose = () => {
    setActive(false);
  };

  const handleToggle = () => {
    setActive(!active);
  };

  return (
    <div className={styles.configSection}>
      <div className={styles.configButton} onClick={handleToggle} ref={iconRef}>
        <ConfigIcon
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
          title={"configuration"}
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
            <OptionBox text={"Cerrar sesión"} action={logout} />
          </div>
        </ModalBox>
      )}
    </div>
  );
}
