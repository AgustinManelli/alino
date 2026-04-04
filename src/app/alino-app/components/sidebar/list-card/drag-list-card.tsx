"use client";

import { motion } from "motion/react";

import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

import { EmojiMartComponent } from "@/components/ui/EmojiMart/emoji-mart-component";

import { ListsType } from "@/lib/schemas/database.types";

import type { Variants } from "motion/react";
import {
  Colaborate,
  MoreVertical,
  Pin,
  SquircleIcon,
} from "@/components/ui/icons/icons";
import styles from "./ListCard.module.css";

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

  const taskCount =
    Array.isArray(list.list?.tasks) && list.list.tasks.length > 0
      ? list.list.tasks[0].count
      : 0;

  return (
    <motion.section
      className={styles.containerDrag}
      variants={animations ? variants : undefined}
      initial="hidden"
      animate="visible"
      exit="hidden"
      style={{ "--color": list.list.color } as React.CSSProperties}
    >
      <div className={`${styles.cardFx} ${styles.cardFxActive}`}></div>

      <div className={styles.colorPickerContainer}>
        {list.list.icon ? (
          <div className={styles.emojiContainer}>
            <EmojiMartComponent shortcodes={list.list.icon} size={16} />
          </div>
        ) : (
          <SquircleIcon className={styles.squircleIcon} />
        )}
      </div>

      <div className={styles.textContainer}>
        <p className={styles.listName}>{list.list.list_name}</p>
      </div>

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
          <>
            <div className={styles.configsContainer}>
              <div
                className={`${styles.configButtonContainer} ${styles.Mobile}`}
              >
                <div className={styles.moreOptions}>
                  <MoreVertical className={styles.moreVerticalIcon} />
                </div>
              </div>
            </div>
            <div className={styles.configsContainer}>
              <p className={`${styles.counter} ${styles.Mobile}`}>
                {taskCount}
              </p>
            </div>
          </>
        ) : (
          <div className={styles.configsContainer}>
            <p className={`${styles.counter} ${styles.Desktop}`}>{taskCount}</p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
