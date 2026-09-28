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

import { useUpdatePinnedFolder } from "@/hooks/todo/folders/useUpdatePinnedFolder";
import { useInsertList } from "@/hooks/todo/lists/useInsertList";
import { ColorPicker } from "@/components/ui/ColorPicker/ListColorPicker";
import { hexColorSchema, shortcodeEmojiSchema } from "@/lib/schemas/list/validation";
import { customToast } from "@/lib/toasts";

import { FolderType, ListsType } from "@/lib/schemas/database.types";
import { variants } from "../draggable-board/animations/variants";
import { useModalStore } from "@/store/useModalStore";

import { DeleteIcon, Edit, LoadingIcon, Pin, Unpin, PlusBoxIcon, SendIcon } from "@/components/ui/icons/icons";
import { SidebarTooltip } from "@/components/ui/sidebar-tooltip";
import { compareRanks, calcRankForInsertion } from "@/lib/lexorank";
import styles from "./SortableFolder.module.css";

const EDIT_ICON = <Edit className={styles.iconAction} />;
const DELETE_ICON = <DeleteIcon className={styles.iconAction} />;
const PIN_ICON = <Pin className={styles.iconAction} />;
const UNPIN_ICON = <Unpin className={styles.iconAction} />;
const NEW_LIST_ICON = <PlusBoxIcon className={styles.iconAction} />;

const EMPTY_EXCLUDES: React.RefObject<HTMLElement>[] = [];

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
  const toggleItemSelection = useSidebarSelectionStore(
    (s) => s.toggleItemSelection
  );
  const startSelectionMode = useSidebarSelectionStore(
    (s) => s.startSelectionMode
  );

  const isSelected = useSidebarSelectionStore(
    useCallback(
      (s) => s.selectedItems.some((x) => x.id === folder.folder_id),
      [folder.folder_id],
    ),
  );

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

  const sortedLists = useMemo(() => {
    if (!lists || lists.length === 0) return lists;
    return [...lists].sort((a, b) =>
      compareRanks(
        { rank: a.rank, id: a.list_id },
        { rank: b.rank, id: b.list_id }
      )
    );
  }, [lists]);

  const listIds = useMemo(
    () => sortedLists?.map((item) => item.list_id),
    [sortedLists]
  );

  const isHoveringRef = useRef(false);
  const [containsOver, setContainsOver] = useState(false);

  const { updatePinnedFolder } = useUpdatePinnedFolder();
  const { insertList } = useInsertList();

  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListColor, setNewListColor] = useState<string>("#87189d");
  const [newListEmoji, setNewListEmoji] = useState<string | null>(null);
  const newListInputRef = useRef<HTMLInputElement | null>(null);
  const newListContainerRef = useRef<HTMLDivElement | null>(null);

  const handleSetNewListColor = useCallback(
    (newColor: string | null, isTyping?: boolean) => {
      if (isTyping) {
        setNewListColor(newColor || "#87189d");
        setNewListEmoji(null);
        return;
      }
      const validation = hexColorSchema.safeParse(newColor);
      if (!validation.success) {
        setNewListColor("#87189d");
        setNewListEmoji(null);
        customToast.error(validation.error.issues[0].message);
        return;
      }
      setNewListColor(newColor || "#87189d");
      newListInputRef.current?.focus();
    },
    []
  );

  const handleSetNewListEmoji = useCallback((newEmoji: string | null) => {
    const validation = shortcodeEmojiSchema.safeParse(newEmoji);
    if (!validation.success) {
      setNewListEmoji(null);
      customToast.error(validation.error.issues[0].message);
    } else {
      setNewListEmoji(newEmoji);
    }
    newListInputRef.current?.focus();
  }, []);

  const resetNewListColor = useCallback(() => {
    setNewListColor("#87189d");
    setNewListEmoji(null);
  }, []);

  const handlePin = useCallback(() => {
    updatePinnedFolder(folder.folder_id, !folder.pinned);
  }, [updatePinnedFolder, folder.folder_id, folder.pinned]);

  const handleStartNewList = useCallback(() => {
    if (!open) {
      setOpen(true);
    }
    setNewListName("");
    setNewListColor("#87189d");
    setNewListEmoji(null);
    setIsCreatingList(true);
    setTimeout(() => {
      newListInputRef.current?.focus();
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }, [open, setOpen]);

  const handleSaveNewList = useCallback(async () => {
    const formatText = newListName.replace(/\s+/g, " ").trim();
    if (!formatText || formatText.length > 30) return;
    const finalColor = newListColor || "#87189d";
    const finalEmoji = newListEmoji;
    setIsCreatingList(false);
    setNewListName("");
    setNewListColor("#87189d");
    setNewListEmoji(null);
    const topRank = calcRankForInsertion(sortedLists ?? [], 0);
    await insertList(formatText, finalColor, finalEmoji, folder.folder_id, topRank);
  }, [newListName, newListColor, newListEmoji, sortedLists, insertList, folder.folder_id]);

  const handleCancelNewList = useCallback(() => {
    setIsCreatingList(false);
    setNewListName("");
    setNewListColor("#87189d");
    setNewListEmoji(null);
  }, []);

  useOnClickOutside(
    newListContainerRef as React.RefObject<HTMLElement>,
    (e) => {
      if (!isCreatingList) return;
      const target = (e?.target instanceof Element
        ? e.target
        : (e?.target as Node)?.parentElement) as HTMLElement | null;
      if (
        target?.closest?.(
          ".color-picker-portal, .emoji-mart-picker, .ignore-sidebar-close, [id*='color-picker-container']"
        )
      ) {
        return;
      }
      handleCancelNewList();
    },
    EMPTY_EXCLUDES,
    "ignore-sidebar-close"
  );

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
    disabled: isNameChange || isSelectionMode || folder.pinned,
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
      if (scrollTop + clientHeight >= scrollHeight - 40) {
        fetchListsPage(folderId);
      }
    };

    container.addEventListener("scroll", tryFetch, { passive: true });
    return () => container.removeEventListener("scroll", tryFetch);
  }, [open, hasFetched, fetchListsPage, folder.folder_id]);

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

  const handleDeleteWithContents = useCallback(async () => {
    deleteFolderWithContents(folder.folder_id);
  }, [deleteFolderWithContents, folder.folder_id]);

  const handleDelete = useCallback(async () => {
    deleteFolder(folder.folder_id);
  }, [deleteFolder, folder.folder_id]);

  const handleConfirm = useCallback(() => {
    openConfirmationModal({
      type: "confirmation",
      props: {
        text: `¿Eliminar "${folder.folder_name}"?`,
        additionalText:
          "¿Deseas eliminar la carpeta conservando las listas o eliminar todo su contenido?",
        actionButton: "Conservar listas",
        onConfirm: handleDelete,
        secondaryAction: {
          label: "Eliminar todo",
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
        name: folder.pinned ? "Desfijar" : "Fijar",
        icon: folder.pinned ? UNPIN_ICON : PIN_ICON,
        action: handlePin,
        enabled: true,
      },
      {
        name: "Nueva lista",
        icon: NEW_LIST_ICON,
        action: handleStartNewList,
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
  }, [
    handleStartNewList,
    handleInfoEdit,
    handlePin,
    folder.pinned,
    handleConfirm,
    handleStartMultiDelete,
  ]);

  useEffect(() => {
    if (isNameChange) {
      document.getElementById(`folder-info-edit-container-${folder.folder_id}`)?.focus();
    }
  }, [isNameChange, folder.folder_id]);

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

  const folderContent = (
    <div
      ref={setSortableNodeRef}
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

      <motion.div
        className={styles.folderHeader}
        {...listeners}
        {...attributes}
        ref={divRef}
        onClick={toggleOpen}
      >
        <AnimatePresence>
          {isSelectionMode && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 24, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
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
          <div className={styles.buttonsContainer}>
            {folder.pinned && (
              <div className={styles.pinContainer}>
                <Pin className={styles.pinIcon} />
              </div>
            )}
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
                  <CounterAnimation value={listsCount} />
                </div>
              </section>
            ) : (
              <div className={styles.configsContainer}>
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
                  <CounterAnimation value={listsCount} />
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {open && (
        <motion.div
          key={`folder-lists-${folder.folder_id}`}
          ref={scrollContainerRef}
          layout="position"
          layoutDependency={open}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`${styles.listWrapper} ${isDragging ? styles.draggingActive : ""
            }`}
          style={{ maxHeight: sidebarCollapsed ? "260px" : "290px" }}
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
                  <div ref={newListContainerRef} className={styles.newListFormWrapper}>
                    <AnimatePresence mode="popLayout">
                      {isCreatingList && (
                        <motion.div
                          key="folder-new-list-card"
                          className={styles.newListCard}
                          initial={animations ? { scale: 0.98, opacity: 0 } : undefined}
                          animate={animations ? { scale: 1, opacity: 1 } : undefined}
                          exit={animations ? { scale: 0.98, opacity: 0 } : undefined}
                          transition={{
                            duration: 0.18,
                            ease: "easeOut",
                          }}
                        >
                          <div className={styles.newListColorPicker}>
                            <ColorPicker
                              color={newListColor}
                              setColor={handleSetNewListColor}
                              emoji={newListEmoji}
                              setEmoji={handleSetNewListEmoji}
                              setOriginalColor={resetNewListColor}
                              uniqueId={`folder-${folder.folder_id}-new-list`}
                            />
                          </div>
                          <input
                            ref={newListInputRef}
                            autoFocus
                            maxLength={30}
                            type="text"
                            placeholder="Nombre de la lista"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveNewList();
                              } else if (e.key === "Escape") {
                                e.preventDefault();
                                handleCancelNewList();
                              }
                            }}
                            className={styles.newListInput}
                            aria-label="Nombre de la lista"
                          />
                          <button
                            type="button"
                            onClick={handleSaveNewList}
                            onMouseDown={(e) => e.preventDefault()}
                            disabled={!newListName.trim()}
                            className={styles.newListSendButton}
                            title="Crear lista"
                            aria-label="Crear lista"
                          >
                            <SendIcon
                              style={{
                                width: 18,
                                stroke: "var(--icon-color)",
                                strokeWidth: 2,
                              }}
                            />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {sortedLists && sortedLists.length > 0 ? (
                    sortedLists.map((list, index) => (
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
                  <div className={styles.sentinel} />
                </motion.div>
              )}
            </AnimatePresence>
          </SortableContext>
        </motion.div>
      )}
    </div>
  );

  return (
    <SidebarTooltip
      label={folder.folder_name}
      enabled={sidebarCollapsed && !isMobile && !open}
    >
      {({ triggerRef, onMouseEnter, onMouseLeave }) => (
        <div
          ref={(node) => {
            (triggerRef as React.MutableRefObject<HTMLElement | null>).current =
              node;
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {folderContent}
        </div>
      )}
    </SidebarTooltip>
  );
});
