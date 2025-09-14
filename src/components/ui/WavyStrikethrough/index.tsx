"use client";

import { memo, useEffect } from "react";
import { motion } from "motion/react";
import { useLineCalculator } from "@/hooks/useLineCalculator";
import { debounce } from "lodash-es";

interface WavyStrikethroughProps {
  textRef: React.RefObject<HTMLElement>;
  completed: boolean | null;
}

function generateWavePath(width: number) {
  const waveSegments = Math.max(4, Math.floor(width / 20));
  const step = width / waveSegments;
  return `M 0 3 ${Array.from(
    { length: waveSegments },
    (_, i) =>
      `Q ${step * (i + 0.5)} ${i % 2 === 0 ? 0 : 6}, ${step * (i + 1)} 3`
  ).join(" ")}`;
}

export const WavyStrikethrough = memo(
  ({ textRef, completed }: WavyStrikethroughProps) => {
    if (!textRef) return;
    const { lines, calculateLines } = useLineCalculator(textRef);

    useEffect(() => {
      calculateLines();
      const debouncedCalculateLines = debounce(calculateLines, 150);

      let ro: ResizeObserver | null = null;
      if (textRef.current && typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => debouncedCalculateLines());
        ro.observe(textRef.current);
      }

      window.addEventListener("resize", debouncedCalculateLines);

      return () => {
        debouncedCalculateLines.cancel();
        window.removeEventListener("resize", debouncedCalculateLines);
        if (ro && textRef.current) ro.unobserve(textRef.current);
      };
    }, [calculateLines]);
    return (
      <>
        {lines.map((line, index) => (
          <motion.div
            key={`${line.top}-${line.left}-${line.width}`}
            style={{
              position: "absolute",
              pointerEvents: "none",
              top: line.top,
              left: line.left - 10,
              width: line.width + 20,
            }}
          >
            <motion.svg
              width="100%"
              height="6"
              viewBox={`0 0 ${line.width + 15} 6`}
              style={{ display: "block" }}
            >
              <motion.path
                d={generateWavePath(line.width + 15)}
                stroke="var(--text)"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: completed ? 1 : 0 }}
                transition={{
                  duration: 0.1,
                  delay: completed
                    ? index * 0.1
                    : (lines.length - index - 1) * 0.1,
                  ease: "easeInOut",
                }}
              />
            </motion.svg>
          </motion.div>
        ))}
      </>
    );
  }
);

WavyStrikethrough.displayName = "WavyStrikethrough";
