"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useDeleteFolder } from "@/hooks/todo/folders/useDeleteFolder";
import { useDeleteFolderWithContents } from "@/hooks/todo/folders/useDeleteFolderWithContents";
import { useFetchListsPage } from "@/hooks/todo/lists/useFetchListsPage";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

import { ListCard } from "../list-card";
import { ConfigMenu } from "@/components/ui/ConfigMenu";
import { CounterAnimation } from "@/components/ui/CounterAnimation";
import { FolderInfoEdit } from "@/components/ui/folder-info-edit";

import { FolderType, ListsType } from "@/lib/schemas/database.types";

import { variants } from "../draggable-board/animations/variants";
import {
  ArrowThin,
  DeleteIcon,
  Edit,
  Pin,
  Unpin,
  LoadingIcon,
} from "@/components/ui/icons/icons";
import styles from "./SortableFolder.module.css";
import { useModalStore } from "@/store/useModalStore";

interface SortableFolderProps {
  folder: FolderType;
  lists: ListsType[] | null;
  isDragging: boolean;
  dropAllowed?: boolean;
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

  const openConfirmationModal = useModalStore((s) => s.open);
  const { deleteFolder } = useDeleteFolder();
  const { deleteFolderWithContents } = useDeleteFolderWithContents();
  const isMobile = usePlatformInfoStore((state) => state.isMobile);
  const animations = useUserPreferencesStore((state) => state.animations);

  const { fetchListsPage } = useFetchListsPage();
  const folderPagination = useTodoDataStore(
    (state) => state.listsPagination[folder.folder_id],
  );
  const isFetchingFolderLists = useTodoDataStore(
    (state) => state.fetchingListsQueue[folder.folder_id],
  );

  const listIds = useMemo(() => lists?.map((list) => list.list_id), [lists]);
  const hasFetched = !!folderPagination;

  const listsCount =
    Array.isArray(folder.memberships) && folder.memberships.length > 0
      ? folder.memberships[0].count
      : 0;

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

  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `folder-${folder.folder_id}-dropzone`,
    data: {
      type: "folder-dropzone",
      accepts: ["item"],
      folderId: folder.folder_id,
    },
  });

  const dynamicStyle = useMemo(() => {
    const borderStyle = dropAllowed
      ? containsOver && !isCurrentlyDraggingThis
        ? "1px solid #3ebb00"
        : "1px solid var(--border-container-color)"
      : containsOver && !isCurrentlyDraggingThis
        ? "1px solid #ef4444"
        : "1px solid var(--border-container-color)";

    return {
      transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
      transition,
      pointerEvents: isCurrentlyDraggingThis ? "none" : ("auto" as any),
      zIndex: isCurrentlyDraggingThis ? 99 : 1,
      opacity: isCurrentlyDraggingThis ? 0.3 : 1,
      border: borderStyle,
      "--bgColor": colorTemp ?? "transparent",
    };
  }, [
    transform,
    transition,
    isCurrentlyDraggingThis,
    dropAllowed,
    containsOver,
    colorTemp,
  ]);

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

  const handleDeleteWithContents = useCallback(() => {
    deleteFolderWithContents(folder.folder_id);
  }, [deleteFolderWithContents, folder.folder_id]);

  const handleConfirm = useCallback(() => {
    openConfirmationModal({
      type: "confirmation",
      props: {
        text: `¿Eliminar la carpeta "${folder.folder_name}"?`,
        additionalText:
          "Podés eliminar solo la carpeta (las listas quedan sueltas) o eliminarla junto con todas sus listas y tareas.",
        actionButton: "Solo la carpeta",
        onConfirm: handleDelete,
        secondaryAction: {
          label: "Carpeta y todo su contenido",
          onConfirm: handleDeleteWithContents,
        },
      },
    });
  }, [
    openConfirmationModal,
    folder.folder_name,
    handleDelete,
    handleDeleteWithContents,
  ]);

  const handleInfoEdit = useCallback(() => {
    setIsNameChange(true);
  }, []);

  const configOptions = useMemo(() => {
    const baseOptions = [
      {
        name: "Editar",
        icon: <Edit className={styles.iconAction} />,
        action: handleInfoEdit,
        enabled: true,
      },
      {
        name: "Fijar",
        icon: false ? (
          <Unpin className={styles.iconAction} />
        ) : (
          <Pin className={styles.iconAction} />
        ),
        action: () => {},
        enabled: false,
      },
      {
        name: "Eliminar",
        icon: <DeleteIcon className={styles.iconAction} />,
        action: handleConfirm,
        enabled: true,
      },
    ];
    return baseOptions.filter((bs) => bs.enabled);
  }, [handleInfoEdit, handleConfirm]);

  useEffect(() => {
    if (isNameChange) {
      const input = document.getElementById("folder-info-edit-container");
      if (input) input.focus();
    }
  }, [isNameChange]);

  useOnClickOutside(divRef, (e) => {
    const target = e.target as HTMLElement;
    if (
      target.closest(".color-picker-portal") ||
      target.closest(".config-menu-portal")
    ) {
      return;
    }
    setIsNameChange(false);
    setColorTemp(folder.folder_color);
  });

  const toggleOpen = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isNameChange) return;
      setOpen((prev) => !prev);
    },
    [isNameChange],
  );

  return (
    <div
      ref={setSortableNodeRef}
      className={styles.folderContainer}
      style={dynamicStyle}
      data-open={open}
    >
      <div
        id={`folder-${folder.folder_id}-dropzone`}
        ref={setDroppableNodeRef}
        data-dropzone="folder"
        className={styles.folderDropOverlay}
        style={{ pointerEvents: isDragging ? "auto" : "none" }}
      />
      <motion.div
        className={styles.folderHeader}
        {...listeners}
        {...attributes}
        ref={divRef}
        onClick={toggleOpen}
        // layout
      >
        <div className={styles.button}>
          <ArrowThin
            className={open ? styles.arrowIconOpen : styles.arrowIconClosed}
            style={{ stroke: colorTemp ?? "var(--text-not-available)" }}
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
                    iconWidth="23px"
                    configOptions={configOptions}
                    idScrollArea="list-container"
                    uniqueId={`folder-config-${folder.folder_id}`}
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
                    iconWidth="23px"
                    configOptions={configOptions}
                    idScrollArea="list-container"
                    uniqueId={`folder-config-${folder.folder_id}`}
                  />
                </div>
                <div className={styles.counter}>
                  <CounterAnimation tasksLength={listsCount} />
                </div>
              </>
            )}
          </section>
        )}
      </motion.div>
      {open && (
        <motion.div
          key={`folder-lists-${folder.folder_id}`}
          ref={scrollContainerRef}
          layout="size"
          layoutDependency={open}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`${styles.listWrapper} ${isDragging ? styles.draggingActive : ""}`}
          style={{ maxHeight: "250px" }}
        >
          <SortableContext
            items={hasFetched ? listIds || [] : []}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence mode="wait">
              {!hasFetched ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={styles.loadingContainer}
                >
                  <LoadingIcon className={styles.loadingIcon} />
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={styles.motionListWrapper}
                >
                  {lists && lists.length > 0 ? (
                    lists.map((list, index) => (
                      <motion.div
                        key={list.list_id}
                        custom={index}
                        variants={animations ? variants : undefined}
                        initial="initial"
                        animate="visible"
                        exit="exit"
                        layout={!isDragging}
                        className={styles.motionListWrapper}
                      >
                        <ListCard list={list} inFolder />
                      </motion.div>
                    ))
                  ) : !isFetchingFolderLists ? (
                    <p className={styles.emptyIndicator}>
                      Arrastra una lista aquí
                    </p>
                  ) : null}

                  {isFetchingFolderLists && (
                    <div className={styles.loadingContainer}>
                      <LoadingIcon className={styles.loadingIcon} />
                    </div>
                  )}

                  {folderPagination?.hasMore && (
                    <div ref={sentinelRef} className={styles.sentinel} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </SortableContext>
        </motion.div>
      )}
    </div>
  );
};
