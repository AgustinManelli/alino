"use client";

import { useEffect, useRef, useState } from "react";
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

import { useMobileStore } from "@/store/useMobileStore";
import { useAnimationStore } from "@/store/useAnimationStore";
import { useLists } from "@/store/lists";
import { Database } from "@/lib/todosSchema";

import { HomeCard } from "../home-card";
import { ListCard } from "../list-card";
import { DragListCard } from "../list-card/drag-list-card";
import { ListInput } from "../list-input";
import { Skeleton } from "@/components/skeleton";

import { IconAlinoMotion } from "@/lib/ui/icon-alino-motion";
import { MenuIcon } from "@/lib/ui/icons";
import styles from "./navbar.module.css";

//INIT EMOJI-MART
import { init } from "emoji-mart";
import data from "@emoji-mart/data/sets/15/apple.json";
init({ data });

export function Navbar({ initialFetching }: { initialFetching: boolean }) {
  //estados locales
  const [isActive, setIsActive] = useState<boolean>(false); //estado para navbar mobile
  const [draggedItem, setDraggedItem] = useState<ListsType | null>(null); //Drag de elemento
  const [isCreating, setIsCreating] = useState<boolean>(false); //Almacenando o editando lista
  const [navScrolling, setNavScrolling] = useState<number>(0); //Valor del scroll en navbar
  const [allowCloseNavbar, setAllowCloseNavbar] = useState<boolean>(true);

  //estados globales
  const { isMobile } = useMobileStore();
  const { lists, setLists, updateListPosition } = useLists();
  const { animations } = useAnimationStore();

  //ref's
  const Ref = useRef<HTMLInputElement | null>(null);
  const prevLengthRef = useRef<number>(lists.length);
  const scrollRef = useRef<HTMLDivElement>(null);

  //useEffect's
  useEffect(() => {
    //useEffect para desplazar navbar cuando se agrega una lista
    if (lists.length > prevLengthRef.current) {
      // Solo ejecuta el scroll si se agregó un elemento
      const objDiv = document.getElementById("listContainer");
      if (objDiv !== null) {
        objDiv.scrollTo({
          top: objDiv.scrollHeight,
          behavior: "smooth",
        });
      }
    }
    prevLengthRef.current = lists.length;
  }, [lists]);

  useEffect(() => {
    //useEffect para dar valor a la posición del scroll en el navbar
    const handleScroll = () => {
      if (scrollRef.current) {
        setNavScrolling(scrollRef.current.scrollTop); // Actualiza la posición del scroll
      }
    };

    const divElement = scrollRef.current;
    if (divElement) {
      divElement.addEventListener("scroll", handleScroll); // Escucha el evento scroll
    }

    return () => {
      if (divElement) {
        divElement.removeEventListener("scroll", handleScroll); // Limpia el evento al desmontar
      }
    };
  }, []);

  //funciones
  const handleCloseNavbar = () => {
    //funcion para cerrar navbar mobile
    setIsActive(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    //función que se inicial al hacer drag
    const { active } = event;
    const draggedList = lists.find((list) => list.id === active.id);
    if (draggedList) {
      setDraggedItem(draggedList);
    }
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
        updateListPosition(draggedItem.id, postIndex / 2);
      } else if (postIndex === 0 && prevIndex !== null && draggedItem) {
        updateListPosition(draggedItem.id, prevIndex + 16384);
      } else if (prevIndex !== null && postIndex !== null && draggedItem) {
        updateListPosition(draggedItem.id, (prevIndex + postIndex) / 2);
      }
    }
    setDraggedItem(null);
  };

  //customHooks
  useOnClickOutside(Ref, () => {
    //customHook para cerrar navbar al hacer click fuera
    if (allowCloseNavbar && !isCreating) {
      handleCloseNavbar();
    }
  });

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
      {/* BOTON PARA ABRIR NAVBAR MOBILE */}
      {isMobile && (
        <button
          onClick={() => {
            setIsActive(!isActive);
          }}
          className={styles.mobileButton}
        >
          <MenuIcon
            style={{
              width: "25px",
              height: "auto",
              stroke: "#1c1c1c",
              strokeWidth: "2",
            }}
          />
        </button>
      )}

      {/* NAVBAR */}
      <div
        className={styles.container}
        style={{ left: isActive ? "0" : "-100%" }}
        ref={Ref}
      >
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
                        {lists
                          .filter((list) => list.pinned === true)
                          .map((list) => (
                            <motion.div
                              layout={draggedItem ? false : true}
                              variants={
                                animations ? containerFMVariant : undefined
                              }
                              initial={
                                animations
                                  ? { scale: 0, opacity: 0 }
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
                                        duration: 0.5,
                                      },
                                      zIndex: "5",
                                    }
                                  : undefined
                              }
                              key={`pinned-${list.id}`}
                              id={`pinned-${list.id}`}
                            >
                              <ListCard
                                list={list}
                                setIsCreating={setIsCreating}
                                isCreating={isCreating}
                                handleCloseNavbar={handleCloseNavbar}
                                navScrolling={navScrolling}
                                setAllowCloseNavbar={setAllowCloseNavbar}
                              />
                            </motion.div>
                          ))}
                      </AnimatePresence>
                    </DndContext>
                    {lists.filter((list) => list.pinned === true).length >
                      0 && (
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
                      {lists
                        .filter((list) => list.pinned === false)
                        .map((list) => (
                          <motion.div
                            layout={draggedItem ? false : true}
                            variants={
                              animations ? containerFMVariant : undefined
                            }
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
                                      duration: 0.5,
                                    },
                                    zIndex: "5",
                                  }
                                : undefined
                            }
                            key={`list-${list.id}`}
                            id={`list-${list.id}`}
                          >
                            <ListCard
                              list={list}
                              setIsCreating={setIsCreating}
                              isCreating={isCreating}
                              handleCloseNavbar={handleCloseNavbar}
                              navScrolling={navScrolling}
                              setAllowCloseNavbar={setAllowCloseNavbar}
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
            <ListInput setIsCreating={setIsCreating} key={"input"} />
          </div>
        </div>
      </div>
    </>
  );
}

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

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
