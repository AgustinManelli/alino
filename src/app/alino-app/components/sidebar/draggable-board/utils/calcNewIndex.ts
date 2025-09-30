"use client";

import type { NormalizedItem } from "./types";

const STEP = 16384;

export function calcNewIndex(arr: NormalizedItem[], newIndex: number) {
  const prev = arr[newIndex - 1]?.index ?? null;
  const post = arr[newIndex + 1]?.index ?? null;

  if (prev === null && post === null) return STEP;
  if (prev === null && post !== null) return post / 2;
  if (post === null && prev !== null) return prev + STEP;
  //Futura mejora para implementar un reordenamiento desde cero cuando no hay más espacio entre dos elementos
  // if (post! - prev! <= 1) return null;
  return (prev + post) / 2;
}
