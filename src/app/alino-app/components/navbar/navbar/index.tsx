"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { HomeCard } from "../home-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListCard } from "../list-card";
import { ListInput } from "../list-input";
import { DragListCard } from "../list-card/drag-list-card";

import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { Database } from "@/lib/schemas/todo-schema";

import { IconAlinoMotion } from "@/components/ui/icons/icon-alino-motion";
import { AlinoLogo, MenuIcon } from "@/components/ui/icons/icons";
import styles from "./navbar.module.css";

//INIT EMOJI-MART
import { init } from "emoji-mart";
import data from "@/components/ui/emoji-mart/apple.json";
import { toast } from "sonner";
import { NormalToaster } from "@/components/ui/toaster/normal-toaster";

init({ data });

const containerFMVariant = {
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

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export function Navbar({
  initialFetching = false,
}: {
  initialFetching?: boolean;
}) {
  //estados locales
  const [navbarOpened, setNavbarOpened] = useState<boolean>(false); //Estado para abrir la navbar
  const [draggedItem, setDraggedItem] = useState<ListsType | null>(null); //Estado para el item arrastrado

  //estados globales
  const isMobile = usePlatformInfoStore((state) => state.isMobile);
  const animations = useUserPreferencesStore((state) => state.animations);
  const lists = useTodoDataStore((state) => state.lists);
  const [prevLength, setPrevLength] = useState(lists.length);
  const setLists = useTodoDataStore((state) => state.setLists);
  const updateIndexList = useTodoDataStore((state) => state.updateIndexList);

  //listas memoizadas
  const [pinnedLists, regularLists] = useMemo(() => {
    const pinned = lists.filter((list) => list.pinned);
    const regular = lists.filter((list) => !list.pinned);
    return [pinned, regular];
  }, [lists]);

  //ref's
  const Ref = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current && lists.length > prevLength) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      setPrevLength(lists.length);
    }
  }, [lists.length, prevLength]);

  //function
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedList = lists.find((list) => list.id === active.id);
    setDraggedItem(draggedList || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
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
  };

  //Lógica para cerrar el navbar
  useOnClickOutside(Ref, () => {
    const configMenuContainer = document.getElementById(
      "config-menu-container-navbar-list-card"
    );
    const colorPickerContainer = document.getElementById(
      "color-picker-container-navbar-list-card"
    );
    const listEdit = document.getElementById(
      "list-info-edit-container-list-card"
    );
    if (configMenuContainer || colorPickerContainer || listEdit) return;
    setNavbarOpened(false);
  });

  const toggleNavbar = useCallback(() => {
    setNavbarOpened((prev) => !prev);
  }, []);

  const handleCloseNavbar = useCallback(() => {
    setNavbarOpened(false);
  }, []);

  //dndkit
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5, delay: 250, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 5, delay: 250, tolerance: 5 },
    })
  );

  //contenido memoizado
  const NavbarContent = useMemo(() => {
    return (
      <div className={styles.navbar}>
        <div className={styles.logoContainer}>
          <IconAlinoMotion
            style={{
              height: "20px",
              width: "auto",
              fill: "#1c1c1c",
              opacity: "0.2",
              overflow: "visible",
            }}
          />
        </div>
        {/* Aquí iría todo el contenido del navbar */}
        <motion.section
          className={styles.cardsSection}
          id="listContainer"
          ref={scrollRef}
        >
          {initialFetching ? (
            <div className={styles.cardsContainer}>
              {Array(4)
                .fill(null)
                .map((_, index) => (
                  <Skeleton
                    style={{
                      width: "100%",
                      height: "45px",
                      borderRadius: "15px",
                    }}
                    delay={index * 0.15}
                    key={`skeleton-${index}`}
                  />
                ))}
            </div>
          ) : (
            <motion.section
              className={styles.cardsContainer}
              variants={containerFMVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <HomeCard
                handleCloseNavbar={handleCloseNavbar}
                key={"homecard"}
              />
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={lists}
                  strategy={verticalListSortingStrategy}
                >
                  <DndContext>
                    <AnimatePresence mode="popLayout">
                      {pinnedLists.map((list) => (
                        <motion.div
                          layout={draggedItem ? false : true}
                          variants={animations ? containerFMVariant : undefined}
                          initial={
                            animations ? { scale: 0, opacity: 0 } : undefined
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
                                  zIndex: "-1",
                                }
                              : undefined
                          }
                          key={`pinned-${list.id}`}
                          id={`pinned-${list.id}`}
                        >
                          <ListCard
                            list={list}
                            handleCloseNavbar={handleCloseNavbar}
                          />
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
                        background: `linear-gradient(to right,rgb(250,250,250) 80%, rgb(240,240,240) 100%) 0% center / 200% no-repeat`,
                        backgroundSize: "200% auto",
                        backgroundRepeat: "no-repeat",
                      }}
                    ></motion.div>
                  )}
                  <AnimatePresence mode="popLayout">
                    {regularLists.map((list) => (
                      <motion.div
                        layout={draggedItem ? false : true}
                        variants={animations ? containerFMVariant : undefined}
                        initial={
                          animations
                            ? { scale: 0, opacity: 0, zIndex: 1 }
                            : undefined
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
                        <ListCard
                          list={list}
                          handleCloseNavbar={handleCloseNavbar}
                        />
                      </motion.div>
                    ))}
                    <DragOverlay>
                      {draggedItem ? (
                        <DragListCard
                          list={draggedItem}
                          key={`list-${draggedItem.id}`}
                        />
                      ) : null}
                    </DragOverlay>
                  </AnimatePresence>
                </SortableContext>
              </DndContext>
            </motion.section>
          )}
        </motion.section>
        <div className={styles.inputContainer}>
          <ListInput key={"input"} />
        </div>
      </div>
    );
  }, [
    animations,
    initialFetching,
    regularLists,
    pinnedLists,
    draggedItem,
    DndContext,
    SortableContext,
    lists,
  ]);

  return (
    <>
      {/* BOTON PARA ABRIR NAVBAR MOBILE */}
      <Button navbarOpened={navbarOpened} toggleNavbar={toggleNavbar} />
      {/* NAVBAR */}
      <motion.div
        className={styles.container}
        ref={Ref}
        initial={{ x: 0 }}
        animate={{ x: navbarOpened || !isMobile ? 0 : "-150%" }}
        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
      >
        {NavbarContent}
      </motion.div>
    </>
  );
}

function Button({
  navbarOpened,
  toggleNavbar,
}: {
  navbarOpened: boolean;
  toggleNavbar: () => void;
}) {
  const isMobile = usePlatformInfoStore((state) => state.isMobile);
  return (
    <>
      {isMobile && (
        <motion.button
          onClick={() => {
            toggleNavbar();
          }}
          className={styles.mobileButton}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            opacity: 1,
            scale: navbarOpened ? 0 : 1,
            transition: {
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
            },
          }}
          exit={{
            opacity: 0,
            scale: 0,
            transition: {
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
            },
          }}
        >
          <MenuIcon
            style={{
              width: "25px",
              height: "auto",
              stroke: "#1c1c1c",
              strokeWidth: "2",
            }}
          />
        </motion.button>
      )}
    </>
  );
}
