import React from "react";
import { Variants } from "motion";
import { motion } from "motion/react";
import { FolderType } from "@/lib/schemas/database.types";
import {
  ArrowThin,
  FolderClosed,
  MoreVertical,
} from "@/components/ui/icons/icons";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";

import styles from "./SortableFolder.module.css";

const variants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    rotate: [-1, 1],
    x: [-0.5, 0.5],
    y: [-0.5, 0.5],
    transition: {
      duration: 0.12,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

interface Props {
  folder: FolderType;
  listCount: number;
}

export const DragSortableFolder = ({ folder, listCount = 0 }: Props) => {
  const isMobile = usePlatformInfoStore((state) => state.isMobile);

  const folderStyle = {
    stroke: folder.folder_color ?? "var(--text-not-available)",
    width: "15px",
    height: "15px",
    strokeWidth: 2,
  };
  const menuStyle = {
    stroke: "var(--text)",
    width: "20px",
    height: "20px",
    strokeWidth: 3,
  };

  return (
    <motion.div
      className={styles.folderContainer}
      variants={variants}
      initial="hidden"
      animate="visible"
      style={{
        border: "solid 1px #3ebb00",
        zIndex: "1",
      }}
    >
      <div className={styles.folderHeader}>
        <div className={styles.button}>
          <ArrowThin
            style={{
              stroke: folder.folder_color ?? "var(--text-not-available)",
              width: "15px",
              height: "15px",
              strokeWidth: 2,
              transform: "rotate(-90deg)",
              transition: "transform 0.1s ease-in-out",
            }}
          />
        </div>
        <div className={styles.infoEditContainer}>
          <div
            style={{
              width: "100%",
              display: "flex",
              gap: "5px",
              alignItems: "center",
            }}
          >
            <FolderClosed style={folderStyle} />
            <p style={{ color: "var(--text)" }}>{folder.folder_name}</p>
          </div>
        </div>
        <section className={styles.buttonsContainer}>
          {isMobile ? (
            <section className={styles.rightButtonsMobile}>
              <div className={styles.moreConfigMenuMobile}>
                <div
                  style={{
                    backgroundColor: "var(--background-over-container)",
                    width: "23px",
                    height: "23px",
                    borderRadius: "5px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MoreVertical style={menuStyle} />
                </div>
              </div>
              <div className={styles.counterMobile}>{listCount}</div>
            </section>
          ) : (
            <div className={styles.counter} style={{ opacity: 1 }}>
              {listCount}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
};
