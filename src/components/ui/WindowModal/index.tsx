import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { ClientOnlyPortal } from "../ClientOnlyPortal";

import { Cross } from "../icons/icons";
import styles from "./WindowModal.module.css";
import { useRef } from "react";
import SimpleBar from "simplebar-react";

const crossIconStyle = {
  width: "20px",
  height: "20px",
  strokeWidth: "1.5",
  stroke: "var(--text-not-available)",
} as React.CSSProperties;

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
      <section className={styles.container}>
        <main className={styles.main} ref={modalRef}>
          <header
            className={`${styles.header} ${title ? styles.headrel : styles.headabs}`}
          >
            <h1 className={styles.title}>{title}</h1>
            {crossButton && (
              <button className={styles.close} onClick={handleCrossAction}>
                <Cross style={crossIconStyle} />
              </button>
            )}
          </header>
          <SimpleBar className={styles.body}>{children}</SimpleBar>
          <footer></footer>
        </main>
      </section>
    </ClientOnlyPortal>
  );
};
