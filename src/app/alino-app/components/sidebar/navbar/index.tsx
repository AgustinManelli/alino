"use client";

import { memo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useShallow } from "zustand/shallow";

import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

import { DraggableContext } from "./draggable-context";
import { HomeCard } from "../home-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListInput } from "../list-input";
import { NavbarButton } from "./navbar-button";

import { IconAlinoMotion } from "@/components/ui/icons/icon-alino-motion";
import styles from "./navbar.module.css";

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

interface NavbarProps {
  initialFetching?: boolean;
}

export const Navbar = memo(function Navbar({ initialFetching }: NavbarProps) {
  //estados locales
  const [navbarOpened, setNavbarOpened] = useState<boolean>(false);

  //estados globales
  const isMobile = usePlatformInfoStore(useShallow((state) => state.isMobile));

  //ref's
  const Ref = useRef<HTMLDivElement | null>(null);

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
    const confirmationModal = document.getElementById(
      "confirmation-modal-list-card"
    );
    if (
      configMenuContainer ||
      colorPickerContainer ||
      listEdit ||
      confirmationModal
    ) {
      return;
    }
    setNavbarOpened(false);
  });

  const toggleNavbar = () => {
    setNavbarOpened((prev) => !prev);
  };

  const handleCloseNavbar = () => {
    setNavbarOpened(false);
  };

  return (
    <>
      {/* BOTON PARA ABRIR NAVBAR MOBILE */}
      {isMobile && (
        <NavbarButton navbarOpened={navbarOpened} toggleNavbar={toggleNavbar} />
      )}
      {/* NAVBAR */}
      <motion.div
        className={styles.sidebarContainer}
        ref={Ref}
        animate={{ x: !navbarOpened && isMobile ? "-150%" : 0 }}
        // transition={{ type: "spring", stiffness: 300, damping: 30 }}
        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
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
      </motion.div>
    </>
  );
});
