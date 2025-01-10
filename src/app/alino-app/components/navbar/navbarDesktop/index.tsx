// "use client";

// import { useEffect, useRef, useState } from "react";
// import { AnimatePresence, Reorder, motion } from "motion/react";
// import { useLists } from "@/store/lists";
// import { AlinoLogo, MenuIcon } from "@/lib/ui/icons";
// import { Skeleton } from "@/components";
// import ListInput from "../listInput";
// import ListCard from "./listCard";
// import styles from "./navbar.module.css";
// import HomeCard from "../homeCard/homeCard";
// import useMobileStore from "@/store/useMobileStore";
// import useOnClickOutside from "@/hooks/useOnClickOutside";
// import { Database } from "@/lib/todosSchema";

// //INIT EMOJI-MART
// import { init } from "emoji-mart";
// import data from "@emoji-mart/data/sets/15/apple.json";
// init({ data });

// type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

// const containerFMVariant = {
//   hidden: { opacity: 1, scale: 1 },
//   visible: {
//     rotate: 0,
//     opacity: 1,
//     scale: 1,
//     transition: {
//       type: "spring",
//       stiffness: 50,
//       delayChildren: 0.1,
//       staggerChildren: 0.1,
//     },
//   },
//   exit: {
//     opacity: 0,
//     scale: 0,
//     transition: {
//       duration: 0.3,
//     },
//   },
// };

// export default function Navbar({
//   initialFetching,
// }: {
//   initialFetching: boolean;
// }) {
//   const [isActive, setIsActive] = useState<boolean>(false);

//   const [isCreating, setIsCreating] = useState<boolean>(false);

//   const [draggedItem, setDraggedItem] = useState<ListsType | null>(null);

//   const [tempIndex, setTempIndex] = useState<number | null>(null);

//   const lists = useLists((state) => state.lists);
//   const setLists = useLists((state) => state.setLists);
//   const updateListPosition = useLists((state) => state.updateListPosition);

//   const { isMobile, setIsMobile } = useMobileStore();

//   const Ref = useRef<HTMLInputElement | null>(null);
//   const refContainer = useRef<HTMLDivElement | null>(null);

//   const [position, setPosition] = useState({ x: 0, y: 0 });

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 850);
//     };

//     window.addEventListener("resize", handleResize);
//     handleResize();
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const handleCloseNavbar = () => {
//     setIsActive(false);
//   };

//   useOnClickOutside(Ref, () => {
//     if (!isCreating) {
//       handleCloseNavbar();
//     }
//   });

//   const handleSet = (values: ListsType[]) => {
//     setLists(values);
//   };

//   const handleDragStart = (list: ListsType) => {
//     setDraggedItem(list);

//     const index = lists.findIndex((item) => item.id === list.id);
//     setTempIndex(index);
//   };

//   const handleDragEnd = () => {
//     const index = lists.findIndex((list) => list.id === draggedItem?.id);

//     const prevIndex = index === 0 ? 0 : lists[index - 1]?.index;
//     const postIndex = index === lists.length - 1 ? 0 : lists[index + 1]?.index;

//     if (tempIndex === index) {
//       setDraggedItem(null);
//       setTempIndex(null);
//       return;
//     }

//     if (prevIndex === 0 && postIndex !== null && draggedItem) {
//       updateListPosition(draggedItem.id, postIndex / 2);
//     } else if (postIndex === 0 && prevIndex !== null && draggedItem) {
//       updateListPosition(draggedItem?.id, prevIndex + 16384);
//     } else if (prevIndex !== null && postIndex !== null && draggedItem) {
//       updateListPosition(draggedItem?.id, (prevIndex + postIndex) / 2);
//     }
//   };

//   const prevLengthRef = useRef<number>(lists.length);
//   useEffect(() => {
//     // Referencia para almacenar la longitud anterior de la lista

//     if (lists.length > prevLengthRef.current) {
//       // Solo ejecuta el scroll si se agregó un elemento
//       const objDiv = document.getElementById("listContainer");
//       if (objDiv !== null) {
//         objDiv.scrollTo({
//           top: objDiv.scrollHeight,
//           behavior: "smooth",
//         });
//       }
//     }

//     // Actualiza la longitud previa
//     prevLengthRef.current = lists.length;
//   }, [lists]);

//   function onDrag(event: any, info: any) {
//     const scrollContainer = document.getElementById("listContainer");
//     if (!scrollContainer) return;
//     const containerHeight = Ref.current?.clientHeight;
//     const speed = 10; // Velocidad del desplazamiento

//     if (!containerHeight) return;

//     if (info.point.y > containerHeight * 0.8) {
//       scrollContainer.scrollBy({ top: speed, behavior: "smooth" });
//     } else if (info.point.y < containerHeight * 0.2) {
//       scrollContainer.scrollBy({ top: -speed, behavior: "smooth" });
//     }
//   }

//   return (
//     <>
//       {isMobile && (
//         <button
//           onClick={() => {
//             setIsActive(!isActive);
//           }}
//           className={styles.mobileButton}
//         >
//           <MenuIcon
//             style={{
//               width: "25px",
//               height: "auto",
//               stroke: "#1c1c1c",
//               strokeWidth: "2",
//             }}
//           />
//         </button>
//       )}
//       <div
//         className={styles.container}
//         style={{ left: isActive ? "0" : "-100%" }}
//         ref={Ref}
//       >
//         <div className={styles.navbar}>
//           <div className={styles.logoContainer}>
//             <AlinoLogo
//               style={{
//                 height: "20px",
//                 width: "auto",
//                 fill: "#1c1c1c",
//                 opacity: "0.1",
//               }}
//               decoFill={"#1c1c1c"}
//             />
//           </div>
//           <motion.section
//             className={styles.cardsSection}
//             id="listContainer"
//             style={{ overflowY: isCreating ? "hidden" : "scroll" }}
//           >
//             {initialFetching ? (
//               <div className={styles.cardsContainer}>
//                 {Array(4)
//                   .fill(null)
//                   .map((_, index) => (
//                     <Skeleton
//                       style={{
//                         width: "100%",
//                         height: "45px",
//                         borderRadius: "15px",
//                       }}
//                       delay={index * 0.15}
//                       key={index}
//                     />
//                   ))}
//               </div>
//             ) : (
//               <Reorder.Group
//                 as="div"
//                 axis="y"
//                 variants={containerFMVariant}
//                 // initial="hidden"
//                 animate="visible"
//                 exit="exit"
//                 className={styles.cardsContainer}
//                 values={lists}
//                 onReorder={handleSet}
//                 ref={refContainer}
//               >
//                 <AnimatePresence mode="popLayout">
//                   <HomeCard
//                     handleCloseNavbar={handleCloseNavbar}
//                     key={"homecard"}
//                   />
//                   {lists
//                     .filter((list) => list.pinned)
//                     .map((list) => (
//                       <Reorder.Item
//                         layout
//                         variants={containerFMVariant}
//                         initial={{ scale: 0, opacity: 0 }}
//                         exit={{
//                           scale: 1.3,
//                           opacity: 0,
//                           filter: "blur(30px) grayscale(100%)",
//                           y: -30,
//                           transition: {
//                             duration: 1,
//                           },
//                         }}
//                         key={`${list.id}-pinned`}
//                         value={list}
//                         onDragStart={() => handleDragStart(list)}
//                         onDragEnd={handleDragEnd}
//                         dragConstraints={refContainer}
//                         dragElastic={0.1}
//                         onDrag={onDrag}
//                         dragListener={isCreating ? false : true}
//                         whileDrag={{
//                           scale: 1.1,
//                           zIndex: 1000,
//                           rotate: [1, -1, 1],
//                           transition: {
//                             rotate: {
//                               repeat: Infinity,
//                               duration: 0.2,
//                               ease: "easeInOut",
//                             },
//                           },
//                         }}
//                         onClick={(e: any) => {
//                           if (draggedItem) {
//                             e.preventDefault();
//                           }
//                         }}
//                       >
//                         <ListCard
//                           list={list}
//                           setIsCreating={setIsCreating}
//                           isCreating={isCreating}
//                           handleCloseNavbar={handleCloseNavbar}
//                         />
//                       </Reorder.Item>
//                     ))}
//                   {lists
//                     .filter((list) => list.pinned === false)
//                     .map((list) => (
//                       <Reorder.Item
//                         layout
//                         variants={containerFMVariant}
//                         initial={{ scale: 0, opacity: 0 }}
//                         exit={{
//                           scale: 1.3,
//                           opacity: 0,
//                           filter: "blur(30px) grayscale(100%)",
//                           y: -30,
//                           transition: {
//                             duration: 1,
//                           },
//                         }}
//                         key={list.id}
//                         value={list}
//                         onDragStart={() => handleDragStart(list)}
//                         onDragEnd={handleDragEnd}
//                         dragConstraints={refContainer}
//                         dragElastic={0.1}
//                         onDrag={onDrag}
//                         dragListener={isCreating ? false : true}
//                         whileDrag={{
//                           scale: 1.1,
//                           zIndex: 1000,
//                           rotate: [1, -1, 1],
//                           transition: {
//                             rotate: {
//                               repeat: Infinity,
//                               duration: 0.2,
//                               ease: "easeInOut",
//                             },
//                           },
//                         }}
//                       >
//                         <ListCard
//                           list={list}
//                           setIsCreating={setIsCreating}
//                           isCreating={isCreating}
//                           handleCloseNavbar={handleCloseNavbar}
//                         />
//                       </Reorder.Item>
//                     ))}
//                   <ListInput setIsCreating={setIsCreating} key={"input"} />
//                 </AnimatePresence>
//               </Reorder.Group>
//             )}
//           </motion.section>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";
import styles from "./navbar.module.css";
import useMobileStore from "@/store/useMobileStore";
import { useLists } from "@/store/lists";
import { use, useEffect, useRef, useState } from "react";
import { AlinoLogo, MenuIcon } from "@/lib/ui/icons";
import { AnimatePresence, motion } from "motion/react";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Database } from "@/lib/todosSchema";
type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

//INIT EMOJI-MART
import { init } from "emoji-mart";
import data from "@emoji-mart/data/sets/15/apple.json";
init({ data });

import ListCard from "./listCard";
import ListInput from "../listInput";
import HomeCard from "../homeCard/homeCard";
import { Skeleton } from "@/components";

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

export default function Navbar({
  initialFetching,
}: {
  initialFetching: boolean;
}) {
  //estados locales
  const [isActive, setIsActive] = useState<boolean>(false);
  const [draggedItem, setDraggedItem] = useState<ListsType | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  //estados globales
  const { isMobile, setIsMobile } = useMobileStore();
  const lists = useLists((state) => state.lists);
  const setLists = useLists((state) => state.setLists);
  const updateListPosition = useLists((state) => state.updateListPosition);

  //ref's
  const Ref = useRef<HTMLInputElement | null>(null);

  const handleCloseNavbar = () => {
    setIsActive(false);
  };

  useOnClickOutside(Ref, () => {
    if (!isCreating) {
      handleCloseNavbar();
    }
  });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5, delay: 250, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 5, delay: 250, tolerance: 5 },
    })
    // useSensor(PointerSensor),
    // useSensor(KeyboardSensor, {
    //   coordinateGetter: sortableKeyboardCoordinates,
    // })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedList = lists.find((list) => list.id === active.id);
    if (draggedList) {
      setDraggedItem(draggedList);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
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

  return (
    <>
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
      <div
        className={styles.container}
        style={{ left: isActive ? "0" : "-100%" }}
        ref={Ref}
      >
        <div className={styles.navbar}>
          <div className={styles.logoContainer}>
            <AlinoLogo
              style={{
                height: "20px",
                width: "auto",
                fill: "#1c1c1c",
                opacity: "0.1",
              }}
              decoFill={"#1c1c1c"}
            />
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            modifiers={[restrictToVerticalAxis]}
          >
            <motion.section className={styles.cardsSection}>
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
                <SortableContext
                  items={lists}
                  strategy={verticalListSortingStrategy}
                >
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
                    <AnimatePresence mode="popLayout">
                      {lists.map((list) => (
                        <motion.div
                          layout
                          layoutId={`list-${list.id}`}
                          transition={{
                            layout: {
                              duration: draggedItem?.id === list.id ? 0 : 1,
                              type: "spring",
                              bounce: 0.2,
                            },
                          }}
                          variants={containerFMVariant}
                          initial={{ scale: 0, opacity: 0 }}
                          exit={{
                            scale: 1.3,
                            opacity: 0,
                            filter: "blur(30px) grayscale(100%)",
                            y: -30,
                            transition: {
                              duration: 1,
                            },
                            zIndex: "5",
                          }}
                          key={`list-${list.id}`}
                        >
                          <ListCard
                            list={list}
                            setIsCreating={setIsCreating}
                            isCreating={isCreating}
                            handleCloseNavbar={handleCloseNavbar}
                            draggedItem={draggedItem?.id}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <ListInput setIsCreating={setIsCreating} key={"input"} />
                  </motion.section>
                </SortableContext>
              )}
            </motion.section>
          </DndContext>
        </div>
      </div>
    </>
  );
}
