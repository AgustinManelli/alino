"use client";

import { useState, useEffect, useCallback } from "react";
import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import {
  Crown,
  Link,
  GridPlusIcon,
  Information,
  Cross,
} from "@/components/ui/icons/icons";
import { tierSatisfies, isWidgetOnlineOnly } from "@/config/widgets.registry";
import { useInstallWidget } from "@/hooks/dashboard/useInstallWidget";
import { useUninstallWidget } from "@/hooks/dashboard/useUninstallWidget";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useSyncStore } from "@/store/useSyncStore";
import { customToast } from "@/lib/toasts";
import { UserWidgetRow } from "@/lib/schemas/database.types";
import { PredefinedWidget } from "@/lib/schemas/dashboard.types";
import { Modal } from "@/components/ui/Modal";
import { AlinoLogo } from "@/components/ui/icons/icons";
import { getUserEmbeddedWidgets } from "@/lib/api/user-widgets/actions";
import {
  getWidgetsCatalogPaginated,
  PaginatedWidgetsCatalog,
} from "@/lib/api/dashboard/actions";
import { EmbeddedWidgetManager } from "./EmbeddedWidgetManager";
import { useModalStore } from "@/store/useModalStore";
import { WidgetPreview } from "./WidgetPreview";
import styles from "./WidgetGallery.module.css";
import i18n from "@/lib/i18n";
import { getWidgetTranslation } from "@/lib/i18n/helpers";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

interface Props {
  onClose: () => void;
  userTier: "free" | "student" | "pro" | "ultra";
}

interface AnimatedSectionContentProps {
  children: ReactNode;
}

const AnimatedSectionContent = ({ children }: AnimatedSectionContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  const animations = useUserPreferencesStore((state) => state.animations);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const updateHeight = () => setHeight(content.scrollHeight);
    updateHeight();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateHeight);
    observer.observe(content);
    return () => observer.disconnect();
  }, [children]);

  return (
    <div
      className={styles.animatedSectionContent}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        transition: animations ? undefined : "none",
      }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
};

const TIER_LABELS: Record<string, string> = {
  free: i18n.t("widgets.tiers.free", { defaultValue: "Gratis" }),
  student: i18n.t("widgets.tiers.student", { defaultValue: "Estudiante" }),
  pro: i18n.t("widgets.tiers.pro", { defaultValue: "Pro" }),
  ultra: i18n.t("widgets.tiers.ultra", { defaultValue: "Ultra" }),
};

const CATEGORIES = [
  {
    id: "all",
    label: i18n.t("widgets.categories.all", {
      defaultValue: "Todos los widgets",
    }),
  },
  {
    id: "productivity",
    label: i18n.t("widgets.categories.productivity", {
      defaultValue: "Productividad",
    }),
  },
  {
    id: "wellness",
    label: i18n.t("widgets.categories.wellness", { defaultValue: "Bienestar" }),
  },
  {
    id: "info",
    label: i18n.t("widgets.categories.info", { defaultValue: "Información" }),
  },
];

const TIERS = [
  { id: "all", label: i18n.t("widgets.tiers.all", { defaultValue: "Todos" }) },
  {
    id: "free",
    label: i18n.t("widgets.tiers.free", { defaultValue: "Gratis" }),
  },
  { id: "pro", label: i18n.t("widgets.tiers.pro", { defaultValue: "Pro" }) },
  // { id: "student", label: "Estudiante" },
];

export const WidgetGallery = ({ onClose, userTier }: Props) => {
  const openModal = useModalStore((s) => s.open);
  const activeWidgets = useDashboardStore((s) => s.activeWidgets);
  const isOnline = useSyncStore((s) => s.isOnline);
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
  const [catalogError, setCatalogError] = useState<string | null>(null);
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
    setCatalogError(null);
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const predefined = (
          useDashboardStore.getState().predefinedWidgets || []
        ).filter((w) => w.id !== "weather");

        let filtered = predefined;
        if (selectedCategory && selectedCategory !== "all") {
          filtered = filtered.filter((w) => w.category === selectedCategory);
        }
        if (selectedTier && selectedTier !== "all") {
          filtered = filtered.filter((w) => w.tierRequired === selectedTier);
        }
        if (debouncedSearch && debouncedSearch.trim()) {
          const term = debouncedSearch.trim().toLowerCase();
          filtered = filtered.filter((w) => {
            const translated = getWidgetTranslation(w);
            return (
              translated.name.toLowerCase().includes(term) ||
              translated.description.toLowerCase().includes(term)
            );
          });
        }

        const pageSize = 6;
        const totalCount = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        const paged = filtered.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize,
        );

        const categoryCounts: Record<string, number> = {
          all: predefined.length,
        };
        for (const item of predefined) {
          if (item.category) {
            categoryCounts[item.category] =
              (categoryCounts[item.category] ?? 0) + 1;
          }
        }

        setCatalogData({
          widgets: paged,
          totalCount,
          currentPage,
          totalPages,
          categoryCounts,
        });
        return;
      }

      const res = await getWidgetsCatalogPaginated({
        search: debouncedSearch,
        category: selectedCategory,
        tier: selectedTier,
        page: currentPage,
        pageSize: 6,
      });
      if (res.data) {
        setCatalogData({
          ...res.data,
          widgets: res.data.widgets.filter((w) => w.id !== "weather"),
        });
      } else if (res.error) {
        setCatalogError(res.error);
      }
    } catch (error) {
      setCatalogError(
        error instanceof Error
          ? error.message
          : i18n.t("widgets.errors.catalog", {
              defaultValue: "No se pudo cargar el catálogo.",
            }),
      );
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
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setMyEmbeddedWidgets([]);
      return;
    }
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

    if (!isOnline && isWidgetOnlineOnly(def.id)) {
      customToast.error(
        "Este widget requiere conexión a internet para usarse.",
      );
      return;
    }

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
    return (isInstalling || isUninstalling) && targetWidgetId === widgetId;
  };

  const widgetsList = catalogData?.widgets ?? [];
  const totalCount = catalogData?.totalCount ?? 0;
  const totalPages = catalogData?.totalPages ?? 1;
  const activeCategoryLabel =
    CATEGORIES.find((category) => category.id === selectedCategory)?.label ??
    CATEGORIES[0].label;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="980px"
      id="alino-widget-gallery-modal"
      ariaLabel={i18n.t("widgets.title", {
        defaultValue: "Galería de widgets",
      })}
    >
      <Modal.Header bordered={true}>
        <div className={styles.headerBrand}>
          <div className={styles.brandLogo}>
            <AlinoLogo style={{ height: 26, width: "auto" }} />
          </div>
          <div className={styles.brandSeparator} />
          <span className={styles.brandShopTag}>
            {i18n.t("widgets.tag", { defaultValue: "WIDGETS" })}
          </span>
        </div>
        <Modal.CloseButton onClick={onClose} />
      </Modal.Header>
      <Modal.Body noPadding={true}>
        <section className={styles.heroBanner}>
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow}>
              {i18n.t("widgets.banner.eyebrow", {
                defaultValue: "TU ESPACIO, A TU MANERA",
              })}
            </span>
            <h1 className={styles.heroTitle}>
              {i18n.t("widgets.banner.title", {
                defaultValue: "Diseña tu dashboard.",
              })}
              <br />
              <span className={styles.heroTitleAccent}>
                {i18n.t("widgets.banner.accent", {
                  defaultValue: "Hazlo tuyo.",
                })}
              </span>
            </h1>
            <p className={styles.heroSubtitle}>
              {i18n.t("widgets.banner.subtitle", {
                defaultValue:
                  "Instala solo lo que necesitas y mantén tu experiencia ligera.",
              })}
            </p>
          </div>
          <div className={styles.heroOrb} aria-hidden="true" />
        </section>
        <section className={styles.tabsContainer}>
          <nav
            className={styles.tabsBar}
            aria-label={i18n.t("widgets.navigation", {
              defaultValue: "Secciones de widgets",
            })}
          >
            <button
              type="button"
              className={`${styles.tabButton} ${
                activeSection === "catalog" ? styles.tabButtonActive : ""
              }`}
              onClick={() => setActiveSection("catalog")}
            >
              <GridPlusIcon style={{ width: 16, height: 16 }} />
              <span>
                {i18n.t("widgets.catalog", {
                  defaultValue: "Explorar widgets",
                })}
              </span>
              {activeSection === "catalog" && (
                <div className={styles.tabIndicator} />
              )}
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${
                activeSection === "my-widgets" ? styles.tabButtonActive : ""
              }`}
              onClick={() => setActiveSection("my-widgets")}
            >
              <Link style={{ width: 16, height: 16 }} />
              <span>
                {i18n.t("widgets.myWidgets", { defaultValue: "Mis widgets" })}
              </span>
              {activeSection === "my-widgets" && (
                <div className={styles.tabIndicator} />
              )}
            </button>
          </nav>
        </section>
        <AnimatedSectionContent>
          <main className={styles.mainArea}>
            {activeSection === "catalog" ? (
              <>
                <section className={styles.sectionHeader}>
                  <div className={styles.sectionHeaderLeft}>
                    <h2 className={styles.sectionTitle}>
                      {activeCategoryLabel}
                    </h2>
                    <p className={styles.sectionSubtitle}>
                      {totalCount}{" "}
                      {totalCount === 1
                        ? "widget disponible"
                        : "widgets disponibles"}
                    </p>
                  </div>
                  <div className={styles.sectionHeaderRight}>
                    <div className={styles.categoryFilters}>
                      <button
                        type="button"
                        className={`${styles.categoryFilterBtn} ${
                          selectedCategory === "all"
                            ? styles.categoryFilterBtnActive
                            : ""
                        }`}
                        onClick={() => handleSelectCategory("all")}
                      >
                        {CATEGORIES[0].label}
                      </button>
                      {CATEGORIES.slice(1).map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          className={`${styles.categoryFilterBtn} ${
                            selectedCategory === category.id
                              ? styles.categoryFilterBtnActive
                              : ""
                          }`}
                          onClick={() => handleSelectCategory(category.id)}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
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
                      placeholder={i18n.t("widgets.search", {
                        defaultValue:
                          "Buscar widgets por nombre o descripción...",
                      })}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className={styles.clearButton}
                        onClick={() => setSearchQuery("")}
                        aria-label={i18n.t("common.clear", {
                          defaultValue: "Limpiar búsqueda",
                        })}
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
                  {isLoading ? (
                    <div className={styles.grid} aria-busy="true">
                      {Array.from({ length: 6 }, (_, index) => (
                        <div className={styles.cardSkeleton} key={index}>
                          <div className={styles.skeletonLine} />
                          <div className={styles.skeletonTitle} />
                          <div className={styles.skeletonPreview} />
                          <div className={styles.skeletonButton} />
                        </div>
                      ))}
                    </div>
                  ) : catalogError ? (
                    <div className={styles.emptyState}>
                      <p>{catalogError}</p>
                      <button
                        type="button"
                        className={styles.cardAction}
                        onClick={fetchCatalog}
                      >
                        {i18n.t("common.retry", { defaultValue: "Reintentar" })}
                      </button>
                    </div>
                  ) : widgetsList.length > 0 ? (
                    <div className={styles.grid}>
                      {widgetsList.map((def: PredefinedWidget) => {
                        const isInstalled = activeWidgets.includes(def.id);
                        const canUse = tierSatisfies(
                          userTier,
                          def.tierRequired,
                        );
                        const isPending = isThisActionPending(def.id);

                        const translated = getWidgetTranslation(def);
                        let buttonLabel = i18n.t("widgets.install", {
                          defaultValue: "Instalar",
                        });
                        if (isInstalled) {
                          buttonLabel = isPending
                            ? i18n.t("widgets.uninstalling", {
                                defaultValue: "Desinstalando...",
                              })
                            : i18n.t("widgets.uninstall", {
                                defaultValue: "Desinstalar",
                              });
                        } else if (isPending) {
                          buttonLabel = i18n.t("widgets.installing", {
                            defaultValue: "Instalando...",
                          });
                        } else if (!canUse) {
                          buttonLabel = i18n.t("widgets.requiresTier", {
                            defaultValue: `Requiere ${TIER_LABELS[def.tierRequired]}`,
                            tier: TIER_LABELS[def.tierRequired],
                          });
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

                            <h3 className={styles.cardTitle}>
                              {translated.name}
                            </h3>
                            <p className={styles.cardDesc}>
                              {translated.description}
                            </p>

                            <WidgetPreview
                              componentKey={def.componentKey}
                              title={translated.name}
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
                      <p>
                        No se encontraron widgets con los filtros aplicados.
                      </p>
                      <span className={styles.emptySubtext}>
                        Prueba buscando con otros términos o seleccionando otra
                        categoría.
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
                        onClick={() =>
                          setCurrentPage((p: number) => Math.max(p - 1, 1))
                        }
                        disabled={currentPage <= 1 || isLoading}
                      >
                        Anterior
                      </button>
                      <button
                        className={styles.pageBtn}
                        onClick={() =>
                          setCurrentPage((p: number) =>
                            Math.min(p + 1, totalPages),
                          )
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
        </AnimatedSectionContent>
      </Modal.Body>
      <Modal.Footer bordered={true}>
        <div className={styles.footerContent}>
          <Information style={{ width: 15, height: 15 }} />
          <span>
            {i18n.t("widgets.footer", {
              defaultValue:
                "Los widgets instalados se cargan bajo demanda para mantener tu aplicación rápida.",
            })}
          </span>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
