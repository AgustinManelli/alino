"use client";

import React, { useCallback } from "react";
import { WindowComponent } from "@/components/ui/WindowComponent";
import { ListsType } from "@/lib/schemas/database.types";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useUpdateIndexList } from "@/hooks/todo/lists/useUpdateIndexList";
import { calculateNewRank } from "@/lib/lexorank";
import { FolderClosed, Check } from "@/components/ui/icons/icons";
import { customToast } from "@/lib/toasts";
import styles from "./MoveListModal.module.css";

interface Props {
  list: ListsType;
  onClose: () => void;
}

export const MoveListModal: React.FC<Props> = ({ list, onClose }) => {
  const folders = useTodoDataStore((state) => state.folders);
  const lists = useTodoDataStore((state) => state.lists);
  const { updateIndexList } = useUpdateIndexList();

  const handleMove = useCallback(
    async (targetFolderId: string | null) => {
      if (list.folder === targetFolderId) {
        onClose();
        return;
      }

      const targetLists = lists.filter((l) => l.folder === targetFolderId);
      const newRank = calculateNewRank(targetLists, []);

      await updateIndexList(
        list.list_id,
        targetFolderId,
        newRank,
        list.folder
      );

      const folderName = targetFolderId
        ? folders.find((f) => f.folder_id === targetFolderId)?.folder_name ?? "carpeta"
        : "raíz";

      customToast.success(`Lista movida a ${folderName}`);
      onClose();
    },
    [list.folder, list.list_id, lists, folders, updateIndexList, onClose]
  );

  return (
    <WindowComponent
      windowTitle={`Mover "${list.list.list_name}"`}
      id="move-list-modal"
      crossAction={onClose}
      adaptative={{ width: "360px", maxWidth: "90vw" }}
    >
      <div className={styles.container}>
        <p className={styles.subtitle}>Selecciona el destino:</p>

        <div className={styles.optionsList}>
          <button
            type="button"
            className={`${styles.optionItem} ${list.folder === null ? styles.optionActive : ""}`}
            onClick={() => handleMove(null)}
          >
            <div className={styles.optionLeft}>
              <div className={styles.rootIconWrapper}>
                <FolderClosed style={{ width: "16px", height: "16px", stroke: "currentColor" }} />
              </div>
              <span className={styles.optionName}>Sin carpeta (Raíz)</span>
            </div>
            {list.folder === null && (
              <Check style={{ width: "16px", height: "16px", stroke: "var(--primary-color)" }} />
            )}
          </button>

          {folders.map((folder) => {
            const isCurrent = list.folder === folder.folder_id;
            return (
              <button
                key={folder.folder_id}
                type="button"
                className={`${styles.optionItem} ${isCurrent ? styles.optionActive : ""}`}
                onClick={() => handleMove(folder.folder_id)}
              >
                <div className={styles.optionLeft}>
                  <div
                    className={styles.folderIconWrapper}
                    style={{ color: folder.folder_color ?? "var(--primary-color)" }}
                  >
                    <FolderClosed style={{ width: "16px", height: "16px", stroke: "currentColor" }} />
                  </div>
                  <span className={styles.optionName}>{folder.folder_name}</span>
                </div>
                {isCurrent && (
                  <Check style={{ width: "16px", height: "16px", stroke: "var(--primary-color)" }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </WindowComponent>
  );
};
