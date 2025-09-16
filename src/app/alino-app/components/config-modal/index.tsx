"use client";

import React, { useCallback, useEffect, useState } from "react";

import { Switch } from "@/components/ui/switch";
import { WindowComponent } from "@/components/ui/window-component";

import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

import styles from "./AccountConfigSection.module.css";
import { toast } from "sonner";

interface props {
  handleCloseConfig: () => void;
}

export function ConfigModal({ handleCloseConfig }: props) {
  const { animations, toggleAnimations } = useUserPreferencesStore();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!("serviceWorker" in navigator && "PushManager" in window)) {
        console.warn("Push notifications are not supported.");
        setIsLoading(false);
        return;
      }
      try {
        const swRegistration = await navigator.serviceWorker.ready;
        const subscription = await swRegistration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error("Error checking push subscription:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSubscription();
  }, []);

  const closeConfigModal = useCallback(() => {
    const confirmationModal = document.getElementById(
      "confirmation-modal-config-modal"
    );
    if (confirmationModal) return;
    handleCloseConfig();
  }, [handleCloseConfig]);

  const subscribeUser = async () => {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permiso para notificaciones denegado.");
        return;
      }
      const swRegistration = await navigator.serviceWorker.ready;
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
      setIsSubscribed(true);
      toast.success("¡Te has suscrito a las notificaciones!");
    } catch (error) {
      console.error("Failed to subscribe the user: ", error);
      toast.error("No se pudo activar la suscripción.");
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeUser = async () => {
    setIsLoading(true);
    try {
      const swRegistration = await navigator.serviceWorker.ready;
      const subscription = await swRegistration.pushManager.getSubscription();

      if (subscription) {
        const successful = await subscription.unsubscribe();

        if (successful) {
          await fetch("/api/push/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });

          setIsSubscribed(false);
          toast.info("Suscripción a notificaciones desactivada.");
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationsToggle = () => {
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  };

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
          sectionTitle="Notificaciones push"
          configElements={[
            {
              text: <>Activa las notificaciones en tu dispositivo</>,
              elementAction: (
                <Switch
                  value={isSubscribed}
                  action={handleNotificationsToggle}
                  width={40}
                  disabled={isLoading}
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
          <React.Fragment key={index}>
            <div key={index} className={styles.sectionElement}>
              <p className={styles.sectionText}>{element.text}</p>
              <div className={styles.sectionAction}>
                {element.elementAction}
              </div>
            </div>
            {configElements.length !== index + 1 && (
              <div className={styles.configElementSeparator}></div>
            )}
          </React.Fragment>
        ))}
      </section>
      {sectionDescription && (
        <p className={styles.sectionDescription}>{sectionDescription}</p>
      )}
    </section>
  );
}
