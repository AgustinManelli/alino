import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FolderType, ListsType } from "@/lib/schemas/todo-schema";
import { ListCard } from "../list-card";
import styles from "./SortableFolder.module.css";
interface SortableFolderProps {
  folder: FolderType;
  lists: ListsType[];
  isDragging: boolean;
}
import {
  ArrowThin,
  DeleteIcon,
  Edit,
  FolderClosed,
  FolderOpen,
  Pin,
  Unpin,
} from "@/components/ui/icons/icons";
import { ConfigMenu } from "@/components/ui/config-menu";
import { useConfirmationModalStore } from "@/store/useConfirmationModalStore";
import { useTodoDataStore } from "@/store/useTodoDataStore";

// sólo el cuerpo del componente, reemplaza el original
export const SortableFolder = ({
  folder,
  lists,
  isDragging,
}: SortableFolderProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [containsOver, setContainsOver] = useState<boolean>(false);

  const openModal = useConfirmationModalStore((state) => state.openModal);
  const deleteFolder = useTodoDataStore((state) => state.deleteFolder);

  const listIds = useMemo(() => lists.map((list) => list.list_id), [lists]);

  useDndMonitor({
    onDragOver: (event) => {
      const overId = event.over?.id as string | undefined;

      if (!overId) {
        setContainsOver(false);
        return;
      }

      // Si el `over.id` es uno de los listIds de esta carpeta — marcar true
      if (
        listIds.includes(overId) ||
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
    isOver: sortOver,
  } = useSortable({
    id: folder.folder_id,
    data: {
      type: "folder",
      item: folder,
    },
  });

  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: `folder-${folder.folder_id}-dropzone`,
    data: {
      type: "folder-dropzone",
      accepts: ["item"],
      folderId: folder.folder_id,
    },
  });

  const style = {
    transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
    transition,
    pointerEvents: isCurrentlyDraggingThis ? "none" : "auto",
    zIndex: isCurrentlyDraggingThis ? 99 : 1,
    opacity: isCurrentlyDraggingThis ? 0.3 : 1,
    border:
      containsOver && !isCurrentlyDraggingThis
        ? "1px solid #3ebb00"
        : "1px solid var(--border-container-color)",
  } as CSSProperties;

  // useEffect(() => {
  //   let timer: NodeJS.Timeout;
  //   if (containsOver && !isCurrentlyDraggingThis) {
  //     timer = setTimeout(() => {
  //       setOpen(true);
  //     }, 1000);
  //   }
  //   return () => clearTimeout(timer);
  // }, [containsOver, isCurrentlyDraggingThis]);

  const handleConfirm = () => {
    openModal({
      text: `¿Desea eliminar la carpeta "${folder.folder_name}"?`,
      onConfirm: handleDelete,
      additionalText:
        "Esta acción es irreversible, pero tranquilo, tus listas no se eliminan.",
    });
  };

  const handleDelete = () => {
    deleteFolder(folder.folder_id);
  };

  const configOptions = useMemo(() => {
    const baseOptions = [
      {
        name: "Editar",
        icon: <Edit style={iconStyle} />,
        action: () => {},
        enabled: false,
      },
      {
        name: "Fijar",
        icon: false ? <Unpin style={iconStyle} /> : <Pin style={iconStyle} />,
        action: () => {},
        enabled: false,
      },
      {
        name: "Eliminar",
        icon: <DeleteIcon style={iconStyle} />,
        action: handleConfirm,
        enabled: true,
      },
    ];
    return baseOptions.filter((bs) => bs.enabled);
  }, []);

  return (
    <div
      ref={setSortableNodeRef}
      className={styles.folderContainer}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        setOpen((prev) => !prev);
      }}
    >
      <div
        id={`folder-${folder.folder_id}-dropzone`}
        ref={setDroppableNodeRef}
        data-dropzone="folder"
        className={styles.folderDropOverlay}
        style={{ pointerEvents: isDragging ? "auto" : "none" }}
      />
      <div className={styles.folderHeader} {...listeners} {...attributes}>
        <div
          style={{
            display: "flex",
            gap: "5px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {open ? (
            <FolderOpen
              style={{
                stroke: folder.folder_color ?? "var(--text-not-available)",
                width: "15px",
                height: "15px",
                strokeWidth: 2,
              }}
            />
          ) : (
            <FolderClosed
              style={{
                stroke: folder.folder_color ?? "var(--text-not-available)",
                width: "15px",
                height: "15px",
                strokeWidth: 2,
              }}
            />
          )}
          <p
            style={{
              color: folder.folder_color ?? "var(--text-not-available)",
            }}
          >
            {folder.folder_name}
          </p>
        </div>
        <section className={styles.buttonsContainer}>
          <ConfigMenu
            iconWidth={"23px"}
            configOptions={configOptions}
            idScrollArea={"list-container"}
            uniqueId={"navbar-list-card"}
          />
          <div className={styles.button}>
            <ArrowThin
              style={{
                stroke: "var(--text-not-available)",
                width: "15px",
                height: "15px",
                strokeWidth: 2,
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </div>
        </section>
      </div>
      {open /*&& !isCurrentlyDraggingThis*/ && (
        <div
          className={styles.listWrapper}
          style={
            {
              "--bgColor": folder.folder_color ?? "transparent",
            } as React.CSSProperties
          }
        >
          <SortableContext
            items={listIds}
            strategy={verticalListSortingStrategy}
          >
            {lists.length > 0 ? (
              lists.map((list) => (
                <ListCard list={list} key={list.list_id} inFolder />
              ))
            ) : (
              <p>Arrastra una lista aquí</p>
            )}
          </SortableContext>
        </div>
      )}
    </div>
  );
};

const iconStyle = {
  width: "14px",
  height: "auto",
  stroke: "var(--text)",
  strokeWidth: 2,
};
