"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Blobatar } from "@blobatar/react";
import "blobatar/motion.css";

import { UserIcon } from "@/components/ui/icons/icons";
import { getBlobatarSeed } from "@/lib/utils/avatar";
import styles from "./UserAvatar.module.css";

export interface UserAvatarProps {
  avatarUrl?: string | null;
  username?: string;
  size?: number;
  animate?: "always" | "hover";
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

export const UserAvatar = ({
  avatarUrl,
  username,
  size,
  animate = "always",
  className = "",
  style = {},
  alt = "Avatar",
}: UserAvatarProps) => {
  const blobatarSeed = useMemo(() => {
    return getBlobatarSeed(avatarUrl, username);
  }, [avatarUrl, username]);

  const dimensionStyle: React.CSSProperties = {
    ...(size
      ? {
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          maxWidth: size,
          maxHeight: size,
        }
      : {}),
    ...style,
  };

  if (blobatarSeed) {
    return (
      <div
        className={`${styles.avatarContainer} ${className}`}
        style={dimensionStyle}
      >
        <Blobatar
          name={blobatarSeed}
          size={size ?? 36}
          animate={animate}
        />
      </div>
    );
  }

  if (avatarUrl && typeof avatarUrl === "string" && avatarUrl.trim() !== "") {
    return (
      <div
        className={`${styles.avatarContainer} ${className}`}
        style={dimensionStyle}
      >
        <Image
          src={avatarUrl}
          alt={alt}
          fill
          unoptimized
          className={styles.avatarImage}
        />
      </div>
    );
  }

  return (
    <div
      className={`${styles.avatarContainer} ${styles.defaultAvatar} ${className}`}
      style={dimensionStyle}
    >
      <UserIcon
        style={{
          width: "55%",
          height: "55%",
          stroke: "currentColor",
          strokeWidth: "1.5",
        }}
      />
    </div>
  );
};
