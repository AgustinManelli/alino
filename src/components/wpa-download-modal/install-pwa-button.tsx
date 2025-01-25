"use client";

import { PlusBoxIcon, Share } from "@/lib/ui/icons";
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWAButton({
  handleCloseModal,
}: {
  handleCloseModal: () => void;
}) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOSorMac, setIsIOSorMac] = useState(false);

  useEffect(() => {
    // Detectar sistema operativo
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isMac = /macintosh|mac os x/.test(userAgent);

    setIsIOSorMac(isIOS || isMac);

    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
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
        handleCloseModal;
      }
    } catch (error) {
      console.error("Error al instalar la PWA:", error);
    } finally {
      setInstallPrompt(null);
    }
  };

  return (
    <>
      {!isIOSorMac ? (
        <button
          onClick={handleInstallClick}
          style={{
            border: "none",
            padding: "10px 20px",
            borderRadius: "10px",
            backgroundColor: "#87189d",
            color: "#fff",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Instalar
        </button>
      ) : isIOSorMac ? (
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
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                borderRadius: "5px",
              }}
            >
              <Share
                style={{
                  stroke: "#1c1c1c",
                  strokeWidth: "2",
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
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                borderRadius: "5px",
              }}
            >
              Agregar a inicio{" "}
              <PlusBoxIcon
                style={{
                  stroke: "#1c1c1c",
                  strokeWidth: "2",
                  width: "16px",
                  height: "auto",
                }}
              />
            </label>
          </li>
        </ul>
      ) : null}
    </>
  );
}
