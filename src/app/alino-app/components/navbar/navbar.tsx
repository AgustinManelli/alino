"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLists } from "@/store/lists";
import SubjectsInput from "./subjects-input";
import Skeleton from "@/components/skeleton";
import { SubjectsCards } from "./subjects-cards";
import { AlinoLogo } from "@/lib/ui/icons";
import styles from "./navbar.module.css";

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

export default function Navbar({
  initialFetching,
}: {
  initialFetching: boolean;
}) {
  const [waiting, setWaiting] = useState<boolean>(false);

  const lists = useLists((state) => state.lists);

  return (
    <div className={styles.navbarContainer}>
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
        <section className={styles.SubjectsCardsSection} id="listContainer">
          {initialFetching ? (
            <div className={styles.divCardsContainer}>
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
              className={styles.divCardsContainer}
            >
              <AnimatePresence mode={"popLayout"}>
                {lists.map((list) => (
                  <motion.div
                    variants={containerFMVariant}
                    initial={{ scale: 0, opacity: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    key={list.id}
                  >
                    <SubjectsCards list={list} />
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
              <SubjectsInput setWaiting={setWaiting} />
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
