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
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useConfirmationModalStore } from "@/store/useConfirmationModalStore";
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
} from "@/components/ui/icons/icons";
import styles from "./ListCard.module.css";

interface ListCardProps {
  list: ListsType;
  inFolder?: boolean;
}

export const ListCard = memo(({ list, inFolder = false }: ListCardProps) => {
  const [isMoreOptions, setIsMoreOptions] = useState<boolean>(false);
  const [isNameChange, setIsNameChange] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(
    list?.list?.color ?? "#87189d",
  );
  const [emoji, setEmoji] = useState<string | null>(list?.list?.icon ?? null);

  const deleteList = useTodoDataStore((state) => state.deleteList);
  const leaveList = useTodoDataStore((state) => state.leaveList);
  const updatePinnedList = useTodoDataStore((state) => state.updatePinnedList);

  const taskCount = useTodoDataStore((state) =>
    state.getTaskCountByListId(list.list_id),
  );

  const isMobile = usePlatformInfoStore((state) => state.isMobile);
  const openModal = useConfirmationModalStore((state) => state.openModal);
  const setNavbarStatus = useSidebarStateStore(
    (state) => state.setNavbarStatus,
  );

  const divRef = useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();

  const uniqueEditId = `list-card-${list.list_id}`;
  const editContainerId = `list-info-edit-container-${uniqueEditId}`;
  const configMenuId = `config-menu-${uniqueEditId}`;

  const handleLeave = useCallback(() => {
    if (!list) return;
    leaveList(list.list_id);
  }, [list, leaveList]);

  const handleDelete = useCallback(() => {
    if (!list) return;
    deleteList(list.list_id);
  }, [list, deleteList]);

  const handleConfirm = useCallback(() => {
    openModal({
      text: `¿Desea eliminar la lista "${list.list.list_name}"?`,
      onConfirm: handleDelete,
      additionalText:
        "Esta acción es irreversible y eliminará todas las tareas de la lista.",
    });
  }, [openModal, list.list.list_name, handleDelete]);

  const handleConfirmLeave = useCallback(() => {
    openModal({
      text: `¿Desea salir de la lista "${list.list.list_name}"?`,
      onConfirm: handleLeave,
      additionalText: "Puedes regresar a ella con otra invitación.",
      actionButton: "Salir",
    });
  }, [openModal, list.list.list_name, handleLeave]);

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

  useOnClickOutside(divRef, (e) => {
    const target = e.target as HTMLElement;

    if (
      target.closest(".color-picker-portal") ||
      target.closest(".config-menu-portal")
    ) {
      return;
    }

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
      backgroundColor: isActive
        ? "var(--background-over-container)"
        : "transparent",
    }),
    [transform, transition, isDragging, isActive],
  );

  if (!list?.list) return null;

  const role = list?.role;
  const canDelete = role === "owner" || role === "admin";
  const canEdit = role === "owner" || role === "admin";
  const isNotOwner = role !== "owner";

  const configOptions = useMemo(() => {
    const baseOptions = [
      {
        name: "Editar",
        icon: <Edit className={styles.iconStyle} />,
        action: handleNameChange,
        enabled: canEdit,
      },
      {
        name: "Fijar",
        icon: list.pinned ? (
          <Unpin className={styles.iconStyle} />
        ) : (
          <Pin className={styles.iconStyle} />
        ),
        action: handlePin,
        enabled: true,
      },
      {
        name: "Salir",
        icon: <LogOut className={styles.iconStyle} />,
        action: handleConfirmLeave,
        enabled: isNotOwner,
      },
      {
        name: "Eliminar",
        icon: <DeleteIcon className={styles.iconStyle} />,
        action: handleConfirm,
        enabled: canDelete,
      },
    ];
    return baseOptions.filter((option) => option.enabled);
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
            inFolder={inFolder}
          />

          <div className={styles.listManagerContainer}>
            {list.list.is_shared && (
              <div className={styles.pinContainer}>
                <Colaborate className={styles.colaborateIcon} />
              </div>
            )}

            {!isNameChange && list.pinned && (
              <div className={styles.pinContainer}>
                <Pin className={styles.pinIcon} />
              </div>
            )}

            {!isNameChange && (
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
            )}
          </div>
        </Link>
      </div>
    </div>
  );
});
