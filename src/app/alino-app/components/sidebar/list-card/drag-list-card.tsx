"use client";

import { ListsType } from "@/lib/schemas/todo-schema";
import {
  Colaborate,
  MoreVertical,
  Pin,
  SquircleIcon,
} from "@/components/ui/icons/icons";
import styles from "./ListCard.module.css";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { EmojiMartComponent } from "@/components/ui/EmojiMart/emoji-mart-component";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useMemo } from "react";

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
  const pathname = usePathname();

  const { isMobile } = usePlatformInfoStore();
  const { animations } = useUserPreferencesStore();

  const tasks = useTodoDataStore((state) => state.tasks);

  const filteredTasks = useMemo(
    () => tasks.filter((task) => task.list_id === list.list_id),
    [tasks, list.list_id]
  );

  const style = {
    backgroundColor: "var(--background-card-dragged)",
    pointerEvents: "auto",
    boxShadow: "0px 0px 30px 0px rgba(0,0,0,0.1)",
    zIndex: 99,
    padding: "7px 10px 7px 15px",
    left: "0",
  } as React.CSSProperties;

  return (
    <motion.section
      className={styles.containerDrag}
      style={style}
      variants={animations ? variants : undefined}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div
        className={styles.cardFx}
        style={{
          boxShadow:
            pathname === `/alino-app/${list.list_id}`
              ? `${list.list.color} 100px 50px 50px`
              : `initial`,
        }}
      ></div>

      <div className={styles.colorPickerContainer} style={{ minWidth: "16px" }}>
        {list.list.icon !== null || list.list.icon === "" ? (
          <div
            style={{
              width: "16px",
              height: "16px",
            }}
          >
            <EmojiMartComponent shortcodes={list?.list.icon} size="16px" />
          </div>
        ) : (
          <SquircleIcon
            style={{
              width: "12px",
              fill: `${list?.list.color}`,
              transition: "fill 0.2s ease-in-out",
            }}
          />
        )}
      </div>

      <div className={styles.textContainer}>
        <p className={styles.listName}>{list.list.list_name}</p>
      </div>

      <div className={styles.listManagerContainer}>
        {list.list.is_shared && (
          <div className={styles.pinContainer}>
            <Colaborate
              style={{
                width: "100%",
                height: "auto",
                stroke: "var(--icon-color)",
                strokeWidth: 2,
                opacity: 0.4,
              }}
            />
          </div>
        )}
        {list.pinned && (
          <div className={styles.pinContainer}>
            <Pin
              style={{
                width: "100%",
                height: "auto",
                stroke: "rgb(210, 210, 210)",
                strokeWidth: 2,
              }}
            />
          </div>
        )}

        {isMobile ? (
          <>
            <div className={styles.configsContainer}>
              <div
                className={`${styles.configButtonContainer} ${styles.Mobile}`}
              >
                <div className={styles.moreOptions}>
                  <MoreVertical
                    style={{
                      stroke: "var(--text)",
                      width: "20px",
                      strokeWidth: "3",
                    }}
                  />
                </div>
              </div>
            </div>
            <div className={styles.configsContainer}>
              <p className={`${styles.counter} ${styles.Mobile}`}>
                {filteredTasks?.length}
              </p>
            </div>
          </>
        ) : (
          <div className={styles.configsContainer}>
            <p className={`${styles.counter} ${styles.Desktop}`}>
              {filteredTasks?.length}
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
