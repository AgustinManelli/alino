"use client";
import WindowComponent from "@/components/windowComponent";
import styles from "./accountConfigSection.module.css";
import { useState } from "react";
import NavbarConfig from "./components/navbar";
import ContainerConfig from "./components/container";

export default function AccountConfigSection({
  name,
  userAvatarUrl,
  handleCloseConfig,
}: {
  name: string;
  userAvatarUrl: string;
  handleCloseConfig: () => void;
}) {
  const [type, setType] = useState<string>("account");

  return (
    <WindowComponent
      windowName={"configuración"}
      crossAction={handleCloseConfig}
    >
      <div className={styles.body}>
        <NavbarConfig type={type} setType={setType} />
        {(() => {
          switch (type) {
            case "account":
              return (
                <ContainerConfig typeSelected={"cuenta"}></ContainerConfig>
              );
            case "app":
              return (
                <ContainerConfig typeSelected={"aplicación"}></ContainerConfig>
              );
          }
        })()}
      </div>
    </WindowComponent>
  );
}
