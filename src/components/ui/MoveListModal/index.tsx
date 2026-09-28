"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { ClientOnlyPortal } from "../ClientOnlyPortal";
import { ListsType } from "@/lib/schemas/database.types";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useUpdateIndexList } from "@/hooks/todo/lists/useUpdateIndexList";
import { calculateNewRank } from "@/lib/lexorank";
import { FolderClosed } from "@/components/ui/icons/icons";
import { Checkbox } from "@/components/ui/Checkbox";
import { customToast } from "@/lib/toasts";
import styles from "./MoveListModal.module.css";

interface Props {
  list: ListsType;
  onClose: () => void;
}

export const MoveListModal: React.FC<Props> = ({ list, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const folders = useTodoDataStore((state) => state.folders);
  const lists = useTodoDataStore((state) => state.lists);
  const { updateIndexList } = useUpdateIndexList();

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    list.folder
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rootListsCount = useMemo(
    () => lists.filter((l) => l.folder === null).length,
    [lists]
  );

  const folderCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of lists) {
      if (l.folder) {
        map.set(l.folder, (map.get(l.folder) || 0) + 1);
      }
    }
    return map;
  }, [lists]);

  const handleMove = useCallback(
    async (targetFolderId: string | null) => {
      if (list.folder === targetFolderId) {
        onClose();
        return;
      }

      try {
        setIsSubmitting(true);
        const targetLists = lists.filter((l) => l.folder === targetFolderId);
        const newRank = calculateNewRank(targetLists, []);

        await updateIndexList(
          list.list_id,
          targetFolderId,
          newRank,
          list.folder
        );

        const folderName = targetFolderId
          ? folders.find((f) => f.folder_id === targetFolderId)?.folder_name ??
          "carpeta"
          : "raíz";

        customToast.success(`Lista movida a ${folderName}`);
        onClose();
      } catch (err) {
        console.error(err);
        customToast.error("Error al mover la lista");
      } finally {
        setIsSubmitting(false);
      }
    },
    [list.folder, list.list_id, lists, folders, updateIndexList, onClose]
  );

  useOnClickOutside(ref, onClose);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (
        e.key === "Enter" &&
        selectedFolderId !== list.folder &&
        !isSubmitting
      ) {
        e.preventDefault();
        handleMove(selectedFolderId);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, selectedFolderId, list.folder, isSubmitting, handleMove]);

  const isRootSelected = selectedFolderId === null;
  const isRootCurrent = list.folder === null;

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
            <p className={styles.modalTitle}>Mover lista</p>
            <p className={styles.modalSubtitle}>
              Selecciona la carpeta de destino para{" "}
              <span className={styles.listHighlight}>
                &ldquo;{list.list.list_name}&rdquo;
              </span>
              .
            </p>
          </section>

          <div className={styles.itemsListContainer}>
            {/* Root Option */}
            <div
              role="button"
              tabIndex={0}
              className={`${styles.itemCard} ${isRootSelected ? styles.itemCardSelected : ""
                }`}
              onClick={() => setSelectedFolderId(null)}
              onDoubleClick={() => handleMove(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedFolderId(null);
                }
              }}
            >
              <div className={styles.itemMain}>
                <div className={styles.iconBox}>
                  <FolderClosed
                    style={{
                      stroke: "var(--text-not-available)",
                      width: "16px",
                      height: "16px",
                      strokeWidth: 2,
                    }}
                  />
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemNameRow}>
                    <span className={styles.itemName}>Sin carpeta (Raíz)</span>
                    {isRootCurrent && (
                      <span className={styles.currentBadge}>Actual</span>
                    )}
                  </div>
                  <span className={styles.itemMeta}>
                    {rootListsCount}{" "}
                    {rootListsCount === 1 ? "lista" : "listas"}
                  </span>
                </div>
              </div>

              <div
                className={styles.checkboxContainer}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Checkbox
                  status={isRootSelected}
                  handleUpdateStatus={() => setSelectedFolderId(null)}
                  ariaLabel="Seleccionar destino raíz"
                />
              </div>
            </div>

            {folders.map((folder) => {
              const isSelected = selectedFolderId === folder.folder_id;
              const isCurrent = list.folder === folder.folder_id;
              const count = folderCounts.get(folder.folder_id) ?? 0;
              const folderColor =
                folder.folder_color ?? "var(--alino-primary-color)";

              return (
                <div
                  key={folder.folder_id}
                  role="button"
                  tabIndex={0}
                  className={`${styles.itemCard} ${isSelected ? styles.itemCardSelected : ""
                    }`}
                  onClick={() => setSelectedFolderId(folder.folder_id)}
                  onDoubleClick={() => handleMove(folder.folder_id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedFolderId(folder.folder_id);
                    }
                  }}
                >
                  <div className={styles.itemMain}>
                    <div
                      className={styles.iconBox}
                      style={{
                        backgroundColor: folder.folder_color
                          ? `${folder.folder_color}18`
                          : "var(--background-container)",
                        borderColor: folder.folder_color
                          ? `${folder.folder_color}35`
                          : "var(--border-container-color)",
                      }}
                    >
                      <FolderClosed
                        style={{
                          stroke: folderColor,
                          width: "16px",
                          height: "16px",
                          strokeWidth: 2,
                        }}
                      />
                    </div>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemNameRow}>
                        <span
                          className={styles.itemName}
                          title={folder.folder_name}
                        >
                          {folder.folder_name}
                        </span>
                        {isCurrent && (
                          <span className={styles.currentBadge}>Actual</span>
                        )}
                      </div>
                      <span className={styles.itemMeta}>
                        {count} {count === 1 ? "lista" : "listas"}
                      </span>
                    </div>
                  </div>

                  <div
                    className={styles.checkboxContainer}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Checkbox
                      status={isSelected}
                      handleUpdateStatus={() =>
                        setSelectedFolderId(folder.folder_id)
                      }
                      ariaLabel={`Seleccionar carpeta ${folder.folder_name}`}
                    />
                  </div>
                </div>
              );
            })}

            {folders.length === 0 && (
              <div className={styles.emptyNote}>
                No tienes carpetas creadas. Crea una carpeta desde la barra
                lateral para organizar tus listas.
              </div>
            )}
          </div>

          <section className={styles.modalButtons}>
            <button
              className={styles.modalButton}
              onClick={onClose}
              type="button"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              className={`${styles.modalButton} ${styles.moveButton}`}
              onClick={() => handleMove(selectedFolderId)}
              type="button"
              disabled={selectedFolderId === list.folder || isSubmitting}
            >
              {isSubmitting ? "Moviendo..." : "Mover"}
            </button>
          </section>
        </div>
      </motion.div>
    </ClientOnlyPortal>
  );
};
