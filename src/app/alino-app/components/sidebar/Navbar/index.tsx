"use client";

/**
 * Componente `Navbar`
 *
 * Renderiza la barra lateral de navegación de la aplicación.
 * Incluye:
 * - Un botón de toggle (solo en mobile).
 * - Una sección con logo y tarjetas (incluyendo soporte para drag & drop).
 * - Un input para crear nuevas listas.
 *
 * También gestiona:
 * - Estado de apertura/cierre del navbar.
 * - Comportamiento responsive (desktop vs mobile).
 * - Detección de clics fuera del navbar para cerrarlo.
 *
 * @component
 * @returns {JSX.Element}
 *
 * @example
 * // Ejemplo de uso (se renderiza automáticamente en la aplicación principal)
 * <Navbar />
 */

import { useCallback, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useShallow } from "zustand/shallow";

import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useSidebarStateStore } from "@/store/useSidebarStateStore";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useFetchListsPage } from "@/hooks/todo/lists/useFetchListsPage";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

import { DraggableBoard } from "../draggable-board";
import { HomeCard } from "../home-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListInput } from "../ListInput";
import { NavbarButton } from "./NavbarButton";

import { IconAlinoMotion } from "@/components/ui/icons/icon-alino-motion";
import { LoadingIcon } from "@/components/ui/icons/icons";
import styles from "./Navbar.module.css";

export const Navbar = () => {
  //Estado global del sidebar (cerrado / abierto) manejado de manera global con zustand
  const { navbarStatus, setNavbarStatus, toggleNavbar } = useSidebarStateStore(
    useShallow((state) => ({
      navbarStatus: state.navbarStatus,
      setNavbarStatus: state.setNavbarStatus,
      toggleNavbar: state.toggleNavbarStatus,
    })),
  );

  //Estado para saber si se está en mobile basado en ancho de pantalla.
  const isMobile = usePlatformInfoStore(useShallow((state) => state.isMobile));

  //Flag para conocer si ya se recuperaron los datos iniciales de la base de datos
  const initialFetch = useTodoDataStore(
    useShallow((state) => state.initialFetch),
  );
  const folders = useTodoDataStore((state) => state.folders);
  const { fetchListsPage } = useFetchListsPage();

  const listsPagination = useTodoDataStore(
    useShallow((state) => state.listsPagination),
  );
  const fetchingListsQueue = useTodoDataStore(
    useShallow((state) => state.fetchingListsQueue),
  );

  const navbarContainerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (listsPagination["root"]?.hasMore) {
            fetchListsPage("root");
          }
        }
      },
      {
        root: document.getElementById("list-container"),
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [listsPagination, fetchListsPage]);

  const handleToggleNavbar = useCallback(() => {
    toggleNavbar();
  }, [toggleNavbar]);

  const handleCloseNavbar = () => {
    setNavbarStatus(false);
  };

  //Custom hook para cerrar navbar al hacer click fuera (excluye refs & clase 'ignore-sidebar-close')
  useOnClickOutside(
    navbarContainerRef,
    handleCloseNavbar,
    [],
    "ignore-sidebar-close",
  );

  return (
    <>
      {/*Botón para abrir / cerrar sidebar */}
      {isMobile && (
        <NavbarButton
          navbarOpened={navbarStatus}
          toggleNavbar={handleToggleNavbar}
        />
      )}

      {/*Contenedor del sidebar */}
      <div
        className={`${styles.navbarContainer} ${navbarStatus ? styles.open : ""}`}
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
                overflow: "visible",
              }}
            />
          </div>
          <motion.section
            className={styles.elementsSection}
            id="list-container"
          >
            <div className={styles.cardsContainer}>
              {!initialFetch ? (
                <>
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
                </>
              ) : (
                <>
                  <HomeCard key={"homecard"} />
                  <DraggableBoard />
                  {fetchingListsQueue["root"] && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "15px 0",
                        width: "100%",
                      }}
                    >
                      <LoadingIcon
                        style={{
                          width: "15px",
                          height: "auto",
                          stroke: "var(--text)",
                          strokeWidth: "2.5",
                        }}
                      />
                    </div>
                  )}
                  {listsPagination["root"]?.hasMore && (
                    <div
                      ref={sentinelRef}
                      style={{ height: "1px", width: "100%" }}
                    />
                  )}
                </>
              )}
            </div>
          </motion.section>
          <div className={styles.inputContainer}>
            <ListInput key={"input"} />
          </div>
        </div>
      </div>
    </>
  );
};
