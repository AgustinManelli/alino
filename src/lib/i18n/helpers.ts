import i18n from "./index";
import {
  CosmeticItem,
  AICreditPack,
  LocalizedText,
} from "@/lib/schemas/database.types";
import { CoinPack, StreakPackage } from "@/lib/api/shop/actions";

export interface TranslatedCosmetic {
  name: string;
  description: string;
  typeLabel: string;
}

export function getCosmeticTranslation(
  item: Pick<CosmeticItem, "id" | "name" | "description" | "type"> & {
    code?: string;
    localized_name?: LocalizedText | null;
    localized_description?: LocalizedText | null;
  },
): TranslatedCosmetic {
  const databaseName = resolveLocalizedField(
    item.localized_name ?? item.name,
    typeof item.name === "string" ? item.name : "",
  );
  const databaseDescription = resolveLocalizedField(
    item.localized_description ?? item.description,
    typeof item.description === "string" ? item.description : "",
  );
  const name = i18n.t(`cosmetics:items.${item.id}.name`, {
    defaultValue: item.code
      ? i18n.t(`cosmetics:items.${item.code}.name`, {
          defaultValue: databaseName,
        })
      : databaseName,
  });

  const description = i18n.t(`cosmetics:items.${item.id}.description`, {
    defaultValue: item.code
      ? i18n.t(`cosmetics:items.${item.code}.description`, {
          defaultValue: databaseDescription,
        })
      : databaseDescription,
  });

  const typeLabel = item.type
    ? i18n.t(`cosmetics:types.${item.type}`, {
        defaultValue: item.type === "frame" ? "Marco" : "Accesorio",
      })
    : "";

  return {
    name,
    description,
    typeLabel,
  };
}

export function resolveLocalizedField(
  value: unknown,
  fallback = "",
  targetLang?: string,
): string {
  if (!value) return fallback;
  let parsed = value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        return value;
      }
    } else {
      return value;
    }
  }

  if (typeof parsed === "object" && parsed !== null) {
    const record = parsed as Record<string, string>;
    if (targetLang) {
      const langKey = targetLang.split("-")[0];
      return record[langKey] || record[targetLang] || "";
    }
    const currentLang = (i18n.language || "es").split("-")[0];
    return (
      record[currentLang] ||
      record.es ||
      record.en ||
      Object.values(record)[0] ||
      fallback
    );
  }

  return String(value);
}

export interface TranslatedCoinPack {
  name: string;
  tag?: string | null;
  tagEn?: string | null;
}

export function getCoinPackTranslation(pack: {
  id: string;
  name: unknown;
  code?: string;
  tag?: unknown;
}): TranslatedCoinPack {
  const name = resolveLocalizedField(pack.name, "");
  const tag = pack.tag ? resolveLocalizedField(pack.tag, "") : null;
  const tagEn = pack.tag ? resolveLocalizedField(pack.tag, "", "en") : null;
  return {
    name,
    tag,
    tagEn,
  };
}

export interface TranslatedStreakPackage {
  name: string;
  badge?: string | null;
}

export function getStreakPackageTranslation(
  pkg: Pick<StreakPackage, "id" | "name"> & {
    code?: string;
    badge?: string | null;
  },
): TranslatedStreakPackage {
  const name = i18n.t(`streak:shop.packages.${pkg.id}.name`, {
    defaultValue: pkg.code
      ? i18n.t(`streak:shop.packages.${pkg.code}.name`, {
          defaultValue: pkg.name,
        })
      : pkg.name,
  });

  let badge = pkg.badge;
  if (pkg.badge) {
    const normalizedBadge = pkg.badge
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g, "_");
    badge = i18n.t(`streak:shop.badges.${normalizedBadge}`, {
      defaultValue: pkg.badge,
    });
  }

  return {
    name,
    badge,
  };
}

export interface TranslatedAICreditPack {
  name: string;
  tag?: string | null;
  tagEn?: string | null;
}

export function getAICreditPackTranslation(pack: {
  id: string;
  name: unknown;
  code?: string;
  tag?: unknown;
}): TranslatedAICreditPack {
  const name = resolveLocalizedField(pack.name, "");
  const tag = pack.tag ? resolveLocalizedField(pack.tag, "") : null;
  const tagEn = pack.tag ? resolveLocalizedField(pack.tag, "", "en") : null;
  return {
    name,
    tag,
    tagEn,
  };
}

import { ShopBanner } from "@/lib/api/shop/actions";

export interface TranslatedBanner {
  title: string;
  subtitle: string;
  eyebrow?: string;
}

export function getBannerTranslation(banner: ShopBanner): TranslatedBanner {
  return {
    title: resolveLocalizedField(banner.title, ""),
    subtitle: resolveLocalizedField(banner.subtitle, ""),
    eyebrow: banner.eyebrow
      ? resolveLocalizedField(banner.eyebrow, "")
      : undefined,
  };
}
