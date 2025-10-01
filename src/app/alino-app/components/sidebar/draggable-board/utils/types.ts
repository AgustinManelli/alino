"use client";

import type { ListsType, FolderType } from "@/lib/schemas/database.types";

export type CombinedKind = "list" | "folder";

export type NormalizedItem = {
  id: string;
  kind: CombinedKind;
  data: ListsType | FolderType;
  // index: number;
  rank: string;
};

export type DndItemData =
  | { type: "item"; parentId: string | null }
  | { type: "folder" }
  | { type: "folder-dropzone"; folderId: string; parentId?: string | null };
