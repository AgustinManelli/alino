import appleData from "../../components/ui/EmojiMart/apple.json";

const validEmojiIds = new Set<string>(Object.keys((appleData as any).emojis || {}));

const nativeToIdMap = new Map<string, string>();

for (const [id, item] of Object.entries((appleData as any).emojis || {})) {
  const skins = (item as any)?.skins;
  if (Array.isArray(skins)) {
    for (const skin of skins) {
      if (skin?.native) {
        nativeToIdMap.set(skin.native, id);
        nativeToIdMap.set(skin.native.replace(/\uFE0F/g, ""), id);
      }
    }
  }
}

const COMMON_ALIASES: Record<string, string> = {
  laptop: "computer",
  shopping_cart: "shopping_trolley",
  speaking_head: "speaking_head_in_silhouette",
  runner: "person_running",
  running: "person_running",
  fitness: "muscle",
  gym: "weight_lifter",
  study: "mortar_board",
  university: "mortar_board",
  work: "briefcase",
  folder: "file_folder",
  calendar: "calendar",
  note: "memo",
  notes: "memo",
  doc: "page_facing_up",
  docs: "page_facing_up",
  paper: "page_facing_up",
  report: "page_facing_up",
  clean: "sparkles",
  cleaning: "sparkles",
  car: "red_car",
};

export function normalizeEmojiShortcode(input?: string | null): string | null {
  if (!input) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  const stripped = raw.replace(/^:+|:+$/g, "").toLowerCase();

  const aliasId = COMMON_ALIASES[stripped] || stripped;
  if (validEmojiIds.has(aliasId)) {
    return `:${aliasId}:`;
  }

  const idFromNative =
    nativeToIdMap.get(raw) || nativeToIdMap.get(raw.replace(/\uFE0F/g, ""));
  if (idFromNative && validEmojiIds.has(idFromNative)) {
    return `:${idFromNative}:`;
  }

  return null;
}
