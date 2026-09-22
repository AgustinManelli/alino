"use client";

import {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { readTaskCount } from "@/store/todoUtils";
import { useDeleteList } from "@/hooks/todo/lists/useDeleteList";
import { useLeaveList } from "@/hooks/todo/lists/useLeaveList";
import { useUpdatePinnedList } from "@/hooks/todo/lists/useUpdatePinnedList";
import { useDuplicateList } from "@/hooks/todo/lists/useDuplicateList";
import { useClearCompletedTasks } from "@/hooks/todo/tasks/useClearCompletedTasks";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useSidebarStateStore } from "@/store/useSidebarStateStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { ConfigMenu } from "@/components/ui/ConfigMenu";
import { ListInfoEdit } from "@/components/ui/list-info-edit";
import { CounterAnimation } from "@/components/ui/CounterAnimation";
import { SidebarTooltip } from "@/components/ui/sidebar-tooltip";
import { Checkbox } from "@/components/ui/Checkbox";
import { useSidebarSelectionStore } from "@/store/useSidebarSelectionStore";

import { ListsType } from "@/lib/schemas/database.types";

import {
  DeleteIcon,
  Edit,
  Pin,
  Unpin,
  Colaborate,
  LogOut,
  Information,
  Check,
  CopyToClipboardIcon,
  FolderClosed,
} from "@/components/ui/icons/icons";
import styles from "./ListCard.module.css";
import { openModal, useModalStore } from "@/store/useModalStore";

interface ListCardProps {
  list: ListsType;
  inFolder?: boolean;
}

const EDIT_ICON = <Edit className={styles.iconStyle} />;
const PIN_ICON = <Pin className={styles.iconStyle} />;
const UNPIN_ICON = <Unpin className={styles.iconStyle} />;
const DUPLICATE_ICON = <CopyToClipboardIcon className={styles.iconStyle} />;
const MOVE_ICON = <FolderClosed className={styles.iconStyle} />;
const CLEAR_COMPLETED_ICON = <Check className={styles.iconStyle} />;
const CHECK_ICON = <Check className={styles.iconStyle} />;
const DELETE_ICON = <DeleteIcon className={styles.iconStyle} />;
const LOGOUT_ICON = <LogOut className={styles.iconStyle} />;
const INFO_ICON = <Information className={styles.iconStyle} />;

export const ListCard = memo(({ list, inFolder = false }: ListCardProps) => {
  const [isMoreOptions, setIsMoreOptions] = useState<boolean>(false);
  const [isNameChange, setIsNameChange] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(
    list?.list?.color ?? "#87189d",
  );
  const [emoji, setEmoji] = useState<string | null>(list?.list?.icon ?? null);

  const { deleteList } = useDeleteList();
  const { leaveList } = useLeaveList();
  const { updatePinnedList } = useUpdatePinnedList();
  const { duplicateList } = useDuplicateList();
  const { clearCompletedTasks } = useClearCompletedTasks();

  const taskCount = useTodoDataStore(
    useCallback(
      (state) => readTaskCount(list, state.tasks),
      [list.list_id, list.list.tasks],
    ),
  );

  const isMobile = usePlatformInfoStore((state) => state.isMobile);
  const openConfirmationModal = useModalStore((s) => s.open);
  const sidebarCollapsed = useUserPreferencesStore((state) => state.sidebarCollapsed);
  const setNavbarStatus = useSidebarStateStore(
    (state) => state.setNavbarStatus,
  );
  const pendingListId = useSidebarStateStore(
    (state) => state.pendingListId,
  );
  const setPendingListId = useSidebarStateStore(
    (state) => state.setPendingListId,
  );

  const router = useRouter();

  const isSelectionMode = useSidebarSelectionStore((s) => s.isSelectionMode);
  const selectedItems = useSidebarSelectionStore((s) => s.selectedItems);
  const toggleItemSelection = useSidebarSelectionStore((s) => s.toggleItemSelection);
  const startSelectionMode = useSidebarSelectionStore((s) => s.startSelectionMode);

  const isSelected = selectedItems.some((x) => x.id === list.list_id);
  const isParentFolderSelected = !!(list.folder && selectedItems.some((x) => x.id === list.folder && x.kind === "folder"));
  const checkboxDisabled = isParentFolderSelected;

  const divRef = useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();

  const uniqueEditId = `list-card-${list.list_id}`;
  const editContainerId = `list-info-edit-container-${uniqueEditId}`;
  const configMenuId = `config-menu-${uniqueEditId}`;

  const listId = list.list_id;
  const listName = list.list.list_name;

  const handleLeave = useCallback(() => leaveList(listId), [listId, leaveList]);

  const handleDelete = useCallback(() => {
    if (!list) return;
    deleteList(list.list_id);
  }, [list, deleteList]);

  const handleConfirm = useCallback(() => {
    openConfirmationModal({
      type: "confirmation",
      props: {
        text: `¿Desea eliminar la lista "${listName}"?`,
        onConfirm: handleDelete,
        additionalText:
          "Esta acción es irreversible y eliminará todas las tareas de la lista.",
      },
    });
  }, [openConfirmationModal, listName, handleDelete]);

  const handleConfirmLeave = useCallback(() => {
    openConfirmationModal({
      type: "confirmation",
      props: {
        text: `¿Desea salir de la lista "${list.list.list_name}"?`,
        onConfirm: handleLeave,
        additionalText: "Puedes regresar a ella con otra invitación.",
        actionButton: "Salir",
      },
    });
  }, [openConfirmationModal, list.list.list_name, handleLeave]);

  const handleNameChange = useCallback(() => {
    setIsNameChange(true);
    setIsMoreOptions(false);
  }, []);

  const handlePin = useCallback(() => {
    updatePinnedList(list.list_id, !list.pinned);
  }, [updatePinnedList, list.list_id, list.pinned]);

  const handleDuplicate = useCallback(() => {
    duplicateList(list);
    setIsMoreOptions(false);
  }, [duplicateList, list]);

  const handleMoveTo = useCallback(() => {
    setIsMoreOptions(false);
    openModal({ type: "moveList", props: { list } });
  }, [list]);

  const handleClearCompleted = useCallback(() => {
    setIsMoreOptions(false);
    openConfirmationModal({
      type: "confirmation",
      props: {
        text: `¿Limpiar tareas completadas?`,
        additionalText: `Se eliminarán todas las tareas completadas de "${list.list.list_name}". Esta acción no se puede deshacer.`,
        actionButton: "Limpiar",
        onConfirm: () => clearCompletedTasks(list.list_id),
      },
    });
  }, [list, clearCompletedTasks, openConfirmationModal]);

  const handleStartMultiDelete = useCallback(() => {
    startSelectionMode({
      id: list.list_id,
      kind: "list",
      parentFolderId: list.folder,
      name: listName,
    });
  }, [startSelectionMode, list, listName]);

  useEffect(() => {
    if (isNameChange) {
      const input = document.getElementById(editContainerId);
      if (input) input.focus();
    }
  }, [isNameChange, editContainerId]);

  useEffect(() => {
    if (!list?.list) return;
    setColorTemp((prev) => (prev !== list.list.color ? list.list.color : prev));
    setEmoji((prev) => (prev !== list.list.icon ? list.list.icon : prev));
  }, [list.list.color, list.list.icon]);

  const noopRef = useRef<HTMLElement | null>(null);
  useOnClickOutside(isNameChange ? divRef : noopRef, (e) => {
    const target = e.target as HTMLElement;
    if (
      target.closest(".color-picker-portal") ||
      target.closest(".config-menu-portal")
    )
      return;
    setIsNameChange(false);
    setColorTemp(list.list.color);
    setEmoji(list.list.icon);
  });

  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: list.list_id,
    transition: { duration: 500, easing: "cubic-bezier(0.25, 1, 0.5, 1)" },
    data: { type: "item", parentId: list.folder ?? null },
    disabled: isMoreOptions || isNameChange || list.pinned,
  });

  const isActive = pathname === `/alino-app/${list.list_id}`;
  const isPending = pendingListId === list.list_id;
  const isCurrentOrPending = isActive || isPending;

  const style = useMemo<CSSProperties>(
    () => ({
      transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
      transition,
      pointerEvents: isDragging ? "none" : "auto",
      zIndex: isDragging ? 99 : 1,
      opacity: isDragging ? 0.3 : 1,
      backgroundColor:
        isCurrentOrPending || isMoreOptions || isNameChange
          ? "var(--background-over-container)"
          : "transparent",
    }),
    [transform, transition, isDragging, isCurrentOrPending, isMoreOptions, isNameChange],
  );

  if (!list?.list) return null;

  const { canDelete, canEdit, isNotOwner } = useMemo(() => {
    const role = list.role;
    return {
      canDelete: role === "owner" || role === "admin",
      canEdit: role === "owner" || role === "admin",
      isNotOwner: role !== "owner",
    };
  }, [list.role]);

  const configOptions = useMemo(() => {
    return [
      {
        name: "Editar",
        icon: EDIT_ICON,
        action: handleNameChange,
        enabled: canEdit,
      },
      {
        name: list.pinned ? "Desfijar" : "Fijar",
        icon: list.pinned ? UNPIN_ICON : PIN_ICON,
        action: handlePin,
        enabled: true,
      },
      {
        name: "Duplicar",
        icon: DUPLICATE_ICON,
        action: handleDuplicate,
        enabled: true,
      },
      {
        name: "Mover a...",
        icon: MOVE_ICON,
        action: handleMoveTo,
        enabled: canEdit,
      },
      {
        name: "Limpiar completadas",
        icon: CLEAR_COMPLETED_ICON,
        action: handleClearCompleted,
        enabled: canEdit,
      },
      {
        name: "Salir",
        icon: LOGOUT_ICON,
        action: handleConfirmLeave,
        enabled: isNotOwner,
      },
      {
        name: "Información",
        icon: INFO_ICON,
        action: () => openModal({ type: "listInformation", props: { list } }),
        enabled: true,
      },
      {
        name: "Eliminar múltiple",
        icon: DELETE_ICON,
        action: handleStartMultiDelete,
        enabled: canDelete,
        variant: "critical" as const,
      },
      {
        name: "Eliminar",
        icon: DELETE_ICON,
        action: handleConfirm,
        enabled: canDelete,
        variant: "critical" as const,
      },
    ].filter((o) => o.enabled);
  }, [
    canEdit,
    canDelete,
    isNotOwner,
    list.pinned,
    handleNameChange,
    handlePin,
    handleDuplicate,
    handleMoveTo,
    handleClearCompleted,
    handleConfirm,
    handleConfirmLeave,
    handleStartMultiDelete,
    list,
  ]);

  const card = (
    <div ref={setNodeRef} className={styles.allContainer}>

      <div {...attributes} {...listeners} ref={divRef}>
        <Link
          className={`${styles.container}${isSelectionMode ? " " + styles.selectionMode : ""}`}
          data-in-folder={inFolder || !!list.folder}
          href={isSelectionMode || isNameChange || isDragging ? "#" : `/alino-app/${list.list_id}`}
          onMouseEnter={() => {
            if (!isSelectionMode && !isNameChange && !isDragging) {
              router.prefetch(`/alino-app/${list.list_id}`);
            }
          }}
          onClick={(e) => {
            if (isSelectionMode) {
              e.preventDefault();
              e.stopPropagation();
              if (!checkboxDisabled) {
                toggleItemSelection({
                  id: list.list_id,
                  kind: "list",
                  parentFolderId: list.folder,
                  name: list.list.list_name,
                });
              }
              return;
            }
            if (isNameChange || isDragging) {
              e.preventDefault();
              return;
            }
            setPendingListId(list.list_id);
            setNavbarStatus(false);
          }}
          onContextMenu={(e) => e.preventDefault()}
          style={{ ...style, "--color": colorTemp } as React.CSSProperties}
        >
          <div
            className={`${styles.cardFx} ${isCurrentOrPending ? styles.cardFxActive : ""}`}
          ></div>

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
                  if (!checkboxDisabled) {
                    toggleItemSelection({
                      id: list.list_id,
                      kind: "list",
                      parentFolderId: list.folder,
                      name: list.list.list_name,
                    });
                  }
                }}
              >
                <div className={styles.checkboxContainer}>
                  <Checkbox
                    status={isSelected || isParentFolderSelected}
                    handleUpdateStatus={() => { }}
                    disabled={checkboxDisabled}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ListInfoEdit
            list={list}
            isNameChange={isNameChange}
            setIsNameChange={setIsNameChange}
            colorTemp={colorTemp}
            setColorTemp={setColorTemp}
            emoji={emoji}
            setEmoji={setEmoji}
            uniqueId={uniqueEditId}
            hideText={!isMobile && sidebarCollapsed}
          />

          {!isNameChange && (
            <div className={styles.listManagerContainer}>
              {list.list.is_shared && (
                <div className={styles.pinContainer}>
                  <Colaborate className={styles.colaborateIcon} />
                </div>
              )}

              {list.pinned && (
                <div className={styles.pinContainer}>
                  <Pin className={styles.pinIcon} />
                </div>
              )}
              <div
                className={`${isMobile ? styles.configsContainerMobile : styles.configsContainer}`}
              >
                <div
                  className={
                    isMobile
                      ? `${styles.configButtonContainer} ${styles.Mobile}`
                      : `${styles.configButtonContainerDesktop} ${styles.Desktop}`
                  }
                  style={{
                    ...(!isMobile ? { opacity: isMoreOptions && !isSelectionMode ? "1" : "0" } : {}),
                    ...(isSelectionMode ? { pointerEvents: "none" } : {}),
                  }}
                >
                  <ConfigMenu
                    iconWidth="23px"
                    configOptions={configOptions}
                    optionalState={setIsMoreOptions}
                    idScrollArea="list-container"
                    uniqueId={configMenuId}
                  />
                </div>
                <p
                  className={
                    isMobile
                      ? `${styles.counter} ${styles.Mobile}`
                      : `${styles.counterDesktop} ${styles.Desktop}`
                  }
                  style={
                    !isMobile
                      ? { opacity: isMoreOptions && !isSelectionMode ? "0" : "1" }
                      : undefined
                  }
                >
                  <CounterAnimation value={taskCount} />
                </p>
              </div>
            </div>
          )}
        </Link>
      </div>
    </div>
  );

  return (
    <SidebarTooltip label={listName} enabled={sidebarCollapsed && !isMobile}>
      {({ triggerRef, onMouseEnter, onMouseLeave }) => (
        <div
          ref={(node) => {
            (triggerRef as React.MutableRefObject<HTMLElement | null>).current = node;
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {card}
        </div>
      )}
    </SidebarTooltip>
  );
});
