"use client";

import { useCallback, useRef } from "react";
import { motion } from "motion/react";
import { useShallow } from "zustand/shallow";

import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useSidebarStateStore } from "@/store/useSidebarStateStore";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

import { DraggableContext } from "./draggable-context";
import { HomeCard } from "../home-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListInput } from "../list-input";
import { NavbarButton } from "./navbar-button";

import { IconAlinoMotion } from "@/components/ui/icons/icon-alino-motion";
import styles from "./navbar.module.css";

export const Navbar = () => {
  //stores
  const { navbarStatus, setNavbarStatus, toggleNavbar } = useSidebarStateStore(
    useShallow((state) => ({
      navbarStatus: state.navbarStatus,
      setNavbarStatus: state.setNavbarStatus,
      toggleNavbar: state.toggleNavbarStatus,
    }))
  ); //Open or close navbar
  const isMobile = usePlatformInfoStore(useShallow((state) => state.isMobile)); //Is mobile by width
  const initialFetch = useTodoDataStore(
    useShallow((state) => state.initialFetch)
  ); //finish fetch inital data (lists,tasks,...,etc)

  const navbarContainerRef = useRef<HTMLDivElement | null>(null);

  const handleToggleNavbar = useCallback(() => {
    toggleNavbar();
  }, [toggleNavbar]);

  const handleCloseNavbar = () => {
    setNavbarStatus(false);
  };

  useOnClickOutside(
    navbarContainerRef,
    handleCloseNavbar,
    [],
    "ignore-sidebar-close"
  );

  return (
    <>
      {isMobile && (
        <NavbarButton
          navbarOpened={navbarStatus}
          toggleNavbar={handleToggleNavbar}
        />
      )}
      <div
        className={`${styles.sidebarContainer} ${navbarStatus ? styles.open : ""}`}
        ref={navbarContainerRef}
        id="navbar-all-container"
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
            {!initialFetch ? (
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
              <section className={styles.cardsContainer}>
                <HomeCard key={"homecard"} />
                <DraggableContext />
              </section>
            )}
          </motion.section>
          <div className={styles.inputContainer}>
            <ListInput key={"input"} />
          </div>
        </div>
      </div>
    </>
  );
};
