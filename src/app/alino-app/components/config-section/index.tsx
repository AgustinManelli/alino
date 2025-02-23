"use client";

import { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";

import { signOutLocal } from "@/lib/auth/actions";
import { useNavigationLoader } from "@/hooks/useNavigationLoader";

import { ModalBox } from "@/components/ui/modal-options-box/modalBox";
import { OptionBox } from "@/components/ui/modal-options-box/optionBox";
import ConfigModal from "../config-modal";
import { CloudIndicator } from "./cloud-indicator";
import { ThemeSelector } from "@/components/ui/theme-selector";

import { Config, LogOut, UserIcon } from "@/components/ui/icons/icons";
import styles from "./ConfigSection.module.css";

interface props {
  name: string;
  userAvatarUrl: string;
}

export function ConfigSection({ name, userAvatarUrl }: props) {
  const [active, setActive] = useState<boolean>(false);
  const [configActive, setConfigActive] = useState<boolean>(false);
  const { setLoading } = useNavigationLoader();

  const iconRef = useRef<HTMLDivElement>(null);

  const logout = () => {
    signOutLocal();
    setLoading(true);
  };

  const handleClose = () => {
    setActive(false);
  };

  const handleToggle = () => {
    setActive(!active);
  };

  const handleOpenConfig = () => {
    setActive(false);
    setConfigActive(true);
  };

  const handleCloseConfig = () => {
    setConfigActive(false);
  };

  return (
    <>
      <AnimatePresence>
        {configActive && <ConfigModal handleCloseConfig={handleCloseConfig} />}
      </AnimatePresence>

      <div className={styles.configSection}>
        <CloudIndicator />
        <div
          className={styles.configButton}
          onClick={handleToggle}
          ref={iconRef}
        >
          <div
            className={styles.configUserIcon}
            style={{
              backgroundImage: userAvatarUrl ? `url('${userAvatarUrl}')` : "",
              opacity: userAvatarUrl ? 1 : 0.3,
            }}
          >
            {!userAvatarUrl && (
              <UserIcon
                style={{
                  stroke: "var(--icon-colorv2)",
                  strokeWidth: "1.5",
                  width: "60%",
                  height: "60%",
                }}
              />
            )}
          </div>
        </div>
        {active && (
          <ModalBox
            title={name ? name : "User"}
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
              <ThemeSelector />
              <OptionBox text={"Configuración"} action={handleOpenConfig}>
                <Config
                  style={{
                    width: "18px",
                    height: "18px",
                    strokeWidth: "2",
                    stroke: "var(--text)",
                  }}
                />
              </OptionBox>
              <OptionBox text={"Cerrar sesión"} action={logout}>
                <LogOut
                  style={{
                    width: "18px",
                    height: "18px",
                    strokeWidth: "2",
                    stroke: "var(--text)",
                  }}
                />
              </OptionBox>
            </div>
          </ModalBox>
        )}
      </div>
    </>
  );
}
