"use client";

import { useEffect, useRef, useState } from "react";
import { motion, Reorder } from "motion/react";
import { useLists } from "@/store/lists";
import { AlinoLogo, MenuIcon } from "@/lib/ui/icons";
import { Skeleton } from "@/components";
import ListInput from "../listInput";
import ListCard from "./listCard";
import styles from "./navbar.module.css";
import HomeCard from "../homeCard/homeCard";
import useMobileStore from "@/store/useMobileStore";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { Database } from "@/lib/todosSchema";

//INIT EMOJI-MART
import { init } from "emoji-mart";
import data from "@emoji-mart/data/sets/15/apple.json";
init({ data });

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

const containerFMVariant = {
  hidden: { opacity: 1, scale: 1 },
  visible: {
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
  },
};

export default function Navbar({
  initialFetching,
}: {
  initialFetching: boolean;
}) {
  const [isActive, setIsActive] = useState<boolean>(false);

  const [isCreating, setIsCreating] = useState<boolean>(false);

  const [draggedItem, setDraggedItem] = useState<ListsType | null>(null);

  const [tempIndex, setTempIndex] = useState<number | null>(null);

  const lists = useLists((state) => state.lists);
  const setLists = useLists((state) => state.setLists);
  const updateListPosition = useLists((state) => state.updateListPosition);

  const { isMobile, setIsMobile } = useMobileStore();

  const Ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 850);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCloseNavbar = () => {
    setIsActive(false);
  };

  useOnClickOutside(Ref, () => {
    if (!isCreating) {
      handleCloseNavbar();
    }
  });

  const handleSet = (values: ListsType[]) => {
    setLists(values);
  };

  const handleDragStart = (list: ListsType) => {
    setDraggedItem(list);
    const index = lists.findIndex((item) => item.id === list.id);
    setTempIndex(index);
  };

  const handleDragEnd = () => {
    const index = lists.findIndex((list) => list.id === draggedItem?.id);

    const prevIndex = index === 0 ? 0 : lists[index - 1]?.index;
    const postIndex = index === lists.length - 1 ? 0 : lists[index + 1]?.index;

    if (tempIndex === index) {
      setDraggedItem(null);
      setTempIndex(null);
      return;
    }

    if (prevIndex === 0 && postIndex !== null && draggedItem) {
      updateListPosition(draggedItem.id, postIndex / 2);
    } else if (postIndex === 0 && prevIndex !== null && draggedItem) {
      updateListPosition(draggedItem?.id, prevIndex + 16384);
    } else if (prevIndex !== null && postIndex !== null && draggedItem) {
      updateListPosition(draggedItem?.id, (prevIndex + postIndex) / 2);
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
          <section className={styles.cardsSection} id="listContainer">
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
                      key={index}
                    />
                  ))}
              </div>
            ) : (
              <Reorder.Group
                variants={containerFMVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={styles.cardsContainer}
                values={lists}
                onReorder={handleSet}
              >
                <HomeCard handleCloseNavbar={handleCloseNavbar} />
                {lists
                  .filter((list) => list.pinned)
                  .map((list) => (
                    <Reorder.Item
                      variants={containerFMVariant}
                      initial={{ scale: 0, opacity: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      key={list.id}
                      value={list}
                      onDragStart={() => handleDragStart(list)}
                      onDragEnd={handleDragEnd}
                    >
                      <ListCard
                        list={list}
                        setIsCreating={setIsCreating}
                        isCreting={isCreating}
                        handleCloseNavbar={handleCloseNavbar}
                      />
                    </Reorder.Item>
                  ))}
                {lists
                  .filter((list) => list.pinned === false)
                  .map((list) => (
                    <Reorder.Item
                      layout
                      variants={containerFMVariant}
                      initial={{ scale: 0, opacity: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      key={list.id}
                      value={list}
                      onDragStart={() => handleDragStart(list)}
                      onDragEnd={handleDragEnd}
                    >
                      <ListCard
                        list={list}
                        setIsCreating={setIsCreating}
                        isCreting={isCreating}
                        handleCloseNavbar={handleCloseNavbar}
                      />
                    </Reorder.Item>
                  ))}
                <ListInput setIsCreating={setIsCreating} />
              </Reorder.Group>
              // <motion.div
              //   variants={containerFMVariant}
              //   initial="hidden"
              //   animate="visible"
              //   exit="exit"
              //   className={styles.cardsContainer}
              //   // whileInView="visible"
              //   // viewport={{ once: true, amount: 0.8 }}
              // >
              //   <HomeCard handleCloseNavbar={handleCloseNavbar} />
              //   {lists
              //     .sort((a, b) => {
              //       if (a.pinned && !b.pinned) return -1;
              //       if (!a.pinned && b.pinned) return 1;
              //       if (a.index === null) return 1;
              //       if (b.index === null) return -1;
              //       return a.index - b.index;
              //     })
              //     .map((list) => (
              //       <motion.div
              //         layout
              //         variants={containerFMVariant}
              //         initial={{ scale: 0, opacity: 0 }}
              //         exit={{ scale: 0, opacity: 0 }}
              //         key={list.id}
              //       >
              //         <ListCard
              //           list={list}
              //           setIsCreating={setIsCreating}
              //           isCreting={isCreating}
              //           handleCloseNavbar={handleCloseNavbar}
              //         />
              //       </motion.div>
              //     ))}

              //   <ListInput setIsCreating={setIsCreating} />
              // </motion.div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
