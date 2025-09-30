"use client";

import { useRef, useEffect } from "react";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useShallow } from "zustand/shallow";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

import { useCombinedItems } from "./hooks/useCombinedItems";
import { useDndSensors } from "./hooks/useDndSensors";
import { useDragHandlers } from "./hooks/useDragHandlers";

import { PinnedLists } from "./parts/PinnedLists";
import { RootItems } from "./parts/RootItems";
import { DragOverlayView } from "./parts/DragOverlayView";
import { ListsType } from "@/lib/schemas/database.types";

export const DraggableBoard = () => {
  // Zustand selectors
  const {
    lists,
    folders,
    setLists,
    setFolders,
    updateIndexList,
    updateIndexFolders,
  } = useTodoDataStore(
    useShallow((state) => ({
      lists: state.lists,
      folders: state.folders,
      setLists: state.setLists,
      setFolders: state.setFolders,
      updateIndexList: state.updateIndexList,
      updateIndexFolders: state.updateIndexFolders,
    }))
  );
  const animations = useUserPreferencesStore(useShallow((s) => s.animations));

  // Derivados
  const { combinedItems, topLevelItems, combinedIds, pinnedLists } =
    useCombinedItems(lists, folders);

  // DnD infra
  const { sensors, measuring, adjustForLayoutPadding } = useDndSensors();

  // Handlers
  const {
    draggedItem,
    tempListLength,
    handleDragStart,
    handleDragEnd,
    onDragCancel,
  } = useDragHandlers({
    combinedItems,
    lists,
    folders,
    setLists,
    setFolders,
    updateIndexList,
    updateIndexFolders,
  });

  const scrollContainerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    scrollContainerRef.current = document.getElementById("list-container");
  }, []);

  const navbarRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    navbarRef.current = document.getElementById("navbar-all-container");
  }, []);

  return (
    <DndContext
      sensors={sensors}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={onDragCancel}
    >
      <PinnedLists pinned={pinnedLists} animations={animations} />

      <SortableContext
        items={combinedIds}
        strategy={verticalListSortingStrategy}
      >
        <RootItems
          items={topLevelItems.filter(
            (item) => item.kind !== "list" || !(item.data as ListsType).pinned
          )}
          lists={lists}
          draggedItem={draggedItem}
          animations={animations}
        />
        <DragOverlayView
          draggedItem={draggedItem}
          tempListLength={tempListLength}
          modifiers={[adjustForLayoutPadding]}
        />
      </SortableContext>
    </DndContext>
  );
};
