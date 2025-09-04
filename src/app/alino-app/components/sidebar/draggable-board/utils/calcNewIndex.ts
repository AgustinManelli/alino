"use client";

import type { NormalizedItem } from "./types";

export function calcNewIndex(arr: NormalizedItem[], newIndex: number) {
  const prev = arr[newIndex - 1]?.index ?? null;
  const post = arr[newIndex + 1]?.index ?? null;

  if (prev === null && post === null) return 16384;
  if (prev === null && post !== null) return Math.floor(post / 2);
  if (post === null && prev !== null) return prev + 16384;
  if (post === prev) return Math.floor(post + prev / 2);
  return Math.floor((prev + post) / 2);
}
