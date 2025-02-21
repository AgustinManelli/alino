"use client";

import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { Database } from "@/lib/schemas/todo-schema";

import { CounterAnimation } from "@/components/ui/counter-animation";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

import { DeleteIcon, Edit, Pin, Unpin } from "@/components/ui/icons/icons";
import styles from "./ListCard.module.css";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { ConfigMenu } from "@/components/ui/config-menu";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { ListInfoEdit } from "@/components/ui/list-info-edit";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

interface props {
  list: ListsType;
  handleCloseNavbar: () => void;
}

export const ListCard = memo(({ list, handleCloseNavbar }: props) => {
  //estados locales
  const [isMoreOptions, setIsMoreOptions] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(list.color);
  const [emoji, setEmoji] = useState<string | null>(list.icon);
  const [deleteConfirm, isDeleteConfirm] = useState<boolean>(false);
  const [isNameChange, setIsNameChange] = useState<boolean>(false);

  //estados globales
  const { deleteList, updatePinnedList } = useTodoDataStore();
  const isMobile = usePlatformInfoStore((state) => state.isMobile);
  const animations = useUserPreferencesStore((state) => state.animations);
  const taskCount = useTodoDataStore((state) =>
    state.getTaskCountByListId(list.id)
  );

  //ref's
  const divRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  //next router
  const pathname = usePathname();
  const router = useRouter();

  //funciones
  const isActiveList = useMemo(
    () => pathname === `/alino-app/${list.id}`,
    [pathname, list.id]
  );
  const handleConfirm = useCallback(() => {
    isDeleteConfirm(true);
  }, []);

  const handleDelete = useCallback(() => {
    if (isActiveList) router.push(`${location.origin}/alino-app`);
    deleteList(list.id);
  }, [isActiveList, list.id, deleteList, router]);

  const handleNameChange = () => {
    setIsNameChange(true);
    setIsMoreOptions(false);
  };

  const handlePin = useCallback(() => {
    updatePinnedList(list.id, !list.pinned);
  }, [list.pinned, updatePinnedList]);

  //useEffect's
  useEffect(() => {
    // inputRef.current?.focus();
    const input = document.getElementById("list-info-edit-container-list-card");
    if (input) {
      input.focus();
    }
  }, [isNameChange]);

  useEffect(() => {
    if (!list) return;
    setColorTemp(list.color);
    setEmoji(list.icon);
  }, [list]);

  //custom hook's
  useOnClickOutside(divRef, () => {
    const colorPickerContainer = document.getElementById(
      "color-picker-container-navbar-list-card"
    );
    if (colorPickerContainer) return;
    setIsNameChange(false);
    setColorTemp(list.color);
    setEmoji(list.icon);
  });

  //dndkit
  const id = list.id;
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    transition: {
      duration: 500,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
    disabled: isMoreOptions || isNameChange || list.pinned,
  });

  const isActive = pathname === `/alino-app/${list.id}`;

  const style = {
    transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
    transition,
    pointerEvents: isDragging ? "none" : "auto",
    zIndex: isDragging ? 99 : 1,
    opacity: isDragging ? 0.2 : 1,
    backgroundColor: isActive
      ? "var(--background-over-container)"
      : "transparent",
  } as CSSProperties;

  const configOptions = [
    {
      name: "Editar",
      icon: (
        <Edit
          style={{
            width: "14px",
            height: "auto",
            stroke: "var(--text)",
            strokeWidth: 2,
          }}
        />
      ),
      action: handleNameChange,
    },
    {
      name: "Fijar",
      icon: list.pinned ? (
        <Unpin
          style={{
            width: "14px",
            height: "auto",
            stroke: "var(--text)",
            strokeWidth: 2,
          }}
        />
      ) : (
        <Pin
          style={{
            width: "14px",
            height: "auto",
            stroke: "var(--text)",
            strokeWidth: 2,
          }}
        />
      ),
      action: handlePin,
    },
    {
      name: "Eliminar",
      icon: (
        <DeleteIcon
          style={{
            stroke: "var(--text)",
            width: "14px",
            height: "auto",
            strokeWidth: 2,
          }}
        />
      ),
      action: handleConfirm,
    },
  ];

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
        />
        <div className={styles.listManagerContainer}>
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
                      idScrollArea={"listContainer"}
                      uniqueId={"navbar-list-card"}
                    />
                  </div>
                </div>
                <div className={styles.configsContainer}>
                  <p className={`${styles.counter} ${styles.Mobile}`}>
                    <CounterAnimation tasksLength={taskCount} />
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
                    idScrollArea={"listContainer"}
                    uniqueId={"navbar-list-card"}
                  />
                </div>
                <p
                  className={`${styles.counterDesktop} ${styles.Desktop}`}
                  style={{
                    opacity: isMoreOptions ? "0" : "1",
                  }}
                >
                  {animations ? (
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
    <>
      {deleteConfirm && (
        <ConfirmationModal
          text={`¿Desea eliminar la lista "${list.name}"?`}
          aditionalText="Esta acción es irreversible y eliminará todas las tareas de la lista."
          isDeleteConfirm={isDeleteConfirm}
          handleDelete={handleDelete}
        />
      )}
      <div ref={setNodeRef}>
        <section
          className={styles.container}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isNameChange) return;
            router.push(`${location.origin}/alino-app/${list.id}`),
              handleCloseNavbar();
          }}
          style={style}
          {...attributes}
          {...listeners}
          ref={divRef}
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
    </>
  );
});
