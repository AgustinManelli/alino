import React from "react";
import { motion, Variants } from "motion/react";

import { FolderType } from "@/lib/schemas/todo-schema";

import {
  ArrowThin,
  FolderClosed,
  MoreVertical,
} from "@/components/ui/icons/icons";
import styles from "./SortableFolder.module.css";

interface Props {
  folder: FolderType;
}

const variants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    rotate: [1, -1, 1],
    transition: {
      type: "spring",
      stiffness: 50,
      rotate: {
        repeat: Infinity,
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  },
};

export const DragSortableFolder = ({ folder }: Props) => {
  return (
    <motion.div
      className={styles.folderContainer}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      style={{ border: "1px solid #3ebb00" }}
    >
      <div className={styles.folderHeader}>
        <div
          style={{
            display: "flex",
            gap: "5px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FolderClosed
            style={{
              stroke: folder.folder_color ?? "var(--text-not-available)",
              width: "15px",
              height: "15px",
              strokeWidth: 2,
            }}
          />
          <p
            style={{
              color: folder.folder_color ?? "var(--text-not-available)",
            }}
          >
            {folder.folder_name}
          </p>
        </div>
        <section className={styles.buttonsContainer}>
          <MoreVertical
            style={{
              stroke: "var(--text)",
              width: "20px",
              strokeWidth: "3",
              display: "flex",
            }}
          />
          <div className={styles.button}>
            <ArrowThin
              style={{
                stroke: "var(--text-not-available)",
                width: "15px",
                height: "15px",
                strokeWidth: 2,
              }}
            />
          </div>
        </section>
      </div>
    </motion.div>
  );
};
