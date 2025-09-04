"use client";

import { AnimatePresence, motion } from "motion/react";
import { ListCard } from "../../list-card";
import type { ListsType } from "@/lib/schemas/todo-schema";
import { variants } from "../animations/variants";

export function PinnedLists({
  pinned,
  animations,
}: {
  pinned: ListsType[];
  animations: boolean;
}) {
  return (
    <AnimatePresence>
      {pinned.map((list) => (
        <motion.div
          layout
          variants={animations ? variants : undefined}
          initial="initial"
          animate="visible"
          exit="exit"
          key={`pinned-${list.list_id}`}
          id={`pinned-${list.list_id}`}
        >
          <ListCard list={list} />
        </motion.div>
      ))}
      {pinned.length > 0 && (
        <motion.div
          layout
          animate={{ backgroundPosition: ["200% center", "0% center"] }}
          transition={{ duration: 1, ease: "linear", delay: 0.2 }}
          id="separator"
          style={{
            width: "100%",
            height: 2,
            background: `linear-gradient(to right,var(--hover-over-container) 80%, var(--border-container-color) 100%) 0% center / 200% no-repeat`,
            backgroundSize: "200% auto",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </AnimatePresence>
  );
}
