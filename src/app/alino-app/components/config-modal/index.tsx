"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Switch } from "@/components/ui/switch";
import { WindowComponent } from "@/components/ui/WindowComponent";
import { Tabs, TabOption } from "@/components/ui/Tabs/Tabs";
import { useTheme } from "next-themes";
import {
  SunIcon,
  MoonIcon,
  ComputerIcon,
} from "@/components/ui/theme-dropdown/ThemeIcons";
import {
  PaintBoard,
  Check,
  SendIcon,
  Config,
  Information,
} from "@/components/ui/icons/icons";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import {
  useKeyboardShortcuts,
  formatShortcutDisplay,
} from "@/hooks/useKeyboardShortcuts";
import { customToast } from "@/lib/toasts";
import { SoundDropdown } from "@/components/ui/SoundDropdown";
import styles from "./AccountConfigSection.module.css";

type ConfigTab =
  | "appearance"
  | "behavior"
  | "notifications"
  | "shortcuts"
  | "about";

interface Props {
  handleCloseConfig: () => void;
}

export function ConfigModal({ handleCloseConfig }: Props) {
  const [activeTab, setActiveTab] = useState<ConfigTab>("appearance");
  const isMobile = usePlatformInfoStore((state) => state.isMobile);

  const { theme, setTheme } = useTheme();

  const {
    animations,
    toggleAnimations,
    sidebarPosition,
    setSidebarPosition,
    uxPwaPrompt,
    toggleUxPwaPrompt,
    soundEffects,
    toggleSoundEffects,
    taskCompletionSound,
    setTaskCompletionSound,
    confirmDelete,
    toggleConfirmDelete,
    firstDayOfWeek,
    setFirstDayOfWeek,
    compactView,
    toggleCompactView,
  } = useUserPreferencesStore();

  const {
    shortcuts,
    recordingId,
    setRecordingId,
    resetShortcuts,
    isMac,
  } = useKeyboardShortcuts();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [cacheSize, setCacheSize] = useState<string>("Calculando...");
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);

    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage
        .estimate()
        .then((est) => {
          if (est.usage) {
            const mb = (est.usage / (1024 * 1024)).toFixed(1);
            setCacheSize(`${mb} MB`);
          } else {
            setCacheSize("< 1 MB");
          }
        })
        .catch(() => setCacheSize("Desconocido"));
    } else {
      setCacheSize("No disponible");
    }

    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  const handleClearCache = async () => {
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      setCacheSize("< 1 MB");
      customToast.success("Caché local liberada correctamente.");
    } catch {
      customToast.error("No se pudo limpiar la caché.");
    }
  };

  const handleCopyDiagnostics = () => {
    const info = `Alino Diagnostics:
Plataforma: ${isMac ? "macOS" : "Windows/Linux"}
Navegador: ${navigator.userAgent}
Resolución: ${window.innerWidth}x${window.innerHeight}
En línea: ${navigator.onLine ? "Sí" : "No"}
Caché local: ${cacheSize}
Versión: v0.1.0 (pre-alpha)`;
    navigator.clipboard.writeText(info);
    customToast.success("Diagnóstico copiado al portapapeles.");
  };

  useEffect(() => {
    const checkSubscription = async () => {
      if (!("serviceWorker" in navigator && "PushManager" in window)) {
        setIsLoading(false);
        return;
      }
      try {
        const swRegistration = await navigator.serviceWorker.ready;
        const subscription = await swRegistration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    checkSubscription();
  }, []);

  const closeConfigModal = useCallback(() => {
    const confirmationModal = document.getElementById(
      "confirmation-modal-config-modal",
    );
    if (confirmationModal) return;
    handleCloseConfig();
  }, [handleCloseConfig]);

  const subscribeUser = async () => {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        customToast.error("Permiso para notificaciones denegado.");
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
      customToast.success("¡Te has suscrito a las notificaciones!");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al suscribirse a las notificaciones.";
      customToast.error(message);
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
        await subscription.unsubscribe();
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        setIsSubscribed(false);
        customToast.success("Te has desuscrito de las notificaciones.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al desuscribirse de las notificaciones.";
      customToast.error(message);
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

  const themeOptions: TabOption[] = useMemo(
    () => [
      {
        id: "light",
        label: "Claro",
        icon: (
          <SunIcon
            isLight={theme === "light"}
            style={{ width: "14px", height: "14px" }}
          />
        ),
      },
      {
        id: "dark",
        label: "Oscuro",
        icon: (
          <MoonIcon
            isDark={theme === "dark"}
            style={{ width: "14px", height: "14px" }}
          />
        ),
      },
      {
        id: "system",
        label: "Automático",
        icon: <ComputerIcon style={{ width: "14px", height: "14px" }} />,
      },
    ],
    [theme],
  );

  const weekDayOptions: TabOption[] = useMemo(
    () => [
      { id: "monday", label: "Lunes" },
      { id: "sunday", label: "Domingo" },
    ],
    [],
  );

  return (
    <WindowComponent
      windowTitle={"Configuración"}
      id={"account-config-section"}
      crossAction={closeConfigModal}
      sidebar={
        <WindowComponent.Sidebar>
          <WindowComponent.SidebarItem
            label="Apariencia"
            icon={
              <PaintBoard
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "currentColor",
                  strokeWidth: "2",
                }}
              />
            }
            active={activeTab === "appearance"}
            onClick={() => setActiveTab("appearance")}
          />
          <WindowComponent.SidebarItem
            label="Productividad"
            icon={
              <Check
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "currentColor",
                  strokeWidth: "2",
                }}
              />
            }
            active={activeTab === "behavior"}
            onClick={() => setActiveTab("behavior")}
          />
          <WindowComponent.SidebarItem
            label="Notificaciones"
            icon={
              <SendIcon
                style={{
                  width: "16px",
                  height: "16px",
                  fill: "currentColor",
                }}
              />
            }
            active={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
          />
          <WindowComponent.SidebarItem
            label="Atajos"
            icon={
              <Config
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "currentColor",
                  strokeWidth: "2",
                }}
              />
            }
            active={activeTab === "shortcuts"}
            onClick={() => setActiveTab("shortcuts")}
          />
          <WindowComponent.SidebarItem
            label="Acerca de"
            icon={
              <Information
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "currentColor",
                  strokeWidth: "2",
                }}
              />
            }
            active={activeTab === "about"}
            onClick={() => setActiveTab("about")}
          />
        </WindowComponent.Sidebar>
      }
    >
      <div className={styles.configModalContainer}>
        <AnimatePresence mode="wait">
          {activeTab === "appearance" && (
            <motion.div
              key="appearance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <section className={styles.sectionContainer}>
                <p className={styles.sectionTitle}>Tema de la interfaz</p>
                <div style={{ width: "100%", marginTop: "4px" }}>
                  <Tabs
                    options={themeOptions}
                    activeTab={theme || "system"}
                    onChange={(id) => setTheme(id)}
                    layoutId="config-theme-tabs"
                    backgroundColor="var(--background-over-container)"
                    indicatorColor="var(--background-over-container)"
                    indicatorHoverColor="var(--background-over-container-hover)"
                    indicatorShadow="0 1px 3px rgba(0, 0, 0, 0.08)"
                    textColor="var(--text-not-available)"
                    activeTextColor="var(--text)"
                    hoverTextColor="var(--text)"
                  />
                </div>
                <p className={styles.sectionDescription}>
                  Elige entre tema claro, oscuro o sincronizado automáticamente con tu sistema operativo.
                </p>
              </section>

              <SectionContainer
                sectionTitle="Animaciones"
                sectionDescription="Desactiva las animaciones si experimentas lentitud o prefieres transiciones instantáneas."
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

              {!isMobile && (
                <SectionContainer
                  sectionTitle="Barra lateral"
                  sectionDescription="Posiciona la barra lateral en el lado izquierdo o derecho de la pantalla."
                  configElements={[
                    {
                      text: <>Ubicación en la derecha</>,
                      elementAction: (
                        <Switch
                          value={sidebarPosition === "right"}
                          action={() =>
                            setSidebarPosition(
                              sidebarPosition === "left" ? "right" : "left",
                            )
                          }
                          width={40}
                        />
                      ),
                    },
                  ]}
                />
              )}

              <SectionContainer
                sectionTitle="Aplicación instalable (PWA)"
                sectionDescription="Controla si deseas ver avisos de instalación en tus navegadores compatibles."
                configElements={[
                  {
                    text: <>Sugerir instalación de la aplicación</>,
                    elementAction: (
                      <Switch
                        value={uxPwaPrompt}
                        action={toggleUxPwaPrompt}
                        width={40}
                      />
                    ),
                  },
                ]}
              />
            </motion.div>
          )}

          {activeTab === "behavior" && (
            <motion.div
              key="behavior"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <SectionContainer
                sectionTitle="Efectos y Sonido"
                sectionDescription="Reproduce una suave confirmación auditiva al completar una tarea."
                configElements={[
                  {
                    text: <>Efectos de sonido al completar tareas</>,
                    elementAction: (
                      <Switch
                        value={soundEffects}
                        action={toggleSoundEffects}
                        width={40}
                      />
                    ),
                  },
                  ...(soundEffects
                    ? [
                      {
                        text: (
                          <div className={styles.infoCol}>
                            <span>Tono de completado</span>
                            <span className={styles.infoSubtext}>
                              Selecciona el audio que sonará al marcar una tarea
                            </span>
                          </div>
                        ),
                        elementAction: (
                          <SoundDropdown
                            usage="task-completion"
                            value={taskCompletionSound || "check-1"}
                            onChange={setTaskCompletionSound}
                          />
                        ),
                      },
                    ]
                    : []),
                ]}
              />

              <SectionContainer
                sectionTitle="Seguridad al eliminar"
                sectionDescription="Solicita confirmación antes de eliminar listas, carpetas o múltiples elementos."
                configElements={[
                  {
                    text: <>Confirmar antes de eliminar elementos</>,
                    elementAction: (
                      <Switch
                        value={confirmDelete}
                        action={toggleConfirmDelete}
                        width={40}
                      />
                    ),
                  },
                ]}
              />

              <SectionContainer
                sectionTitle="Calendario y Planificación"
                sectionDescription="Define el primer día de la semana para los selectores de fechas y vistas de tareas."
                configElements={[
                  {
                    text: <>Comienzo de la semana</>,
                    elementAction: (
                      <div style={{ width: "160px" }}>
                        <Tabs
                          options={weekDayOptions}
                          activeTab={firstDayOfWeek}
                          onChange={(id) =>
                            setFirstDayOfWeek(id as "monday" | "sunday")
                          }
                          layoutId="config-week-tabs"
                          backgroundColor="var(--background-over-container)"
                          indicatorColor="var(--background-over-container)"
                          indicatorHoverColor="var(--background-over-container-hover)"
                          indicatorShadow="0 1px 3px rgba(0, 0, 0, 0.08)"
                          textColor="var(--text-not-available)"
                          activeTextColor="var(--text)"
                          hoverTextColor="var(--text)"
                        />
                      </div>
                    ),
                  },
                ]}
              />

              <SectionContainer
                sectionTitle="Densidad de visualización"
                sectionDescription="Ajusta el espaciado vertical entre elementos para ver más tareas simultáneamente."
                configElements={[
                  {
                    text: <>Modo compacto en listas</>,
                    elementAction: (
                      <Switch
                        value={compactView}
                        action={toggleCompactView}
                        width={40}
                      />
                    ),
                  },
                ]}
              />
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <SectionContainer
                sectionTitle="Notificaciones push"
                sectionDescription="Recibe recordatorios de tus tareas y novedades importantes directamente en tu navegador o dispositivo móvil."
                configElements={[
                  {
                    text: <>Activar notificaciones push</>,
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
            </motion.div>
          )}

          {activeTab === "shortcuts" && (
            <motion.div
              key="shortcuts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div className={styles.shortcutHeaderRow}>
                <p className={styles.sectionTitle}>Atajos de teclado</p>
                <button
                  type="button"
                  className={styles.resetBtn}
                  onClick={resetShortcuts}
                >
                  Restablecer por defecto
                </button>
              </div>
              <p className={styles.sectionDescription}>
                Haz clic sobre cualquier combinación para reasignarla presionando tus teclas deseadas en tiempo real.
              </p>
              <div className={styles.shortcutList}>
                {shortcuts.map((item) => {
                  const isRecording = recordingId === item.id;
                  return (
                    <div key={item.id} className={styles.shortcutItem}>
                      <div className={styles.shortcutInfo}>
                        <span className={styles.shortcutLabel}>
                          {item.label}
                        </span>
                        <span className={styles.shortcutDescription}>
                          {item.description}
                        </span>
                      </div>
                      <button
                        type="button"
                        className={`${styles.shortcutBtn} ${isRecording ? styles.shortcutBtnRecording : ""
                          }`}
                        onClick={() =>
                          setRecordingId(isRecording ? null : item.id)
                        }
                        title={
                          isRecording
                            ? "Presiona las teclas que deseas asignar..."
                            : "Haz clic para cambiar combinación"
                        }
                      >
                        {isRecording
                          ? "Presiona teclas..."
                          : formatShortcutDisplay(item, isMac)}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <SectionContainer
                sectionTitle="Estado del sistema"
                sectionDescription="Monitorea la conectividad de la aplicación y gestiona el almacenamiento de datos en tu navegador."
                configElements={[
                  {
                    text: <>Conexión a la nube</>,
                    elementAction: (
                      <div className={styles.statusBadge}>
                        <span
                          className={styles.statusDot}
                          style={{
                            backgroundColor: isOnline ? "#2fd159" : "#ff3b30",
                          }}
                        />
                        <span>
                          {isOnline ? "En línea y sincronizado" : "Sin conexión"}
                        </span>
                      </div>
                    ),
                  },
                  {
                    text: (
                      <div className={styles.infoCol}>
                        <span>Almacenamiento en caché local</span>
                        <span className={styles.infoSubtext}>
                          {cacheSize} de datos temporales ocupados en este dispositivo
                        </span>
                      </div>
                    ),
                    elementAction: (
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={handleClearCache}
                      >
                        Liberar caché
                      </button>
                    ),
                  },
                ]}
              />

              <SectionContainer
                sectionTitle="Plataforma y diagnóstico"
                sectionDescription="Información técnica del entorno local útil para reportar incidencias."
                configElements={[
                  {
                    text: <>Sistema detectado</>,
                    elementAction: (
                      <span className={styles.infoValue}>
                        {isMac ? "macOS" : "Windows / Linux"}
                      </span>
                    ),
                  },
                  {
                    text: (
                      <div className={styles.infoCol}>
                        <span>Diagnóstico del sistema</span>
                        <span className={styles.infoSubtext}>
                          Copia información técnica de la sesión para compartir con soporte
                        </span>
                      </div>
                    ),
                    elementAction: (
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={handleCopyDiagnostics}
                      >
                        Copiar diagnóstico
                      </button>
                    ),
                  },
                ]}
              />

              <SectionContainer
                sectionTitle="Información de la aplicación"
                configElements={[
                  {
                    text: <>Versión actual</>,
                    elementAction: (
                      <span className={styles.versionBadge}>v0.1.0 pre-alpha</span>
                    ),
                  },
                  {
                    text: (
                      <div className={styles.infoCol}>
                        <span>Soporte y contacto</span>
                        <span className={styles.infoSubtext}>
                          ¿Tienes dudas, sugerencias o encontraste algún error?
                        </span>
                      </div>
                    ),
                    elementAction: (
                      <a
                        href="mailto:ayuda@alino.online"
                        className={styles.actionBtn}
                        style={{ textDecoration: "none" }}
                      >
                        Contactar
                      </a>
                    ),
                  },
                ]}
              />
            </motion.div>
          )}
        </AnimatePresence>
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
            <div className={styles.sectionElement}>
              <div className={styles.sectionText}>{element.text}</div>
              {element.elementAction && (
                <div className={styles.sectionAction}>
                  {element.elementAction}
                </div>
              )}
            </div>
            {configElements.length !== index + 1 && (
              <div className={styles.configElementSeparator} />
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
