"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Crown,
  Link,
  GridPlusIcon,
  Check,
  Clock,
  Information,
  Cross,
} from "@/components/ui/icons/icons";
import { tierSatisfies } from "@/config/widgets.registry";
import { useInstallWidget } from "@/hooks/dashboard/useInstallWidget";
import { useUninstallWidget } from "@/hooks/dashboard/useUninstallWidget";
import { useDashboardStore } from "@/store/useDashboardStore";
import { UserWidgetRow } from "@/lib/schemas/database.types";
import { PredefinedWidget } from "@/lib/schemas/dashboard.types";
import { WindowComponent } from "@/components/ui/WindowComponent";
import { getUserEmbeddedWidgets } from "@/lib/api/user-widgets/actions";
import {
  getWidgetsCatalogPaginated,
  PaginatedWidgetsCatalog,
} from "@/lib/api/dashboard/actions";
import { EmbeddedWidgetManager } from "./EmbeddedWidgetManager";
import { useModalStore } from "@/store/useModalStore";
import { WidgetPreview } from "./WidgetPreview";
import styles from "./WidgetGallery.module.css";

interface Props {
  onClose: () => void;
  userTier: "free" | "student" | "pro" | "ultra";
}

const TIER_LABELS: Record<string, string> = {
  free: "Gratis",
  student: "Estudiante",
  pro: "Pro",
  ultra: "Ultra",
};

const CATEGORIES = [
  { id: "all", label: "Todos los widgets" },
  { id: "productivity", label: "Productividad" },
  { id: "wellness", label: "Bienestar" },
  { id: "info", label: "Información" },
];

const TIERS = [
  { id: "all", label: "Todos" },
  { id: "free", label: "Gratis" },
  { id: "pro", label: "Pro" },
  // { id: "student", label: "Estudiante" },
];

export const WidgetGallery = ({ onClose, userTier }: Props) => {
  const openModal = useModalStore((s) => s.open);
  const activeWidgets = useDashboardStore((s) => s.activeWidgets);
  const { installWidget, isPending: isInstalling } = useInstallWidget();
  const { uninstallWidget, isPending: isUninstalling } = useUninstallWidget();

  const [activeSection, setActiveSection] = useState<"catalog" | "my-widgets">(
    "catalog",
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [targetWidgetId, setTargetWidgetId] = useState<string | null>(null);

  const [catalogData, setCatalogData] =
    useState<PaginatedWidgetsCatalog | null>(null);
  const [myEmbeddedWidgets, setMyEmbeddedWidgets] = useState<UserWidgetRow[]>(
    [],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchCatalog = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getWidgetsCatalogPaginated({
        search: debouncedSearch,
        category: selectedCategory,
        tier: selectedTier,
        page: currentPage,
        pageSize: 6,
      });
      if (res.data) {
        setCatalogData(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedTier, currentPage]);

  useEffect(() => {
    if (activeSection === "catalog") {
      fetchCatalog();
    }
  }, [activeSection, fetchCatalog]);

  const fetchMyWidgets = useCallback(async () => {
    const { data } = await getUserEmbeddedWidgets();
    setMyEmbeddedWidgets(data ?? []);
  }, []);

  useEffect(() => {
    if (activeSection === "my-widgets") {
      fetchMyWidgets();
    }
  }, [activeSection, fetchMyWidgets]);

  const handleSelectCategory = (catId: string) => {
    setActiveSection("catalog");
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId);
    setCurrentPage(1);
  };

  const handleWidgetAction = async (def: PredefinedWidget) => {
    const isInstalled = activeWidgets.includes(def.id);
    const canUse = tierSatisfies(userTier, def.tierRequired);

    if (isThisActionPending(def.id)) return;

    setTargetWidgetId(def.id);
    try {
      if (isInstalled) {
        await uninstallWidget(def.id);
      } else if (canUse) {
        await installWidget(def.id);
      } else {
        openModal({ type: "premium" });
      }
    } finally {
      setTargetWidgetId(null);
    }
  };

  const isThisActionPending = (widgetId: string) => {
    return (
      (isInstalling || isUninstalling) && targetWidgetId === widgetId
    );
  };

  const widgetsList = catalogData?.widgets ?? [];
  const totalCount = catalogData?.totalCount ?? 0;
  const totalPages = catalogData?.totalPages ?? 1;

  return (
    <WindowComponent
      windowTitle="Tienda de widgets"
      id="widget-gallery-window"
      crossAction={onClose}
      sidebar={
        <WindowComponent.Sidebar>
          <WindowComponent.SidebarItem
            label="Todos"
            icon={<GridPlusIcon style={{ width: "16px", height: "16px" }} />}
            active={activeSection === "catalog" && selectedCategory === "all"}
            onClick={() => handleSelectCategory("all")}
            badge={catalogData?.totalCount}
          />
          <WindowComponent.SidebarItem
            label="Productividad"
            icon={
              <Check
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "currentColor",
                  strokeWidth: "2",
                }}
              />
            }
            active={
              activeSection === "catalog" && selectedCategory === "productivity"
            }
            onClick={() => handleSelectCategory("productivity")}
            badge={catalogData?.categoryCounts?.["productivity"]}
          />
          <WindowComponent.SidebarItem
            label="Bienestar"
            icon={<Clock style={{ width: "16px", height: "16px" }} />}
            active={
              activeSection === "catalog" && selectedCategory === "wellness"
            }
            onClick={() => handleSelectCategory("wellness")}
            badge={catalogData?.categoryCounts?.["wellness"]}
          />
          <WindowComponent.SidebarItem
            label="Información"
            icon={
              <Information
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "currentColor",
                  strokeWidth: "2",
                }}
              />
            }
            active={activeSection === "catalog" && selectedCategory === "info"}
            onClick={() => handleSelectCategory("info")}
            badge={catalogData?.categoryCounts?.["info"]}
          />
          <WindowComponent.SidebarItem
            label="Mis Widgets"
            icon={<Link style={{ width: "16px", height: "16px" }} />}
            active={activeSection === "my-widgets"}
            onClick={() => setActiveSection("my-widgets")}
            badge={
              myEmbeddedWidgets.length > 0 ? myEmbeddedWidgets.length : undefined
            }
          />
        </WindowComponent.Sidebar>
      }
    >
      <main className={styles.mainArea}>
        {activeSection === "catalog" ? (
          <>
            <div className={styles.topBar}>
              <div className={styles.searchContainer}>
                <svg
                  className={styles.searchIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Buscar widgets por nombre o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className={styles.clearButton}
                    onClick={() => setSearchQuery("")}
                    aria-label="Limpiar búsqueda"
                  >
                    <Cross style={{ width: "12px", height: "12px" }} />
                  </button>
                )}
              </div>

              <div className={styles.tierChipsRow}>
                {TIERS.map((tier) => {
                  const isActive = selectedTier === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      className={`${styles.tierChip} ${
                        isActive ? styles.tierChipActive : ""
                      }`}
                      onClick={() => handleSelectTier(tier.id)}
                    >
                      {tier.id === "pro" && (
                        <Crown
                          style={{
                            width: "12px",
                            height: "12px",
                            color: "rgb(255, 200, 100)",
                          }}
                        />
                      )}
                      <span>{tier.label}</span>
                    </button>
                  );
                })}
              </div>

              <span className={styles.resultsCount}>
                {totalCount} {totalCount === 1 ? "widget" : "widgets"}
              </span>
            </div>

                <div className={styles.scrollArea}>
                  {widgetsList.length > 0 ? (
                    <div className={styles.grid}>
                      {widgetsList.map((def: PredefinedWidget) => {
                        const isInstalled = activeWidgets.includes(def.id);
                        const canUse = tierSatisfies(userTier, def.tierRequired);
                        const isPending = isThisActionPending(def.id);

                        let buttonLabel = "Instalar";
                        if (isInstalled) {
                          buttonLabel = isPending ? "Desinstalando..." : "Desinstalar";
                        } else if (isPending) {
                          buttonLabel = "Instalando...";
                        } else if (!canUse) {
                          buttonLabel = `Requiere ${TIER_LABELS[def.tierRequired]}`;
                        }

                        return (
                          <div
                            key={def.id}
                            className={`${styles.card} ${
                              isInstalled ? styles.cardInstalled : ""
                            }`}
                          >
                            <div className={styles.cardHeader}>
                              <div
                                className={styles.cardTierBadge}
                                data-tier={def.tierRequired}
                              >
                                {def.tierRequired !== "free" && (
                                  <Crown
                                    style={{
                                      width: "12px",
                                      height: "12px",
                                      strokeWidth: 2,
                                      stroke: "rgb(255, 200, 100)",
                                    }}
                                  />
                                )}
                                <span>{TIER_LABELS[def.tierRequired]}</span>
                              </div>
                              <span className={styles.cardCategory}>
                                {def.category}
                              </span>
                            </div>

                            <h3 className={styles.cardTitle}>{def.name}</h3>
                            <p className={styles.cardDesc}>{def.description}</p>

                            <WidgetPreview
                              componentKey={def.componentKey}
                              title={def.name}
                            />

                            <button
                              className={`${styles.cardAction} ${
                                isInstalled ? styles.cardActionRemove : ""
                              }`}
                              onClick={() => handleWidgetAction(def)}
                              disabled={isPending}
                            >
                              {buttonLabel}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <p>No se encontraron widgets con los filtros aplicados.</p>
                      <span className={styles.emptySubtext}>
                        Prueba buscando con otros términos o seleccionando otra categoría.
                      </span>
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <footer className={styles.paginationBar}>
                    <span className={styles.pageInfo}>
                      Página {currentPage} de {totalPages}
                    </span>
                    <div className={styles.pageButtons}>
                      <button
                        className={styles.pageBtn}
                        onClick={() => setCurrentPage((p: number) => Math.max(p - 1, 1))}
                        disabled={currentPage <= 1 || isLoading}
                      >
                        Anterior
                      </button>
                      <button
                        className={styles.pageBtn}
                        onClick={() =>
                          setCurrentPage((p: number) => Math.min(p + 1, totalPages))
                        }
                        disabled={currentPage >= totalPages || isLoading}
                      >
                        Siguiente
                      </button>
                    </div>
                  </footer>
                )}
              </>
            ) : (
              <div className={styles.scrollArea}>
                <EmbeddedWidgetManager
                  widgets={myEmbeddedWidgets}
                  activeWidgets={activeWidgets}
                  userTier={userTier}
                  onInstall={(id: string) => installWidget(id, id)}
                  onUninstall={(id: string) => uninstallWidget(id)}
                  onChange={fetchMyWidgets}
                />
              </div>
            )}
          </main>
    </WindowComponent>
  );
};
