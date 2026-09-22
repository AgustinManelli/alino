"use client";

import React from "react";

interface CosmeticRendererProps {
  size?: number;
  className?: string;
  borderRadius?: string | number;
}

const useCosmeticId = (prefix: string) => {
  const id = React.useId();
  return `${prefix}_${id.replace(/:/g, "")}`;
};

export const FrameBronze: React.FC<CosmeticRendererProps> = ({ size = 96, borderRadius = 23 }) => {
  const pad = 4;
  const outerSize = size + pad * 2;
  const numRadius =
    typeof borderRadius === "number" ? borderRadius : parseFloat(borderRadius as string) || 23;
  const s = size / 96;
  const rx = numRadius;
  const uid = useCosmeticId("frame_bronze");

  const bronzeId = `${uid}_bronze`;
  const shineId = `${uid}_shine`;
  const rimId = `${uid}_rim`;
  const clipId = `${uid}_clip`;

  const inset = 1.8 * s;
  const shadowOffset = 2 * s;

  return (
    <svg
      width={outerSize}
      height={outerSize}
      viewBox={`0 0 ${outerSize} ${outerSize}`}
      style={{
        position: "absolute",
        top: -pad,
        left: -pad,
        pointerEvents: "none",
        zIndex: 2,
        overflow: "visible",
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bronzeId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD9A6" />
          <stop offset="22%" stopColor="#E8A263" />
          <stop offset="48%" stopColor="#C47940" />
          <stop offset="74%" stopColor="#9A5628" />
          <stop offset="100%" stopColor="#6E3818" />
        </linearGradient>

        <linearGradient id={shineId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF3D6" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#FFD9A6" stopOpacity="0.25" />
          <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={rimId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE9C6" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#C47940" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5A2E13" stopOpacity="0.55" />
        </linearGradient>

        <clipPath id={clipId}>
          <rect x={pad} y={pad} width={size} height={size} rx={rx} />
        </clipPath>
      </defs>

      <rect
        x={pad}
        y={pad + shadowOffset}
        width={size}
        height={size}
        rx={rx}
        fill="#3A1D0B"
        opacity="0.28"
      />

      <rect
        x={pad + 0.6 * s}
        y={pad + 1.4 * s}
        width={size - 1.2 * s}
        height={size - 1.2 * s}
        rx={Math.max(2, rx - 0.6 * s)}
        fill="none"
        stroke="#3A1D0B"
        strokeWidth={1.4 * s}
        opacity="0.55"
      />

      <rect
        x={pad}
        y={pad + 0.6 * s}
        width={size}
        height={size}
        rx={rx}
        fill="none"
        stroke="#5A2E13"
        strokeWidth={4.9 * s}
        strokeLinejoin="round"
      />

      <rect
        x={pad}
        y={pad}
        width={size}
        height={size}
        rx={rx}
        fill="none"
        stroke={`url(#${bronzeId})`}
        strokeWidth={3.5 * s}
        strokeLinejoin="round"
      />

      <rect
        x={pad}
        y={pad}
        width={size}
        height={size}
        rx={rx}
        fill="none"
        stroke={`url(#${shineId})`}
        strokeWidth={1.4 * s}
        strokeLinejoin="round"
        opacity="0.85"
      />

      <rect
        x={pad + inset}
        y={pad + inset}
        width={size - inset * 2}
        height={size - inset * 2}
        rx={Math.max(2, rx - inset)}
        fill="none"
        stroke={`url(#${rimId})`}
        strokeWidth={0.95 * s}
      />

      <g clipPath={`url(#${clipId})`}>
        <path
          d={`M${pad},${pad + 62 * s} L${pad + 90 * s},${pad + 6 * s} L${pad + 95 * s},${pad + 17 * s} L${pad},${pad + 76 * s} Z`}
          fill="#FFFFFF"
          opacity="0.1"
        />
        <path
          d={`M${pad + 5 * s},${pad + 83 * s} L${pad + 98 * s},${pad + 25 * s} L${pad + 99 * s},${pad + 29 * s} L${pad + 6 * s},${pad + 86 * s} Z`}
          fill="#FFFFFF"
          opacity="0.1"
        />
      </g>
    </svg>
  );
};

export const FrameSilver: React.FC<CosmeticRendererProps> = ({ size = 96, borderRadius = 23 }) => {
  const pad = 4;
  const outerSize = size + pad * 2;
  const numRadius =
    typeof borderRadius === "number" ? borderRadius : parseFloat(borderRadius as string) || 23;
  const rx = numRadius;
  const s = size / 96;
  const uid = useCosmeticId("frame_silver");

  const gradientId = `${uid}_grad`;
  const shadowId = `${uid}_shadow`;
  const shineId = `${uid}_shine`;

  return (
    <svg
      width={outerSize}
      height={outerSize}
      viewBox={`0 0 ${outerSize} ${outerSize}`}
      style={{
        position: "absolute",
        top: -pad,
        left: -pad,
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="22%" stopColor="#DDE7F0" />
          <stop offset="50%" stopColor="#AAB8C6" />
          <stop offset="76%" stopColor="#EEF4F8" />
          <stop offset="100%" stopColor="#8798A8" />
        </linearGradient>
        <linearGradient id={shineId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#C7F0FF" stopOpacity="0.55" />
        </linearGradient>
        <filter id={shadowId} x="-18%" y="-18%" width="136%" height="136%">
          <feDropShadow dx="0" dy="1.2" stdDeviation={1.6 * s} floodColor="#41576B" floodOpacity="0.28" />
        </filter>
      </defs>

      <rect
        x={pad}
        y={pad + 0.5 * s}
        width={size}
        height={size}
        rx={rx}
        fill="none"
        stroke="#718394"
        strokeWidth={4.6 * s}
        filter={`url(#${shadowId})`}
      />
      <rect
        x={pad}
        y={pad}
        width={size}
        height={size}
        rx={rx}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={3.35 * s}
      />
      <path
        d={`M ${pad + 7 * s} ${pad + 13 * s} Q ${pad + 10 * s} ${pad + 7 * s} ${pad + 17 * s} ${pad + 6 * s}`}
        stroke={`url(#${shineId})`}
        strokeWidth={1.5 * s}
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      <path
        d={`M ${pad + size - 7 * s} ${pad + size - 13 * s} Q ${pad + size - 10 * s} ${pad + size - 7 * s} ${pad + size - 17 * s} ${pad + size - 6 * s}`}
        stroke="#FFFFFF"
        strokeWidth={1.1 * s}
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />

      {[0, 1, 2, 3].map((corner) => {
        const x = corner % 2 === 0 ? pad + rx * 0.38 : pad + size - rx * 0.38;
        const y = corner < 2 ? pad + rx * 0.38 : pad + size - rx * 0.38;
        return <circle key={corner} cx={x} cy={y} r={1.65 * s} fill="#FFFFFF" opacity="0.9" />;
      })}
    </svg>
  );
};

export const FrameGold: React.FC<CosmeticRendererProps> = ({ size = 96, borderRadius = 23 }) => {
  const pad = 5;
  const outerSize = size + pad * 2;
  const numRadius =
    typeof borderRadius === "number" ? borderRadius : parseFloat(borderRadius as string) || 23;
  const rx = numRadius;
  const s = size / 96;
  const uid = useCosmeticId("frame_gold");

  const gradientId = `${uid}_grad`;
  const shadowId = `${uid}_shadow`;
  const highlightId = `${uid}_highlight`;

  return (
    <svg
      width={outerSize}
      height={outerSize}
      viewBox={`0 0 ${outerSize} ${outerSize}`}
      style={{
        position: "absolute",
        top: -pad,
        left: -pad,
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2A8" />
          <stop offset="24%" stopColor="#FFD84D" />
          <stop offset="52%" stopColor="#F4B72D" />
          <stop offset="78%" stopColor="#FFE77A" />
          <stop offset="100%" stopColor="#D99118" />
        </linearGradient>
        <linearGradient id={highlightId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#FFF7C4" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFF7C4" stopOpacity="0" />
        </linearGradient>
        <filter id={shadowId} x="-18%" y="-18%" width="136%" height="136%">
          <feDropShadow dx="0" dy="1.8" stdDeviation={2 * s} floodColor="#8B5A00" floodOpacity="0.32" />
        </filter>
      </defs>

      <rect
        x={pad}
        y={pad + 0.5 * s}
        width={size}
        height={size}
        rx={rx}
        fill="none"
        stroke="#A96B05"
        strokeWidth={5.2 * s}
        filter={`url(#${shadowId})`}
      />
      <rect
        x={pad}
        y={pad}
        width={size}
        height={size}
        rx={rx}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={3.8 * s}
      />
      <rect
        x={pad + 1.8 * s}
        y={pad + 1.8 * s}
        width={size - 3.6 * s}
        height={size - 3.6 * s}
        rx={Math.max(2, rx - 1.8 * s)}
        fill="none"
        stroke={`url(#${highlightId})`}
        strokeWidth={1.15 * s}
      />

      {[0, 1, 2, 3].map((corner) => {
        const x = corner % 2 === 0 ? pad + rx * 0.4 : pad + size - rx * 0.4;
        const y = corner < 2 ? pad + rx * 0.4 : pad + size - rx * 0.4;
        return (
          <g key={corner}>
            <circle cx={x} cy={y} r={3.1 * s} fill="#FFE48A" stroke="#B97908" strokeWidth={0.9 * s} />
            <circle cx={x - 0.7 * s} cy={y - 0.8 * s} r={1.35 * s} fill="#FFFFFF" />
          </g>
        );
      })}
    </svg>
  );
};

export const FrameEmerald: React.FC<CosmeticRendererProps> = ({ size = 96, borderRadius = 23 }) => {
  const pad = 5;
  const outerSize = size + pad * 2;
  const numRadius =
    typeof borderRadius === "number" ? borderRadius : parseFloat(borderRadius as string) || 23;
  const rx = numRadius;
  const s = size / 96;
  const uid = useCosmeticId("frame_emerald");

  const gradientId = `${uid}_grad`;
  const shadowId = `${uid}_shadow`;

  return (
    <svg
      width={outerSize}
      height={outerSize}
      viewBox={`0 0 ${outerSize} ${outerSize}`}
      style={{
        position: "absolute",
        top: -pad,
        left: -pad,
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A7F3C5" />
          <stop offset="28%" stopColor="#57D982" />
          <stop offset="62%" stopColor="#29B765" />
          <stop offset="100%" stopColor="#117A47" />
        </linearGradient>
        <filter id={shadowId} x="-18%" y="-18%" width="136%" height="136%">
          <feDropShadow dx="0" dy="1.6" stdDeviation={2 * s} floodColor="#0A6C3D" floodOpacity="0.26" />
        </filter>
      </defs>

      <rect
        x={pad}
        y={pad + 0.5 * s}
        width={size}
        height={size}
        rx={rx}
        fill="none"
        stroke="#086238"
        strokeWidth={5.2 * s}
        filter={`url(#${shadowId})`}
      />
      <rect
        x={pad}
        y={pad}
        width={size}
        height={size}
        rx={rx}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={3.75 * s}
      />
      <path
        d={`M ${pad + 7 * s} ${pad + 12 * s} Q ${pad + 10 * s} ${pad + 7 * s} ${pad + 16 * s} ${pad + 6 * s}`}
        stroke="#D7FFE5"
        strokeWidth={1.5 * s}
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {[0, 1, 2, 3].map((corner) => {
        const x = corner % 2 === 0 ? pad + rx * 0.39 : pad + size - rx * 0.39;
        const y = corner < 2 ? pad + rx * 0.39 : pad + size - rx * 0.39;
        return (
          <g key={corner}>
            <circle cx={x} cy={y} r={3.2 * s} fill="#B5FFD0" stroke="#0B6D3B" strokeWidth={0.9 * s} />
            <circle cx={x - 0.8 * s} cy={y - 0.9 * s} r={1.35 * s} fill="#FFFFFF" />
          </g>
        );
      })}
    </svg>
  );
};

export const FrameNeonCyan: React.FC<CosmeticRendererProps> = ({ size = 96, borderRadius = 23 }) => {
  const pad = 5;
  const outerSize = size + pad * 2;
  const numRadius =
    typeof borderRadius === "number" ? borderRadius : parseFloat(borderRadius as string) || 23;
  const rx = numRadius;
  const s = size / 96;
  const uid = useCosmeticId("frame_cyan");

  const gradientId = `${uid}_grad`;
  const glowId = `${uid}_glow`;

  return (
    <svg
      width={outerSize}
      height={outerSize}
      viewBox={`0 0 ${outerSize} ${outerSize}`}
      style={{
        position: "absolute",
        top: -pad,
        left: -pad,
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C8FFFF" />
          <stop offset="30%" stopColor="#52EAF6" />
          <stop offset="65%" stopColor="#20C7E6" />
          <stop offset="100%" stopColor="#4478F5" />
        </linearGradient>
        <filter id={glowId} x="-24%" y="-24%" width="148%" height="148%">
          <feDropShadow dx="0" dy="0" stdDeviation={2.8 * s} floodColor="#42DDF2" floodOpacity="0.55" />
        </filter>
      </defs>

      <rect
        x={pad}
        y={pad}
        width={size}
        height={size}
        rx={rx}
        fill="none"
        stroke="#0A91B2"
        strokeWidth={5.2 * s}
        opacity="0.9"
        filter={`url(#${glowId})`}
      />
      <rect
        x={pad}
        y={pad}
        width={size}
        height={size}
        rx={rx}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={3.55 * s}
      />
      <rect
        x={pad + 1.8 * s}
        y={pad + 1.8 * s}
        width={size - 3.6 * s}
        height={size - 3.6 * s}
        rx={Math.max(2, rx - 1.8 * s)}
        fill="none"
        stroke="#E7FFFF"
        strokeWidth={0.9 * s}
        opacity="0.7"
      />

      <path
        d={`M ${pad + 5 * s} ${pad + 13 * s} L ${pad + 5 * s} ${pad + 7 * s} Q ${pad + 5 * s} ${pad + 5 * s} ${pad + 8 * s} ${pad + 5 * s} L ${pad + 14 * s} ${pad + 5 * s}`}
        stroke="#FFFFFF"
        strokeWidth={1.9 * s}
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      <path
        d={`M ${pad + size - 5 * s} ${pad + size - 13 * s} L ${pad + size - 5 * s} ${pad + size - 7 * s} Q ${pad + size - 5 * s} ${pad + size - 5 * s} ${pad + size - 8 * s} ${pad + size - 5 * s} L ${pad + size - 14 * s} ${pad + size - 5 * s}`}
        stroke="#DDFDFF"
        strokeWidth={1.6 * s}
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
    </svg>
  );
};

export const FrameCelestial: React.FC<CosmeticRendererProps> = ({ size = 96, borderRadius = 23 }) => {
  const pad = 6;
  const outerSize = size + pad * 2;
  const numRadius =
    typeof borderRadius === "number" ? borderRadius : parseFloat(borderRadius as string) || 23;
  const rx = numRadius;
  const s = size / 96;
  const uid = useCosmeticId("frame_celestial");

  const gradientId = `${uid}_grad`;
  const glowId = `${uid}_glow`;

  return (
    <svg
      width={outerSize}
      height={outerSize}
      viewBox={`0 0 ${outerSize} ${outerSize}`}
      style={{
        position: "absolute",
        top: -pad,
        left: -pad,
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9FC4" />
          <stop offset="32%" stopColor="#FF6F91" />
          <stop offset="62%" stopColor="#A970FF" />
          <stop offset="100%" stopColor="#4E9BFF" />
        </linearGradient>
        <filter id={glowId} x="-22%" y="-22%" width="144%" height="144%">
          <feDropShadow dx="0" dy="0" stdDeviation={3.2 * s} floodColor="#9A6AF4" floodOpacity="0.48" />
        </filter>
      </defs>

      <rect
        x={pad}
        y={pad}
        width={size}
        height={size}
        rx={rx}
        fill="none"
        stroke="#6C4BB8"
        strokeWidth={5.1 * s}
        opacity="0.86"
        filter={`url(#${glowId})`}
      />
      <rect
        x={pad}
        y={pad}
        width={size}
        height={size}
        rx={rx}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={3.6 * s}
      />

      {[
        [pad + rx * 0.33, pad + rx * 0.33],
        [pad + size - rx * 0.33, pad + rx * 0.33],
        [pad + rx * 0.33, pad + size - rx * 0.33],
        [pad + size - rx * 0.33, pad + size - rx * 0.33],
      ].map(([x, y], index) => (
        <g key={index}>
          <path
            d={`M ${x} ${y - 5 * s} L ${x + 1.7 * s} ${y - 1.7 * s} L ${x + 5 * s} ${y} L ${x + 1.7 * s} ${y + 1.7 * s} L ${x} ${y + 5 * s} L ${x - 1.7 * s} ${y + 1.7 * s} L ${x - 5 * s} ${y} L ${x - 1.7 * s} ${y - 1.7 * s} Z`}
            fill="#FFFFFF"
            opacity="0.96"
          />
          <circle cx={x} cy={y} r={1.25 * s} fill="#FFF0A8" />
        </g>
      ))}
    </svg>
  );
};

export const FrameGoldLuxury: React.FC<CosmeticRendererProps> = ({ size = 96, borderRadius = 23 }) => {
  const pad = 5;
  const outerSize = size + pad * 2;
  const numRadius =
    typeof borderRadius === "number" ? borderRadius : parseFloat(borderRadius as string) || 23;
  const rx = numRadius;
  const s = size / 96;
  const uid = useCosmeticId("frame_gold_luxury");

  const gradientId = `${uid}_grad`;
  const shadowId = `${uid}_shadow`;
  const shineId = `${uid}_shine`;

  return (
    <svg
      width={outerSize}
      height={outerSize}
      viewBox={`0 0 ${outerSize} ${outerSize}`}
      style={{
        position: "absolute",
        top: -pad,
        left: -pad,
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF7A8" />
          <stop offset="24%" stopColor="#FFD84C" />
          <stop offset="50%" stopColor="#F2B52B" />
          <stop offset="74%" stopColor="#FFE77A" />
          <stop offset="100%" stopColor="#C88915" />
        </linearGradient>
        <linearGradient id={shineId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#FFF6BD" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <filter id={shadowId} x="-18%" y="-18%" width="136%" height="136%">
          <feDropShadow dx="0" dy="1.7" stdDeviation={2 * s} floodColor="#8C5B00" floodOpacity="0.3" />
        </filter>
      </defs>

      <rect
        x={pad}
        y={pad + 0.5 * s}
        width={size}
        height={size}
        rx={rx}
        fill="none"
        stroke="#A86E08"
        strokeWidth={5.6 * s}
        filter={`url(#${shadowId})`}
      />
      <rect
        x={pad}
        y={pad}
        width={size}
        height={size}
        rx={rx}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={3.9 * s}
      />
      <rect
        x={pad + 2.1 * s}
        y={pad + 2.1 * s}
        width={size - 4.2 * s}
        height={size - 4.2 * s}
        rx={Math.max(2, rx - 2.1 * s)}
        fill="none"
        stroke={`url(#${shineId})`}
        strokeWidth={1.25 * s}
      />

      {[
        [pad + rx * 0.34, pad + rx * 0.34],
        [pad + size - rx * 0.34, pad + rx * 0.34],
        [pad + rx * 0.34, pad + size - rx * 0.34],
        [pad + size - rx * 0.34, pad + size - rx * 0.34],
      ].map(([x, y], index) => (
        <g key={index}>
          <circle cx={x} cy={y} r={3 * s} fill="#FFF0A2" stroke="#B77708" strokeWidth={0.8 * s} />
          <circle cx={x - 0.7 * s} cy={y - 0.8 * s} r={1.25 * s} fill="#FFFFFF" />
        </g>
      ))}

      <path
        d={`M ${pad + 16 * s} ${pad + 7 * s} Q ${pad + size / 2} ${pad + 2.6 * s} ${pad + size - 16 * s} ${pad + 7 * s}`}
        stroke="#FFF9D8"
        strokeWidth={1.2 * s}
        strokeLinecap="round"
        fill="none"
        opacity="0.62"
      />
    </svg>
  );
};

export const OverlayProCrown: React.FC<CosmeticRendererProps> = ({ size = 96 }) => {
  const scale = size / 96;
  const uid = useCosmeticId("pro_crown");
  const goldId = `${uid}_gold`;
  const ballId = `${uid}_ball`;
  const gemId = `${uid}_gem`;
  const shadowId = `${uid}_shadow`;

  return (
    <div
      style={{
        position: "absolute",
        top: -25 * scale,
        left: "50%",

        transform: "translateX(0%) rotate(20deg)",
        width: 64 * scale,
        height: 42 * scale,
        pointerEvents: "none",
        zIndex: 3,
      }}
    >
      <svg
        viewBox="0 0 64 42"
        fill="none"
        width="100%"
        height="100%"
        overflow="visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={goldId} x1="18%" y1="0%" x2="82%" y2="100%">
            <stop offset="0%" stopColor="#FFF7C2" />
            <stop offset="30%" stopColor="#FFD84D" />
            <stop offset="62%" stopColor="#F5B72A" />
            <stop offset="100%" stopColor="#D98A12" />
          </linearGradient>

          <radialGradient id={ballId} cx="35%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#FFFDE8" />
            <stop offset="45%" stopColor="#FFD84D" />
            <stop offset="100%" stopColor="#DE9713" />
          </radialGradient>

          <linearGradient id={gemId} x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#EBD6FF" />
            <stop offset="45%" stopColor="#B76CFF" />
            <stop offset="100%" stopColor="#6D34CF" />
          </linearGradient>

          <filter id={shadowId} x="-30%" y="-30%" width="160%" height="175%">
            <feDropShadow
              dx="0"
              dy="1.6"
              stdDeviation="1.4"
              floodColor="#6A4700"
              floodOpacity="0.32"
            />
          </filter>
        </defs>

        <g filter={`url(#${shadowId})`}>
          <path
            d={"M11 30 L14 12 L23 21 L32 7 L41 21 L50 12 L53 30 Z"}
            fill="#B8790F"
            stroke="#B8790F"
            strokeWidth="3.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={"M11 30 L14 12 L23 21 L32 7 L41 21 L50 12 L53 30 Z"}
            fill={`url(#${goldId})`}
            stroke={`url(#${goldId})`}
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          <rect x="7.5" y="27.5" width="49" height="10.5" rx="5.25" fill="#B8790F" />
          <rect
            x="8.7"
            y="28.7"
            width="46.6"
            height="8.1"
            rx="4.05"
            fill={`url(#${goldId})`}
          />

          <path
            d="M16 25 Q32 28 48 25"
            stroke="#FFF6B0"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />

          <circle cx="14" cy="12" r="3.2" fill={`url(#${ballId})`} stroke="#B8790F" strokeWidth="1" />
          <circle cx="50" cy="12" r="3.2" fill={`url(#${ballId})`} stroke="#B8790F" strokeWidth="1" />
          <circle cx="32" cy="7" r="3.6" fill={`url(#${ballId})`} stroke="#B8790F" strokeWidth="1" />

          <circle cx="12.9" cy="10.9" r="0.9" fill="#FFFDF0" opacity="0.9" />
          <circle cx="48.9" cy="10.9" r="0.9" fill="#FFFDF0" opacity="0.9" />
          <circle cx="30.7" cy="5.6" r="1.05" fill="#FFFDF0" opacity="0.9" />

          <circle cx="32" cy="32.6" r="3.3" fill={`url(#${gemId})`} stroke="#5B2BB0" strokeWidth="0.9" />
          <circle cx="30.7" cy="31.4" r="1" fill="#FFFFFF" opacity="0.75" />

          <path
            d="M15 36.1 H49"
            stroke="#C07C0E"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.35"
          />
        </g>
      </svg>
    </div>
  );
};

const FRAME_COMPONENTS: Record<string, React.FC<CosmeticRendererProps>> = {
  frame_bronze: FrameBronze,
  frame_silver: FrameSilver,
  frame_gold: FrameGold,
  frame_gold_luxury: FrameGoldLuxury,
  frame_emerald: FrameEmerald,
  frame_neon_cyan: FrameNeonCyan,
  frame_celestial: FrameCelestial,
};

const OVERLAY_COMPONENTS: Record<string, React.FC<CosmeticRendererProps>> = {
  overlay_pro_crown: OverlayProCrown,

};

export const CosmeticFrameRenderer: React.FC<{
  code?: string | null;
  size?: number;
  borderRadius?: string | number;
}> = ({ code, size = 96, borderRadius = 23 }) => {
  if (!code) return null;
  const Component = FRAME_COMPONENTS[code];
  if (!Component) return null;
  return <Component size={size} borderRadius={borderRadius} />;
};

export const CosmeticOverlayRenderer: React.FC<{
  code?: string | null;
  size?: number;
}> = ({ code, size = 96 }) => {
  if (!code) return null;
  const Component = OVERLAY_COMPONENTS[code];
  if (!Component) return null;
  return <Component size={size} />;
};
