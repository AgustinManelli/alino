"use client";

import { AnimatePresence, motion } from "motion/react";
import { ListCard } from "../../list-card";
import { SortableFolder } from "../../folders/sortable-folder";
import type { ListsType, FolderType } from "@/lib/schemas/database.types";
import type { PinnedItem } from "../hooks/useCombinedItems";
import type { NormalizedItem } from "../utils/types";
import { compareRanks } from "@/lib/lexorank";
import { variants } from "../animations/variants";

export function PinnedLists({
  pinnedItems,
  pinned = [],
  pinnedFolders = [],
  allLists = [],
  draggedItem,
  animations,
}: {
  pinnedItems?: PinnedItem[];
  pinned?: ListsType[];
  pinnedFolders?: FolderType[];
  allLists?: ListsType[];
  draggedItem?: NormalizedItem | null;
  animations: boolean;
}) {
  const itemsToRender: PinnedItem[] =
    pinnedItems ?? [
      ...pinnedFolders.map((f) => ({ kind: "folder" as const, id: f.folder_id, data: f })),
      ...pinned.map((l) => ({ kind: "list" as const, id: l.list_id, data: l })),
    ];

  const hasPinned = itemsToRender.length > 0;

  return (
    <AnimatePresence mode="popLayout">
      {itemsToRender.map((item) => {
        if (item.kind === "folder") {
          const folder = item.data;
          const folderLists =
            ("childrens" in item && item.childrens
              ? item.childrens
              : allLists.filter((l) => l.folder === folder.folder_id)
            ).slice().sort((a, b) => compareRanks({ rank: a.rank, id: a.list_id }, { rank: b.rank, id: b.list_id }));

          return (
            <motion.div
              layout="position"
              variants={animations ? variants : undefined}
              initial="initial"
              animate="visible"
              exit="exit"
              key={`folder-${folder.folder_id}`}
              id={`pinned-folder-${folder.folder_id}`}
              style={{ zIndex: 10 }}
            >
              <SortableFolder
                folder={folder}
                lists={folderLists}
                isDragging={!!draggedItem}
                dropAllowed={draggedItem?.kind === "list"}
              />
            </motion.div>
          );
        } else {
          const list = item.data;
          return (
            <motion.div
              layout="position"
              variants={animations ? variants : undefined}
              initial="initial"
              animate="visible"
              exit="exit"
              key={`list-${list.list_id}`}
              id={`pinned-${list.list_id}`}
              style={{ zIndex: 10 }}
            >
              <ListCard list={list} />
            </motion.div>
          );
        }
      })}

      {hasPinned && (
        <motion.div
          layout="position"
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{
            opacity: 1,
            height: 2,
            backgroundPosition: ["200% center", "0% center"],
          }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.2 }}
          id="separator"
          style={{
            width: "100%",
            background: `linear-gradient(to right,var(--hover-over-container) 80%, var(--border-container-color) 100%) 0% center / 200% no-repeat`,
            backgroundSize: "200% auto",
          }}
        />
      )}
    </AnimatePresence>
  );
}
