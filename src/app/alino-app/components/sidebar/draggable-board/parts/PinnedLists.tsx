"use client";

import { AnimatePresence, motion } from "motion/react";
import { ListCard } from "../../list-card";
import type { ListsType } from "@/lib/schemas/database.types";
import { variants } from "../animations/variants";

export function PinnedLists({
  pinned,
  animations,
}: {
  pinned: ListsType[];
  animations: boolean;
}) {
  return (
    <AnimatePresence mode="popLayout">
      {pinned.map((list) => (
        <motion.div
          layoutId={`list-card-transition-${list.list_id}`}
          layout
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
      ))}

      {pinned.length > 0 && (
        <motion.div
          layout
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{
            opacity: 1,
            height: 2,
            backgroundPosition: ["200% center", "0% center"],
          }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3 }}
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
