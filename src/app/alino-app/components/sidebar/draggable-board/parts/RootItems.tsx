"use client";

import { AnimatePresence, motion } from "motion/react";
import { SortableFolder } from "../../folders/sortable-folder";
import { ListCard } from "../../list-card";
import type { ListsType, FolderType } from "@/lib/schemas/todo-schema";
import type { NormalizedItem } from "../utils/types";
import { variants } from "../animations/variants";

export function RootItems({
  items,
  lists,
  draggedItem,
  animations,
}: {
  items: NormalizedItem[];
  lists: ListsType[];
  draggedItem: NormalizedItem | null;
  animations: boolean;
}) {
  return (
    <AnimatePresence>
      {items.map((item) => {
        if (item.kind === "folder") {
          const folder = item.data as FolderType;
          return (
            <motion.div
              layout={draggedItem ? false : true}
              variants={animations ? variants : undefined}
              initial="initial"
              animate="visible"
              exit="exit"
              key={`folder-${item.id}`}
              id={item.id}
            >
              <SortableFolder
                folder={folder}
                lists={lists.filter((ls) => ls.folder === folder.folder_id)}
                isDragging={!!draggedItem}
                dropAllowed={draggedItem?.kind === "list"}
              />
            </motion.div>
          );
        }
        const list = item.data as ListsType;
        return (
          <motion.div
            layout={draggedItem ? false : true}
            variants={animations ? variants : undefined}
            initial="initial"
            animate="visible"
            exit="exit"
            key={`list-${item.id}`}
            id={item.id}
          >
            <ListCard list={list} />
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
