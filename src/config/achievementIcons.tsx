"use client";

import React, { useId } from "react";

interface IllustrationProps {
  size?: number;
  className?: string;
}

interface BadgeShellProps {
  gradientId: string;
  colorStart: string;
  colorEnd: string;
  shadowColor: string;
}

const BadgeShell: React.FC<BadgeShellProps> = ({ gradientId, colorStart, colorEnd, shadowColor }) => (
  <>
    <defs>
      <linearGradient id={gradientId} x1="15%" y1="0%" x2="85%" y2="100%">
        <stop offset="0%" stopColor={colorStart} />
        <stop offset="100%" stopColor={colorEnd} />
      </linearGradient>
    </defs>
    <circle cx="32" cy="35" r="26" fill={shadowColor} />
    <circle cx="32" cy="31" r="26" fill={`url(#${gradientId})`} />
    <path
      d="M12 27C13 18 20 11 29 9"
      stroke="#FFFFFF"
      strokeOpacity="0.32"
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
    />
  </>
);

export const FirstTaskIllustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <BadgeShell gradientId={`${id}-ft`} colorStart="#7BEE5B" colorEnd="#2FA344" shadowColor="#1D7A34" />
      <path d="M19 31L27 39L46 17" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M48 10L49.6 14.8L54.4 16.4L49.6 18L48 22.8L46.4 18L41.6 16.4L46.4 14.8L48 10Z"
        fill="#FFE066"
      />
    </svg>
  );
};

export const Streak3Illustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <BadgeShell gradientId={`${id}-s3`} colorStart="#FFC168" colorEnd="#E2791D" shadowColor="#8A4A14" />
      <path
        d="M32 14C32 14 40 24 40 32C40 38 36.4 42 32 42C27.6 42 24 38 24 32C24 26 28 20 32 14Z"
        fill="#FF7A3D"
      />
      <path
        d="M32 26C32 26 35.5 30.5 35.5 34.5C35.5 37 34 39 32 39C30 39 28.5 37 28.5 34.5C28.5 31.5 32 26 32 26Z"
        fill="#FFE388"
      />
    </svg>
  );
};

export const Streak7Illustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <BadgeShell gradientId={`${id}-s7`} colorStart="#FF9A5C" colorEnd="#D9361C" shadowColor="#7A2410" />
      <path
        d="M22 30C22 30 26 34 26 38C26 41 24 43 22 43C20 43 18 41 18 38C18 35 20 32 22 30Z"
        fill="#FF6A33"
        opacity="0.9"
      />
      <path
        d="M42 30C42 30 46 34 46 38C46 41 44 43 42 43C40 43 38 41 38 38C38 35 40 32 42 30Z"
        fill="#FF6A33"
        opacity="0.9"
      />
      <path
        d="M32 12C32 12 41 22 41 32C41 38.5 37.2 43 32 43C26.8 43 23 38.5 23 32C23 25 28 19 32 12Z"
        fill="#FF7A38"
      />
      <path
        d="M32 24C32 24 36 29.5 36 33.5C36 36.5 34.2 39 32 39C29.8 39 28 36.5 28 33.5C28 30 32 24 32 24Z"
        fill="#FFE888"
      />
    </svg>
  );
};

export const Streak30Illustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <defs>
        <linearGradient id={`${id}-flame`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#5B8DEF" />
          <stop offset="55%" stopColor="#9B6BF2" />
          <stop offset="100%" stopColor="#F26BC6" />
        </linearGradient>
      </defs>
      <BadgeShell gradientId={`${id}-s30`} colorStart="#8B7CF6" colorEnd="#5326C4" shadowColor="#33176E" />
      <path
        d="M32 10C32 10 43 21 43 33C43 40.5 38.2 46 32 46C25.8 46 21 40.5 21 33C21 25.5 26 19 29 16C29.5 22 32 25 34 25C35 20 34 15 32 10Z"
        fill={`url(#${id}-flame)`}
      />
      <path d="M35 12L36 15.5L39.5 16.5L36 17.5L35 21L34 17.5L30.5 16.5L34 15.5L35 12Z" fill="#FFFFFF" opacity="0.85" />
      <path d="M50 22L51 25L54 26L51 27L50 30L49 27L46 26L49 25L50 22Z" fill="#FFFFFF" opacity="0.7" />
    </svg>
  );
};

export const ListCreatorIllustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <BadgeShell gradientId={`${id}-lc`} colorStart="#5FC1FF" colorEnd="#0B6FE0" shadowColor="#0A3E7A" />
      <rect x="20" y="14" width="24" height="32" rx="5" fill="#FFFFFF" />
      <rect x="26" y="10" width="12" height="8" rx="3" fill="#DCEEFF" />
      <path d="M25 24H39M25 31H39M25 38H33" stroke="#0B6FE0" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="45" cy="42" r="10" fill="#2FBE6B" stroke="#FFFFFF" strokeWidth="2.5" />
      <path d="M41 42L44 45L49.5 38.5" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
};

export const Tasks10Illustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <BadgeShell gradientId={`${id}-t10`} colorStart="#E7B27B" colorEnd="#B0692B" shadowColor="#6B3A16" />
      <circle cx="32" cy="30" r="18" fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1.6" strokeDasharray="2 4" />
      <text
        x="32"
        y="37"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight={800}
        fontSize="20"
        fill="#FFFFFF"
      >
        10
      </text>
      <path d="M20 46C24 50 40 50 44 46L42 52C38 55 26 55 22 52L20 46Z" fill="#8A4A1E" />
    </svg>
  );
};

export const Tasks50Illustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <BadgeShell gradientId={`${id}-t50`} colorStart="#F3F7FB" colorEnd="#AAB6C2" shadowColor="#5B6672" />
      <circle cx="32" cy="30" r="18" fill="none" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1.6" strokeDasharray="2 4" />
      <path d="M15 30C13 24 16 18 20 16C18 21 19 26 21 29" stroke="#8FA0AF" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M49 30C51 24 48 18 44 16C46 21 45 26 43 29" stroke="#8FA0AF" strokeWidth="3" strokeLinecap="round" fill="none" />
      <text
        x="32"
        y="37"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight={800}
        fontSize="19"
        fill="#3B4652"
      >
        50
      </text>
    </svg>
  );
};

export const Tasks100Illustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <defs>
        <linearGradient id={`${id}-crown`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#FF9500" />
        </linearGradient>
      </defs>
      <BadgeShell gradientId={`${id}-t100`} colorStart="#FFD966" colorEnd="#FF8A00" shadowColor="#7A4A00" />
      <path
        d="M32 8L34 16M14 22L10 18M50 22L54 18M20 15L17 10M44 15L47 10"
        stroke="#FFFFFF"
        strokeOpacity="0.4"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M17 42L20 22L29 32L32 17L35 32L44 22L47 42H17Z"
        fill={`url(#${id}-crown)`}
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="19" y="43" width="26" height="4.5" rx="2.2" fill="#FFFFFF" />
      <circle cx="32" cy="30" r="3.4" fill="#F26BC6" stroke="#FFFFFF" strokeWidth="1.4" />
    </svg>
  );
};

export const CustomProfileIllustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <BadgeShell gradientId={`${id}-cp`} colorStart="#FF8FC0" colorEnd="#C13584" shadowColor="#7A1F52" />
      <circle cx="32" cy="25" r="9" fill="#FFFFFF" />
      <path d="M17 47C17 38.5 23.5 34 32 34C40.5 34 47 38.5 47 47" fill="#FFFFFF" />
      <circle cx="47" cy="16" r="8" fill="#FFE066" stroke="#FFFFFF" strokeWidth="2.2" />
      <path
        d="M47 11.5V14.5M47 17.5V20.5M43.5 16H46.5M47.5 16H50.5"
        stroke="#7A5A00"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const FallbackIllustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <BadgeShell gradientId={`${id}-fb`} colorStart="#9FB0C2" colorEnd="#5A6B7D" shadowColor="#2E3A47" />
      <path
        d="M32 15L35.6 24.4H45.6L37.6 30.2L40.6 39.6L32 33.8L23.4 39.6L26.4 30.2L18.4 24.4H28.4L32 15Z"
        fill="#FFFFFF"
      />
    </svg>
  );
};

const ILLUSTRATION_MAP: Record<string, React.FC<IllustrationProps>> = {
  first_task: FirstTaskIllustration,
  streak_3: Streak3Illustration,
  streak_7: Streak7Illustration,
  streak_30: Streak30Illustration,
  list_creator: ListCreatorIllustration,
  tasks_10: Tasks10Illustration,
  tasks_50: Tasks50Illustration,
  tasks_100: Tasks100Illustration,
  custom_profile: CustomProfileIllustration,
};

export const AchievementIllustration: React.FC<{
  code: string;
  size?: number;
  className?: string;
}> = ({ code, size = 64, className = "" }) => {
  const Component = ILLUSTRATION_MAP[code] || FallbackIllustration;
  return <Component size={size} className={className} />;
};