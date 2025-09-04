"use client";

import { DragOverlay, type Modifier } from "@dnd-kit/core";
import { DragListCard } from "../../list-card/drag-list-card";
import { DragSortableFolder } from "../../folders/drag-sortable-folder";
import type { NormalizedItem } from "../utils/types";
import type { ListsType, FolderType } from "@/lib/schemas/todo-schema";

export function DragOverlayView({
  draggedItem,
  tempListLength,
  modifiers,
}: {
  draggedItem: NormalizedItem | null;
  tempListLength: number;
  modifiers?: Modifier[];
}) {
  return (
    <DragOverlay modifiers={modifiers}>
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
  );
}
