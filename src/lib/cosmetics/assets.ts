import type {
  CosmeticAsset,
  CosmeticAssetSource,
} from "@/lib/schemas/database.types";

const transitionAssetPattern = /^\/api\/cosmetics\/[a-z0-9][a-z0-9_-]{0,99}\?/;

export const getAllowedCosmeticAssetHosts = (): Set<string> => {
  const hosts = [
    getHostname(process.env.NEXT_PUBLIC_SUPABASE_URL),
    ...(process.env.NEXT_PUBLIC_COSMETIC_ASSET_HOSTS ?? "")
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
  ];
  return new Set(hosts.filter((host): host is string => Boolean(host)));
};

export const isAllowedCosmeticAssetSource = (source: string): boolean => {
  if (transitionAssetPattern.test(source)) return true;

  try {
    const url = new URL(source);
    return (
      url.protocol === "https:" &&
      getAllowedCosmeticAssetHosts().has(url.hostname)
    );
  } catch {
    return false;
  }
};

export const isVersionedCosmeticAsset = (asset: CosmeticAssetSource): boolean =>
  Boolean(asset.version && asset.integrity);

export const getCosmeticAssetSource = (
  asset: CosmeticAsset,
  animated: boolean,
): CosmeticAssetSource => {
  if (animated) {
    return asset.variants?.animated?.[0] ?? asset;
  }

  return asset.variants?.reduced_motion ?? asset.variants?.static ?? asset;
};

export const getCosmeticAssetSources = (
  asset: CosmeticAsset,
  animated: boolean,
): CosmeticAssetSource[] => {
  if (!animated) return [];
  return (asset.variants?.animated ?? []).filter((source) =>
    isAllowedCosmeticAssetSource(source.src),
  );
};

export const getCosmeticAssetCachePolicy = (
  asset: CosmeticAssetSource,
): "immutable" | "revalidate" => (asset.version ? "immutable" : "revalidate");

const getHostname = (value?: string): string | null => {
  if (!value) return null;
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
};
