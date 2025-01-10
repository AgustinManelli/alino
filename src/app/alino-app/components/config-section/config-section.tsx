"use client";

import styles from "./config-section.module.css";
import { ConfigIcon, Config, LogOut } from "@/lib/ui/icons";
import { useRef, useState } from "react";
import { ModalBox, OptionBox } from "@/components";
import { signout } from "@/lib/auth/actions";
import { useLoaderStore } from "@/store/useLoaderStore";
import ConfigUserIcon from "./config-user-icon";
import AccountConfigSection from "../accountConfigSection";
import CloudStateIndicator from "../cloudStateIndicator/cloudStateIndicator";

export default function ConfigSection({
  userAvatarUrl,
  name,
}: {
  userAvatarUrl: string;
  name: string;
}) {
  const iconRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<boolean>(false);
  const [configActive, setConfigActive] = useState<boolean>(false);

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

  const handleOpenConfig = () => {
    setActive(false);
    setConfigActive(true);
  };

  const handleCloseConfig = () => {
    setConfigActive(false);
  };

  return (
    <>
      {configActive && (
        <AccountConfigSection
          name={name}
          userAvatarUrl={userAvatarUrl}
          handleCloseConfig={handleCloseConfig}
        />
      )}
      <div className={styles.configSection}>
        <CloudStateIndicator />
        <div
          className={styles.configButton}
          onClick={handleToggle}
          ref={iconRef}
        >
          <ConfigUserIcon userAvatarUrl={userAvatarUrl} />
        </div>
        {active && (
          <ModalBox
            title={name}
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
