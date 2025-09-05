"use client";

import { MenuIcon } from "@/components/ui/icons/icons";
import styles from "./Navbar.module.css";

interface Props {
  navbarOpened: boolean;
  toggleNavbar: () => void;
}

export const NavbarButton = ({ navbarOpened, toggleNavbar }: Props) => {
  return (
    <button
      className={styles.mobileButton}
      onClick={toggleNavbar}
      style={{ opacity: navbarOpened ? 0 : 1, scale: navbarOpened ? 0 : 1 }}
    >
      <MenuIcon
        style={{
          width: "25px",
          height: "auto",
          stroke: "var(--text)",
          strokeWidth: "2",
        }}
      />
    </button>
  );
};
