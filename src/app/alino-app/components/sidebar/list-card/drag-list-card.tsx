"use client";

import { Database } from "@/lib/schemas/todo-schema";
import { MoreVertical, Pin, SquircleIcon } from "@/components/ui/icons/icons";
import styles from "./ListCard.module.css";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { EmojiMartComponent } from "@/components/ui/emoji-mart/emoji-mart-component";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useMemo } from "react";

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
    backgroundColor: "rgb(250, 250, 250)",
    pointerEvents: "auto",
    boxShadow: "0px 0px 30px 0px rgba(0,0,0,0.1)",
    zIndex: 99,
    padding: "7px 10px 7px 15px",
  } as React.CSSProperties;

  return (
    <motion.section
      className={styles.container}
      style={style}
      variants={animations ? variants : undefined}
      initial="hidden"
      animate="visible"
      exit="exit"
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

      {/* IMPLEMENTAR INPUT PARA CAMBIAR DE NOMBRE CON SU RESPECTIVO BOTÓN */}
      <div className={styles.textContainer}>
        <p
          className={styles.listName}
          style={{
            color: "#1c1c1c",
          }}
        >
          {list.list.list_name}
        </p>
      </div>

      <div className={styles.listManagerContainer}>
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
                <MoreVertical
                  style={{ stroke: "#1c1c1c", width: "20px", strokeWidth: "3" }}
                />
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

type MembershipRow = Database["public"]["Tables"]["list_memberships"]["Row"];
type ListsRow = Database["public"]["Tables"]["lists"]["Row"];
type ListsType = MembershipRow & { list: ListsRow };

const variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
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
