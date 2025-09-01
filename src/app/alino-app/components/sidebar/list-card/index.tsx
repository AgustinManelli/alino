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
import { useUIStore } from "@/store/useUIStore";
import { ListsType } from "@/lib/schemas/todo-schema";

import { ConfigMenu } from "@/components/ui/config-menu";
import { ListInfoEdit } from "@/components/ui/list-info-edit";
import { CounterAnimation } from "@/components/ui/counter-animation";

import {
  DeleteIcon,
  Edit,
  Pin,
  Unpin,
  Colaborate,
  LogOut,
} from "@/components/ui/icons/icons";
import styles from "./ListCard.module.css";

interface props {
  list: ListsType;
  inFolder?: boolean;
}

export const ListCard = memo(({ list, inFolder = false }: props) => {
  //estados locales
  const [isMoreOptions, setIsMoreOptions] = useState<boolean>(false);
  const [isNameChange, setIsNameChange] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(
    list.list.color ?? "#87189d"
  );
  const [emoji, setEmoji] = useState<string | null>(list.list.icon);

  //estados globales
  const deleteList = useTodoDataStore((state) => state.deleteList);
  const leaveList = useTodoDataStore((state) => state.leaveList);
  const updatePinnedList = useTodoDataStore((state) => state.updatePinnedList);
  const isMobile = usePlatformInfoStore((state) => state.isMobile);
  const animations = useUserPreferencesStore((state) => state.animations);
  const taskCount = useTodoDataStore((state) =>
    state.getTaskCountByListId(list.list_id)
  );
  const openModal = useConfirmationModalStore((state) => state.openModal);
  const setNavbarStatus = useUIStore((state) => state.setNavbarStatus);

  //ref's
  const divRef = useRef<HTMLInputElement | null>(null);

  //next router
  const pathname = usePathname();
  const router = useRouter();

  //funciones
  const handleLeave = useCallback(() => {
    if (!list) return;
    leaveList(list.list_id);
  }, [list, leaveList, pathname]);

  const handleDelete = useCallback(() => {
    if (!list) return;
    deleteList(list.list_id);
  }, [list, deleteList, pathname]);

  const handleConfirm = () => {
    openModal({
      text: `¿Desea eliminar la lista "${list.list.list_name}"?`,
      onConfirm: handleDelete,
      additionalText:
        "Esta acción es irreversible y eliminará todas las tareas de la lista.",
    });
  };

  const handleConfirmLeave = useCallback(() => {
    openModal({
      text: `¿Desea salir de la lista "${list.list.list_name}"?`,
      onConfirm: handleLeave,
      additionalText: "Puedes regresar a ella con otra invitación.",
      actionButton: "Salir",
    });
  }, [openModal, list, handleLeave]);

  const handleNameChange = () => {
    setIsNameChange(true);
    setIsMoreOptions(false);
  };

  const handlePin = () => {
    updatePinnedList(list.list_id, !list.pinned);
  };

  //useEffect's
  useEffect(() => {
    const input = document.getElementById("list-info-edit-container-list-card");
    if (input) {
      input.focus();
    }
  }, [isNameChange]);

  useEffect(() => {
    if (!list) return;
    setColorTemp(list.list.color);
    setEmoji(list.list.icon);
  }, [list]);

  //custom hook's
  useOnClickOutside(divRef, () => {
    const colorPickerContainer = document.getElementById(
      "color-picker-container-navbar-list-card"
    );
    if (colorPickerContainer) return;
    setIsNameChange(false);
    setColorTemp(list.list.color);
    setEmoji(list.list.icon);
  });

  //dndkit
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

  const style = {
    transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
    transition,
    pointerEvents: isDragging ? "none" : "auto",
    zIndex: isDragging ? 99 : 1,
    opacity: isDragging ? 0.3 : 1,
    backgroundColor: isActive
      ? "var(--background-over-container)"
      : "transparent",
  } as CSSProperties;

  const role = list?.role;
  const canDelete = role === "owner" || role === "admin";
  const canEdit = role === "owner" || role === "admin";
  const owner = role !== "owner";
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
        enabled: owner,
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
    owner,
    list.pinned,
    handleNameChange,
    handlePin,
    handleConfirm,
  ]);

  const handleConfigMenu = (state: boolean) => {
    setIsMoreOptions(state);
  };

  const content = useMemo(() => {
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
          {!isNameChange &&
            (isMobile ? (
              <>
                <div className={styles.configsContainer}>
                  <div
                    className={`${styles.configButtonContainer} ${styles.Mobile}`}
                  >
                    <ConfigMenu
                      iconWidth={"23px"}
                      configOptions={configOptions}
                      optionalState={handleConfigMenu}
                      idScrollArea={"list-container"}
                      uniqueId={"navbar-list-card"}
                    />
                  </div>
                </div>
                <div className={styles.configsContainer}>
                  <p className={`${styles.counter} ${styles.Mobile}`}>
                    {animations && !inFolder ? (
                      <CounterAnimation tasksLength={taskCount} />
                    ) : (
                      taskCount
                    )}
                  </p>
                </div>
              </>
            ) : (
              <div className={styles.configsContainer}>
                <div
                  className={`${styles.configButtonContainerDesktop} ${styles.Desktop}`}
                  style={{
                    opacity: isMoreOptions ? "1" : "0",
                  }}
                >
                  <ConfigMenu
                    iconWidth={"23px"}
                    configOptions={configOptions}
                    optionalState={handleConfigMenu}
                    idScrollArea={"list-container"}
                    uniqueId={"navbar-list-card"}
                  />
                </div>
                <p
                  className={`${styles.counterDesktop} ${styles.Desktop}`}
                  style={{
                    opacity: isMoreOptions ? "0" : "1",
                  }}
                >
                  {animations && !inFolder ? (
                    <CounterAnimation tasksLength={taskCount} />
                  ) : (
                    taskCount
                  )}
                </p>
              </div>
            ))}
        </div>
      </>
    );
  }, [
    emoji,
    isMoreOptions,
    isNameChange,
    taskCount,
    isMobile,
    colorTemp,
    list,
  ]);

  return (
    <div
      ref={setNodeRef}
      className={styles.allContainer}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isNameChange) return;
        router.replace(`/alino-app/${list.list_id}`);
        setNavbarStatus(false);
      }}
    >
      <section
        {...attributes}
        {...listeners}
        ref={divRef}
        className={styles.container}
        style={style}
      >
        <div
          className={styles.cardFx}
          style={{
            boxShadow: `${colorTemp} 100px 50px 50px`,
            opacity: isActive ? 0.1 : 0,
          }}
        ></div>
        {content}
      </section>
    </div>
  );
});

const iconStyle = {
  width: "14px",
  height: "auto",
  stroke: "var(--text)",
  strokeWidth: 2,
};
