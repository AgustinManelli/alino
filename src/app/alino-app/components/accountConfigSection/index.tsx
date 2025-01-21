"use client";

import { useState } from "react";

import { useLists } from "@/store/lists";
import { useAnimationStore } from "@/store/useAnimationStore";

import { ButtonConfig } from "./components/buttonConfig";
import { Switch } from "@/components/switch";
import ContainerConfig from "./components/container";
import NavbarConfig from "./components/navbar";
import { WindowComponent } from "@/components/window-component";

import styles from "./AccountConfigSection.module.css";

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
  const { deleteAllLists, deleteAllTasks } = useLists();
  const [allowClose, setAllowClose] = useState<boolean>(true);

  return (
    <WindowComponent
      windowName={"configuración"}
      crossAction={allowClose ? handleCloseConfig : () => {}}
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
                      <div className={styles.configElement}>
                        <div>
                          <p className={styles.configSectionTitle}>
                            Animaciones de la UI
                          </p>
                        </div>
                        <div className={styles.switchSection}>
                          <Switch
                            value={animations}
                            action={toggleAnimations}
                            width={40}
                          />
                        </div>
                      </div>
                    </section>
                    <p className={styles.configSectionDescription}>
                      Desactivar animaciones si experimenta bajo rendimiento o
                      retrasos en la aplicación.
                    </p>
                  </div>
                  <div className={styles.sectionContainer}>
                    <p className={styles.sectionTitle}>Almacenamiento</p>
                    <section className={styles.configSection}>
                      <div className={styles.configElement}>
                        <div>
                          <p className={styles.configSectionTitle}>
                            Eliminar todas las listas
                          </p>
                        </div>
                        <div className={styles.switchSection}>
                          <ButtonConfig
                            name={"Eliminar"}
                            action={() => {
                              deleteAllLists();
                            }}
                            stylesProp={{
                              width: "fit-content",
                              height: "100%",
                              padding: "0 10px",
                              borderRadius: "5px",
                              backgroundColor: "rgb(255, 231, 230)",
                              color: "#1c1c1c",
                              fontSize: "14px",
                            }}
                            setAllowClose={setAllowClose}
                            deleteModalText={
                              "¿Desea eliminar todas las listas?"
                            }
                            additionalDeleteModalText={
                              "Ten en cuenta que esta acción es irreversible y no podrás recuperar las listas y tareas eliminadas."
                            }
                          />
                        </div>
                      </div>
                      <div className={styles.configElementSeparator}></div>
                      <div className={styles.configElement}>
                        <div>
                          <p className={styles.configSectionTitle}>
                            Eliminar todas las tareas
                          </p>
                        </div>
                        <div className={styles.switchSection}>
                          <ButtonConfig
                            name={"Eliminar"}
                            action={() => {
                              deleteAllTasks();
                            }}
                            stylesProp={{
                              width: "fit-content",
                              height: "100%",
                              padding: "0 10px",
                              border: "none",
                              borderRadius: "5px",
                              backgroundColor: "rgb(255, 231, 230)",
                              color: "#1c1c1c",
                              fontSize: "14px",
                            }}
                            setAllowClose={setAllowClose}
                            deleteModalText={
                              "¿Desea eliminar todas las tareas?"
                            }
                            additionalDeleteModalText={
                              "Ten en cuenta que esta acción es irreversible y no podrás recuperar las tareas eliminadas."
                            }
                          />
                        </div>
                      </div>
                    </section>
                    <p className={styles.configSectionDescription}>
                      Eliminar todas las listas o tareas es una acción
                      irreversible. Eliminar todas las listas implica eliminar
                      todas las tareas.
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
