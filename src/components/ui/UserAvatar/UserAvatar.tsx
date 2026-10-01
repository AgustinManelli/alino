"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Blobatar } from "@blobatar/react";
import "blobatar/motion.css";

import { UserIcon } from "@/components/ui/icons/icons";
import { getBlobatarSeed } from "@/lib/utils/avatar";
import { useUserDataStore } from "@/store/useUserDataStore";
import { CosmeticRenderer } from "@/components/ui/CosmeticRenderer";
import type { CosmeticItem } from "@/lib/schemas/database.types";
import styles from "./UserAvatar.module.css";

export interface UserAvatarProps {
  avatarUrl?: string | null;
  username?: string;
  size?: number;
  animate?: "always" | "hover";
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
  equippedFrameId?: string | null;
  equippedOverlayId?: string | null;
  equippedFrame?: CosmeticItem | null;
  equippedOverlay?: CosmeticItem | null;
}

export const UserAvatar = ({
  avatarUrl,
  username,
  size,
  animate = "always",
  className = "",
  style = {},
  alt = "Avatar",
  equippedFrameId,
  equippedOverlayId,
  equippedFrame,
  equippedOverlay,
}: UserAvatarProps) => {
  const currentUser = useUserDataStore((state) => state.user);
  const cosmeticsVisualCatalog = useUserDataStore(
    (state) => state.cosmeticsVisualCatalog,
  );

  const activeFrame = useMemo(() => {
    if (equippedFrameId !== undefined) return equippedFrameId;
    if (currentUser && (!username || currentUser.username === username)) {
      return currentUser.equipped_frame_id;
    }
    return null;
  }, [equippedFrameId, currentUser, username]);

  const activeOverlay = useMemo(() => {
    if (equippedOverlayId !== undefined) return equippedOverlayId;
    if (currentUser && (!username || currentUser.username === username)) {
      return currentUser.equipped_overlay_id;
    }
    return null;
  }, [equippedOverlayId, currentUser, username]);

  const blobatarSeed = useMemo(() => {
    return getBlobatarSeed(avatarUrl, username);
  }, [avatarUrl, username]);

  const effectiveRadius = style?.borderRadius ?? (size && size <= 44 ? 10 : 23);
  const resolvedFrame =
    equippedFrame ??
    cosmeticsVisualCatalog?.find((cosmetic) => cosmetic.id === activeFrame) ??
    null;
  const resolvedOverlay =
    equippedOverlay ??
    cosmeticsVisualCatalog?.find((cosmetic) => cosmetic.id === activeOverlay) ??
    null;
  const resolvedEffect =
    cosmeticsVisualCatalog?.find(
      (cosmetic) => cosmetic.slot === "avatar_effect" && cosmetic.is_equipped,
    ) ?? null;

  const dimensionStyle: React.CSSProperties = {
    borderRadius: effectiveRadius,
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

  const renderInnerAvatar = () => {
    if (blobatarSeed) {
      return (
        <div className={styles.avatarContainer}>
          <Blobatar name={blobatarSeed} size={size ?? 36} animate={animate} />
        </div>
      );
    }

    if (avatarUrl && typeof avatarUrl === "string" && avatarUrl.trim() !== "") {
      return (
        <div className={styles.avatarContainer}>
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
      <div className={`${styles.avatarContainer} ${styles.defaultAvatar}`}>
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

  return (
    <div className={`${styles.avatarRoot} ${className}`} style={dimensionStyle}>
      <CosmeticRenderer cosmetic={resolvedEffect} size={size ?? 36} />
      <CosmeticRenderer
        cosmetic={resolvedFrame}
        size={size ?? 36}
        borderRadius={effectiveRadius}
      />
      {renderInnerAvatar()}
      <CosmeticRenderer cosmetic={resolvedOverlay} size={size ?? 36} />
    </div>
  );
};
