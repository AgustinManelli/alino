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
import { usePathname } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import Link from "next/link";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { readTaskCount } from "@/store/todoUtils";
import { useDeleteList } from "@/hooks/todo/lists/useDeleteList";
import { useLeaveList } from "@/hooks/todo/lists/useLeaveList";
import { useUpdatePinnedList } from "@/hooks/todo/lists/useUpdatePinnedList";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useSidebarStateStore } from "@/store/useSidebarStateStore";
import { ConfigMenu } from "@/components/ui/ConfigMenu";
import { ListInfoEdit } from "@/components/ui/list-info-edit";
import { CounterAnimation } from "@/components/ui/CounterAnimation";

import { ListsType } from "@/lib/schemas/database.types";

import {
  DeleteIcon,
  Edit,
  Pin,
  Unpin,
  Colaborate,
  LogOut,
  Information,
} from "@/components/ui/icons/icons";
import styles from "./ListCard.module.css";
import { openModal, useModalStore } from "@/store/useModalStore";

interface ListCardProps {
  list: ListsType;
}

const EDIT_ICON = <Edit className={styles.iconStyle} />;
const PIN_ICON = <Pin className={styles.iconStyle} />;
const UNPIN_ICON = <Unpin className={styles.iconStyle} />;
const DELETE_ICON = <DeleteIcon className={styles.iconStyle} />;
const LOGOUT_ICON = <LogOut className={styles.iconStyle} />;
const INFO_ICON = <Information className={styles.iconStyle} />;

export const ListCard = memo(({ list }: ListCardProps) => {
  const [isMoreOptions, setIsMoreOptions] = useState<boolean>(false);
  const [isNameChange, setIsNameChange] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(
    list?.list?.color ?? "#87189d",
  );
  const [emoji, setEmoji] = useState<string | null>(list?.list?.icon ?? null);

  const { deleteList } = useDeleteList();
  const { leaveList } = useLeaveList();
  const { updatePinnedList } = useUpdatePinnedList();

  const taskCount = useTodoDataStore(
    useCallback(
      (state) => readTaskCount(list, state.tasks),
      [list.list_id, list.list.tasks],
    ),
  );

  const isMobile = usePlatformInfoStore((state) => state.isMobile);
  const openConfirmationModal = useModalStore((s) => s.open);
  const setNavbarStatus = useSidebarStateStore(
    (state) => state.setNavbarStatus,
  );
  const setPendingListId = useSidebarStateStore(
    (state) => state.setPendingListId,
  );

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

  const style = useMemo<CSSProperties>(
    () => ({
      transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
      transition,
      pointerEvents: isDragging ? "none" : "auto",
      zIndex: isDragging ? 99 : 1,
      opacity: isDragging ? 0.3 : 1,
      backgroundColor:
        isActive || isMoreOptions || isNameChange
          ? "var(--background-over-container)"
          : "transparent",
    }),
    [transform, transition, isDragging, isActive, isMoreOptions, isNameChange],
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
        name: "Fijar",
        icon: list.pinned ? UNPIN_ICON : PIN_ICON,
        action: handlePin,
        enabled: true,
      },
      {
        name: "Salir",
        icon: LOGOUT_ICON,
        action: handleConfirmLeave,
        enabled: isNotOwner,
      },
      {
        name: "Eliminar",
        icon: DELETE_ICON,
        action: handleConfirm,
        enabled: canDelete,
      },
      {
        name: "Información",
        icon: INFO_ICON,
        action: () => openModal({ type: "listInformation", props: { list } }),
        enabled: true,
      },
    ].filter((o) => o.enabled);
  }, [
    canEdit,
    canDelete,
    isNotOwner,
    list.pinned,
    handleNameChange,
    handlePin,
    handleConfirm,
    handleConfirmLeave,
  ]);

  return (
    <div ref={setNodeRef} className={styles.allContainer}>
      <div {...attributes} {...listeners} ref={divRef}>
        <Link
          className={styles.container}
          href={isNameChange || isDragging ? "#" : `/alino-app/${list.list_id}`}
          prefetch={false}
          onClick={(e) => {
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
            className={`${styles.cardFx} ${isActive ? styles.cardFxActive : ""}`}
          ></div>

          <ListInfoEdit
            list={list}
            isNameChange={isNameChange}
            setIsNameChange={setIsNameChange}
            colorTemp={colorTemp}
            setColorTemp={setColorTemp}
            emoji={emoji}
            setEmoji={setEmoji}
            uniqueId={uniqueEditId}
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
                  style={
                    !isMobile
                      ? { opacity: isMoreOptions ? "1" : "0" }
                      : undefined
                  }
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
                      ? { opacity: isMoreOptions ? "0" : "1" }
                      : undefined
                  }
                >
                  <CounterAnimation tasksLength={taskCount} />
                </p>
              </div>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
});
