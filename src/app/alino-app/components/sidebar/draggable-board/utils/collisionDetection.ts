"use client";

import {
  CollisionDetection,
  pointerWithin,
  closestCorners,
  rectIntersection,
} from "@dnd-kit/core";

export const customHierarchicalCollisionDetection: CollisionDetection = (args) => {
  const activeType = args.active.data?.current?.type;

  const pointerCollisions = pointerWithin(args);

  if (pointerCollisions.length > 0) {
    if (activeType === "folder") {
      const rootCollisions = pointerCollisions.filter((c) => {
        const data = c.data?.droppableContainer?.data?.current;
        return (
          data?.type === "folder" ||
          (data?.type === "item" && !data?.parentId)
        );
      });
      if (rootCollisions.length > 0) {
        return [rootCollisions[0]];
      }
    } else {
      const itemCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === "item"
      );
      if (itemCollision) {
        return [itemCollision];
      }

      const folderDropzoneCollision = pointerCollisions.find(
        (c) =>
          c.data?.droppableContainer?.data?.current?.type === "folder-dropzone"
      );
      if (folderDropzoneCollision) {
        return [folderDropzoneCollision];
      }

      return [pointerCollisions[0]];
    }
  }

  const cornerCollisions = closestCorners(args);
  if (activeType === "folder") {
    const rootCorners = cornerCollisions.filter((c) => {
      const data = c.data?.droppableContainer?.data?.current;
      return (
        data?.type === "folder" ||
        (data?.type === "item" && !data?.parentId)
      );
    });
    if (rootCorners.length > 0) {
      return [rootCorners[0]];
    }
  }

  if (cornerCollisions.length > 0) {
    return cornerCollisions;
  }

  return rectIntersection(args);
};
