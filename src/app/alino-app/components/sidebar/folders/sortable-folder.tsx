"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
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
import { Checkbox } from "@/components/ui/Checkbox";
import { useSidebarSelectionStore } from "@/store/useSidebarSelectionStore";

import { ListCard } from "../list-card";
import { ConfigMenu } from "@/components/ui/ConfigMenu";
import { CounterAnimation } from "@/components/ui/CounterAnimation";
import { FolderInfoEdit } from "@/components/ui/folder-info-edit";

import { FolderType, ListsType } from "@/lib/schemas/database.types";
import { variants } from "../draggable-board/animations/variants";
import { useModalStore } from "@/store/useModalStore";

import { DeleteIcon, Edit, LoadingIcon } from "@/components/ui/icons/icons";
import { SidebarTooltip } from "@/components/ui/sidebar-tooltip";
import styles from "./SortableFolder.module.css";

const EDIT_ICON = <Edit className={styles.iconAction} />;
const DELETE_ICON = <DeleteIcon className={styles.iconAction} />;

interface SortableFolderProps {
  folder: FolderType;
  lists: ListsType[] | null;
  isDragging?: boolean;
  dropAllowed?: boolean;
}

export const SortableFolder = memo(function SortableFolder({
  folder,
  lists,
  isDragging = false,
  dropAllowed = true,
}: SortableFolderProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [isNameChange, setIsNameChange] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string | null>(
    folder.folder_color
  );

  const divRef = useRef<HTMLDivElement | null>(null);
  const folderContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const openConfirmationModal = useModalStore((s) => s.open);
  const { deleteFolder } = useDeleteFolder();
  const { deleteFolderWithContents } = useDeleteFolderWithContents();
  const isMobile = usePlatformInfoStore((state) => state.isMobile);
  const animations = useUserPreferencesStore((state) => state.animations);
  const sidebarCollapsed = useUserPreferencesStore(
    (state) => state.sidebarCollapsed
  );

  const isSelectionMode = useSidebarSelectionStore((s) => s.isSelectionMode);
  const selectedItems = useSidebarSelectionStore((s) => s.selectedItems);
  const toggleItemSelection = useSidebarSelectionStore(
    (s) => s.toggleItemSelection
  );
  const startSelectionMode = useSidebarSelectionStore(
    (s) => s.startSelectionMode
  );

  const isSelected = selectedItems.some((x) => x.id === folder.folder_id);

  const { fetchListsPage } = useFetchListsPage();
  const fetchListsPageRef = useRef(fetchListsPage);
  useEffect(() => {
    fetchListsPageRef.current = fetchListsPage;
  }, [fetchListsPage]);

  const folderPagination = useTodoDataStore(
    (state) => state.listsPagination[folder.folder_id]
  );
  const isFetchingFolderLists = useTodoDataStore(
    (state) => state.fetchingListsQueue[folder.folder_id]
  );

  const hasFetched = !!folderPagination;

  const listsCount = useMemo(() => {
    return Array.isArray(folder.memberships) && folder.memberships.length > 0
      ? folder.memberships[0].count
      : 0;
  }, [folder.memberships]);

  const listIds = useMemo(
    () => lists?.map((item) => item.list_id),
    [lists]
  );

  const isHoveringRef = useRef(false);
  const [containsOver, setContainsOver] = useState(false);

  useDndMonitor({
    onDragOver: (event) => {
      const isOver = event.over?.id === `folder-${folder.folder_id}-dropzone`;
      if (isOver && !isHoveringRef.current) {
        isHoveringRef.current = true;
        setContainsOver(true);
      } else if (!isOver && isHoveringRef.current) {
        isHoveringRef.current = false;
        setContainsOver(false);
      }
    },
    onDragEnd: () => {
      isHoveringRef.current = false;
      setContainsOver(false);
    },
    onDragCancel: () => {
      isHoveringRef.current = false;
      setContainsOver(false);
    },
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
    disabled: isNameChange || isSelectionMode,
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

  useEffect(() => {
    if (open && !folderPagination) {
      fetchListsPage(folder.folder_id);
    }
  }, [open, folder.folder_id, folderPagination, fetchListsPage]);

  useEffect(() => {
    if (!open || !hasFetched || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const folderId = folder.folder_id;

    const tryFetch = () => {
      const { listsPagination, fetchingListsQueue } =
        useTodoDataStore.getState();
      const hasMore = listsPagination[folderId]?.hasMore ?? false;
      const isFetching = fetchingListsQueue[folderId] ?? false;
      if (!hasMore || isFetching) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      if (distanceFromBottom < 60) {
        fetchListsPageRef.current(folderId);
      }
    };
    tryFetch();

    container.addEventListener("scroll", tryFetch, { passive: true });

    const ro = new ResizeObserver(tryFetch);
    ro.observe(container);

    return () => {
      container.removeEventListener("scroll", tryFetch);
      ro.disconnect();
    };
  }, [open, hasFetched, folder.folder_id]);

  const dynamicStyle = useMemo(() => {
    let borderColor = "var(--border-container-color)";
    if (containsOver && !isCurrentlyDraggingThis) {
      borderColor = dropAllowed ? "#3ebb00" : "#ef4444";
    }

    return {
      transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
      transition: isCurrentlyDraggingThis || transform ? transition : undefined,
      pointerEvents: (isCurrentlyDraggingThis ? "none" : "auto") as React.CSSProperties["pointerEvents"],
      zIndex: isCurrentlyDraggingThis ? 99 : 1,
      opacity: isCurrentlyDraggingThis ? 0.3 : 1,
      border: `1px solid ${borderColor}`,
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
    if (!containsOver || isCurrentlyDraggingThis) return;

    const timer = setTimeout(() => {
      setOpen(true);
    }, 500);

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

  const handleStartMultiDelete = useCallback(() => {
    startSelectionMode({
      id: folder.folder_id,
      kind: "folder",
      name: folder.folder_name,
    });
  }, [startSelectionMode, folder]);

  const configOptions = useMemo(() => {
    return [
      {
        name: "Editar",
        icon: EDIT_ICON,
        action: handleInfoEdit,
        enabled: true,
      },
      {
        name: "Eliminar múltiple",
        icon: DELETE_ICON,
        action: handleStartMultiDelete,
        enabled: true,
        variant: "critical" as const,
      },
      {
        name: "Eliminar",
        icon: DELETE_ICON,
        action: handleConfirm,
        enabled: true,
        variant: "critical" as const,
      },
    ].filter((bs) => bs.enabled);
  }, [handleInfoEdit, handleConfirm, handleStartMultiDelete]);

  useEffect(() => {
    if (isNameChange) {
      document.getElementById("folder-info-edit-container")?.focus();
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
      if (isSelectionMode) {
        toggleItemSelection({
          id: folder.folder_id,
          kind: "folder",
          name: folder.folder_name,
        });
        return;
      }
      if (!isNameChange) {
        setOpen((prev) => !prev);
      }
    },
    [isNameChange, isSelectionMode, folder, toggleItemSelection]
  );

  return (
    <div
      ref={(node) => {
        setSortableNodeRef(node);
        folderContainerRef.current = node;
      }}
      data-folder-container="true"
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

      <SidebarTooltip
        label={folder.folder_name}
        enabled={sidebarCollapsed && !isMobile}
        containerRef={folderContainerRef}
      >
        {({ triggerRef, onMouseEnter, onMouseLeave }) => (
          <motion.div
            className={styles.folderHeader}
            {...listeners}
            {...attributes}
            ref={(node) => {
              (triggerRef as React.MutableRefObject<HTMLElement | null>).current =
                node;
              divRef.current = node;
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={toggleOpen}
          >
            <AnimatePresence>
              {isSelectionMode && (
                <motion.div
                  initial={{ width: 0, opacity: 0, marginRight: -7 }}
                  animate={{ width: 24, opacity: 1, marginRight: 0 }}
                  exit={{ width: 0, opacity: 0, marginRight: -7 }}
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                  style={{ overflow: "hidden", flexShrink: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleItemSelection({
                      id: folder.folder_id,
                      kind: "folder",
                      name: folder.folder_name,
                    });
                  }}
                >
                  <div className={styles.checkboxContainer}>
                    <Checkbox status={isSelected} handleUpdateStatus={() => { }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={styles.infoEditContainer}>
              <FolderInfoEdit
                folder={folder}
                isNameChange={isNameChange}
                setIsNameChange={setIsNameChange}
                colorTemp={colorTemp}
                setColorTemp={setColorTemp}
                folderOpen={open}
                hideText={!isMobile && sidebarCollapsed}
              />
            </div>

            {!isNameChange && (
              <section className={styles.buttonsContainer}>
                {isMobile ? (
                  <section className={styles.rightButtonsMobile}>
                    {!isSelectionMode && (
                      <div className={styles.moreConfigMenuMobile}>
                        <ConfigMenu
                          iconWidth="23px"
                          configOptions={configOptions}
                          idScrollArea="list-container"
                          uniqueId={`folder-config-${folder.folder_id}`}
                        />
                      </div>
                    )}
                    <div className={styles.counterMobile}>
                      <CounterAnimation tasksLength={listsCount} />
                    </div>
                  </section>
                ) : (
                  <>
                    <div
                      className={styles.moreConfigMenu}
                      style={
                        isSelectionMode
                          ? { pointerEvents: "none", opacity: 0 }
                          : undefined
                      }
                    >
                      <ConfigMenu
                        iconWidth="23px"
                        configOptions={configOptions}
                        idScrollArea="list-container"
                        uniqueId={`folder-config-${folder.folder_id}`}
                      />
                    </div>
                    <div
                      className={styles.counter}
                      style={isSelectionMode ? { opacity: 1 } : undefined}
                    >
                      <CounterAnimation tasksLength={listsCount} />
                    </div>
                  </>
                )}
              </section>
            )}
          </motion.div>
        )}
      </SidebarTooltip>

      {open && (
        <motion.div
          key={`folder-lists-${folder.folder_id}`}
          ref={scrollContainerRef}
          layout="position"
          layoutDependency={open}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`${styles.listWrapper} ${isDragging ? styles.draggingActive : ""
            }`}
          style={{ maxHeight: sidebarCollapsed ? "220px" : "250px" }}
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
                        layout={!isDragging ? "position" : false}
                        className={styles.motionListWrapper}
                      >
                        <ListCard list={list} inFolder />
                      </motion.div>
                    ))
                  ) : !isFetchingFolderLists ? (
                    <p className={styles.emptyIndicator}>Arrastra una lista aquí</p>
                  ) : null}

                  {isFetchingFolderLists && (
                    <div className={styles.loadingContainer}>
                      <LoadingIcon className={styles.loadingIcon} />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </SortableContext>
        </motion.div>
      )}
    </div>
  );
});
