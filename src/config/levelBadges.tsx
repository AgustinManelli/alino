"use client";

import React from "react";

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  color: string;
  accentColor: string;
}

export const LEVEL_DEFINITIONS: Record<number, LevelInfo> = {
  1: { level: 1, title: "Novato", minXp: 0, maxXp: 100, color: "#8E8E93", accentColor: "#C7C7CC" },
  2: { level: 2, title: "Iniciado", minXp: 100, maxXp: 250, color: "#CD7F32", accentColor: "#DDAA77" },
  3: { level: 3, title: "Enfocado", minXp: 250, maxXp: 500, color: "#30D158", accentColor: "#66FFAA" },
  4: { level: 4, title: "Constante", minXp: 500, maxXp: 850, color: "#0A84FF", accentColor: "#64D2FF" },
  5: { level: 5, title: "Avanzado", minXp: 850, maxXp: 1300, color: "#FFD60A", accentColor: "#FFE866" },
  6: { level: 6, title: "Imparable", minXp: 1300, maxXp: 1900, color: "#FF9F0A", accentColor: "#FFC266" },
  7: { level: 7, title: "Maestro", minXp: 1900, maxXp: 2600, color: "#BF5AF2", accentColor: "#DA8FFF" },
  8: { level: 8, title: "Élite", minXp: 2600, maxXp: 3500, color: "#00E5FF", accentColor: "#80F2FF" },
  9: { level: 9, title: "Leyenda", minXp: 3500, maxXp: 4600, color: "#FF375F", accentColor: "#FF7597" },
  10: { level: 10, title: "Mítico", minXp: 4600, maxXp: 6000, color: "#AF52DE", accentColor: "#FFD700" },
};

export const getLevelInfo = (level: number): LevelInfo => {
  const boundedLevel = Math.max(1, Math.min(level, 10));
  return LEVEL_DEFINITIONS[boundedLevel] || LEVEL_DEFINITIONS[1];
};

interface LevelBadgeProps {
  level: number;
  size?: number;
  className?: string;
  showLevelNumber?: boolean;
  badgeColor?: string;
  accentColor?: string;
  title?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  size = 28,
  className = "",
  showLevelNumber = true,
  badgeColor,
  accentColor,
  title,
}) => {
  const defaultInfo = getLevelInfo(level);
  const infoColor = badgeColor || defaultInfo.color;
  const infoAccent = accentColor || defaultInfo.accentColor;
  const infoTitle = title || defaultInfo.title;
  const strokeWidth = 2;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flexShrink: 0,
        userSelect: "none",
      }}
      title={`Nivel ${level} • ${infoTitle}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient
            id={`lvlGrad_${level}_${size}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={infoAccent} />
            <stop offset="100%" stopColor={infoColor} />
          </linearGradient>
          <filter id={`lvlGlow_${level}_${size}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={infoColor} floodOpacity="0.4" />
          </filter>
        </defs>

        <path
          d="M24 4L39 11V23C39 32.5 32.5 40.5 24 44C15.5 40.5 9 32.5 9 23V11L24 4Z"
          fill={`url(#lvlGrad_${level}_${size})`}
          filter={`url(#lvlGlow_${level}_${size})`}
        />
        <path
          d="M24 6.5L36.5 12.3V22.5C36.5 30.5 31 37.3 24 40.5C17 37.3 11.5 30.5 11.5 22.5V12.3L24 6.5Z"
          fill="rgba(0, 0, 0, 0.25)"
          stroke={infoAccent}
          strokeWidth={strokeWidth}
          strokeOpacity="0.8"
        />

        {level >= 5 && (
          <path
            d="M24 9L26.5 15H33L27.5 19L29.5 25L24 21.5L18.5 25L20.5 19L15 15H21.5L24 9Z"
            fill={infoAccent}
            opacity="0.3"
          />
        )}
      </svg>

      {showLevelNumber && (
        <span
          style={{
            position: "absolute",
            fontSize: `${Math.round(size * 0.4)}px`,
            fontWeight: 800,
            color: "#FFFFFF",
            textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
            letterSpacing: "-0.5px",
            lineHeight: 1,
            marginTop: "1px",
          }}
        >
          {level}
        </span>
      )}
    </div>
  );
};
