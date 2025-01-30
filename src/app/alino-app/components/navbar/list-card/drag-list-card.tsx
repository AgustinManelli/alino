"use client";

import { Database } from "@/lib/schemas/todo-schema";
import { Pin, SquircleIcon } from "@/components/ui/icons/icons";
import styles from "./ListCard.module.css";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { EmojiMartComponent } from "@/components/ui/emoji-mart/emoji-mart-component";

export function DragListCard({ list }: { list: ListsType }) {
  const pathname = usePathname();

  const style = {
    backgroundColor: "rgb(250, 250, 250)",
    pointerEvents: "auto",
    boxShadow: "0px 0px 30px 0px rgba(0,0,0,0.1)",
    zIndex: 99,
  } as React.CSSProperties;

  return (
    <AnimatePresence>
      <motion.div
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
        <div className={styles.identifierContainer}>
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
        <motion.p
          className={styles.listName}
          style={{
            background: `linear-gradient(to right,#1c1c1c 80%, ${list.color} 90%, transparent 95%) 0% center / 200% no-repeat text`,
            backgroundSize: "200% auto",
            backgroundRepeat: "no-repeat",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          transition={{
            duration: 2,
            ease: "linear",
            delay: 0.2,
          }}
        >
          {list.name}
        </motion.p>
        {list.pinned && (
          <div className={styles.pinContainer}>
            <Pin
              style={{
                width: "14px",
                stroke: "rgb(210, 210, 210)",
                strokeWidth: "2",
              }}
            />
          </div>
        )}
        <p
          className={styles.counter}
          style={{
            opacity: 1,
          }}
        >
          {list.tasks?.length}
        </p>
      </motion.div>
    </AnimatePresence>
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
