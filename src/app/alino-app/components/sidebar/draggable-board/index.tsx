"use client";

import { useRef, useEffect, useState } from "react";
import { DndContext, useDndMonitor } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useShallow } from "zustand/shallow";
import React from "react";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

import { useCombinedItems } from "./hooks/useCombinedItems";
import { useDndSensors } from "./hooks/useDndSensors";
import { useDragHandlers } from "./hooks/useDragHandlers";

import { PinnedLists } from "./parts/PinnedLists";
import { RootItems } from "./parts/RootItems";
import { DragOverlayView } from "./parts/DragOverlayView";
import { ListsType } from "@/lib/schemas/database.types";
import { NormalizedItem } from "./utils/types";

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
    <>
      <PinnedLists pinned={pinnedLists} animations={animations} />
      <DndContext
        sensors={sensors}
        measuring={measuring}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={onDragCancel}
      >
        <SortableRoot
          combinedIds={combinedIds}
          topLevelItems={topLevelItems}
          lists={lists}
          draggedItem={draggedItem}
          animations={animations}
        />
        <DragOverlayView
          draggedItem={draggedItem}
          tempListLength={tempListLength}
          modifiers={[adjustForLayoutPadding]}
        />
      </DndContext>
    </>
  );
};

interface SortableRootProps {
  combinedIds: string[];
  topLevelItems: NormalizedItem[];
  lists: ListsType[];
  draggedItem: NormalizedItem | null;
  animations: boolean;
}

const SortableRoot = ({
  combinedIds,
  topLevelItems,
  lists,
  draggedItem,
  animations,
}: SortableRootProps) => {
  const [overId, setOverId] = useState<string | null>(null);
  const [isBelowOver, setIsBelowOver] = useState(false);

  useDndMonitor({
    onDragOver: (event) => {
      const { active, over } = event;
      const overId = over?.id as string | undefined;
      const activeId = active.id;

      const isDraggedItemFromRoot = combinedIds.includes(activeId as string);

      if (!overId || activeId === overId || isDraggedItemFromRoot) {
        setOverId(null);
        return;
      }

      const isOverRootItem = combinedIds.includes(overId as string);

      if (isOverRootItem) {
        if (over?.data.current?.type === "folder-dropzone") {
          setOverId(null);
          return;
        }

        setOverId(overId);

        const overNodeRect = over?.rect;
        const dragNodeRect = active.rect.current.translated;
        if (!dragNodeRect) return;

        if (overNodeRect) {
          const overCenterY = overNodeRect.top + overNodeRect.height / 2;
          setIsBelowOver(dragNodeRect.top > overCenterY);
        }
      } else {
        setOverId(null);
      }
    },
    onDragEnd: () => {
      setOverId(null);
    },
    onDragCancel: () => {
      setOverId(null);
    },
  });

  return (
    <SortableContext items={combinedIds} strategy={verticalListSortingStrategy}>
      <RootItems
        items={topLevelItems.filter(
          (item) => item.kind !== "list" || !(item.data as ListsType).pinned
        )}
        lists={lists}
        draggedItem={draggedItem}
        animations={animations}
        overId={overId}
        isBelowOver={isBelowOver}
      />
    </SortableContext>
  );
};
