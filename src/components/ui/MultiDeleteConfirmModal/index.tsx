"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { ClientOnlyPortal } from "../ClientOnlyPortal";
import styles from "./MultiDeleteConfirmModal.module.css";

interface SelectionItem {
  id: string;
  kind: "list" | "folder";
  parentFolderId?: string | null;
  name: string;
}

interface Props {
  selectedItems: SelectionItem[];
  onConfirm: (folderOptions: { folderId: string; option: "keep_lists" | "delete_contents" }[]) => void;
  onClose: () => void;
}

export const MultiDeleteConfirmModal = ({
  selectedItems,
  onConfirm,
  onClose,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  const selectedFolders = selectedItems.filter((x) => x.kind === "folder");

  const [folderOptions, setFolderOptions] = useState<Record<string, "keep_lists" | "delete_contents">>(() => {
    const initial: Record<string, "keep_lists" | "delete_contents"> = {};
    for (const f of selectedFolders) {
      initial[f.id] = "delete_contents";
    }
    return initial;
  });

  const handleFolderOptionChange = (folderId: string, value: "keep_lists" | "delete_contents") => {
    setFolderOptions((prev) => ({
      ...prev,
      [folderId]: value,
    }));
  };

  const handleAccept = useCallback(() => {
    const optionsArray = Object.entries(folderOptions).map(([folderId, option]) => ({
      folderId,
      option,
    }));
    onConfirm(optionsArray);
    onClose();
  }, [folderOptions, onConfirm, onClose]);

  useOnClickOutside(ref, onClose);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <ClientOnlyPortal>
      <motion.div
        className={`${styles.modalBackground} ignore-sidebar-close`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.2 } }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
      >
        <div className={styles.modalContainer} ref={ref}>
          <section className={styles.modalText}>
            <p className={styles.modalTitle}>¿Eliminar los elementos seleccionados?</p>
            <p className={styles.modalSubtitle}>
              Se eliminarán {selectedItems.length} {selectedItems.length === 1 ? "elemento" : "elementos"}.
            </p>

            <div className={styles.itemsListContainer}>
              {selectedItems.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemIcon}>{item.kind === "folder" ? "📁" : "📄"}</span>
                    <span className={styles.itemName}>{item.name}</span>
                  </div>
                  {item.kind === "folder" && (
                    <select
                      className={styles.select}
                      value={folderOptions[item.id] || "delete_contents"}
                      onChange={(e) =>
                        handleFolderOptionChange(item.id, e.target.value as "keep_lists" | "delete_contents")
                      }
                    >
                      <option value="delete_contents">Eliminar contenido</option>
                      <option value="keep_lists">Mantener listas</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className={styles.modalButtons}>
            <button className={styles.modalButton} onClick={onClose}>
              Cancelar
            </button>
            <button
              className={`${styles.modalButton} ${styles.delete}`}
              onClick={handleAccept}
            >
              Eliminar
            </button>
          </section>
        </div>
      </motion.div>
    </ClientOnlyPortal>
  );
};
