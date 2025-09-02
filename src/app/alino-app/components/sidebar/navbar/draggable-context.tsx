"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
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
  rectIntersection,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useShallow } from "zustand/shallow";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

import { DragListCard } from "../list-card/drag-list-card";
import { ListCard } from "../list-card";
import { SortableFolder } from "../folders/sortable-folder";
import { DragSortableFolder } from "../folders/drag-sortable-folder";

import { ListsType, FolderType } from "@/lib/schemas/todo-schema";

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

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

export const DraggableContext = () => {
  const [draggedItem, setDraggedItem] = useState<NormalizedItem | null>(null);
  const [tempListLength, setTempListLenght] = useState<number>(0);

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
      ? lists
          .filter((l) => l.pinned !== true)
          .map((l) => ({
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

  const pinnedLists = useMemo(
    () => lists.filter((l) => l.pinned === true),
    [lists]
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
      if (current) {
        const activeType = active.data?.current?.type;
        setDraggedItem(current);
        if (activeType === "folder") {
          setTempListLenght(
            lists.filter((ls) => ls.folder === active.id).length
          );
        }
      }
    },
    [combinedItems]
  );

  //Función cuando se suelta elemento
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id === over?.id) {
        setDraggedItem(null);
        setTempListLenght(0);
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
        setTempListLenght(0);
        return;
      }

      const newOrder = arrayMove(combinedItems.slice(), oldIndex, newIndex);
      const moved = newOrder[newIndex];

      const activeType = active.data?.current?.type;
      if (over) {
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
              updateIndexList(
                movedList.list_id,
                computedIndex,
                movedList.folder
              );
            } else {
              const computedIndex = calcNewIndex(newOrder, newIndex);
              movedList.index = computedIndex;
              movedList.folder =
                over.data.current.parentId ?? over.data.current.folderId;
              newOrder[newIndex] = { ...newOrder[newIndex], data: movedList };
              updateIndexList(
                movedList.list_id,
                computedIndex,
                over.data.current.parentId ?? over.data.current.folderId
              );
            }
          }
        } else {
          if (activeType === "item") {
            const movedList = { ...(moved.data as ListsType) };
            const computedIndex = calcNewIndex(newOrder, newIndex);
            movedList.index = computedIndex;
            movedList.folder = null;
            newOrder[newIndex] = { ...newOrder[newIndex], data: movedList };
            updateIndexList(movedList.list_id, computedIndex, null);
          }
          if (activeType === "folder") {
            const movedFolder = { ...(moved.data as FolderType) };
            const computedIndex = calcNewIndex(newOrder, newIndex);
            movedFolder.index = computedIndex;
            newOrder[newIndex] = { ...newOrder[newIndex], data: movedFolder };
            updateIndexFolders(movedFolder.folder_id, computedIndex);
          }
        }
      } else {
        if (activeType === "item" && active.data?.current?.parentId) {
          const movedList = { ...(moved.data as ListsType) };
          const computedIndex = calcNewIndex(newOrder, newIndex);
          movedList.index = computedIndex;
          movedList.folder = null;
          newOrder[newIndex] = { ...newOrder[newIndex], data: movedList };
          updateIndexList(movedList.list_id, computedIndex, null);
        }
        // if (activeType === "folder") {
        //   const movedFolder = { ...(moved.data as FolderType) };
        //   const computedIndex = calcNewIndex(newOrder, newIndex);
        //   movedFolder.index = computedIndex;
        //   newOrder[newIndex] = { ...newOrder[newIndex], data: movedFolder };
        //   updateIndexFolders(movedFolder.folder_id, computedIndex);
        // }
      }

      const updatedFolders = newOrder
        .filter((it) => it.kind === "folder")
        .map((it) => it.data as FolderType);

      const updatedLists = newOrder
        .filter((it) => it.kind === "list")
        .map((it) => it.data as ListsType);

      const movedListsMap = new Map(updatedLists.map((l) => [l.list_id, l]));
      const movedFoldersMap = new Map(
        updatedFolders.map((f) => [f.folder_id, f])
      );

      const finalLists = lists.map((orig) =>
        movedListsMap.has(orig.list_id)
          ? { ...(movedListsMap.get(orig.list_id) as ListsType) }
          : orig
      );

      updatedLists.forEach((l) => {
        if (!finalLists.find((x) => x.list_id === l.list_id))
          finalLists.push(l);
      });

      const finalFolders = list_folders.map((orig) =>
        movedFoldersMap.has(orig.folder_id)
          ? { ...(movedFoldersMap.get(orig.folder_id) as FolderType) }
          : orig
      );
      updatedFolders.forEach((f) => {
        if (!finalFolders.find((x) => x.folder_id === f.folder_id))
          finalFolders.push(f);
      });

      setLists(finalLists);
      setFolders(finalFolders);
      setDraggedItem(null);
      setTempListLenght(0);
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

  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    ref.current = document.getElementById("navbar-all-container");
  }, []);

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragCancel={() => {
          setDraggedItem(null);
          setTempListLenght(0);
        }}
        collisionDetection={rectIntersection}
        measuring={measuring}
      >
        <AnimatePresence mode="popLayout">
          {pinnedLists.map((list) => (
            <motion.div
              variants={animations ? variants : undefined}
              initial={animations ? { scale: 0, opacity: 0 } : undefined}
              animate={"visible"}
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
                      zIndex: "-1",
                    }
                  : undefined
              }
              key={`pinned-${list.list_id}`}
              id={`pinned-${list.list_id}`}
            >
              <ListCard list={list} />
            </motion.div>
          ))}
          {pinnedLists.length > 0 && (
            <motion.div
              animate={{
                backgroundPosition: ["200% center", "0% center"],
              }}
              transition={{
                duration: 1,
                ease: "linear",
                delay: 0.2,
              }}
              id="separator"
              style={{
                width: "100%",
                height: "2px",
                background: `linear-gradient(to right,var(--hover-over-container) 80%, var(--border-container-color) 100%) 0% center / 200% no-repeat`,
                backgroundSize: "200% auto",
                backgroundRepeat: "no-repeat",
              }}
            ></motion.div>
          )}
        </AnimatePresence>
        <SortableContext
          items={combinedIds}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence>
            {topLevelItems.map((item) => {
              if (item.kind === "folder") {
                const folder = item.data as FolderType;
                return (
                  <motion.div
                    variants={animations ? variants : undefined}
                    initial={
                      animations
                        ? { scale: 0, opacity: 0, zIndex: 1 }
                        : undefined
                    }
                    animate={"visible"}
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
                    key={`folder-${item.id}`}
                    id={item.id}
                  >
                    <SortableFolder
                      folder={folder}
                      lists={lists.filter(
                        (ls) => ls.folder === folder.folder_id
                      )}
                      isDragging={!!draggedItem}
                      dropAllowed={draggedItem?.kind === "list"}
                    />
                  </motion.div>
                );
              } else {
                const list = item.data as ListsType;
                return (
                  <motion.div
                    variants={animations ? variants : undefined}
                    initial={
                      animations
                        ? { scale: 0, opacity: 0, zIndex: 1 }
                        : undefined
                    }
                    animate={"visible"}
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
                    key={`list-${item.id}`}
                    id={item.id}
                  >
                    <ListCard list={list} />
                  </motion.div>
                );
              }
            })}
          </AnimatePresence>
          <DragOverlay modifiers={[adjustForLayoutPadding]}>
            {draggedItem ? (
              draggedItem.kind === "list" ? (
                <DragListCard list={draggedItem.data as ListsType} />
              ) : (
                <DragSortableFolder
                  folder={draggedItem.data as FolderType}
                  listCount={tempListLength}
                />
              )
            ) : null}
          </DragOverlay>
        </SortableContext>
      </DndContext>
    </>
  );
};
