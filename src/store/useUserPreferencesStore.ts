"use client";

//store para almacenar preferencias de configuración del usuario

import { create } from "zustand";

interface UserPreferences {
  animations: boolean;
  uxPwaPrompt: boolean;
  toggleAnimations: () => void;
  toggleUxPwaPrompt: () => void;
}

const STORAGE_KEY = "user-preferences";

const defaultPreferences = {
  animations: true,
  uxPwaPrompt: true,
};

export const useUserPreferencesStore = create<UserPreferences>((set) => {
  // Cargar preferencias iniciales desde localStorage
  const storedPreferences =
    typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)
      ? JSON.parse(localStorage.getItem(STORAGE_KEY) as string)
      : {};

  const initialPreferences = {
    ...defaultPreferences,
    ...storedPreferences, // Sobrescribir los valores predeterminados con los almacenados
  };

  return {
    animations: initialPreferences.animations,
    uxPwaPrompt: initialPreferences.uxPwaPrompt,

    toggleAnimations: () => {
      set((state) => {
        const newPreferences = {
          ...storedPreferences,
          animations: !state.animations,
        };

        // Guardar las preferencias actualizadas en localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
        }

        return { animations: newPreferences.animations };
      });
    },

    toggleUxPwaPrompt: () => {
      set((state) => {
        const newPreferences = {
          ...storedPreferences,
          uxPwaPrompt: !state.uxPwaPrompt,
        };

        // Guardar las preferencias actualizadas en localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
        }

        return { uxPwaPrompt: newPreferences.uxPwaPrompt };
      });
    },
  };
});
