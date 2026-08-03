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

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useShallow } from "zustand/shallow";

import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useSidebarStateStore } from "@/store/useSidebarStateStore";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useFetchListsPage } from "@/hooks/todo/lists/useFetchListsPage";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useSidebarSelectionStore } from "@/store/useSidebarSelectionStore";
import { useDeleteMultipleItems } from "@/hooks/todo/useDeleteMultipleItems";
import { useModalStore } from "@/store/useModalStore";

import { DraggableBoard } from "../draggable-board";
import { HomeCard } from "../home-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListInput } from "../ListInput";
import { NavbarButton } from "./NavbarButton";

import { IconAlinoMotion } from "@/components/ui/icons/icon-alino-motion";
import {
  LoadingIcon,
  SidebarLeftClose,
  SidebarLeftOpen,
  SidebarRightClose,
  SidebarRightOpen,
} from "@/components/ui/icons/icons";
import styles from "./Navbar.module.css";

/** Píxeles desde el fondo del scroll a partir de los cuales se dispara el fetch. */
const SCROLL_THRESHOLD_PX = 120;

export const Navbar = () => {
  //Estado global del sidebar (cerrado / abierto) manejado de manera global con zustand
  const { navbarStatus, setNavbarStatus, toggleNavbar } = useSidebarStateStore(
    useShallow((state) => ({
      navbarStatus: state.navbarStatus,
      setNavbarStatus: state.setNavbarStatus,
      toggleNavbar: state.toggleNavbarStatus,
    })),
  );

  const { sidebarCollapsed, sidebarPosition, setSidebarCollapsed } = useUserPreferencesStore();

  const isSelectionMode = useSidebarSelectionStore((s) => s.isSelectionMode);
  const selectedItems = useSidebarSelectionStore((s) => s.selectedItems);
  const cancelSelectionMode = useSidebarSelectionStore((s) => s.cancelSelectionMode);

  const { deleteMultiple } = useDeleteMultipleItems();
  const openModal = useModalStore((s) => s.open);

  const handleConfirmMultiDelete = useCallback(() => {
    openModal({
      type: "multiDeleteConfirm",
      props: {
        selectedItems,
        onConfirm: (folderOptions) => {
          deleteMultiple(selectedItems, folderOptions);
        },
      },
    });
  }, [openModal, selectedItems, deleteMultiple]);

  //Estado para saber si se está en mobile basado en ancho de pantalla.
  const isMobile = usePlatformInfoStore(useShallow((state) => state.isMobile));

  //Flag para conocer si ya se recuperaron los datos iniciales de la base de datos
  const initialFetch = useTodoDataStore(
    useShallow((state) => state.initialFetch),
  );
  const fetchingListsQueue = useTodoDataStore(
    useShallow((state) => state.fetchingListsQueue),
  );
  const { fetchListsPage } = useFetchListsPage();

  const navbarContainerRef = useRef<HTMLDivElement | null>(null);
  const fetchListsPageRef = useRef(fetchListsPage);
  useEffect(() => {
    fetchListsPageRef.current = fetchListsPage;
  }, [fetchListsPage]);

  useEffect(() => {
    if (!initialFetch) return;

    const container = document.getElementById("list-container");
    if (!container) return;

    const tryFetch = () => {
      const { listsPagination, fetchingListsQueue: queue } =
        useTodoDataStore.getState();
      const hasMore = listsPagination["root"]?.hasMore ?? false;
      const isFetching = queue["root"] ?? false;
      if (!hasMore || isFetching) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      if (distanceFromBottom < SCROLL_THRESHOLD_PX) {
        fetchListsPageRef.current("root");
      }
    };

    tryFetch();

    container.addEventListener("scroll", tryFetch, { passive: true });

    const ro = new ResizeObserver(tryFetch);
    ro.observe(container);

    return () => {
      container.removeEventListener("scroll", tryFetch);
      ro.disconnect();
    };
  }, [initialFetch]);

  useEffect(() => {
    if (sidebarCollapsed && isSelectionMode) {
      cancelSelectionMode();
    }
  }, [sidebarCollapsed, isSelectionMode, cancelSelectionMode]);

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

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const collapseIcon =
    sidebarPosition === "left"
      ? sidebarCollapsed
        ? <SidebarLeftClose />
        : <SidebarLeftOpen />
      : sidebarCollapsed
        ? <SidebarRightOpen />
        : <SidebarRightClose />;

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
          <div className={styles.navbarHeader}>
            {isMobile ? (
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
            ) : sidebarCollapsed ? (
              <button
                onClick={handleToggleCollapse}
                className={styles.collapsedHeaderButton}
                title="Expandir"
              >
                <div className={styles.collapsedLogo}>
                  <IconAlinoMotion
                    style={{
                      height: "13px",
                      width: "auto",
                      fill: "var(--text)",
                      overflow: "visible",
                    }}
                  />
                </div>
                <div className={styles.collapsedExpandIcon}>
                  {collapseIcon}
                </div>
              </button>
            ) : (
              <>
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
                {!isSelectionMode && (
                  <button
                    onClick={handleToggleCollapse}
                    className={styles.collapseButton}
                    data-sidebar-position={sidebarPosition}
                    title="Contraer"
                  >
                    {collapseIcon}
                  </button>
                )}
              </>
            )}
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
                </>
              )}
            </div>
          </motion.section>
          <div className={styles.inputContainer}>
            {isSelectionMode ? (
              <div className={styles.selectionBar}>
                <div className={styles.selectionCount}>
                  {!sidebarCollapsed && <span>{selectedItems.length} seleccionados</span>}
                  {sidebarCollapsed && <span>{selectedItems.length}</span>}
                </div>
                <div className={styles.selectionButtons}>
                  <button
                    className={styles.selectionCancelButton}
                    onClick={cancelSelectionMode}
                    title="Cancelar"
                  >
                    {!sidebarCollapsed ? "Cancelar" : "✕"}
                  </button>
                  <button
                    className={styles.selectionDeleteButton}
                    onClick={handleConfirmMultiDelete}
                    disabled={selectedItems.length === 0}
                    title="Eliminar"
                  >
                    {!sidebarCollapsed ? "Eliminar" : "🗑️"}
                  </button>
                </div>
              </div>
            ) : (
              <ListInput key={"input"} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
