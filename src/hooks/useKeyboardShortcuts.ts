"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useTheme } from "next-themes";
import { customToast } from "@/lib/toasts";

export interface ShortcutItem {
  id: string;
  label: string;
  description: string;
  key: string;
  metaOrCtrl: boolean;
  shift?: boolean;
  alt?: boolean;
}

export const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  {
    id: "openSearch",
    label: "Búsqueda rápida / Paleta",
    description: "Abre la búsqueda global o la paleta de comandos",
    key: "k",
    metaOrCtrl: true,
  },
  {
    id: "newTask",
    label: "Crear nueva tarea",
    description: "Enfoca rápidamente el campo de creación de tarea",
    key: "n",
    metaOrCtrl: false,
  },
  {
    id: "openConfig",
    label: "Abrir configuración",
    description: "Abre la ventana de configuración general",
    key: ",",
    metaOrCtrl: true,
  },
  {
    id: "toggleSidebar",
    label: "Alternar barra lateral",
    description: "Colapsa o expande la barra lateral de navegación",
    key: "b",
    metaOrCtrl: true,
  },
  {
    id: "toggleTheme",
    label: "Cambiar tema de la interfaz",
    description: "Alterna rápidamente entre tema claro y tema oscuro",
    key: "l",
    metaOrCtrl: true,
    shift: true,
  },
];

const STORAGE_KEY = "alino_custom_shortcuts";

export function formatShortcutDisplay(
  item: ShortcutItem,
  isMac: boolean,
): string {
  const parts: string[] = [];

  if (item.metaOrCtrl) {
    parts.push(isMac ? "⌘" : "Ctrl");
  }
  if (item.alt) {
    parts.push(isMac ? "⌥" : "Alt");
  }
  if (item.shift) {
    parts.push(isMac ? "⇧" : "Shift");
  }

  let keyDisplay = item.key.toUpperCase();
  if (item.key === ",") keyDisplay = ",";
  if (item.key === "Escape") keyDisplay = "Esc";
  if (item.key === "Enter") keyDisplay = "↵ Enter";

  parts.push(keyDisplay);

  return isMac ? parts.join(" ") : parts.join(" + ");
}

export function useKeyboardShortcuts() {
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>(() => {
    if (typeof window === "undefined") return DEFAULT_SHORTCUTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return DEFAULT_SHORTCUTS.map((def) => {
          const match = parsed.find((p: ShortcutItem) => p.id === def.id);
          return match ? { ...def, ...match } : def;
        });
      }
    } catch {
      // Ignorar errores de parseo
    }
    return DEFAULT_SHORTCUTS;
  });

  const [recordingId, setRecordingId] = useState<string | null>(null);

  const isMac = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      navigator.platform?.toUpperCase().indexOf("MAC") >= 0 ||
      navigator.userAgent?.toUpperCase().indexOf("MAC") >= 0
    );
  }, []);

  const saveShortcuts = useCallback((newShortcuts: ShortcutItem[]) => {
    setShortcuts(newShortcuts);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newShortcuts));
      } catch {
        // Ignorar
      }
    }
  }, []);

  const resetShortcuts = useCallback(() => {
    saveShortcuts(DEFAULT_SHORTCUTS);
    customToast.success("Atajos restablecidos a los valores por defecto.");
  }, [saveShortcuts]);

  const updateShortcut = useCallback(
    (id: string, updates: Partial<ShortcutItem>) => {
      const updated = shortcuts.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      );
      saveShortcuts(updated);
      setRecordingId(null);
      customToast.success("Atajo actualizado correctamente.");
    },
    [shortcuts, saveShortcuts],
  );

  // Escucha para modo grabación de atajo
  useEffect(() => {
    if (!recordingId) return;

    const handleRecord = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Ignorar pulsaciones de solo modificadores
      if (["Meta", "Control", "Alt", "Shift"].includes(e.key)) return;

      // Detectar tecla
      let pressedKey = e.key.toLowerCase();
      if (pressedKey === " ") pressedKey = "Space";

      const hasMetaOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      updateShortcut(recordingId, {
        key: pressedKey,
        metaOrCtrl: hasMetaOrCtrl,
        shift: e.shiftKey,
        alt: e.altKey,
      });
    };

    window.addEventListener("keydown", handleRecord, true);
    return () => window.removeEventListener("keydown", handleRecord, true);
  }, [recordingId, isMac, updateShortcut]);

  return {
    shortcuts,
    recordingId,
    setRecordingId,
    updateShortcut,
    resetShortcuts,
    isMac,
  };
}

export function useGlobalShortcutsListener(actions?: {
  onOpenSearch?: () => void;
  onNewTask?: () => void;
  onOpenConfig?: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const sidebarCollapsed = useUserPreferencesStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useUserPreferencesStore(
    (s) => s.setSidebarCollapsed,
  );

  const { shortcuts, isMac } = useKeyboardShortcuts();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      for (const item of shortcuts) {
        const matchesMetaOrCtrl = item.metaOrCtrl
          ? isMac
            ? e.metaKey
            : e.ctrlKey
          : !(isMac ? e.metaKey : e.ctrlKey);

        const matchesShift = item.shift ? e.shiftKey : !e.shiftKey;
        const matchesAlt = item.alt ? e.altKey : !e.altKey;

        const pressedKey = e.key.toLowerCase();
        const matchesKey =
          pressedKey === item.key.toLowerCase() ||
          (item.key === "Space" && e.code === "Space");

        if (matchesMetaOrCtrl && matchesShift && matchesAlt && matchesKey) {
          if (!item.metaOrCtrl && isInput) {
            continue;
          }

          e.preventDefault();

          switch (item.id) {
            case "openSearch":
              actions?.onOpenSearch?.();
              break;
            case "newTask": {
              const taskInput =
                document.querySelector<HTMLInputElement>(
                  'input[name="task_name"]',
                ) ||
                document.querySelector<HTMLElement>('[contenteditable="true"]');
              if (taskInput) {
                taskInput.focus();
              } else {
                actions?.onNewTask?.();
              }
              break;
            }
            case "openConfig":
              actions?.onOpenConfig?.();
              break;
            case "toggleSidebar":
              setSidebarCollapsed(!sidebarCollapsed);
              break;
            case "toggleTheme":
              setTheme(theme === "dark" ? "light" : "dark");
              customToast.info(
                theme === "dark" ? "Tema claro activado" : "Tema oscuro activado",
              );
              break;
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, isMac, actions, theme, setTheme, sidebarCollapsed, setSidebarCollapsed]);
}
