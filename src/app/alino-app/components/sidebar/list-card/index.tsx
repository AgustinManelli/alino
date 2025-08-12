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
import { useShallow } from "zustand/shallow";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { Database } from "@/lib/schemas/todo-schema";

import { ConfigMenu } from "@/components/ui/config-menu";
import { ListInfoEdit } from "@/components/ui/list-info-edit";
import { CounterAnimation } from "@/components/ui/counter-animation";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

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

type MembershipRow = Database["public"]["Tables"]["list_memberships"]["Row"];
type ListsRow = Database["public"]["Tables"]["lists"]["Row"];
type ListsType = MembershipRow & { list: ListsRow };

interface ListCardProps {
  list: ListsType;
  handleCloseNavbar: () => void;
}

export const ListCard = memo(({ list, handleCloseNavbar }: ListCardProps) => {
  //estados locales
  const [isMoreOptions, setIsMoreOptions] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(list.list.color);
  const [emoji, setEmoji] = useState<string | null>(list.list.icon);
  const [deleteConfirm, isDeleteConfirm] = useState<boolean>(false);
  const [isNameChange, setIsNameChange] = useState<boolean>(false);

  //estados globales
  const { deleteList, updatePinnedList } = useTodoDataStore();
  const isMobile = usePlatformInfoStore(useShallow((state) => state.isMobile));
  const animations = useUserPreferencesStore(
    useShallow((state) => state.animations)
  );
  const taskCount = useTodoDataStore(
    useShallow((state) => state.getTaskCountByListId(list.list_id))
  );

  //ref's
  const divRef = useRef<HTMLInputElement | null>(null);

  //next router
  const pathname = usePathname();
  const router = useRouter();

  //funciones
  const isActiveList = useMemo(
    () => pathname === `/alino-app/${list.list_id}`,
    [pathname, list.list_id]
  );

  const handleConfirm = () => {
    isDeleteConfirm(true);
  };

  const handleDelete = () => {
    if (isActiveList) router.push(`${location.origin}/alino-app`);
    deleteList(list.list_id);
  };

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
  const id = list.list_id;
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

  const isActive = pathname === `/alino-app/${list.list_id}`;

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

  const role = list?.role;
  const canDelete = role === "owner" || role === "admin";
  const canEdit = role === "owner" || role === "admin";
  const owner = role !== "owner";
  const baseConfigOptions = [
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
      name: "Salir",
      icon: (
        <LogOut
          style={{
            stroke: "var(--text)",
            width: "14px",
            height: "auto",
            strokeWidth: 2,
          }}
        />
      ),
      action: () => {},
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

  const configOptions = baseConfigOptions.filter((option) => {
    switch (option.name) {
      case "Editar":
        return canEdit;
      case "Eliminar":
        return canDelete;
      case "Salir":
        return owner;
      default:
        return true;
    }
  });

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
        {list.list.is_shared && (
          <Colaborate
            style={{
              width: "auto",
              height: "70%",
              stroke: "var(--icon-color)",
              strokeWidth: 2,
              opacity: 0.4,
            }}
          />
        )}
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
                      idScrollArea={"list-container"}
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
          text={`¿Desea eliminar la lista "${list.list.list_name}"?`}
          aditionalText="Esta acción es irreversible y eliminará todas las tareas de la lista."
          handleDelete={handleDelete}
          isDeleteConfirm={isDeleteConfirm}
          id={"list-card"}
        />
      )}
      <div ref={setNodeRef}>
        <section
          className={styles.container}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isNameChange) return;
            router.push(`${location.origin}/alino-app/${list.list_id}`),
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
