"use client";

import { EmojiMartComponent } from "@/components/ui/emoji-mart/emoji-mart-component";
import { SquircleIcon } from "@/components/ui/icons/icons";
import { useTodoDataStore } from "@/store/useTodoDataStore";

import styles from "./ListIcon.module.css";
import { useEffect, useRef, useState } from "react";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

interface props {
  list_id: string;
}

export function ListIcon({ list_id }: props) {
  const [open, setOpen] = useState<boolean>(false);
  const lists = useTodoDataStore((state) => state.lists);

  const isMobile = usePlatformInfoStore((state) => state.isMobile);

  const list = lists.find((l) => l.id === list_id);

  if (!list) return null;

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setOpen(false);
    };

    const scrollContainer = document.getElementById("task-section-scroll-area");
    scrollContainer?.addEventListener("scroll", handleScroll);

    return () => {
      scrollContainer?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useOnClickOutside(buttonRef, () => {
    setOpen(false);
  });

  return (
    <button
      className={styles.listIcon}
      onMouseEnter={() => {
        !isMobile && setOpen(true);
      }}
      onMouseLeave={() => {
        !isMobile && setOpen(false);
      }}
      onClick={() => {
        isMobile && setOpen(true);
      }}
      ref={buttonRef}
    >
      {open && (
        <div className={styles.tooltip}>
          <p>{list.name}</p>
        </div>
      )}
      {list.icon !== null ? (
        <div
          style={{
            width: "16px",
            height: "16px",
          }}
        >
          <EmojiMartComponent shortcodes={list.icon} size="16px" />
        </div>
      ) : (
        <SquircleIcon
          style={{
            width: "12px",
            fill: `${list.color}`,
            transition: "fill 0.2s ease-in-out",
          }}
        />
      )}
    </button>
  );
}
