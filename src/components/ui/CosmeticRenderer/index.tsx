"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
import type {
  CosmeticAsset,
  CosmeticAssetManifest,
  CosmeticItem,
} from "@/lib/schemas/database.types";
import {
  getCosmeticAssetSource,
  getCosmeticAssetSources,
  isAllowedCosmeticAssetSource,
} from "@/lib/cosmetics/assets";
import { cosmeticMediaManifestSchema } from "@/lib/schemas/cosmetics/validation";
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
  const manifestResult = cosmeticMediaManifestSchema.safeParse({
    assets: cosmetic.asset_manifest,
    visual: cosmetic.visual_manifest,
  });
  if (!manifestResult.success) {
    reportInvalidManifest(cosmetic.id, {
      issues: manifestResult.error.issues,
    });
    return null;
  }
  const assets = manifestResult.data.assets as CosmeticAssetManifest;
  const layers = manifestResult.data.visual.layers;

  if (!assets || !layers?.length) return null;

  return (
    <>
      {layers.map((layer) => {
        const asset = assets[layer.asset_key];
        if (!asset) return null;
        if (!isAllowedCosmeticAssetSource(asset.src)) return null;
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

const svgCache = new Map<string, Promise<string | null>>();

const fetchSvgText = (src: string): Promise<string | null> => {
  if (!svgCache.has(src)) {
    svgCache.set(
      src,
      fetch(src)
        .then((r) => (r.ok ? r.text() : null))
        .catch(() => null),
    );
  }
  return svgCache.get(src)!;
};

const normalizeSvgRoot = (svgText: string): string =>
  svgText.replace(
    /(<svg\b)([^>]*)(>)/i,
    (_, open, attrs, close) => {
      const cleaned = attrs
        .replace(/\s*width="[^"]*"/gi, "")
        .replace(/\s*height="[^"]*"/gi, "")
        .replace(/\s*style="[^"]*"/gi, "");
      return `${open}${cleaned} width="100%" height="100%"${close}`;
    },
  );

const sanitizeSvgText = (raw: string): string =>
  normalizeSvgRoot(
    raw
      .replace(/<\?xml[^?]*\?>/gi, "")
      .replace(/<!DOCTYPE[^>]*>/gi, "")
      .trim(),
  );


const CosmeticAssetImage = ({
  asset,
  animated,
  size,
  isOverlay,
  overlayScale,
  className,
  style,
}: CosmeticAssetImageProps) => {
  const selectedAsset = getCosmeticAssetSource(asset, animated);
  const animatedSources = getCosmeticAssetSources(asset, animated);
  const reducedMotionSource = asset.variants?.reduced_motion;
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (asset.type !== "svg") return;
    if (!isAllowedCosmeticAssetSource(selectedAsset.src)) return;
    fetchSvgText(selectedAsset.src).then((text) => {
      if (mountedRef.current && text) setSvgContent(sanitizeSvgText(text));
    });
  }, [selectedAsset.src, asset.type]);

  if (!isAllowedCosmeticAssetSource(selectedAsset.src)) return null;

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
    pointerEvents: "none",
  };

  if (asset.type === "svg") {
    if (!svgContent) return null;
    return (
      <div
        className={className}
        style={{ ...imageStyle, display: "flex", overflow: "visible" }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
        aria-hidden
      />
    );
  }

  if (!animatedSources.length) {
    return (
      <img
        src={selectedAsset.src}
        alt={selectedAsset.alt ?? ""}
        width={selectedAsset.width ?? size}
        height={selectedAsset.height ?? size}
        aria-hidden={!selectedAsset.alt}
        className={className}
        style={{ ...imageStyle, objectFit: "contain" }}
        loading={asset.loading ?? "lazy"}
      />
    );
  }

  return (
    <picture>
      {reducedMotionSource &&
        isAllowedCosmeticAssetSource(reducedMotionSource.src) && (
          <source
            srcSet={reducedMotionSource.src}
            type={toMimeType(reducedMotionSource.type)}
            media="(prefers-reduced-motion: reduce)"
          />
        )}
      {animatedSources.map((source) => (
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
        style={{ ...imageStyle, objectFit: "contain" }}
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

const invalidManifestIds = new Set<string>();

const reportInvalidManifest = (id: string, details: unknown): void => {
  if (invalidManifestIds.has(id)) return;
  invalidManifestIds.add(id);
  console.error(`[CosmeticRenderer] Invalid manifest for cosmetic "${id}".`, {
    details,
  });
};
