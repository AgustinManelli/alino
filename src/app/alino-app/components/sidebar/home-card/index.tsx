"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSidebarStateStore } from "@/store/useSidebarStateStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";

import { HomeIcon2 } from "@/components/ui/icons/icons";
import { SidebarTooltip } from "@/components/ui/sidebar-tooltip";

import styles from "./HomeCard.module.css";

const APP_PATH = "/alino-app";

export const HomeCard = () => {
  const setNavbarStatus = useSidebarStateStore(
    (state) => state.setNavbarStatus,
  );

  const pathname = usePathname();
  const sidebarCollapsed = useUserPreferencesStore((state) => state.sidebarCollapsed);
  const isMobile = usePlatformInfoStore((state) => state.isMobile);

  const isActive = pathname === APP_PATH;

  const handleCloseNavbar = () => {
    setNavbarStatus(false);
  };

  const link = (
    <Link
      className={`${styles.container} ${isActive ? styles.containerActive : ""}`}
      href={APP_PATH}
      onClick={handleCloseNavbar}
      aria-current={isActive ? "page" : undefined}
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

  return (
    <SidebarTooltip label="Home" enabled={sidebarCollapsed && !isMobile}>
      {({ triggerRef, onMouseEnter, onMouseLeave }) => (
        <div
          ref={(node) => {
            (triggerRef as React.MutableRefObject<HTMLElement | null>).current = node;
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {link}
        </div>
      )}
    </SidebarTooltip>
  );
};
