"use client";

import { useState, useEffect } from "react";

import { PlusBoxIcon, Share } from "@/components/ui/icons/icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface Props {
  onClose: () => void;
}

export default function InstallPWAButton({ onClose }: Props) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isIOSorMac] = useState<boolean>(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod|macintosh|mac os x/.test(ua);
  });

  useEffect(() => {
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") onClose();
    } finally {
      setInstallPrompt(null);
    }
  };

  if (isIOSorMac) {
    return (
      <ul
        style={{
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <li style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <p>1. Haz click en</p>
          <label
            style={{
              display: "flex",
              padding: "3px 5px",
              backgroundColor: "rgba(0,0,0,0.05)",
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
        <li style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <p>2. Selecciona</p>
          <label
            style={{
              display: "flex",
              gap: "5px",
              padding: "3px 5px",
              backgroundColor: "rgba(0,0,0,0.05)",
              borderRadius: "5px",
            }}
          >
            Agregar a inicio
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
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      disabled={!installPrompt}
      style={{
        border: "none",
        padding: "10px 20px",
        borderRadius: "10px",
        backgroundColor: "#87189d",
        color: "#fff",
        fontSize: "16px",
        cursor: installPrompt ? "pointer" : "not-allowed",
        opacity: installPrompt ? 1 : 0.5,
      }}
    >
      Instalar
    </button>
  );
}
