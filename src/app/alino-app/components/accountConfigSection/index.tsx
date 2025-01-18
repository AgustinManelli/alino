"use client";
import WindowComponent from "@/components/windowComponent";
import styles from "./accountConfigSection.module.css";
import { useState } from "react";
import NavbarConfig from "./components/navbar";
import ContainerConfig from "./components/container";
import { SwitchButton } from "@/components/switchButton";
import { useAnimationStore } from "@/store/useAnimationStore";

export default function AccountConfigSection({
  name,
  userAvatarUrl,
  handleCloseConfig,
}: {
  name: string;
  userAvatarUrl: string;
  handleCloseConfig: () => void;
}) {
  const [type, setType] = useState<string>("app");
  const { animations, toggleAnimations } = useAnimationStore();

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
              return <ContainerConfig></ContainerConfig>;
            case "app":
              return (
                <ContainerConfig>
                  <div className={styles.sectionContainer}>
                    <p className={styles.sectionTitle}>Animaciones</p>
                    <section className={styles.configSection}>
                      <div>
                        <p className={styles.configSectionTitle}>
                          Animaciones de la UI
                        </p>
                      </div>
                      <div className={styles.switchSection}>
                        <SwitchButton
                          value={animations}
                          action={toggleAnimations}
                          width={40}
                        />
                      </div>
                    </section>
                    <p className={styles.configSectionDescription}>
                      Desactivar animaciones si experimenta bajo rendimiento o
                      retrasos en la aplicación
                    </p>
                  </div>
                </ContainerConfig>
              );
          }
        })()}
      </div>
    </WindowComponent>
  );
}
