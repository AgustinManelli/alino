"use client";

import React, { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";

import { signOutLocal } from "@/lib/auth/actions";
import { useNavigationLoader } from "@/hooks/useNavigationLoader";
import { useUserDataStore } from "@/store/useUserDataStore";

import { ModalBox } from "@/components/ui/modal-options-box/modalBox";
import { OptionBox } from "@/components/ui/modal-options-box/optionBox";
import { ConfigModal } from "../config-modal";
import { CloudIndicator } from "./cloud-indicator";
import { ThemeSelector } from "@/components/ui/theme-selector";
import ConfigUser from "../config-user";

import { Config, LogOut, UserIcon } from "@/components/ui/icons/icons";
import styles from "./ConfigSection.module.css";

export const ConfigSection = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [configActive, setConfigActive] = useState<boolean>(false);
  const [configUserActive, setConfigUserActive] = useState<boolean>(false);
  const { setLoading } = useNavigationLoader();

  const user = useUserDataStore((state) => state.user);

  const iconRef = useRef<HTMLDivElement>(null);

  const avatar_url = user?.avatar_url;
  const display_name = user?.display_name;
  const username = user?.username;

  const logout = () => {
    signOutLocal();
    setLoading(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleOpenConfig = () => {
    setIsOpen(false);
    setConfigActive(true);
  };

  const handleCloseConfig = () => {
    setConfigActive(false);
  };

  const handleOpenConfigUser = () => {
    setIsOpen(false);
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
        {isOpen && (
          <ModalBox
            title={display_name ? display_name : "User"}
            user
            subtitle={`@${username ? username : "user"}`}
            onClose={handleClose}
            iconRef={iconRef}
          >
            <div className={styles.optionsBoxsContainer}>
              <ThemeSelector />
              <OptionBox text={"Mi cuenta"} action={handleOpenConfigUser}>
                <UserIcon style={iconStyles} />
              </OptionBox>
              <OptionBox text={"Configuración"} action={handleOpenConfig}>
                <Config style={iconStyles} />
              </OptionBox>
              <div className={styles.separator}></div>
              <OptionBox text={"Cerrar sesión"} action={logout}>
                <LogOut style={iconStyles} />
              </OptionBox>
            </div>
          </ModalBox>
        )}
      </div>
    </>
  );
};

const iconStyles = {
  width: "18px",
  height: "18px",
  strokeWidth: "2",
  stroke: "var(--text)",
} as React.CSSProperties;
