"use client";

import { useState } from "react";
import styles from "./navbar.module.css";
import { AlinoLogo, MenuIcon } from "@/lib/ui/icons";
import { Skeleton } from "@/components";
import { AnimatePresence, motion } from "framer-motion";
import { useLists } from "@/store/lists";
import ListCard from "./listCard";
import ListInput from "../listInput";
import HomeCardMobile from "../homeCard/homeCardMobile";

const containerFMVariant = {
  hidden: { opacity: 1, scale: 1 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0,
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, scale: 0 },
};

const skeletonFMVariant = {
  hidden: { scale: 1, opacity: 0, y: 60 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
  },
  exit: { opacity: 0, scale: 0 },
};

export default function NavbarMobile({
  initialFetching,
  setInitialFetching,
}: {
  initialFetching: boolean;
  setInitialFetching: (value: boolean) => void;
}) {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [waiting, setWaiting] = useState<boolean>(false);

  const lists = useLists((state) => state.lists);

  const closeNav = () => {
    setIsActive(false);
  };

  return (
    <div className={styles.container}>
      <nav className={`${styles.navbar} ${isActive && styles.active}`}>
        <div className={styles.top}>
          <AlinoLogo
            style={{
              height: "20px",
              width: "auto",
              fill: "#1c1c1c",
              opacity: "0.1",
            }}
            decoFill={"#1c1c1c"}
          />
          <button
            onClick={() => {
              setIsActive(!isActive);
            }}
            className={styles.button}
          >
            <MenuIcon
              style={{
                height: "25px",
                width: "auto",
                stroke: "#1c1c1c",
                strokeWidth: "2",
              }}
            />
          </button>
        </div>
        {isActive && (
          <section
            className={styles.navbarContent}
            id="listContainer"
            style={{ display: isActive ? "initial" : "none" }}
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
                      key={index}
                    />
                  ))}
              </div>
            ) : (
              <motion.div
                variants={containerFMVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={styles.cardsContainer}
              >
                <AnimatePresence mode={"popLayout"}>
                  <HomeCardMobile action={closeNav} />
                  {lists.map((list) => (
                    <motion.div
                      variants={containerFMVariant}
                      initial={{ scale: 0, opacity: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      key={list.id}
                    >
                      <ListCard list={list} action={closeNav} />
                    </motion.div>
                  ))}
                  {waiting && (
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
                    </motion.div>
                  )}
                </AnimatePresence>
                <ListInput setWaiting={setWaiting} />
              </motion.div>
            )}
          </section>
        )}
      </nav>
    </div>
  );
}
