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

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useConfirmationModalStore } from "@/store/useConfirmationModalStore";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useSidebarStateStore } from "@/store/useSidebarStateStore";
import { ListsType } from "@/lib/schemas/database.types";

import { ConfigMenu } from "@/components/ui/ConfigMenu";
import { ListInfoEdit } from "@/components/ui/list-info-edit";
import { CounterAnimation } from "@/components/ui/CounterAnimation";

import {
  DeleteIcon,
  Edit,
  Pin,
  Unpin,
  Colaborate,
  LogOut,
} from "@/components/ui/icons/icons";
import styles from "./ListCard.module.css";
import Link from "next/link";

interface props {
  list: ListsType;
  inFolder?: boolean;
}

export const ListCard = memo(({ list, inFolder = false }: props) => {
  const [isMoreOptions, setIsMoreOptions] = useState<boolean>(false);
  const [isNameChange, setIsNameChange] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(
    list?.list?.color ?? "#87189d",
  );
  const [emoji, setEmoji] = useState<string | null>(list.list?.icon ?? null);

  const deleteList = useTodoDataStore((state) => state.deleteList);
  const leaveList = useTodoDataStore((state) => state.leaveList);
  const updatePinnedList = useTodoDataStore((state) => state.updatePinnedList);

  const taskCount = useTodoDataStore(
    useCallback(
      (state) => state.getTaskCountByListId(list.list_id),
      [list.list_id],
    ),
  );

  const isMobile = usePlatformInfoStore((state) => state.isMobile);
  const animations = useUserPreferencesStore((state) => state.animations);
  const openModal = useConfirmationModalStore((state) => state.openModal);
  const setNavbarStatus = useSidebarStateStore(
    (state) => state.setNavbarStatus,
  );

  const divRef = useRef<HTMLInputElement | null>(null);

  const pathname = usePathname();
  const router = useRouter();

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
    const input = document.getElementById("list-info-edit-container-list-card");
    if (input) {
      input.focus();
    }
  }, [isNameChange]);

  useEffect(() => {
    if (!list?.list) return;
    setColorTemp((prev) => (prev !== list.list.color ? list.list.color : prev));
    setEmoji((prev) => (prev !== list.list.icon ? list.list.icon : prev));
  }, [list.list.color, list.list.icon]);

  useOnClickOutside(divRef, () => {
    const colorPickerContainer = document.getElementById(
      "color-picker-container-navbar-list-card",
    );
    if (colorPickerContainer) return;
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

  const style = useMemo(
    () =>
      ({
        transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
        transition,
        pointerEvents: isDragging ? "none" : "auto",
        zIndex: isDragging ? 99 : 1,
        opacity: isDragging ? 0.3 : 1,
        backgroundColor: isActive
          ? "var(--background-over-container)"
          : "transparent",
      }) as CSSProperties,
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
        icon: <Edit style={iconStyle} />,
        action: handleNameChange,
        enabled: canEdit,
      },
      {
        name: "Fijar",
        icon: list.pinned ? (
          <Unpin style={iconStyle} />
        ) : (
          <Pin style={iconStyle} />
        ),
        action: handlePin,
        enabled: true,
      },
      {
        name: "Salir",
        icon: <LogOut style={iconStyle} />,
        action: handleConfirmLeave,
        enabled: isNotOwner,
      },
      {
        name: "Eliminar",
        icon: <DeleteIcon style={iconStyle} />,
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

  const handleConfigMenu = useCallback((state: boolean) => {
    setIsMoreOptions(state);
  }, []);

  const content = useMemo(() => {
    const counterDisplay = (
      <p
        className={
          isMobile
            ? `${styles.counter} ${styles.Mobile}`
            : `${styles.counterDesktop} ${styles.Desktop}`
        }
        style={!isMobile ? { opacity: isMoreOptions ? "0" : "1" } : undefined}
      >
        <CounterAnimation tasksLength={taskCount} />
      </p>
    );

    const configDisplay = (
      <div
        className={
          isMobile
            ? `${styles.configButtonContainer} ${styles.Mobile}`
            : `${styles.configButtonContainerDesktop} ${styles.Desktop}`
        }
        style={!isMobile ? { opacity: isMoreOptions ? "1" : "0" } : undefined}
      >
        <ConfigMenu
          iconWidth={"23px"}
          configOptions={configOptions}
          optionalState={handleConfigMenu}
          idScrollArea={"list-container"}
          uniqueId={"navbar-list-card"}
        />
      </div>
    );

    return (
      <>
        <ListInfoEdit
          list={list}
          isNameChange={isNameChange}
          setIsNameChange={setIsNameChange}
          colorTemp={colorTemp}
          setColorTemp={setColorTemp}
          emoji={emoji}
          setEmoji={setEmoji}
          uniqueId="list-card"
          inFolder
        />
        <div className={styles.listManagerContainer}>
          {list.list.is_shared && (
            <div className={styles.pinContainer}>
              <Colaborate
                style={{
                  width: "100%",
                  height: "auto",
                  stroke: "var(--icon-color)",
                  strokeWidth: 2,
                  opacity: 0.4,
                }}
              />
            </div>
          )}
          {!isNameChange && list.pinned && (
            <div className={styles.pinContainer}>
              <Pin
                style={{
                  width: "100%",
                  height: "auto",
                  stroke: "var(--icon-color)",
                  strokeWidth: 2,
                  opacity: 0.4,
                }}
              />
            </div>
          )}
          {!isNameChange && (
            <div className={styles.configsContainer}>
              {configDisplay}
              {counterDisplay}
            </div>
          )}
        </div>
      </>
    );
  }, [
    list,
    isNameChange,
    colorTemp,
    emoji,
    isMobile,
    isMoreOptions,
    animations,
    inFolder,
    taskCount,
    configOptions,
    handleConfigMenu,
  ]);

  return (
    <div ref={setNodeRef} className={styles.allContainer}>
      <div {...attributes} {...listeners} ref={divRef}>
        <Link
          className={styles.container}
          style={style}
          href={isNameChange || isDragging ? "#" : `/alino-app/${list.list_id}`}
          prefetch={false}
          onClick={(e) => {
            if (isNameChange || isDragging) {
              e.preventDefault();
              return;
            }
            setNavbarStatus(false);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
          }}
        >
          <div
            className={styles.cardFx}
            style={{
              boxShadow: `${colorTemp} 100px 50px 50px`,
              opacity: isActive ? 0.1 : 0,
            }}
          ></div>
          {content}
        </Link>
      </div>
    </div>
  );
});

const iconStyle = {
  width: "14px",
  height: "auto",
  stroke: "var(--text)",
  strokeWidth: 2,
};
