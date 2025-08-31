"use client";

import { useMemo, useState, useCallback, memo, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  DndContext,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  Modifier,
  pointerWithin,
  CollisionDetection,
  rectIntersection,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useShallow } from "zustand/shallow";

import { ListsType, FolderType } from "@/lib/schemas/todo-schema";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

import { DragListCard } from "../list-card/drag-list-card";
import { ListCard } from "../list-card";
import { SortableFolder } from "../folders/sortable-folder";

import styles from "./DraggableContext.module.css";
import { DragSortableFolder } from "../folders/drag-sortable-folder";

const variants = {
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 50,
    },
  },
} as const;

type CombinedType = ListsType | FolderType;

type CombinedKind = "list" | "folder";

type NormalizedItem = {
  id: string;
  kind: CombinedKind;
  data: CombinedType;
  index: number;
};

export const DraggableContext = () => {
  const [draggedItem, setDraggedItem] = useState<NormalizedItem | null>(null);

  const {
    lists,
    list_folders,
    setLists,
    setFolders,
    updateIndexList,
    updateIndexFolders,
  } = useTodoDataStore(
    useShallow((state) => ({
      lists: state.lists,
      list_folders: state.folders,
      setLists: state.setLists,
      setFolders: state.setFolders,
      updateIndexList: state.updateIndexList,
      updateIndexFolders: state.updateIndexFolders,
    }))
  );
  const animations = useUserPreferencesStore(
    useShallow((state) => state.animations)
  );

  //Tipos combinados para normalización de la lista.
  const combinedItems = useMemo<NormalizedItem[]>(() => {
    const foldersNormalized: NormalizedItem[] = list_folders
      ? list_folders.map((f) => ({
          id: f.folder_id,
          kind: "folder",
          data: f,
          index: (f as any).index ?? 0,
        }))
      : [];

    const listsNormalized: NormalizedItem[] = lists
      ? lists.map((l) => ({
          id: l.list_id,
          kind: "list",
          data: l,
          index: (l as any).index ?? 0,
        }))
      : [];

    const combined = [...foldersNormalized, ...listsNormalized];

    return combined.sort((a, b) => a.index - b.index);
  }, [list_folders, lists]);

  //Elementos filtrados unicamente del root
  const topLevelItems = useMemo(() => {
    return combinedItems.filter(
      (it) =>
        it.kind === "folder" ||
        (it.kind === "list" && (it.data as ListsType).folder == null)
    );
  }, [combinedItems]);

  //Id's de los elementos del root
  const combinedIds = useMemo(
    () => topLevelItems.map((i) => i.id),
    [topLevelItems]
  );

  const scrollContainerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    scrollContainerRef.current = document.getElementById("list-container");
  }, []);

  //Cálculo de nuevo Indice.
  const calcNewIndex = (arr: NormalizedItem[], newIndex: number) => {
    const prev = arr[newIndex - 1]?.index ?? null;
    const post = arr[newIndex + 1]?.index ?? null;

    if (prev === null && post === null) {
      return 16384;
    }
    if (prev === null && post !== null) {
      return Math.floor(post / 2);
    }
    if (post === null && prev !== null) {
      return prev + 16384;
    }
    if (post === prev) {
      return Math.floor(post + prev / 2);
    }
    return Math.floor((prev + post) / 2);
  };

  //Funcion cuando comienza Drag
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const current = combinedItems.find(
        (it) => it.id === (active.id as string)
      );
      setDraggedItem(current ?? null);
    },
    [combinedItems]
  );

  //Función cuando se suelta elemento
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      console.log(active, over);
      //Cancelar si es sobre el mismo id, significa que no se movió
      if (active.id === over?.id) {
        setDraggedItem(null);
        return;
      }

      let oldIndex;
      let newIndex;

      if (over?.data?.current?.type !== "folder-dropzone") {
        newIndex = combinedItems.findIndex((it) => it.id === over?.id);
      } else {
        const targetFolderId = over.data.current.folderId;
        const lastItemIndexInFolder = combinedItems.findLastIndex(
          (item) =>
            item.kind === "list" &&
            (item.data as ListsType).folder === targetFolderId
        );
        if (lastItemIndexInFolder !== -1) {
          newIndex = lastItemIndexInFolder;
        } else {
          newIndex = combinedItems.findIndex(
            (item) => item.id === targetFolderId
          );
        }
      }
      if (!over && active) {
        const lastItemIndexInFolder = combinedItems.findLastIndex(
          (item) => item
        );
        if (lastItemIndexInFolder !== -1) {
          newIndex = lastItemIndexInFolder;
        }
      }
      oldIndex = combinedItems.findIndex(
        (it) => it.id === (active.id as string)
      );
      if (oldIndex === -1 || newIndex === -1) {
        setDraggedItem(null);
        return;
      }

      // mueve la posición en el array normalizado
      const newOrder = arrayMove(combinedItems.slice(), oldIndex, newIndex);
      const moved = newOrder[newIndex];

      const activeType = active.data?.current?.type;
      //Obtenemos el id del elemento sobre el que se hace drop, si no existe, es el root
      if (over) {
        //Si se hace drop sobre un folder-dropzone o sobre algun elemento que tiene parentId
        if (
          over.data?.current?.type === "folder-dropzone" ||
          over.data?.current?.parentId
        ) {
          if (activeType === "item") {
            const movedList = { ...(moved.data as ListsType) };
            if (
              active.data?.current?.parentId === over.data?.current?.parentId ||
              active.data?.current?.parentId === over.data?.current?.folderId
            ) {
              const computedIndex = calcNewIndex(newOrder, newIndex);
              movedList.index = computedIndex;
              newOrder[newIndex] = { ...newOrder[newIndex], data: movedList };
              // updateIndexList(
              //   movedList.list_id,
              //   computedIndex,
              //   active.data?.current?.parentId
              // );
            } else {
              const computedIndex = calcNewIndex(newOrder, newIndex);
              movedList.index = computedIndex;
              movedList.folder =
                over.data.current.parentId ?? over.data.current.folderId;
              newOrder[newIndex] = { ...newOrder[newIndex], data: movedList };
              // updateIndexList(
              //   movedList.list_id,
              //   computedIndex,
              //   over.data.current.parentId
              // );
            }
          }
        } else {
          if (activeType === "item") {
            const movedList = { ...(moved.data as ListsType) };
            const computedIndex = calcNewIndex(newOrder, newIndex);
            movedList.index = computedIndex;
            movedList.folder = null;
            newOrder[newIndex] = { ...newOrder[newIndex], data: movedList };
            // updateIndexList(
            //   movedList.list_id,
            //   computedIndex,
            //   null
            // );
          }
          if (activeType === "folder") {
            const movedFolder = { ...(moved.data as FolderType) };
            const computedIndex = calcNewIndex(newOrder, newIndex);
            movedFolder.index = computedIndex;
            newOrder[newIndex] = { ...newOrder[newIndex], data: movedFolder };
            //updateIndexFolders(movedFolder.folder_id, computedIndex);
          }
        }
      } else {
        if (activeType === "item") {
          const movedList = { ...(moved.data as ListsType) };
          const computedIndex = calcNewIndex(newOrder, newIndex);
          movedList.index = computedIndex;
          movedList.folder = null;
          newOrder[newIndex] = { ...newOrder[newIndex], data: movedList };
          // updateIndexList(
          //   movedList.list_id,
          //   computedIndex,
          //   null
          // );
        }
        if (activeType === "folder") {
          const movedFolder = { ...(moved.data as FolderType) };
          const computedIndex = calcNewIndex(newOrder, newIndex);
          movedFolder.index = computedIndex;
          newOrder[newIndex] = { ...newOrder[newIndex], data: movedFolder };
          //updateIndexFolders(movedFolder.folder_id, computedIndex);
        }
      }

      const updatedFolders = newOrder
        .filter((it) => it.kind === "folder")
        .map((it) => it.data as FolderType);

      const updatedLists = newOrder
        .filter((it) => it.kind === "list")
        .map((it) => it.data as ListsType);

      setLists(updatedLists);
      setFolders(updatedFolders);
      setDraggedItem(null);
    },
    [combinedItems, setLists, setFolders, updateIndexList, updateIndexFolders]
  );

  //Sensores DndKit
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5, delay: 250, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 5, delay: 250, tolerance: 5 },
    })
  );

  //Ajuste fino de overlay
  const adjustForLayoutPadding: Modifier = ({ transform }) => {
    return {
      ...transform,
      x: transform.x - 15,
      y: transform.y - 15,
    };
  };

  //Colisión personalizada
  const customCollisionDetection: CollisionDetection = (args) => {
    const { active } = args;
    const activeData = active.data.current;

    if (activeData?.parentId) {
      return rectIntersection(args);
    }

    const pointerCollisions = pointerWithin(args);
    const overFolderDropzone = pointerCollisions.find((collision) =>
      String(collision.id).endsWith("-dropzone")
    );

    if (overFolderDropzone) {
      return [overFolderDropzone];
    }

    return rectIntersection(args);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragCancel={() => {
          setDraggedItem(null);
        }}
        collisionDetection={rectIntersection}
        // collisionDetection={customCollisionDetection}
        // modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={combinedIds}
          strategy={verticalListSortingStrategy}
        >
          {topLevelItems.map((item) => {
            if (item.kind === "folder") {
              const folder = item.data as FolderType;
              return (
                <motion.div
                  layout={draggedItem ? false : true}
                  variants={animations ? variants : undefined}
                  initial={
                    animations ? { scale: 0, opacity: 0, zIndex: 1 } : undefined
                  }
                  whileInView="visible"
                  exit={
                    animations
                      ? {
                          scale: 1.3,
                          opacity: 0,
                          filter: "blur(30px) grayscale(100%)",
                          y: -30,
                          transition: {
                            duration: 1,
                          },
                          zIndex: "0",
                        }
                      : undefined
                  }
                  key={item.id}
                  id={item.id}
                  viewport={{
                    root: scrollContainerRef,
                    once: true,
                    amount: 0.1,
                  }}
                >
                  <SortableFolder
                    folder={folder}
                    lists={lists.filter((ls) => ls.folder === folder.folder_id)}
                    isDragging={!!draggedItem}
                  />
                </motion.div>
              );
            } else {
              const list = item.data as ListsType;
              return (
                <motion.div
                  layout={draggedItem ? false : true}
                  variants={animations ? variants : undefined}
                  initial={
                    animations ? { scale: 0, opacity: 0, zIndex: 1 } : undefined
                  }
                  whileInView="visible"
                  exit={
                    animations
                      ? {
                          scale: 1.3,
                          opacity: 0,
                          filter: "blur(30px) grayscale(100%)",
                          y: -30,
                          transition: {
                            duration: 1,
                          },
                          zIndex: "0",
                        }
                      : undefined
                  }
                  key={item.id}
                  id={item.id}
                  viewport={{
                    root: scrollContainerRef,
                    once: true,
                    amount: 0.1,
                  }}
                >
                  <ListCard list={list} />
                </motion.div>
              );
            }
          })}
          <DragOverlay modifiers={[adjustForLayoutPadding]}>
            {draggedItem ? (
              draggedItem.kind === "list" ? (
                <DragListCard list={draggedItem.data as ListsType} />
              ) : (
                <DragSortableFolder folder={draggedItem.data as FolderType} />
              )
            ) : null}
          </DragOverlay>
        </SortableContext>
      </DndContext>
    </>
  );
};
