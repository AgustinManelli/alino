export const getBlobatarSeed = (
  avatarUrl?: string | null,
  fallbackUsername?: string,
): string | null => {
  if (!avatarUrl || typeof avatarUrl !== "string") return null;
  const trimmed = avatarUrl.trim();
  if (trimmed.startsWith("blobatar:")) {
    return trimmed.slice("blobatar:".length) || fallbackUsername || "alino";
  }
  const match = trimmed.match(/blobatar-([^./?#]+)\.svg/);
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }
  return null;
};
