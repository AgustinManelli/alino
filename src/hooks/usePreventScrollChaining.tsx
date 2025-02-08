"use client";

import { useEffect, useRef } from "react";

const usePreventScrollChaining = () => {
  // Definir el tipo de la referencia como un div HTML
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Obtener el contenedor actual
    const container = containerRef.current;

    const handleWheel = (event: WheelEvent) => {
      if (container) {
        const { scrollHeight, clientHeight } = container;

        // Verificar si el contenido desborda
        const canScroll = scrollHeight > clientHeight;

        // Si no hay suficiente contenido, bloquear el scroll
        if (!canScroll) {
          event.preventDefault();
        }
      }
    };

    // Agregar el event listener al contenedor
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    // Limpiar el event listener al desmontar el componente
    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  return containerRef;
};

export default usePreventScrollChaining;
