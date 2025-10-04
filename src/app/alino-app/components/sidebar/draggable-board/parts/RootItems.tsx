"use client";

import { AnimatePresence, motion } from "motion/react";
import { SortableFolder } from "../../folders/sortable-folder";
import { ListCard } from "../../list-card";
import type { ListsType, FolderType } from "@/lib/schemas/database.types";
import type { NormalizedItem } from "../utils/types";
import { variants } from "../animations/variants";
import React from "react";

export function RootItems({
  items,
  lists,
  draggedItem,
  animations,
  overId,
  isBelowOver,
}: {
  items: NormalizedItem[];
  lists: ListsType[];
  draggedItem: NormalizedItem | null;
  animations: boolean;
  overId: string | null;
  isBelowOver: boolean;
}) {
  const DropIndicator = () => (
    <div
      style={{
        height: "45px",
        width: "100%",
        backgroundColor: "rgba(62, 187, 0, 0.3)",
        borderRadius: "15px",
      }}
    />
  );

  return (
    <AnimatePresence>
      {items.map((item) => {
        if (item.kind === "folder") {
          const folder = item.data as FolderType;
          return (
            <React.Fragment key={`folder-${item.id}`}>
              {overId === item.id && !isBelowOver && <DropIndicator />}
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
                  lists={item.childrens || []}
                  isDragging={!!draggedItem}
                  dropAllowed={draggedItem?.kind === "list"}
                />
              </motion.div>
              {overId === item.id && isBelowOver && <DropIndicator />}
            </React.Fragment>
          );
        }
        const list = item.data as ListsType;
        return (
          <React.Fragment key={`list-${item.id}`}>
            {overId === item.id && !isBelowOver && <DropIndicator />}
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
            {overId === item.id && isBelowOver && <DropIndicator />}
          </React.Fragment>
        );
      })}
    </AnimatePresence>
  );
}
