"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { animate } from "motion";

import { interpolate } from "flubber";

import styles from "./checkbox.module.css";

const paths = {
  normal: {
    d: "M12,2.5c-7.6,0-9.5,1.9-9.5,9.5s1.9,9.5,9.5,9.5s9.5-1.9,9.5-9.5S19.6,2.5,12,2.5z",
  },
  clicked: {
    d: "M12,5.13c-4.5,0-6.47-1.85-7.6-.73-1.13,1.13.73,3.1.73,7.6,0,4.5-1.85,6.47-.72,7.6,1.13,1.13,3.1-.72,7.6-.72s6.47,1.85,7.6.72c1.13-1.13-.72-3.1-.73-7.6,0-4.5,1.85-6.47.73-7.6s-3.1.73-7.6.73Z",
  },
};

export function Checkbox({
  status,
  handleUpdateStatus,
  id,
  active = true,
}: {
  status: boolean | null;
  handleUpdateStatus: () => void;
  id: string;
  active?: boolean;
}) {
  const [tempStatus, setTempStatus] = useState(status);

  useEffect(() => {
    setTempStatus(status);
  }, [status]);

  function togglePath() {
    setTempStatus((prev) => !prev);
    const path = document.getElementById(`path-${id}`);
    const svg = document.getElementById(`svg-${id}`);
    const check = document.getElementById(`check-${id}`);

    if (!path || !svg || !check || path.getAttribute("d") === null) {
      return;
    }

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
      className={styles.statusButton}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePath();
        handleUpdateStatus();
      }}
      disabled={!active}
      style={{ opacity: !active ? 0.3 : 1 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        style={{
          width: "15px",
          stroke: "var(--icon-colorv2)",
          strokeWidth: "2",
          overflow: "visible",
          fill: tempStatus ? "var(--icon-colorv2)" : "transparent",
          transition: "fill 0.1s ease-in-out",
          transform: "scale(1)",
        }}
        id={`svg-${id}`}
      >
        <path id={`path-${id}`} d={paths.normal.d} />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: tempStatus ? 1 : 0 }}
          id={`check-${id}`}
          style={{ stroke: "var(--icon-color-inside)", strokeWidth: 2 }}
          strokeLinejoin="round"
          d="m6.68,13.58s1.18,0,2.76,2.76c0,0,3.99-7.22,7.88-8.67"
        />
      </svg>
    </button>
  );
}
