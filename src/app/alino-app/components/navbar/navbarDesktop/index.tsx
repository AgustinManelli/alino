"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useLists } from "@/store/lists";
import { AlinoLogo, MenuIcon } from "@/lib/ui/icons";
import { Skeleton } from "@/components";
import ListInput from "../listInput";
import ListCard from "./listCard";
import styles from "./navbar.module.css";
import HomeCard from "../homeCard/homeCard";
import useMobileStore from "@/store/useMobileStore";
import useOnClickOutside from "@/hooks/useOnClickOutside";

//INIT EMOJI-MART
import { init } from "emoji-mart";
import data from "@emoji-mart/data/sets/15/apple.json";
init({ data });

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

// const skeletonFMVariant = {
//   hidden: { scale: 1, opacity: 0, y: 60 },
//   visible: {
//     scale: 1,
//     opacity: 1,
//     y: 0,
//   },
//   exit: { opacity: 0, scale: 0 },
// };

export default function Navbar({
  initialFetching,
}: {
  initialFetching: boolean;
}) {
  const [waiting, setWaiting] = useState<boolean>(false);

  useEffect(() => {
    console.log(waiting);
  }, [waiting]);

  const [isActive, setIsActive] = useState<boolean>(false);

  const [isCreating, setIsCreating] = useState<boolean>(false);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const lists = useLists((state) => state.lists);

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
              <motion.div
                layout
                variants={containerFMVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={styles.cardsContainer}
                // whileInView="visible"
                // viewport={{ once: true, amount: 0.8 }}
              >
                <HomeCard handleCloseNavbar={handleCloseNavbar} />
                {lists
                  .sort((a, b) => {
                    if (a.pinned && !b.pinned) return -1;
                    if (!a.pinned && b.pinned) return 1;
                    if (a.index === null) return 1;
                    if (b.index === null) return -1;
                    return a.index - b.index;
                  })
                  .map((list) => (
                    <motion.div
                      layout
                      variants={containerFMVariant}
                      initial={{ scale: 0, opacity: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      key={list.id}
                    >
                      <ListCard
                        list={list}
                        setIsCreating={setIsCreating}
                        isCreting={isCreating}
                        handleCloseNavbar={handleCloseNavbar}
                      />
                    </motion.div>
                  ))}
                {/* {waiting && (
                    <motion.div
                      variants={skeletonFMVariant}
                      transition={{ ease: "easeOut", duration: 0.2 }}
                    >
                      <Skeleton
                        style={{
                          width: "100%",
                          height: "45px",
                          borderRadius: "15px",
                        }}
                      />
                      <p>"a"</p>
                    </motion.div>
                  )} */}

                <ListInput
                  setWaiting={setWaiting}
                  setIsCreating={setIsCreating}
                />
              </motion.div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
