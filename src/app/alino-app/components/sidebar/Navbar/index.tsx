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

import { useCallback, useRef } from "react";
import { motion } from "motion/react";
import { useShallow } from "zustand/shallow";

import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useSidebarStateStore } from "@/store/useSidebarStateStore";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

import { DraggableBoard } from "../draggable-board";
import { HomeCard } from "../home-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListInput } from "../ListInput";
import { NavbarButton } from "./NavbarButton";

import { IconAlinoMotion } from "@/components/ui/icons/icon-alino-motion";
import styles from "./Navbar.module.css";

export const Navbar = () => {
  //Estado global del sidebar (cerrado / abierto) manejado de manera global con zustand
  const { navbarStatus, setNavbarStatus, toggleNavbar } = useSidebarStateStore(
    useShallow((state) => ({
      navbarStatus: state.navbarStatus,
      setNavbarStatus: state.setNavbarStatus,
      toggleNavbar: state.toggleNavbarStatus,
    }))
  );

  //Estado para saber si se está en mobile basado en ancho de pantalla.
  const isMobile = usePlatformInfoStore(useShallow((state) => state.isMobile));

  //Flag para conocer si ya se recuperaron los datos iniciales de la base de datos
  const initialFetch = useTodoDataStore(
    useShallow((state) => state.initialFetch)
  );

  const navbarContainerRef = useRef<HTMLDivElement | null>(null);

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
    "ignore-sidebar-close"
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
