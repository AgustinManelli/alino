"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Crown, Link } from "@/components/ui/icons/icons";
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
      adaptative={{ width: "880px", maxWidth: "95vw" }}
    >
      <div className={styles.container}>
        <div className={styles.mobileCategoryScroll}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.chipBtn} ${activeSection === "catalog" && selectedCategory === cat.id
                ? styles.chipBtnActive
                : ""
                }`}
              onClick={() => handleSelectCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
          <button
            className={`${styles.chipBtn} ${activeSection === "my-widgets" ? styles.chipBtnActive : ""
              }`}
            onClick={() => setActiveSection("my-widgets")}
          >
            Mis Widgets
          </button>
        </div>

        <div className={styles.storeLayout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarSection}>
              <span className={styles.sidebarTitle}>Categorías</span>
              {CATEGORIES.map((cat) => {
                const count =
                  catalogData?.categoryCounts[cat.id] ??
                  (cat.id === "all" ? catalogData?.totalCount : 0);
                const isActive =
                  activeSection === "catalog" && selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    className={`${styles.sidebarButton} ${isActive ? styles.sidebarButtonActive : ""
                      }`}
                    onClick={() => handleSelectCategory(cat.id)}
                  >
                    <div className={styles.sidebarBtnContent}>
                      <span>{cat.label}</span>
                    </div>
                    {typeof count === "number" && count > 0 && (
                      <span className={styles.sidebarBadge}>{count}</span>
                    )}
                  </button>
                );
              })}

              <button
                className={`${styles.sidebarButton} ${activeSection === "my-widgets" ? styles.sidebarButtonActive : ""
                  }`}
                onClick={() => setActiveSection("my-widgets")}
              >
                <div className={styles.sidebarBtnContent}>
                  <Link style={{ width: "13px" }} />
                  <span>Mis Widgets</span>
                </div>
                {myEmbeddedWidgets.length > 0 && (
                  <span className={styles.sidebarBadge}>
                    {myEmbeddedWidgets.length}
                  </span>
                )}
              </button>
            </div>

            <div className={styles.sidebarDivider} />

            <div className={styles.sidebarSection}>
              <span className={styles.sidebarTitle}>Filtrar por nivel</span>
              {TIERS.map((tier) => {
                const isActive = selectedTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    className={`${styles.sidebarButton} ${isActive ? styles.sidebarButtonActive : ""
                      }`}
                    onClick={() => handleSelectTier(tier.id)}
                  >
                    <div className={styles.sidebarBtnContent}>
                      {tier.id === "pro" && (
                        <Crown style={{ width: "13px", color: "rgb(255, 200, 100)" }} />
                      )}
                      <span>{tier.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

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
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <span className={styles.resultsCount}>
                    {totalCount} {totalCount === 1 ? "widget" : "widgets"}
                  </span>
                </div>

                <div className={styles.scrollArea}>
                  {widgetsList.length > 0 ? (
                    <div className={styles.grid}>
                      {widgetsList.map((def) => {
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
                            className={`${styles.card} ${isInstalled ? styles.cardInstalled : ""
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
                              className={`${styles.cardAction} ${isInstalled ? styles.cardActionRemove : ""
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
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage <= 1 || isLoading}
                      >
                        Anterior
                      </button>
                      <button
                        className={styles.pageBtn}
                        onClick={() =>
                          setCurrentPage((p) => Math.min(p + 1, totalPages))
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
        </div>
      </div>
    </WindowComponent>
  );
};
