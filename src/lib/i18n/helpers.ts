import i18n from "./index";
import { CosmeticItem } from "@/lib/schemas/database.types";
import { CoinPack } from "@/lib/api/shop/actions";

export interface TranslatedCosmetic {
  name: string;
  description: string;
  typeLabel: string;
}

export function getCosmeticTranslation(item: Pick<CosmeticItem, "id" | "name" | "description" | "type"> & { code?: string }): TranslatedCosmetic {
  const name = i18n.t(`cosmetics:items.${item.id}.name`, {
    defaultValue: item.code ? i18n.t(`cosmetics:items.${item.code}.name`, { defaultValue: item.name }) : item.name,
  });

  const description = i18n.t(`cosmetics:items.${item.id}.description`, {
    defaultValue: item.code
      ? i18n.t(`cosmetics:items.${item.code}.description`, { defaultValue: item.description || "" })
      : item.description || "",
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

export interface TranslatedCoinPack {
  name: string;
  tag?: string | null;
}

export function getCoinPackTranslation(pack: Pick<CoinPack, "id" | "name"> & { code?: string; tag?: string | null }): TranslatedCoinPack {
  const name = i18n.t(`shop:packs.items.${pack.id}.name`, {
    defaultValue: pack.code ? i18n.t(`shop:packs.items.${pack.code}.name`, { defaultValue: pack.name }) : pack.name,
  });

  let tag = pack.tag;
  if (pack.tag) {
    const normalizedTag = pack.tag.toLowerCase().trim().replace(/[\s-]+/g, "_");
    tag = i18n.t(`shop:packs.tags.${normalizedTag}`, {
      defaultValue: pack.tag,
    });
  }

  return {
    name,
    tag,
  };
}
