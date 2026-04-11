"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

interface Line {
  top: number;
  left: number;
  width: number;
}

interface WavyStrikethroughProps {
  textRef: React.RefObject<HTMLElement>;
  completed: boolean | null;
}

const pathCache = new Map<number, string>();

function generateWavePath(width: number): string {
  const w = Math.round(width);
  const cached = pathCache.get(w);
  if (cached) return cached;
  const segments = Math.max(4, Math.floor(w / 20));
  const step = w / segments;
  const d = `M 0 3 ${Array.from(
    { length: segments },
    (_, i) =>
      `Q ${step * (i + 0.5)} ${i % 2 === 0 ? 0 : 6}, ${step * (i + 1)} 3`,
  ).join(" ")}`;
  pathCache.set(w, d);
  return d;
}

function getVisualLines(el: HTMLElement): Line[] {
  const parent = el.parentElement;
  if (!parent) return [];

  const elRect = el.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();

  const elOffsetTop = Math.round(elRect.top - parentRect.top);
  const elOffsetLeft = Math.round(elRect.left - parentRect.left);

  type RectEntry = { left: number; right: number; centerY: number };
  const rawRects: RectEntry[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let textNode = walker.nextNode() as Text | null;

  while (textNode) {
    if (textNode.textContent?.trim()) {
      const range = document.createRange();
      range.selectNodeContents(textNode);
      const nodeRects = Array.from(range.getClientRects());
      for (const r of nodeRects) {
        if (r.width > 1 && r.height > 1) {
          rawRects.push({
            left: r.left - elRect.left,
            right: r.right - elRect.left,
            centerY: r.top - elRect.top + r.height / 2,
          });
        }
      }
    }
    textNode = walker.nextNode() as Text | null;
  }

  if (!rawRects.length) return [];

  const MERGE_THRESHOLD = 10;
  const groups: RectEntry[][] = [];

  for (const r of rawRects) {
    let merged = false;
    for (const g of groups) {
      const avgCenter = g.reduce((s, x) => s + x.centerY, 0) / g.length;
      if (Math.abs(avgCenter - r.centerY) <= MERGE_THRESHOLD) {
        g.push(r);
        merged = true;
        break;
      }
    }
    if (!merged) groups.push([r]);
  }

  return groups.map((g) => {
    const minLeft = Math.min(...g.map((x) => x.left));
    const maxRight = Math.max(...g.map((x) => x.right));
    const avgCenterY = g.reduce((s, x) => s + x.centerY, 0) / g.length;
    return {
      left: Math.round(elOffsetLeft + minLeft),
      top: Math.round(elOffsetTop + avgCenterY - 3),
      width: Math.round(maxRight - minLeft),
    };
  });
}

export const WavyStrikethrough = memo(
  ({ textRef, completed }: WavyStrikethroughProps) => {
    const [lines, setLines] = useState<Line[]>([]);
    const rafRef = useRef<number>(0);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const calculateLines = useCallback(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!textRef.current) return;
        setLines(getVisualLines(textRef.current));
      });
    }, [textRef]);

    useEffect(() => {
      calculateLines();

      if (!textRef.current || typeof ResizeObserver === "undefined") return;

      const ro = new ResizeObserver(() => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(calculateLines, 120);
      });

      ro.observe(textRef.current);

      return () => {
        cancelAnimationFrame(rafRef.current);
        clearTimeout(timerRef.current);
        ro.disconnect();
      };
    }, [calculateLines]);

    if (!lines.length) return null;

    return (
      <>
        {lines.map((line, index) => (
          <motion.svg
            key={`${line.top}-${line.left}`}
            width={line.width + 20}
            height={6}
            viewBox={`0 0 ${line.width + 15} 6`}
            style={{
              position: "absolute",
              pointerEvents: "none",
              top: line.top,
              left: line.left - 10,
              display: "block",
            }}
          >
            <motion.path
              d={generateWavePath(line.width + 15)}
              stroke="var(--text)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: completed ? 1 : 0 }}
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
        ))}
      </>
    );
  },
);

WavyStrikethrough.displayName = "WavyStrikethrough";
