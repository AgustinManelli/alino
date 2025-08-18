"use client";

import { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";

import { signOutLocal } from "@/lib/auth/actions";
import { useNavigationLoader } from "@/hooks/useNavigationLoader";
import { useTodoDataStore } from "@/store/useTodoDataStore";

import { ModalBox } from "@/components/ui/modal-options-box/modalBox";
import { OptionBox } from "@/components/ui/modal-options-box/optionBox";
import { ConfigModal } from "../config-modal";
import { CloudIndicator } from "./cloud-indicator";
import { ThemeSelector } from "@/components/ui/theme-selector";

import { Config, LogOut, UserIcon } from "@/components/ui/icons/icons";
import styles from "./ConfigSection.module.css";
import ConfigUser from "../config-user";

export function ConfigSection() {
  const [active, setActive] = useState<boolean>(false);
  const [configActive, setConfigActive] = useState<boolean>(false);
  const [configUserActive, setConfigUserActive] = useState<boolean>(false);
  const { setLoading } = useNavigationLoader();

  const user = useTodoDataStore((state) => state.user);

  const avatar_url = user?.avatar_url;
  const display_name = user?.display_name;
  const username = user?.username;

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

  const handleOpenConfigUser = () => {
    setActive(false);
    setConfigUserActive(true);
  };

  const handleCloseConfigUser = () => {
    setConfigUserActive(false);
  };

  return (
    <>
      <AnimatePresence>
        {configActive && <ConfigModal handleCloseConfig={handleCloseConfig} />}
      </AnimatePresence>
      <AnimatePresence>
        {configUserActive && (
          <ConfigUser handleCloseConfig={handleCloseConfigUser} user={user} />
        )}
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
              backgroundImage: avatar_url ? `url('${avatar_url}')` : "",
              opacity: avatar_url ? 1 : 0.3,
            }}
          >
            {!avatar_url && (
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
            title={display_name ? display_name : "User"}
            subtitle={`@${username ? username : "user"}`}
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
              <OptionBox text={"Mi cuenta"} action={handleOpenConfigUser}>
                <UserIcon
                  style={{
                    width: "18px",
                    height: "18px",
                    strokeWidth: "2",
                    stroke: "var(--text)",
                  }}
                />
              </OptionBox>
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
