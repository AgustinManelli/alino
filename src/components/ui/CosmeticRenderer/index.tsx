"use client";

import type { CSSProperties } from "react";
import type {
  CosmeticAsset,
  CosmeticAssetManifest,
  CosmeticItem,
} from "@/lib/schemas/database.types";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import styles from "./CosmeticRenderer.module.css";

interface Props {
  cosmetic?: CosmeticItem | null;
  size: number;
  borderRadius?: string | number;
}

export const CosmeticRenderer = ({ cosmetic, size }: Props) => {
  const animationsEnabled = useUserPreferencesStore(
    (state) => state.animations,
  );

  if (!cosmetic) return null;
  const assets = cosmetic.asset_manifest as CosmeticAssetManifest | undefined;
  const layers = cosmetic.visual_manifest?.layers;

  if (!assets || !layers?.length) return null;

  return (
    <>
      {layers.map((layer) => {
        const asset = assets[layer.asset_key];
        if (!asset) return null;
        if (!isAllowedAssetSource(asset.src)) return null;
        const transform = layer.transform;
        const isOverlay = cosmetic.slot === "avatar_overlay";
        const overlayScale = size / 96;
        return (
          <CosmeticAssetImage
            key={layer.asset_key}
            asset={asset}
            animated={animationsEnabled}
            size={size}
            isOverlay={isOverlay}
            overlayScale={overlayScale}
            className={styles.layer}
            style={{
              zIndex: layer.z_index ?? 2,
              opacity: layer.opacity ?? 1,
              transform: isOverlay
                ? `translate(${transform?.x ?? "0"}, ${transform?.y ?? "0"}) rotate(${transform?.rotate ?? 20}deg)`
                : `translate(${transform?.x ?? "0"}, ${transform?.y ?? "0"}) scale(${transform?.scale ?? 1}) rotate(${transform?.rotate ?? 0}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

interface CosmeticAssetImageProps {
  asset: CosmeticAsset;
  animated: boolean;
  size: number;
  isOverlay: boolean;
  overlayScale: number;
  className: string;
  style: CSSProperties;
}

const CosmeticAssetImage = ({
  asset,
  animated,
  size,
  isOverlay,
  overlayScale,
  className,
  style,
}: CosmeticAssetImageProps) => {
  const selectedAsset = animated
    ? (asset.variants?.animated?.[0] ?? asset)
    : (asset.variants?.reduced_motion ?? asset.variants?.static ?? asset);
  const animatedSources = animated ? (asset.variants?.animated ?? []) : [];
  const reducedMotionSource = asset.variants?.reduced_motion;
  const safeAnimatedSources = animatedSources.filter((source) =>
    isAllowedAssetSource(source.src),
  );
  if (!isAllowedAssetSource(selectedAsset.src)) return null;
  const imageStyle: CSSProperties = {
    ...style,
    position: "absolute",
    inset: isOverlay ? undefined : 0,
    top: isOverlay ? `${-25 * overlayScale}px` : undefined,
    left: isOverlay ? `${size / 2}px` : undefined,
    width: isOverlay
      ? `${(selectedAsset.width ?? 64) * overlayScale}px`
      : "100%",
    height: isOverlay
      ? `${(selectedAsset.height ?? 42) * overlayScale}px`
      : "100%",
    objectFit: "contain",
    pointerEvents: "none",
  };

  if (!safeAnimatedSources.length) {
    return (
      <img
        src={selectedAsset.src}
        alt={selectedAsset.alt ?? ""}
        width={selectedAsset.width ?? size}
        height={selectedAsset.height ?? size}
        aria-hidden={!selectedAsset.alt}
        className={className}
        style={imageStyle}
        loading={asset.loading ?? "lazy"}
      />
    );
  }

  return (
    <picture>
      {reducedMotionSource && isAllowedAssetSource(reducedMotionSource.src) && (
        <source
          srcSet={reducedMotionSource.src}
          type={toMimeType(reducedMotionSource.type)}
          media="(prefers-reduced-motion: reduce)"
        />
      )}
      {safeAnimatedSources.map((source) => (
        <source
          key={source.src}
          srcSet={source.src}
          type={toMimeType(source.type)}
        />
      ))}
      <img
        src={selectedAsset.src}
        alt={selectedAsset.alt ?? ""}
        width={selectedAsset.width ?? size}
        height={selectedAsset.height ?? size}
        aria-hidden={!selectedAsset.alt}
        className={className}
        style={imageStyle}
        loading={asset.loading ?? "lazy"}
      />
    </picture>
  );
};

const toMimeType = (type?: string): string | undefined => {
  if (!type) return undefined;
  if (type === "webp") return "image/webp";
  if (type === "apng") return "image/apng";
  if (type === "gif") return "image/gif";
  if (type === "svg") return "image/svg+xml";
  if (type === "video") return "video/mp4";
  return "image/*";
};

const isAllowedAssetSource = (source: string): boolean => {
  if (source.startsWith("/")) return true;
  try {
    const url = new URL(source);
    const configuredHosts = [
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://invalid")
        .hostname,
      ...(process.env.NEXT_PUBLIC_COSMETIC_ASSET_HOSTS ?? "")
        .split(",")
        .map((host) => host.trim().toLowerCase())
        .filter(Boolean),
    ];
    return configuredHosts.includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
};
