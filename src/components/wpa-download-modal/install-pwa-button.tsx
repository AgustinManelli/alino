"use client";

import { PlusBoxIcon, Share } from "@/lib/ui/icons";
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWAButton() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Verificar si el navegador soporta PWA
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    if (isStandalone) {
      setIsInstallable(false);
      return;
    }

    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        console.log("Usuario aceptó instalar la PWA");
        setIsInstallable(false);
      } else {
        console.log("Usuario rechazó instalar la PWA");
      }
    } catch (error) {
      console.error("Error al instalar la PWA:", error);
    } finally {
      setInstallPrompt(null);
    }
  };

  // if (!isInstallable) return null;

  return (
    <>
      {isInstallable ? (
        <button
          onClick={handleInstallClick}
          style={{
            border: "none",
            padding: "10px 20px",
            borderRadius: "10px",
            backgroundColor: "#87189d",
            color: "#fff",
            fontSize: "16px",
          }}
        >
          Instalar
        </button>
      ) : (
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <li
            style={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <p>1. Haz click en</p>
            <label
              style={{
                display: "flex",
                padding: "3px 5px",
                backgroundColor: "rgb(235, 235, 235)",
                borderRadius: "5px",
              }}
            >
              <Share
                style={{
                  stroke: "#1c1c1c",
                  strokeWidth: "1.5",
                  width: "16px",
                  height: "auto",
                }}
              />
            </label>
          </li>
          <li
            style={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <p>2. Selecciona</p>
            <label
              style={{
                display: "flex",
                gap: "5px",
                padding: "3px 5px",
                backgroundColor: "rgb(235, 235, 235)",
                borderRadius: "5px",
              }}
            >
              Agregar a inicio{" "}
              <PlusBoxIcon
                style={{
                  stroke: "#1c1c1c",
                  strokeWidth: "1.5",
                  width: "16px",
                  height: "auto",
                }}
              />
            </label>
          </li>
        </ul>
      )}
    </>
  );
}
