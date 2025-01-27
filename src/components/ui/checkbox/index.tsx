"use client";

import { animate } from "motion";
import { interpolate } from "flubber";
import styles from "./checkbox.module.css";
import { useState } from "react";

const paths = {
  normal: {
    d: "M12,2.5c-7.6,0-9.5,1.9-9.5,9.5s1.9,9.5,9.5,9.5s9.5-1.9,9.5-9.5S19.6,2.5,12,2.5z",
  },
  clicked: {
    d: "M12,5.13c-4.5,0-6.47-1.85-7.6-.73-1.13,1.13.73,3.1.73,7.6,0,4.5-1.85,6.47-.72,7.6,1.13,1.13,3.1-.72,7.6-.72s6.47,1.85,7.6.72c1.13-1.13-.72-3.1-.73-7.6,0-4.5,1.85-6.47.73-7.6s-3.1.73-7.6.73Z",
  },
  // finish: {
  //   d: "M28,12c0,1.4-3.97,2.81-6,4.5-.56.47-1.04.87-1.33,1.47,0,.01-.01.02-.01.03-.05.12-.11.23-.16.34-.07.12-.13.24-.2.35-.03.06-.07.13-.12.2-.18.26-.35.47-.48.6h0c-1.42,1.51-3.82,2.01-7.7,2.01-7.6,0-9.5-1.9-9.5-9.5S4.4,2.5,12,2.5c3.88,0,6.28.5,7.69,2,.11.12.27.3.42.52.07.09.13.19.19.29.07.11.13.22.2.34.07.16.13.28.16.35,0,.01.01.02.01.03.3.61.8,1.04,1.33,1.47,2.01,1.65,6,3.09,6,4.5Z",
  // },
};

export function Checkbox({
  status,
  handleUpdateStatus,
  style,
  id,
}: {
  status: boolean;
  handleUpdateStatus: () => void;
  style?: React.CSSProperties;
  id: string;
}) {
  const [tempStatus, setTempStatus] = useState(status);
  function togglePath() {
    setTempStatus(!tempStatus);
    const path = document.getElementById(`path-${id}`);
    const svg = document.getElementById(`svg-${id}`);

    if (!path || !svg || path.getAttribute("d") === null) return;
    const currentPath = paths.clicked;
    const pathData = path.getAttribute("d") ?? "";
    const mixPaths = interpolate(pathData, currentPath.d, {
      maxSegmentLength: 2,
    });
    animate(
      svg,
      { transform: "scale(0.75)" },
      {
        transform: { duration: 0.2 },
      }
    );
    animate(0, 1, {
      duration: 0.2,
      ease: "easeInOut",
      onUpdate: (progress) => {
        path.setAttribute("d", mixPaths(progress));
        console.log(progress);
      },
    }).then(() => {
      const mixPaths = interpolate(pathData, paths.normal.d, {
        maxSegmentLength: 2,
      });
      animate(
        svg,
        { transform: "scale(1)" },
        {
          transform: { duration: 0.2 },
        }
      );
      animate(0, 1, {
        duration: 0.2,
        ease: "easeInOut",
        onUpdate: (progress) => {
          path.setAttribute("d", mixPaths(progress));
        },
      });
    });
  }
  return (
    <button
      className={styles.statusButton}
      onClick={(e) => {
        e.stopPropagation();
        togglePath();
        handleUpdateStatus();
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        style={{
          width: "15px",
          stroke: "#1c1c1c",
          strokeWidth: "2",
          overflow: "visible",
          fill: tempStatus ? "#1c1c1c" : "transparent",
          transition: "fill 0.1s ease-in-out",
          transform: "scale(1)",
        }}
        id={`svg-${id}`}
      >
        <path
          id={`path-${id}`}
          d="M12,2.5c-7.6,0-9.5,1.9-9.5,9.5s1.9,9.5,9.5,9.5s9.5-1.9,9.5-9.5S19.6,2.5,12,2.5z"
        />
      </svg>
    </button>
  );
}
