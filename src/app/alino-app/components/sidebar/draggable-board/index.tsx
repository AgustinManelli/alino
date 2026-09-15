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
import { useUpdateIndexList } from "@/hooks/todo/lists/useUpdateIndexList";
import { useUpdateIndexFolders } from "@/hooks/todo/folders/useUpdateIndexFolders";

import { useCombinedItems } from "./hooks/useCombinedItems";
import { useDndSensors } from "./hooks/useDndSensors";
import { useDragHandlers } from "./hooks/useDragHandlers";
import { customHierarchicalCollisionDetection } from "./utils/collisionDetection";

import { PinnedLists } from "./parts/PinnedLists";
import { RootItems } from "./parts/RootItems";
import { DragOverlayView } from "./parts/DragOverlayView";
import { ListsType, FolderType } from "@/lib/schemas/database.types";

export const DraggableBoard = () => {
  // Zustand selectors
  const { lists, folders, setLists, setFolders } = useTodoDataStore(
    useShallow((state) => ({
      lists: state.lists,
      folders: state.folders,
      setLists: state.setLists,
      setFolders: state.setFolders,
    })),
  );
  const { updateIndexList } = useUpdateIndexList();
  const { updateIndexFolders } = useUpdateIndexFolders();
  const animations = useUserPreferencesStore(useShallow((s) => s.animations));

  // Derivados
  const { combinedItems, topLevelItems, combinedIds, pinnedItems } =
    useCombinedItems(lists, folders);

  const { sensors, measuring, adjustForLayoutPadding } = useDndSensors();

  const { draggedItem, handleDragStart, handleDragEnd, onDragCancel, handleDragOver } =
    useDragHandlers({
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
      collisionDetection={customHierarchicalCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={onDragCancel}
      onDragOver={handleDragOver}
    >
      <PinnedLists pinnedItems={pinnedItems} allLists={lists} draggedItem={draggedItem} animations={animations} />
      <SortableContext
        items={combinedIds}
        strategy={verticalListSortingStrategy}
      >
        <RootItems
          items={topLevelItems.filter(
            (item) =>
              !(item.kind === "list" && (item.data as ListsType).pinned) &&
              !(item.kind === "folder" && (item.data as FolderType).pinned),
          )}
          draggedItem={draggedItem}
          animations={animations}
        />
        <DragOverlayView
          draggedItem={draggedItem}
          modifiers={[adjustForLayoutPadding]}
        />
      </SortableContext>
    </DndContext>
  );
};
