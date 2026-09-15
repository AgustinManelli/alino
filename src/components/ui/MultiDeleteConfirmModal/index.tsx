"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { ClientOnlyPortal } from "../ClientOnlyPortal";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import {
  ChevronDown,
  FolderClosed,
  SquircleIcon,
} from "@/components/ui/icons/icons";
import { EmojiMartComponent } from "@/components/ui/EmojiMart/emoji-mart-component";
import styles from "./MultiDeleteConfirmModal.module.css";

interface SelectionItem {
  id: string;
  kind: "list" | "folder";
  parentFolderId?: string | null;
  name: string;
}

interface Props {
  selectedItems: SelectionItem[];
  onConfirm: (
    folderOptions: {
      folderId: string;
      option: "keep_lists" | "delete_contents";
    }[]
  ) => void;
  onClose: () => void;
}

export const MultiDeleteConfirmModal = ({
  selectedItems,
  onConfirm,
  onClose,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const lists = useTodoDataStore((state) => state.lists);
  const folders = useTodoDataStore((state) => state.folders);

  const selectedFolders = useMemo(
    () => selectedItems.filter((x) => x.kind === "folder"),
    [selectedItems]
  );

  const [folderOptions, setFolderOptions] = useState<
    Record<string, "keep_lists" | "delete_contents">
  >(() => {
    const initial: Record<string, "keep_lists" | "delete_contents"> = {};
    for (const f of selectedFolders) {
      initial[f.id] = "delete_contents";
    }
    return initial;
  });

  const handleFolderOptionChange = (
    folderId: string,
    value: "keep_lists" | "delete_contents"
  ) => {
    setFolderOptions((prev) => ({
      ...prev,
      [folderId]: value,
    }));
  };

  const handleAccept = useCallback(() => {
    const optionsArray = Object.entries(folderOptions).map(
      ([folderId, option]) => ({
        folderId,
        option,
      })
    );
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
          <section className={styles.modalHeader}>
            <p className={styles.modalTitle}>
              ¿Eliminar los elementos seleccionados?
            </p>
            <p className={styles.modalSubtitle}>
              Se {selectedItems.length === 1 ? "eliminará" : "eliminarán"}{" "}
              {selectedItems.length}{" "}
              {selectedItems.length === 1 ? "elemento" : "elementos"}.
            </p>
          </section>

          <div className={styles.itemsListContainer}>
            {selectedItems.map((item) => {
              if (item.kind === "folder") {
                const folderData = folders.find(
                  (f) => f.folder_id === item.id
                );
                const folderColor =
                  folderData?.folder_color ?? "var(--text-not-available)";
                const folderName = folderData?.folder_name ?? item.name;

                return (
                  <div key={item.id} className={styles.itemCard}>
                    <div className={styles.itemMain}>
                      <div className={styles.iconBox}>
                        <FolderClosed
                          style={{
                            stroke: folderColor,
                            width: "16px",
                            height: "16px",
                            strokeWidth: 2,
                          }}
                        />
                      </div>
                      <span className={styles.itemName} title={folderName}>
                        {folderName}
                      </span>
                    </div>

                    <div className={styles.selectWrapper}>
                      <select
                        className={styles.select}
                        value={folderOptions[item.id] || "delete_contents"}
                        onChange={(e) =>
                          handleFolderOptionChange(
                            item.id,
                            e.target.value as
                              | "keep_lists"
                              | "delete_contents"
                          )
                        }
                      >
                        <option value="delete_contents">
                          Eliminar contenido
                        </option>
                        <option value="keep_lists">Mantener listas</option>
                      </select>
                      <ChevronDown className={styles.selectChevron} />
                    </div>
                  </div>
                );
              }

              const listData = lists.find((l) => l.list_id === item.id);
              const listName = listData?.list?.list_name ?? item.name;
              const listIcon = listData?.list?.icon;
              const listColor =
                listData?.list?.color ?? "var(--alino-primary-color)";

              return (
                <div key={item.id} className={styles.itemCard}>
                  <div className={styles.itemMain}>
                    <div className={styles.iconBox}>
                      {listIcon ? (
                        <EmojiMartComponent shortcodes={listIcon} size={16} />
                      ) : (
                        <SquircleIcon
                          style={{
                            fill: listColor,
                            width: "12px",
                            height: "12px",
                          }}
                        />
                      )}
                    </div>
                    <span className={styles.itemName} title={listName}>
                      {listName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <section className={styles.modalButtons}>
            <button
              className={styles.modalButton}
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className={`${styles.modalButton} ${styles.deleteButton}`}
              onClick={handleAccept}
              type="button"
            >
              Eliminar
            </button>
          </section>
        </div>
      </motion.div>
    </ClientOnlyPortal>
  );
};
