"use client";

import React, { CSSProperties, useMemo } from "react";
import { motion } from "motion/react";
import { Variants } from "motion";

import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

import { FolderType } from "@/lib/schemas/database.types";

import {
  ArrowThin,
  FolderClosed,
  MoreVertical,
} from "@/components/ui/icons/icons";
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
}

export const DragSortableFolder = ({ folder }: Props) => {
  const isMobile = usePlatformInfoStore((state) => state.isMobile);
  const animations = useUserPreferencesStore((state) => state.animations);

  const dragStyles = useMemo(
    () => ({
      border: "solid 1px #3ebb00",
      zIndex: 1,
    }),
    [],
  );

  const arrowStyle = useMemo(
    () => ({
      stroke: folder.folder_color ?? "var(--text-not-available)",
    }),
    [folder.folder_color],
  );

  const listsCount =
    Array.isArray(folder.memberships) && folder.memberships.length > 0
      ? folder.memberships[0].count
      : 0;

  return (
    <motion.div
      className={styles.folderContainer}
      variants={animations ? variants : undefined}
      initial="hidden"
      animate="visible"
      style={dragStyles}
    >
      <div className={styles.folderHeader}>
        <div className={styles.button}>
          <ArrowThin className={styles.arrowIconClosed} style={arrowStyle} />
        </div>
        <div className={styles.infoEditContainer}>
          <div className={styles.dragInfoWrapper}>
            <FolderClosed
              className={styles.dragFolderIcon}
              style={
                {
                  "--color": folder.folder_color ?? "var(--text-not-available)",
                } as CSSProperties
              }
            />
            <p className={styles.dragFolderName}>{folder.folder_name}</p>
          </div>
        </div>
        <section className={styles.buttonsContainer}>
          {isMobile ? (
            <section className={styles.rightButtonsMobile}>
              <div className={styles.moreConfigMenuMobile}>
                <div className={styles.dragMenuWrapper}>
                  <MoreVertical className={styles.dragMenuIcon} />
                </div>
              </div>
              <div className={styles.counterMobile}>{listsCount}</div>
            </section>
          ) : (
            <div className={styles.counter} style={{ opacity: 1 }}>
              {listsCount}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
};
