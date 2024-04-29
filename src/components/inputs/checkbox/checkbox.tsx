"use client";

import { animate, spring } from "motion";
import { interpolate } from "flubber";
import styles from "./checkbox.module.css";

const paths = {
  normal: {
    d: "M12,2.5c-7.6,0-9.5,1.9-9.5,9.5s1.9,9.5,9.5,9.5s9.5-1.9,9.5-9.5S19.6,2.5,12,2.5z",
  },
  clicked: {
    d: "M12,5.13c-4.5,0-6.47-1.85-7.6-.73-1.13,1.13.73,3.1.73,7.6,0,4.5-1.85,6.47-.72,7.6,1.13,1.13,3.1-.72,7.6-.72s6.47,1.85,7.6.72c1.13-1.13-.72-3.1-.73-7.6,0-4.5,1.85-6.47.73-7.6s-3.1.73-7.6.73Z",
  },
  finish: {
    d: "M28,12c0,1.4-3.97,2.81-6,4.5-.56.47-1.04.87-1.33,1.47,0,.01-.01.02-.01.03-.05.12-.11.23-.16.34-.07.12-.13.24-.2.35-.03.06-.07.13-.12.2-.18.26-.35.47-.48.6h0c-1.42,1.51-3.82,2.01-7.7,2.01-7.6,0-9.5-1.9-9.5-9.5S4.4,2.5,12,2.5c3.88,0,6.28.5,7.69,2,.11.12.27.3.42.52.07.09.13.19.19.29.07.11.13.22.2.34.07.16.13.28.16.35,0,.01.01.02.01.03.3.61.8,1.04,1.33,1.47,2.01,1.65,6,3.09,6,4.5Z",
  },
};

export function Checkbox({
  status,
  setStatus,
  style,
}: {
  status: boolean;
  setStatus: (value: boolean) => void;
  style?: React.CSSProperties;
}) {
  async function togglePath() {
    const path = document.getElementById("path");
    const svg = document.getElementById("svg");
    const currentPath = paths.clicked;
    const mixPaths = interpolate(path?.getAttribute("d"), currentPath.d, {
      maxSegmentLength: 1.5,
    });
    animate(
      svg ? svg : "",
      { transform: "scale(0.75)", fill: status ? "#1c1c1c" : "transparent" },
      {
        transform: { easing: spring(), duration: 0.2 },
        fill: { easing: "ease-in-out", duration: 0.1 },
      }
    );
    animate((progress) => path?.setAttribute("d", mixPaths(progress)), {
      duration: 0.2,
      easing: "ease-in-out",
    }).finished.then(() => {
      if (status) {
        const mixPaths = interpolate(path?.getAttribute("d"), paths.finish.d, {
          maxSegmentLength: 1.5,
        });
        animate(
          svg ? svg : "",
          { transform: "scale(1)", fill: status ? "#1c1c1c" : "transparent" },
          {
            transform: { easing: spring(), duration: 0.2 },
            fill: { easing: "ease-in-out", duration: 0.1 },
          }
        );
        animate((progress) => path?.setAttribute("d", mixPaths(progress)), {
          duration: 0.1,
          easing: "ease-in-out",
        }).finished.then(() => {
          if (status) {
            const mixPaths = interpolate(
              path?.getAttribute("d"),
              paths.normal.d,
              {
                maxSegmentLength: 1.5,
              }
            );
            animate((progress) => path?.setAttribute("d", mixPaths(progress)), {
              duration: 0.2,
              easing: "ease-in-out",
            });
          }
        });
      } else {
        const mixPaths = interpolate(path?.getAttribute("d"), paths.normal.d, {
          maxSegmentLength: 1.5,
        });
        animate(
          svg ? svg : "",
          { transform: "scale(1)", fill: status ? "#1c1c1c" : "transparent" },
          {
            transform: { easing: spring(), duration: 0.2 },
            fill: { easing: "ease-in-out", duration: 0.1 },
          }
        );
        animate((progress) => path?.setAttribute("d", mixPaths(progress)), {
          duration: 0.2,
          easing: "ease-in-out",
        });
      }
    });
  }
  return (
    <button
      className={styles.statusButton}
      onClick={(e) => {
        e.stopPropagation();
        setStatus(!status);
        togglePath();
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
        }}
        id="svg"
      >
        <path
          id="path"
          d="M12,2.5c-7.6,0-9.5,1.9-9.5,9.5s1.9,9.5,9.5,9.5s9.5-1.9,9.5-9.5S19.6,2.5,12,2.5z"
        />
      </svg>
    </button>
  );
}
