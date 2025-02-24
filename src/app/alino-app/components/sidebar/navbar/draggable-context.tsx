"use client";

import { useMemo, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useShallow } from "zustand/shallow";

import { Database } from "@/lib/schemas/todo-schema";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

import { DragListCard } from "../list-card/drag-list-card";
import { ListCard } from "../list-card";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

const variants = {
  hidden: { opacity: 1, scale: 1 },
  visible: {
    rotate: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 50,
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: {
      duration: 0.3,
    },
  },
};

interface DraggableContextProps {
  handleCloseNavbar: () => void;
}

export function DraggableContext({ handleCloseNavbar }: DraggableContextProps) {
  const [draggedItem, setDraggedItem] = useState<ListsType | null>(null); //Estado para el item arrastrado

  const lists = useTodoDataStore(useShallow((state) => state.lists));
  const animations = useUserPreferencesStore(
    useShallow((state) => state.animations)
  );
  const setLists = useTodoDataStore((state) => state.setLists);
  const updateIndexList = useTodoDataStore((state) => state.updateIndexList);

  const [pinnedLists, regularLists] = useMemo(() => {
    const pinned = lists.filter((list) => list.pinned);
    const regular = lists.filter((list) => !list.pinned);
    return [pinned, regular];
  }, [lists]);

  //functions
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const draggedList = lists.find((list) => list.id === active.id);
      setDraggedItem(draggedList || null);
    },
    [lists]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      //función que se inicia al finalizar o soltar un elemento draggable
      const { active, over } = event;

      if (!over || active.id === over.id) {
        setDraggedItem(null);
        return;
      }
      const oldIndex = lists.findIndex((list) => list.id === active.id);
      const newIndex = lists.findIndex((list) => list.id === over.id);

      if (oldIndex !== newIndex) {
        const newLists = arrayMove(lists, oldIndex, newIndex);
        setLists(newLists);

        const prevIndex = newIndex === 0 ? 0 : newLists[newIndex - 1]?.index;
        const postIndex =
          newIndex === newLists.length - 1 ? 0 : newLists[newIndex + 1]?.index;

        if (prevIndex === 0 && postIndex !== null && draggedItem) {
          updateIndexList(draggedItem.id, postIndex / 2);
        } else if (postIndex === 0 && prevIndex !== null && draggedItem) {
          updateIndexList(draggedItem.id, prevIndex + 16384);
        } else if (prevIndex !== null && postIndex !== null && draggedItem) {
          updateIndexList(draggedItem.id, (prevIndex + postIndex) / 2);
        }
      }
      setDraggedItem(null);
    },
    [lists, draggedItem, setLists, updateIndexList]
  );

  //dndkit
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5, delay: 250, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 5, delay: 250, tolerance: 5 },
    })
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={lists} strategy={verticalListSortingStrategy}>
          <DndContext>
            <AnimatePresence mode="popLayout">
              {pinnedLists.map((list) => (
                <motion.div
                  layout={draggedItem ? false : true}
                  variants={animations ? variants : undefined}
                  initial={animations ? { scale: 0, opacity: 0 } : undefined}
                  transition={
                    animations
                      ? {
                          scale: {
                            duration: 0.2,
                            ease: "easeInOut",
                          },
                        }
                      : undefined
                  }
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
                  key={`pinned-${list.id}`}
                  id={`pinned-${list.id}`}
                >
                  <ListCard list={list} handleCloseNavbar={handleCloseNavbar} />
                </motion.div>
              ))}
            </AnimatePresence>
          </DndContext>
          {lists.filter((list) => list.pinned === true).length > 0 && (
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
          <AnimatePresence mode="popLayout">
            {regularLists.map((list) => (
              <motion.div
                layout={draggedItem ? false : true}
                variants={animations ? variants : undefined}
                initial={
                  animations ? { scale: 0, opacity: 0, zIndex: 1 } : undefined
                }
                transition={
                  animations
                    ? {
                        scale: {
                          duration: 0.2,
                          ease: "easeInOut",
                        },
                      }
                    : undefined
                }
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
                key={`list-${list.id}`}
                id={`list-${list.id}`}
              >
                <ListCard list={list} handleCloseNavbar={handleCloseNavbar} />
              </motion.div>
            ))}
          </AnimatePresence>
          <DragOverlay>
            {draggedItem ? (
              <DragListCard list={draggedItem} key={`list-${draggedItem.id}`} />
            ) : null}
          </DragOverlay>
        </SortableContext>
      </DndContext>
    </>
  );
}
