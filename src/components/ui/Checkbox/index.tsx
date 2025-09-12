"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { animate } from "motion";
import { interpolate } from "flubber";

import styles from "./Checkbox.module.css";

const paths = {
  normal: {
    d: "M12,2.5c-7.6,0-9.5,1.9-9.5,9.5s1.9,9.5,9.5,9.5s9.5-1.9,9.5-9.5S19.6,2.5,12,2.5z",
  },
  clicked: {
    d: "M12,5.13c-4.5,0-6.47-1.85-7.6-.73-1.13,1.13.73,3.1.73,7.6,0,4.5-1.85,6.47-.72,7.6,1.13,1.13,3.1-.72,7.6-.72s6.47,1.85,7.6.72c1.13-1.13-.72-3.1-.73-7.6,0-4.5,1.85-6.47.73-7.6s-3.1.73-7.6.73Z",
  },
};

interface Props {
  /**
   * El estado actual del checkbox (marcado o no marcado).
   */
  status: boolean | null;
  /**
   * Función callback que se invoca al hacer clic en el checkbox.
   */
  handleUpdateStatus: () => void;
  /**
   * Si es `true`, el checkbox se deshabilita y no permite interacción.
   * @default false
   */
  disabled?: boolean;
  /**
   * Etiqueta de accesibilidad para lectores de pantalla.
   * @default "checkbox"
   */
  ariaLabel?: string;
}

/**
 * Un componente de checkbox animado que utiliza `flubber` y `motion`
 * para crear una transición suave entre los estados de marcado y desmarcado.
 */
export const Checkbox = ({
  status,
  handleUpdateStatus,
  disabled = false,
  ariaLabel = "checkbox",
}: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  function togglePath() {
    if (disabled) return;

    const path = pathRef.current;
    const svg = svgRef.current;

    if (!path || !svg) {
      return;
    }

    handleUpdateStatus();

    const pathData = path.getAttribute("d") ?? "";
    const mixPaths = interpolate(pathData, paths.clicked.d, {
      maxSegmentLength: 2,
    });

    animate(svg, { transform: "scale(0.75)" }, { duration: 0.15 });
    animate(0, 1, {
      duration: 0.15,
      ease: "easeInOut",
      onUpdate: (progress) => {
        path.setAttribute("d", mixPaths(progress));
      },
    }).then(() => {
      const mixPathsBack = interpolate(paths.clicked.d, paths.normal.d, {
        maxSegmentLength: 2,
      });

      animate(svg, { transform: "scale(1)" }, { duration: 0.15 });
      animate(0, 1, {
        duration: 0.15,
        ease: "easeInOut",
        onUpdate: (progress) => {
          path.setAttribute("d", mixPathsBack(progress));
        },
      });
    });
  }

  return (
    <button
      className={styles.checkbox}
      onClick={togglePath}
      disabled={disabled}
      role="checkbox"
      aria-checked={!!status}
      aria-label={ariaLabel}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={styles.svg}
        ref={svgRef}
        style={{
          stroke: "var(--icon-colorv2)",
          fill: status ? "var(--icon-colorv2)" : "transparent",
        }}
      >
        <path ref={pathRef} d={paths.normal.d} />
        <motion.path
          animate={{ pathLength: status ? 1 : 0 }}
          className={styles.checkPath}
          strokeLinejoin="round"
          d="m6.68,13.58s1.18,0,2.76,2.76c0,0,3.99-7.22,7.88-8.67"
        />
      </svg>
    </button>
  );
};
