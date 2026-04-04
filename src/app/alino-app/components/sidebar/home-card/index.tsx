"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSidebarStateStore } from "@/store/useSidebarStateStore";

import { HomeIcon2 } from "@/components/ui/icons/icons";

import styles from "./HomeCard.module.css";

const APP_PATH = "/alino-app";

export const HomeCard = () => {
  const setNavbarStatus = useSidebarStateStore(
    (state) => state.setNavbarStatus,
  );

  const pathname = usePathname();

  const isActive = pathname === APP_PATH;

  const handleCloseNavbar = () => {
    setNavbarStatus(false);
  };

  return (
    <Link
      className={`${styles.container} ${isActive ? styles.containerActive : ""}`}
      href={APP_PATH}
      onClick={handleCloseNavbar}
      aria-current={isActive ? "page" : undefined}
      prefetch={false}
    >
      <div
        className={`${styles.cardFx} ${isActive ? styles.cardFxActive : ""}`}
      ></div>

      <div className={styles.colorPickerContainer}>
        <HomeIcon2 className={styles.homeIcon} />
      </div>

      <div className={styles.textContainer}>
        <p className={styles.listName}>home</p>
      </div>
    </Link>
  );
};
