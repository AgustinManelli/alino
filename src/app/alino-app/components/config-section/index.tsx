"use client";

import React, { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";

import { signOutLocal } from "@/lib/auth/actions";
import { useNavigationLoader } from "@/hooks/useNavigationLoader";

import { ModalBox } from "@/components/ui/modal-options-box";
import { ConfigModal } from "../config-modal";
import { CloudIndicator } from "./cloud-indicator";
import { ThemeSelector } from "@/components/ui/theme-selector";
import ConfigUser from "../config-user";

import {
  Config,
  LogOut,
  UserIcon,
} from "@/components/ui/icons/icons";
import styles from "./ConfigSection.module.css";
import { useUserDataStore } from "@/store/useUserDataStore";

export const ConfigSection = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [configActive, setConfigActive] = useState<boolean>(false);

  const configUserActive = useUserDataStore((state) => state.configUserActive);
  const setConfigUserActive = useUserDataStore(
    (state) => state.setConfigUserActive,
  );
  const { setLoading } = useNavigationLoader();

  const user = useUserDataStore((state) => state.user);

  const iconRef = useRef<HTMLDivElement>(null);

  const avatar_url = user?.avatar_url;
  const display_name = user?.display_name;
  const username = user?.username;
  const tier = (user as any)?.tier || "free";

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

  const userHeader = (
    <div className={styles.userHeader}>
      <p className={styles.displayName}>
        {display_name ? display_name : "User"}
      </p>
      <div className={styles.subtitleWrapper}>
        <p className={styles.username}>{`@${username ? username : "user"}`}</p>
        <span className={`${styles.tierBadge} ${styles[tier]}`}>
          {tier.toUpperCase()}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {configActive && <ConfigModal handleCloseConfig={handleCloseConfig} />}
      </AnimatePresence>
      <AnimatePresence>{configUserActive && <ConfigUser />}</AnimatePresence>
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
            onClose={handleClose}
            iconRef={iconRef}
            headerSlot={userHeader}
          >
            <ModalBox.Separator />
            <ModalBox.Content>
              <ThemeSelector />
              <ModalBox.Option text={"Mi cuenta"} action={handleOpenConfigUser}>
                <UserIcon style={iconStyles} />
              </ModalBox.Option>
              <ModalBox.Option text={"Configuración"} action={handleOpenConfig}>
                <Config style={iconStyles} />
              </ModalBox.Option>
              <ModalBox.Separator />
              <ModalBox.Option text={"Cerrar sesión"} action={logout}>
                <LogOut style={iconStyles} />
              </ModalBox.Option>
            </ModalBox.Content>
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
