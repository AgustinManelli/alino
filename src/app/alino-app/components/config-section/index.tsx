"use client";

import { useRef, useState } from "react";

import { useLoaderStore } from "@/store/useLoaderStore";
import { signOutLocal } from "@/lib/auth/actions";

import { ModalBox } from "@/components/ui/modal-options-box/modalBox";
import { OptionBox } from "@/components/ui/modal-options-box/optionBox";
import AccountConfigSection from "../accountConfigSection";
import { CloudIndicator } from "./cloud-indicator";

import { Config, LogOut, UserIcon } from "@/components/ui/icons/icons";
import styles from "./ConfigSection.module.css";
import { AnimatePresence } from "motion/react";

interface props {
  userAvatarUrl: string;
  name: string;
}

export function ConfigSection({ userAvatarUrl, name }: props) {
  const [active, setActive] = useState<boolean>(false);
  const [configActive, setConfigActive] = useState<boolean>(false);

  const iconRef = useRef<HTMLDivElement>(null);

  const { setLoading } = useLoaderStore();

  const logout = () => {
    setLoading(true);
    signOutLocal();
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
        {configActive && (
          <AccountConfigSection
            name={name ? name : "User"}
            userAvatarUrl={userAvatarUrl}
            handleCloseConfig={handleCloseConfig}
          />
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
              backgroundImage: userAvatarUrl ? `url('${userAvatarUrl}')` : "",
            }}
          >
            {!userAvatarUrl && (
              <UserIcon
                style={{
                  stroke: "rgb(225, 225, 225)",
                  strokeWidth: "1.5",
                  width: "70%",
                  height: "70%",
                }}
              />
            )}
          </div>
        </div>
        {active && (
          <ModalBox
            title={name ? name : "User"}
            footer={`alino · ${new Date().getFullYear()}`}
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
              <OptionBox text={"Configuración"} action={handleOpenConfig}>
                <Config
                  style={{
                    width: "18px",
                    height: "18px",
                    strokeWidth: "2",
                    stroke: "#1c1c1c",
                  }}
                />
              </OptionBox>
              <OptionBox text={"Cerrar sesión"} action={logout}>
                <LogOut
                  style={{
                    width: "18px",
                    height: "18px",
                    strokeWidth: "2",
                    stroke: "#1c1c1c",
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
