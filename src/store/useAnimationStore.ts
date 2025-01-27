"use client";

import { create } from "zustand";

interface AnimationState {
  animations: boolean;
  toggleAnimations: () => void;
}

export const useAnimationStore = create<AnimationState>((set) => {
  // Leer el valor inicial desde localStorage
  const storedAnimations = localStorage.getItem("animations");
  const initialAnimations = storedAnimations
    ? JSON.parse(storedAnimations)
    : true;

  return {
    animations: initialAnimations, // Usar el valor de localStorage o el valor predeterminado
    toggleAnimations: () => {
      set((state) => {
        const newValue = !state.animations;

        // Guardar el nuevo estado en localStorage
        localStorage.setItem("animations", JSON.stringify(newValue));

        return { animations: newValue };
      });
    },
  };
});
