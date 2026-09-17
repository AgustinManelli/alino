"use client";

import React from "react";

interface IllustrationProps {
  size?: number;
  className?: string;
}

export const FirstTaskIllustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="ft_grad_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#30D158" />
        <stop offset="100%" stopColor="#1E7B34" />
      </linearGradient>
      <linearGradient id="ft_grad_star" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE066" />
        <stop offset="100%" stopColor="#FF9F0A" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#ft_grad_bg)" />
    <circle cx="32" cy="32" r="24" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeDasharray="3 3" />
    <path d="M21 33L28 40L44 24" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M48 14L49.5 18.5L54 20L49.5 21.5L48 26L46.5 21.5L42 20L46.5 18.5L48 14Z" fill="url(#ft_grad_star)" />
  </svg>
);

export const Streak3Illustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="s3_flame_grad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#FF453A" />
        <stop offset="50%" stopColor="#FF9F0A" />
        <stop offset="100%" stopColor="#FFD60A" />
      </linearGradient>
      <linearGradient id="s3_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3A1A00" />
        <stop offset="100%" stopColor="#1A0D00" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#s3_bg)" stroke="#FF9F0A" strokeWidth="2" strokeOpacity="0.4" />
    <path d="M32 12C32 12 39 21 39 29C39 34 35.8 38 32 38C28.2 38 25 34 25 29C25 24 28 19 32 12Z" fill="url(#s3_flame_grad)" />
    <path d="M23 26C23 26 28 32 28 37C28 41 25.5 44 23 44C20.5 44 18 41 18 37C18 33 21 30 23 26Z" fill="#FF453A" opacity="0.8" />
    <path d="M41 26C41 26 46 32 46 37C46 41 43.5 44 41 44C38.5 44 36 41 36 37C36 33 39 30 41 26Z" fill="#FF453A" opacity="0.8" />
    <path d="M32 28C32 28 35 32 35 35C35 37 33.6 39 32 39C30.4 39 29 37 29 35C29 32 32 28 32 28Z" fill="#FFFFFF" />
  </svg>
);

export const Streak7Illustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="s7_outer_grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF9F0A" />
        <stop offset="100%" stopColor="#FF375F" />
      </linearGradient>
      <linearGradient id="s7_inner" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#FF453A" />
        <stop offset="60%" stopColor="#FFD60A" />
        <stop offset="100%" stopColor="#FFFFFF" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="#201005" stroke="url(#s7_outer_grad)" strokeWidth="2.5" />
    <path d="M32 10C35 18 46 25 46 37C46 45 39.5 50 32 50C24.5 50 18 45 18 37C18 28 25 21 28 17C29 23 32 26 34 26C35 21 34 15 32 10Z" fill="url(#s7_inner)" />
    <circle cx="32" cy="38" r="7" fill="#FF453A" />
    <path d="M32 33L34 38H30L32 33Z" fill="#FFE866" />
  </svg>
);

export const Streak30Illustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="s30_grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0A84FF" />
        <stop offset="50%" stopColor="#64D2FF" />
        <stop offset="100%" stopColor="#BF5AF2" />
      </linearGradient>
    </defs>
    <path d="M32 4L54 16V38L32 58L10 38V16L32 4Z" fill="#0C1226" stroke="url(#s30_grad)" strokeWidth="2.5" />
    <path d="M32 14C35 20 44 26 44 36C44 42 38.5 47 32 47C25.5 47 20 42 20 36C20 28 27 22 29 19C30 23 32 26 34 26C35 22 34 18 32 14Z" fill="url(#s30_grad)" />
    <path d="M32 28L34.5 34H41L36 37.5L38 43.5L32 39.5L26 43.5L28 37.5L23 34H29.5L32 28Z" fill="#FFFFFF" />
  </svg>
);

export const ListCreatorIllustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="lc_grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0A84FF" />
        <stop offset="100%" stopColor="#0055B3" />
      </linearGradient>
    </defs>
    <rect x="8" y="12" width="48" height="40" rx="8" fill="url(#lc_grad)" />
    <path d="M16 22H36M16 32H44M16 42H28" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    <circle cx="46" cy="40" r="10" fill="#30D158" stroke="#FFFFFF" strokeWidth="2.5" />
    <path d="M42 40L45 43L50 37" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Tasks10Illustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="t10_grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5E5CE6" />
        <stop offset="100%" stopColor="#BF5AF2" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="#15122B" stroke="url(#t10_grad)" strokeWidth="2.5" />
    <circle cx="32" cy="32" r="18" stroke="url(#t10_grad)" strokeWidth="2" strokeDasharray="4 4" />
    <circle cx="32" cy="32" r="7" fill="#BF5AF2" />
    <path d="M28 20L36 12M32 10V14M36 10H32" stroke="#64D2FF" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const Tasks50Illustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="t50_gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE866" />
        <stop offset="50%" stopColor="#FFD60A" />
        <stop offset="100%" stopColor="#FF9F0A" />
      </linearGradient>
    </defs>
    <path d="M32 6L52 14V30C52 42 43 51 32 56C21 51 12 42 12 30V14L32 6Z" fill="#2A1F05" stroke="url(#t50_gold)" strokeWidth="3" />
    <path d="M32 16L35.5 24H44L37 29L39.5 37L32 32L24.5 37L27 29L20 24H28.5L32 16Z" fill="url(#t50_gold)" />
    <path d="M22 43L28 47L42 36" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Tasks100Illustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="t100_crown" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FF8C00" />
      </linearGradient>
      <linearGradient id="t100_glow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF007A" />
        <stop offset="100%" stopColor="#7928CA" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#t100_glow)" />
    <path d="M16 42L20 22L28 32L32 18L36 32L44 22L48 42H16Z" fill="url(#t100_crown)" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="32" cy="18" r="2.5" fill="#FFFFFF" />
    <circle cx="20" cy="22" r="2" fill="#FFFFFF" />
    <circle cx="44" cy="22" r="2" fill="#FFFFFF" />
    <rect x="18" y="44" width="28" height="4" rx="2" fill="#FFFFFF" opacity="0.9" />
  </svg>
);

export const CustomProfileIllustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="cp_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF375F" />
        <stop offset="100%" stopColor="#BF5AF2" />
      </linearGradient>
    </defs>
    <rect x="8" y="8" width="48" height="48" rx="14" fill="url(#cp_bg)" />
    <circle cx="32" cy="25" r="9" fill="#FFFFFF" />
    <path d="M18 48C18 40.5 24.5 37 32 37C39.5 37 46 40.5 46 48" fill="#FFFFFF" />
    <circle cx="46" cy="18" r="7" fill="#FFD60A" stroke="#FFFFFF" strokeWidth="2" />
    <path d="M46 14V17M46 19V22M43 18H49" stroke="#1C1C1E" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const FallbackIllustration: React.FC<IllustrationProps> = ({ size = 64, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="fb_grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD60A" />
        <stop offset="100%" stopColor="#FF9F0A" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="26" fill="#1C1C1E" stroke="url(#fb_grad)" strokeWidth="2.5" />
    <path d="M32 16L35.5 24H44L37 29L39.5 37L32 32L24.5 37L27 29L20 24H28.5L32 16Z" fill="url(#fb_grad)" />
  </svg>
);

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
