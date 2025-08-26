"use client";

import { motion } from "motion/react";

import { MenuIcon } from "@/components/ui/icons/icons";
import styles from "./navbar.module.css";

interface Props {
  navbarOpened: boolean;
  toggleNavbar: () => void;
}

export const NavbarButton = ({ navbarOpened, toggleNavbar }: Props) => {
  return (
    <motion.button
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
      onClick={toggleNavbar}
    >
      <MenuIcon
        style={{
          width: "25px",
          height: "auto",
          stroke: "var(--text)",
          strokeWidth: "2",
        }}
      />
    </motion.button>
  );
};
