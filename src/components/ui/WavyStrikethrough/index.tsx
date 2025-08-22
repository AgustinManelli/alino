"use client";

import { memo } from "react";
import { motion } from "motion/react";

type LineType = {
  width: number;
  top: number;
  left: number;
};

interface WavyStrikethroughProps {
  lines: LineType[];
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
  ({ lines, completed }: WavyStrikethroughProps) => (
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
                duration: 0.2,
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
  )
);

WavyStrikethrough.displayName = "WavyStrikethrough";
