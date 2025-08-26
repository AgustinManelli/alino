"use client";

import { memo, useCallback, useRef, useState } from "react";
import { motion } from "motion/react";
import { shallow, useShallow } from "zustand/shallow";

import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useUIStore } from "@/store/useUIStore";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

import { DraggableContext } from "./draggable-context";
import { HomeCard } from "../home-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListInput } from "../list-input";
import { NavbarButton } from "./navbar-button";

import { IconAlinoMotion } from "@/components/ui/icons/icon-alino-motion";
import styles from "./navbar.module.css";

const containerFMVariant = {
  visible: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
} as const;

interface Props {
  initialFetching?: boolean;
}

export const Navbar = memo(({ initialFetching }: Props) => {
  const navbarStatus = useUIStore((state) => state.navbarStatus);
  const setNavbarStatus = useUIStore((state) => state.setNavbarStatus);

  const isMobile = usePlatformInfoStore(useShallow((state) => state.isMobile));

  const Ref = useRef<HTMLDivElement | null>(null);

  const toggleNavbar = useCallback(() => {
    setNavbarStatus(!navbarStatus);
  }, [setNavbarStatus]);

  const handleCloseNavbar = useCallback(() => {
    setNavbarStatus(false);
  }, [setNavbarStatus]);

  useOnClickOutside(Ref, handleCloseNavbar, [], "ignore-sidebar-close");

  return (
    <>
      {isMobile && (
        <NavbarButton navbarOpened={navbarStatus} toggleNavbar={toggleNavbar} />
      )}
      <div
        className={`${styles.sidebarContainer} ${navbarStatus ? styles.open : ""}`}
        ref={Ref}
      >
        <div className={styles.navbar}>
          <div className={styles.logoContainer}>
            <IconAlinoMotion
              style={{
                height: "20px",
                width: "auto",
                fill: "var(--text)",
                opacity: "0.2",
                overflow: "visible",
              }}
            />
          </div>
          <motion.section className={styles.cardsSection} id="list-container">
            {initialFetching ? (
              <div className={styles.cardsContainer}>
                {Array(3)
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
                <DraggableContext handleCloseNavbar={handleCloseNavbar} />
              </motion.section>
            )}
          </motion.section>
          <div className={styles.inputContainer}>
            <ListInput key={"input"} />
          </div>
        </div>
      </div>
    </>
  );
});
