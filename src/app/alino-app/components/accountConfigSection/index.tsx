"use client";

import { useState } from "react";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

import { ButtonConfig } from "./components/buttonConfig";
import { Switch } from "@/components/ui/switch";
import ContainerConfig from "./components/container";
import { WindowComponent } from "@/components/ui/window-component";

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
  const { animations, toggleAnimations } = useUserPreferencesStore();
  const { deleteAllLists, deleteAllTasks } = useTodoDataStore();
  const [allowClose, setAllowClose] = useState<boolean>(true);

  return (
    <WindowComponent
      windowName={"configuración"}
      crossAction={allowClose ? handleCloseConfig : () => {}}
    >
      <div className={styles.body}>
        <ContainerConfig>
          <div className={styles.sectionContainer}>
            <p className={styles.sectionTitle}>Animaciones</p>
            <section className={styles.configSection}>
              <div className={styles.configElement}>
                <div>
                  <p className={styles.configSectionTitle}>
                    Animaciones de la UI (beta)
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
              Desactiva las animaciones si experimenta bajo rendimiento o
              retrasos en la aplicación. Esta configuración no desactiva
              animaciones esenciales.
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
                      backgroundColor: "var(--background-over-container)",
                      color: "rgb(255, 43, 43)",
                      fontSize: "14px",
                    }}
                    setAllowClose={setAllowClose}
                    deleteModalText={"¿Desea eliminar todas las listas?"}
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
                      backgroundColor: "var(--background-over-container)",
                      color: "rgb(255, 43, 43)",
                      fontSize: "14px",
                    }}
                    setAllowClose={setAllowClose}
                    deleteModalText={"¿Desea eliminar todas las tareas?"}
                    additionalDeleteModalText={
                      "Ten en cuenta que esta acción es irreversible y no podrás recuperar las tareas eliminadas."
                    }
                  />
                </div>
              </div>
            </section>
            <p className={styles.configSectionDescription}>
              Eliminar todas las listas o tareas es una acción irreversible.
              Eliminar todas las listas implica eliminar todas las tareas.
            </p>
          </div>
          <div className={styles.sectionContainer}>
            <p className={styles.sectionTitle}>Soporte</p>
            <section className={styles.configSection}>
              <div className={styles.configElement}>
                <div>
                  <p className={styles.configSectionTitle}>
                    ¡Gracias por utilizar Alino! Si necesitas ayuda o tienes
                    alguna pregunta, no dudes en contactarnos en
                    <a
                      href="mailto:ayuda@alino.online"
                      style={{
                        color: "rgb(106, 195, 255)",
                        textDecoration: "underline",
                      }}
                    >
                      {" "}
                      ayuda@alino.online
                    </a>
                    .
                  </p>
                </div>
              </div>
            </section>
          </div>
          <div className={styles.sectionContainer}>
            <p className={styles.sectionTitle}>Versión</p>
            <section className={styles.configSection}>
              <div className={styles.configElement}>
                <div>
                  <p className={styles.configSectionTitle}>
                    v0.1.0 (pre-alpha)
                  </p>
                </div>
              </div>
            </section>
          </div>
        </ContainerConfig>
      </div>
    </WindowComponent>
  );
}
