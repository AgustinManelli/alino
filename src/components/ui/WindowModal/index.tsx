"use client";

import { useRef } from "react";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { ClientOnlyPortal } from "../ClientOnlyPortal";

import { Cross } from "../icons/icons";
import styles from "./WindowModal.module.css";

interface Props {
  children?: React.ReactNode;
  title?: string;
  crossButton?: boolean;
  closeAction: () => void;
}

export const WindowModal = ({
  children,
  title,
  crossButton = true,
  closeAction,
}: Props) => {
  const modalRef = useRef<HTMLElement | null>(null);
  const handleCrossAction = () => {
    closeAction();
  };

  useOnClickOutside(modalRef, closeAction);
  return (
    <ClientOnlyPortal>
      <section className={`${styles.container} ignore-sidebar-close`}>
        <main className={styles.main} ref={modalRef}>
          <header
            className={`${styles.header} ${title ? styles.headrel : styles.headabs}`}
          >
            <h1 className={styles.title}>{title}</h1>
            {crossButton && (
              <div className={styles.windowCrossContainer}>
                <button
                  className={styles.windowCrossButton}
                  onClick={handleCrossAction}
                >
                  <Cross className={styles.windowCrossIcon} />
                </button>
              </div>
            )}
          </header>
          <div className={styles.body}>{children}</div>
          <footer></footer>
        </main>
      </section>
    </ClientOnlyPortal>
  );
};
