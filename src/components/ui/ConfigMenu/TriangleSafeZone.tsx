"use client";

import { memo } from "react";

type Point = { x: number; y: number };

interface Props {
  entryPoint: Point;
  submenuRect: DOMRect;
  opensRight: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  debug: boolean;
  zIndex: number;
}

export const TriangleSafeZone = memo(function TriangleSafeZone({
  entryPoint,
  submenuRect,
  opensRight,
  onMouseEnter,
  onMouseLeave,
  debug,
  zIndex,
}: Props) {
  const padY = 5;

  const edgeX = opensRight ? submenuRect.left : submenuRect.right;
  const topY = submenuRect.top - padY;
  const bottomY = submenuRect.bottom + padY;

  const triangle: [number, number][] = [
    [entryPoint.x, entryPoint.y],
    [edgeX, topY],
    [edgeX, bottomY],
  ];

  const xs = triangle.map((p) => p[0]);
  const ys = triangle.map((p) => p[1]);

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  const w = maxX - minX;
  const h = maxY - minY;

  if (w <= 0 || h <= 0) return null;

  const points = triangle.map(([x, y]) => `${x - minX},${y - minY}`).join(" ");

  return (
    <svg
      style={{
        position: "fixed",
        left: `${minX}px`,
        top: `${minY}px`,
        width: `${w}px`,
        height: `${h}px`,
        zIndex,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <polygon
        points={points}
        fill={debug ? "rgba(59,130,246,0.25)" : "transparent"}
        stroke={debug ? "rgb(37,99,235)" : "none"}
        strokeWidth={debug ? 2 : 0}
        strokeLinejoin="round"
        pointerEvents="auto"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ cursor: debug ? "crosshair" : "default" }}
      />
      {debug &&
        triangle.map(([x, y], i) => (
          <circle
            key={i}
            cx={x - minX}
            cy={y - minY}
            r={5}
            fill="rgb(37,99,235)"
            stroke="white"
            strokeWidth={1.5}
          />
        ))}
    </svg>
  );
});
