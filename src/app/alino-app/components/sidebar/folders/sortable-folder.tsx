import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FolderType, ListsType } from "@/lib/schemas/database.types";
import { ListCard } from "../list-card";
import styles from "./SortableFolder.module.css";
interface SortableFolderProps {
  folder: FolderType;
  lists: ListsType[] | null;
  isDragging: boolean;
  dropAllowed?: boolean;
}
import {
  ArrowThin,
  DeleteIcon,
  Edit,
  Pin,
  Unpin,
  LoadingIcon,
} from "@/components/ui/icons/icons";
import { ConfigMenu } from "@/components/ui/ConfigMenu";
import { useConfirmationModalStore } from "@/store/useConfirmationModalStore";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { CounterAnimation } from "@/components/ui/CounterAnimation";
import { FolderInfoEdit } from "@/components/ui/folder-info-edit";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { motion } from "motion/react";
import { variants } from "../draggable-board/animations/variants";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

function readFolderMembershipCount(
  folder: FolderType,
  lists: ListsType[],
): number {
  const payload = folder.memberships;
  if (Array.isArray(payload) && payload.length > 0) {
    return payload[0].count;
  }
  return lists.filter((l) => l.folder === folder.folder_id).length;
}

export const SortableFolder = ({
  folder,
  lists,
  isDragging,
  dropAllowed = true,
}: SortableFolderProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [containsOver, setContainsOver] = useState<boolean>(false);
  const [isNameChange, setIsNameChange] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string | null>(
    folder.folder_color,
  );

  const openModal = useConfirmationModalStore((state) => state.openModal);
  const deleteFolder = useTodoDataStore((state) => state.deleteFolder);
  const isMobile = usePlatformInfoStore((state) => state.isMobile);
  const animations = useUserPreferencesStore((state) => state.animations);

  const fetchListsPage = useTodoDataStore((state) => state.fetchListsPage);
  const folderPagination = useTodoDataStore(
    (state) => state.listsPagination[folder.folder_id],
  );
  const isFetchingFolderLists = useTodoDataStore(
    (state) => state.fetchingListsQueue[folder.folder_id],
  );

  const listIds = useMemo(() => lists?.map((list) => list.list_id), [lists]);

  const hasFetched = !!folderPagination;

  const listsCount = useMemo(() => {
    return readFolderMembershipCount(folder, lists ?? []);
  }, [lists, folder]);

  const divRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && !folderPagination) {
      fetchListsPage(folder.folder_id);
    }
  }, [open, folder.folder_id, folderPagination, fetchListsPage]);

  useEffect(() => {
    if (!open || !sentinelRef.current || !scrollContainerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && folderPagination?.hasMore) {
          fetchListsPage(folder.folder_id);
        }
      },
      { root: scrollContainerRef.current, rootMargin: "100px", threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [open, folderPagination, folder.folder_id, fetchListsPage]);

  useDndMonitor({
    onDragOver: (event) => {
      const overId = event.over?.id as string | undefined;

      if (!overId) {
        setContainsOver(false);
        return;
      }
      if (
        listIds?.includes(overId) ||
        overId === `folder-${folder.folder_id}-dropzone`
      ) {
        setContainsOver(true);
      } else {
        setContainsOver(false);
      }
    },
    onDragEnd: () => setContainsOver(false),
    onDragCancel: () => setContainsOver(false),
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging: isCurrentlyDraggingThis,
  } = useSortable({
    id: folder.folder_id,
    data: {
      type: "folder",
      item: folder,
    },
  });

  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: `folder-${folder.folder_id}-dropzone`,
    data: {
      type: "folder-dropzone",
      accepts: ["item"],
      folderId: folder.folder_id,
    },
  });

  const style = {
    transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
    transition,
    pointerEvents: isCurrentlyDraggingThis ? "none" : "auto",
    zIndex: isCurrentlyDraggingThis ? 99 : 1,
    opacity: isCurrentlyDraggingThis ? 0.3 : 1,
    border: dropAllowed
      ? containsOver && !isCurrentlyDraggingThis
        ? "1px solid #3ebb00"
        : "1px solid var(--border-container-color)"
      : containsOver && !isCurrentlyDraggingThis
        ? "1px solid #ef4444"
        : "1px solid var(--border-container-color)",
    "--bgColor": colorTemp ?? "transparent",
  } as CSSProperties;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (containsOver && !isCurrentlyDraggingThis) {
      timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [containsOver, isCurrentlyDraggingThis]);

  const handleDelete = useCallback(() => {
    deleteFolder(folder.folder_id);
  }, [deleteFolder, folder.folder_id]);

  const handleConfirm = useCallback(() => {
    openModal({
      text: `¿Desea eliminar la carpeta "${folder.folder_name}"?`,
      onConfirm: handleDelete,
      additionalText:
        "Esta acción es irreversible, pero tranquilo, tus listas no se eliminan.",
    });
  }, [openModal, folder.folder_name, handleDelete]);

  const handleInfoEdit = useCallback(() => {
    setIsNameChange(true);
  }, []);

  const configOptions = useMemo(() => {
    const baseOptions = [
      {
        name: "Editar",
        icon: <Edit style={iconStyle} />,
        action: handleInfoEdit,
        enabled: true,
      },
      {
        name: "Fijar",
        icon: false ? <Unpin style={iconStyle} /> : <Pin style={iconStyle} />,
        action: () => {},
        enabled: false,
      },
      {
        name: "Eliminar",
        icon: <DeleteIcon style={iconStyle} />,
        action: handleConfirm,
        enabled: true,
      },
    ];
    return baseOptions.filter((bs) => bs.enabled);
  }, [handleInfoEdit, handleConfirm]);

  useEffect(() => {
    const input = document.getElementById("folder-info-edit-container");
    if (input) {
      input.focus();
    }
  }, [isNameChange]);

  useOnClickOutside(divRef, () => {
    const colorPickerContainer = document.getElementById(
      "color-picker-container-folder",
    );
    if (colorPickerContainer) return;
    setIsNameChange(false);
    setColorTemp(folder.folder_color);
  });

  return (
    <div
      ref={setSortableNodeRef}
      className={styles.folderContainer}
      style={style}
      data-open={open}
    >
      <div
        id={`folder-${folder.folder_id}-dropzone`}
        ref={setDroppableNodeRef}
        data-dropzone="folder"
        className={styles.folderDropOverlay}
        style={{ pointerEvents: isDragging ? "auto" : "none" }}
      />
      <div
        className={styles.folderHeader}
        {...listeners}
        {...attributes}
        ref={divRef}
        onClick={(e) => {
          e.stopPropagation();
          if (isNameChange) return;
          setOpen((prev) => !prev);
        }}
      >
        <div className={styles.button}>
          <ArrowThin
            style={{
              stroke: colorTemp ?? "var(--text-not-available)",
              width: "15px",
              height: "15px",
              strokeWidth: 2,
              transform: open ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.1s ease-in-out",
            }}
          />
        </div>
        <div className={styles.infoEditContainer}>
          <FolderInfoEdit
            folder={folder}
            isNameChange={isNameChange}
            setIsNameChange={setIsNameChange}
            colorTemp={colorTemp}
            setColorTemp={setColorTemp}
            folderOpen={open}
          />
        </div>
        {!isNameChange && (
          <section className={styles.buttonsContainer}>
            {isMobile ? (
              <section className={styles.rightButtonsMobile}>
                <div className={styles.moreConfigMenuMobile}>
                  <ConfigMenu
                    iconWidth={"23px"}
                    configOptions={configOptions}
                    idScrollArea={"list-container"}
                    uniqueId={"navbar-list-card"}
                  />
                </div>
                <div className={styles.counterMobile}>
                  <CounterAnimation tasksLength={listsCount} />
                </div>
              </section>
            ) : (
              <>
                <div className={styles.moreConfigMenu}>
                  <ConfigMenu
                    iconWidth={"23px"}
                    configOptions={configOptions}
                    idScrollArea={"list-container"}
                    uniqueId={"navbar-list-card"}
                  />
                </div>
                <div className={styles.counter}>
                  <CounterAnimation tasksLength={listsCount} />
                </div>
              </>
            )}
          </section>
        )}
      </div>
      {open && (
        <div
          ref={scrollContainerRef}
          className={`${styles.listWrapper} ${isDragging ? styles.draggingActive : ""}`}
          style={{ maxHeight: "250px" }}
        >
          <SortableContext
            items={hasFetched ? listIds || [] : []}
            strategy={verticalListSortingStrategy}
          >
            {!hasFetched ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "15px 0",
                  width: "100%",
                }}
              >
                <LoadingIcon
                  style={{
                    width: "15px",
                    height: "auto",
                    stroke: "var(--text)",
                    strokeWidth: "2.5",
                  }}
                />
              </div>
            ) : (
              <>
                {lists && lists.length > 0 ? (
                  lists.map((list, index) => (
                    <motion.div
                      key={list.list_id}
                      custom={index}
                      variants={animations ? variants : undefined}
                      initial="initial"
                      animate="visible"
                      exit="exit"
                      layout={isDragging ? false : true}
                      style={{
                        width: "100%",
                      }}
                    >
                      <ListCard list={list} inFolder />
                    </motion.div>
                  ))
                ) : !isFetchingFolderLists ? (
                  <p>Arrastra una lista aquí</p>
                ) : null}

                {isFetchingFolderLists && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "15px 0",
                      width: "100%",
                    }}
                  >
                    <LoadingIcon
                      style={{
                        width: "15px",
                        height: "auto",
                        stroke: "var(--text)",
                        strokeWidth: "2.5",
                      }}
                    />
                  </div>
                )}

                {folderPagination?.hasMore && (
                  <div
                    ref={sentinelRef}
                    style={{ height: "1px", width: "100%" }}
                  />
                )}
              </>
            )}
          </SortableContext>
        </div>
      )}
    </div>
  );
};

const iconStyle = {
  width: "14px",
  height: "auto",
  stroke: "var(--text)",
  strokeWidth: 2,
};
