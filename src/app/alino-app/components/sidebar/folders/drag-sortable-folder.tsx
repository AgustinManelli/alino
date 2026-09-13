"use client";

import React, { CSSProperties } from "react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";

import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { FolderType } from "@/lib/schemas/database.types";
import { FolderClosed, MoreVertical } from "@/components/ui/icons/icons";
import styles from "./SortableFolder.module.css";
import folderInfoStyles from "@/components/ui/folder-info-edit/FolderInfoEdit.module.css";

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
  const sidebarCollapsed = useUserPreferencesStore(
    (state) => state.sidebarCollapsed
  );
  const isCollapsed = !isMobile && sidebarCollapsed;

  const listsCount =
    Array.isArray(folder.memberships) && folder.memberships.length > 0
      ? folder.memberships[0].count
      : 0;

  const dragStyles: CSSProperties = {
    "--color": folder.folder_color ?? "var(--text-not-available)",
    "--bgColor": folder.folder_color ?? "transparent",
    width: isCollapsed ? "45px" : "100%",
    height: "45px",
    minHeight: "45px",
    borderRadius: "15px",
    padding: "5px",
    backgroundColor: "var(--background-card-dragged)",
    boxShadow: "0px 0px 30px 0px rgba(0, 0, 0, 0.15)",
    border: "1px solid var(--border-container-color)",
    zIndex: 99,
  } as CSSProperties;

  const headerStyles: CSSProperties = isCollapsed
    ? { padding: "0 4px", gap: 0 }
    : {};

  return (
    <motion.div
      className={styles.folderContainer}
      variants={animations ? variants : undefined}
      initial="hidden"
      animate="visible"
      exit="hidden"
      style={dragStyles}
      data-open={false}
    >
      <div className={styles.folderHeader} style={headerStyles}>
        <div className={styles.infoEditContainer}>
          <div className={folderInfoStyles.colorPickerContainer}>
            <div className={folderInfoStyles.emojiContainer}>
              <FolderClosed
                className={folderInfoStyles.folderIcon}
                style={
                  {
                    "--color":
                      folder.folder_color ?? "var(--text-not-available)",
                  } as CSSProperties
                }
              />
            </div>
          </div>

          {!isCollapsed && (
            <div className={folderInfoStyles.textContainer}>
              <span className={folderInfoStyles.listName}>
                {folder.folder_name}
              </span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <section className={styles.buttonsContainer}>
            {isMobile ? (
              <section className={styles.rightButtonsMobile}>
                <div className={styles.moreConfigMenuMobile}>
                  <div className={styles.button}>
                    <MoreVertical
                      style={{
                        width: "14px",
                        height: "14px",
                        stroke: "var(--text)",
                        strokeWidth: 2,
                      }}
                    />
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
        )}
      </div>
    </motion.div>
  );
};
