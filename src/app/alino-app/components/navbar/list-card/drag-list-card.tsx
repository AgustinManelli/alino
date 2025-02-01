"use client";

import { Database } from "@/lib/schemas/todo-schema";
import { MoreVertical, Pin, SquircleIcon } from "@/components/ui/icons/icons";
import styles from "./ListCard.module.css";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { EmojiMartComponent } from "@/components/ui/emoji-mart/emoji-mart-component";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";

export function DragListCard({ list }: { list: ListsType }) {
  const pathname = usePathname();

  const { isMobile } = usePlatformInfoStore();

  const style = {
    backgroundColor: "rgb(250, 250, 250)",
    pointerEvents: "auto",
    boxShadow: "0px 0px 30px 0px rgba(0,0,0,0.1)",
    zIndex: 99,
  } as React.CSSProperties;

  return (
    <motion.section
      className={styles.container}
      style={style}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div
        className={styles.cardFx}
        style={{
          boxShadow:
            pathname === `/alino-app/${list.id}`
              ? `${list.color} 100px 50px 50px`
              : `initial`,
        }}
      ></div>

      <div className={styles.colorPickerContainer} style={{ minWidth: "16px" }}>
        {list.icon !== null || list.icon === "" ? (
          <div
            style={{
              width: "16px",
              height: "16px",
            }}
          >
            <EmojiMartComponent shortcodes={list?.icon} size="16px" />
          </div>
        ) : (
          <SquircleIcon
            style={{
              width: "12px",
              fill: `${list?.color}`,
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
          {list.name}
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
              <p className={styles.counterMobile}>{list.tasks?.length}</p>
            </div>
            <div className={styles.configsContainer}>
              <div className={styles.configButtonContainerMobile}>
                <MoreVertical
                  style={{ stroke: "#1c1c1c", width: "20px", strokeWidth: "3" }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className={styles.configsContainer}>
            <p className={styles.counter}>{list.tasks?.length}</p>
          </div>
        )}
      </div>
    </motion.section>
  );
}

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

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
