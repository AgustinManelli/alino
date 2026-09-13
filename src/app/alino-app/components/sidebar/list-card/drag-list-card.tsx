"use client";

import React, { CSSProperties } from "react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";

import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { EmojiMartComponent } from "@/components/ui/EmojiMart/emoji-mart-component";
import { ListsType } from "@/lib/schemas/database.types";
import {
  Colaborate,
  MoreVertical,
  Pin,
  SquircleIcon,
} from "@/components/ui/icons/icons";
import styles from "./ListCard.module.css";
import listInfoStyles from "@/components/ui/list-info-edit/ListInfoEdit.module.css";

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

export function DragListCard({ list }: { list: ListsType }) {
  const isMobile = usePlatformInfoStore((state) => state.isMobile);
  const animations = useUserPreferencesStore((state) => state.animations);
  const sidebarCollapsed = useUserPreferencesStore(
    (state) => state.sidebarCollapsed
  );
  const isCollapsed = !isMobile && sidebarCollapsed;
  const inFolder = !!list.folder;

  const taskCount =
    Array.isArray(list.list?.tasks) && list.list.tasks.length > 0
      ? list.list.tasks[0].count
      : 0;

  const dragStyles: CSSProperties = {
    "--color": list.list.color,
    width: isCollapsed ? (inFolder ? "33px" : "45px") : "100%",
    height: isCollapsed && inFolder ? "33px" : "45px",
    minHeight: isCollapsed && inFolder ? "33px" : "45px",
    borderRadius: isCollapsed && inFolder ? "8px" : "15px",
    padding: isCollapsed && inFolder ? "0 4px" : "7px 10px",
    backgroundColor: "var(--background-card-dragged)",
    boxShadow: "0px 0px 30px 0px rgba(0, 0, 0, 0.15)",
    zIndex: 99,
  } as CSSProperties;

  return (
    <motion.section
      className={styles.containerDrag}
      variants={animations ? variants : undefined}
      initial="hidden"
      animate="visible"
      exit="hidden"
      style={dragStyles}
    >
      <div className={`${styles.cardFx} ${styles.cardFxActive}`} />

      <div className={listInfoStyles.colorPickerContainer}>
        {list.list.icon ? (
          <div className={listInfoStyles.emojiContainer}>
            <EmojiMartComponent shortcodes={list.list.icon} size={16} />
          </div>
        ) : (
          <div className={listInfoStyles.emojiContainer}>
            <SquircleIcon
              style={{
                fill: list.list.color,
                width: "12px",
                height: "12px",
              }}
            />
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className={listInfoStyles.textContainer}>
          <span className={listInfoStyles.listName}>
            {list.list.list_name}
          </span>
        </div>
      )}

      {!isCollapsed && (
        <div className={styles.listManagerContainer}>
          {list.list.is_shared && (
            <div className={styles.pinContainer}>
              <Colaborate className={styles.colaborateIcon} />
            </div>
          )}

          {list.pinned && (
            <div className={styles.pinContainer}>
              <Pin className={styles.pinIcon} />
            </div>
          )}

          {isMobile ? (
            <div className={styles.configsContainerMobile}>
              <div className={`${styles.configButtonContainer} ${styles.Mobile}`}>
                <div className={styles.moreOptions}>
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
              <p className={`${styles.counter} ${styles.Mobile}`}>{taskCount}</p>
            </div>
          ) : (
            <div className={styles.configsContainer}>
              <p className={`${styles.counterDesktop} ${styles.Desktop}`}>
                {taskCount}
              </p>
            </div>
          )}
        </div>
      )}
    </motion.section>
  );
}
