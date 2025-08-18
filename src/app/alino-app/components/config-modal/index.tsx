"use client";

import { useCallback } from "react";

import { ButtonConfig } from "./components/buttonConfig";
import { Switch } from "@/components/ui/switch";
import { WindowComponent } from "@/components/ui/window-component";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

import styles from "./AccountConfigSection.module.css";

interface props {
  handleCloseConfig: () => void;
}

export function ConfigModal({ handleCloseConfig }: props) {
  const { animations, toggleAnimations } = useUserPreferencesStore();
  const { deleteAllLists /*, deleteAllTasks*/ } = useTodoDataStore();

  const closeConfigModal = useCallback(() => {
    const confirmationModal = document.getElementById(
      "confirmation-modal-config-modal"
    );
    if (confirmationModal) return;
    handleCloseConfig();
  }, [handleCloseConfig]);

  return (
    <WindowComponent
      windowTitle={"configuración"}
      id={"account-config-section"}
      crossAction={closeConfigModal}
    >
      <div className={styles.configModalContainer}>
        <SectionContainer
          sectionTitle="Animaciones"
          sectionDescription="Desactiva las animaciones si experimenta bajo rendimiento o retrasos en la aplicación."
          configElements={[
            {
              text: <>Animaciones de la UI (beta)</>,
              elementAction: (
                <Switch
                  value={animations}
                  action={toggleAnimations}
                  width={40}
                />
              ),
            },
          ]}
        />

        <SectionContainer
          sectionTitle="Almacenamiento"
          sectionDescription="Eliminar todas las listas o tareas es una acción irreversible."
          configElements={[
            {
              text: <>Eliminar todas las listas</>,
              elementAction: (
                <ButtonConfig
                  name="Eliminar"
                  action={deleteAllLists}
                  stylesProp={{
                    color: "rgb(255, 43, 43)",
                  }}
                  modalText="¿Desea eliminar todas las listas?"
                  explainText="Esta acción es irreversible."
                />
              ),
            },
            {
              text: <>Eliminar todas las tareas</>,
              elementAction: (
                <ButtonConfig
                  name="Eliminar"
                  action={() => {} /*deleteAllTasks*/}
                  stylesProp={{
                    color: "rgb(255, 43, 43)",
                  }}
                  modalText="¿Desea eliminar todas las tareas?"
                  explainText="Esta acción es irreversible."
                />
              ),
            },
          ]}
        />

        <SectionContainer
          sectionTitle="Soporte"
          configElements={[
            {
              text: (
                <>
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
                </>
              ),
            },
          ]}
        />

        <SectionContainer
          sectionTitle="Version"
          configElements={[
            {
              text: <>v0.1.0 (pre-alpha)</>,
            },
          ]}
        />
      </div>
    </WindowComponent>
  );
}

interface ConfigElement {
  text: JSX.Element;
  elementAction?: JSX.Element;
}

interface SectionProps {
  sectionTitle: string;
  sectionDescription?: string;
  configElements: ConfigElement[];
}

function SectionContainer({
  sectionTitle,
  sectionDescription,
  configElements,
}: SectionProps) {
  return (
    <section className={styles.sectionContainer}>
      <p className={styles.sectionTitle}>{sectionTitle}</p>
      <section className={styles.sectionContent}>
        {configElements.map((element, index) => (
          <>
            <div key={index} className={styles.sectionElement}>
              <p className={styles.sectionText}>{element.text}</p>
              <div className={styles.sectionAction}>
                {element.elementAction}
              </div>
            </div>
            {configElements.length !== index + 1 && (
              <div className={styles.configElementSeparator}></div>
            )}
          </>
        ))}
      </section>
      {sectionDescription && (
        <p className={styles.sectionDescription}>{sectionDescription}</p>
      )}
    </section>
  );
}
