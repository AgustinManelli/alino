import { useEffect } from "react";

// Hook simplificado - ya no maneja el timer, solo limpieza opcional
export const usePomodoroCleanup = () => {
  useEffect(() => {
    // Cleanup solo si el componente se desmonta inesperadamente
    return () => {
      // El store maneja su propia limpieza, no necesitamos hacer nada aquí
    };
  }, []);
};

// Hook para funcionalidades adicionales del pomodoro
export const usePomodoroFeatures = () => {
  // Funciones adicionales que podrías necesitar
  const playNotificationSound = () => {
    // Opcional: reproducir sonido de notificación
    if (typeof Audio !== "undefined") {
      try {
        const audio = new Audio("/notification-sound.mp3"); // ajusta la ruta
        audio.play().catch(() => {
          // Silently fail if audio can't be played
        });
      } catch {
        // Silently fail if Audio is not supported
      }
    }
  };

  const showBrowserNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        requireInteraction: false,
        silent: false,
      });
    }
  };

  return {
    playNotificationSound,
    showBrowserNotification,
  };
};
