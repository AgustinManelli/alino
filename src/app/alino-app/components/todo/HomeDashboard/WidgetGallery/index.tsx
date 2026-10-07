"use client";


import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  Crown,
  Link,
  GridPlusIcon,
  Information,
  Cross,
  SearchIcon,
  ArrowLeft,
  AlinoLogo,
} from "@/components/ui/icons/icons";
import { AlinoLogoLoader } from "@/components/ui/icons/AlinoLogoLoader";
import { tierSatisfies, isWidgetOnlineOnly } from "@/config/widgets.registry";
import { useInstallWidget } from "@/hooks/dashboard/useInstallWidget";
import { useUninstallWidget } from "@/hooks/dashboard/useUninstallWidget";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useSyncStore } from "@/store/useSyncStore";
import { customToast } from "@/lib/toasts";
import { UserWidgetRow } from "@/lib/schemas/database.types";
import { PredefinedWidget } from "@/lib/schemas/dashboard.types";
import { Modal } from "@/components/ui/Modal";
import { getUserEmbeddedWidgets } from "@/lib/api/user-widgets/actions";
import {
  getWidgetsCatalogPaginated,
  PaginatedWidgetsCatalog,
} from "@/lib/api/dashboard/actions";
import { EmbeddedWidgetManager } from "./EmbeddedWidgetManager";
import { useModalStore } from "@/store/useModalStore";
import { WidgetPreview } from "./WidgetPreview";
import styles from "./WidgetGallery.module.css";
import { getWidgetTranslation } from "@/lib/i18n/helpers";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

interface Props {
  onClose: () => void;
  userTier: "free" | "student" | "pro" | "ultra";
}

interface AnimatedSectionContentProps {
  children: React.ReactNode;
  enabled: boolean;
}

const AnimatedSectionContent: React.FC<AnimatedSectionContentProps> = ({
  children,
  enabled,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const updateHeight = () => {
      setContentHeight(content.getBoundingClientRect().height);
    };

    updateHeight();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateHeight);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      className={styles.animatedSectionContent}
      animate={{ height: contentHeight }}
      transition={
        enabled
          ? { type: "spring", stiffness: 360, damping: 32 }
          : { duration: 0 }
      }
    >
      <div ref={contentRef}>{children}</div>
    </motion.div>
  );
};

interface FilterOption {
  id: string;
  label: string;
  premium?: boolean;
}

interface FilterScrollerProps {
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  variant: "chips" | "segmented";
  smooth: boolean;
}

const FilterScroller: React.FC<FilterScrollerProps> = ({
  options,
  value,
  onChange,
  ariaLabel,
  variant,
  smooth,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const updateEdges = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const start = scroller.scrollLeft > 2;
    const end =
      scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 2;
    setEdges((prev) =>
      prev.start === start && prev.end === end ? prev : { start, end },
    );
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    updateEdges();
    scroller.addEventListener("scroll", updateEdges, { passive: true });

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateEdges);
      return () => {
        scroller.removeEventListener("scroll", updateEdges);
        window.removeEventListener("resize", updateEdges);
      };
    }

    const observer = new ResizeObserver(updateEdges);
    observer.observe(scroller);
    observer.observe(track);
    return () => {
      scroller.removeEventListener("scroll", updateEdges);
      observer.disconnect();
    };
  }, [updateEdges, options]);

  const handleSelect = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: string,
  ) => {
    onChange(id);
    event.currentTarget.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      inline: "center",
      block: "nearest",
    });
  };

  const isSegmented = variant === "segmented";

  return (
    <div
      className={styles.scrollerWrap}
      data-start={edges.start}
      data-end={edges.end}
    >
      <div ref={scrollerRef} className={styles.scroller}>
        <div
          ref={trackRef}
          role="group"
          aria-label={ariaLabel}
          className={isSegmented ? styles.segmentedTrack : styles.chipsTrack}
        >
          {options.map((option) => {
            const isActive = value === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isActive}
                className={`${
                  isSegmented ? styles.segmentedOption : styles.filterChip
                } ${
                  isActive
                    ? isSegmented
                      ? styles.segmentedOptionActive
                      : styles.filterChipActive
                    : ""
                }`}
                onClick={(event) => handleSelect(event, option.id)}
              >
                {option.premium && (
                  <Crown
                    style={{
                      width: 12,
                      height: 12,
                      stroke: "currentColor",
                      strokeWidth: 2,
                      color: "rgb(255, 200, 100)",
                      flexShrink: 0,
                    }}
                  />
                )}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface WidgetCardProps {
  def: PredefinedWidget;
  isInstalled: boolean;
  canUse: boolean;
  isPending: boolean;
  buttonLabel: string;
  tierLabel: string;
  onAction: (def: PredefinedWidget) => void;
}

const WidgetCard: React.FC<WidgetCardProps> = ({
  def,
  isInstalled,
  canUse,
  isPending,
  buttonLabel,
  tierLabel,
  onAction,
}) => {
  const translated = getWidgetTranslation(def);
  const isPremiumTier =
    def.tierRequired === "pro" || def.tierRequired === "ultra";

  return (
    <article
      className={`${styles.card} ${isInstalled ? styles.cardInstalled : ""}`}
    >
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{translated.name}</h3>
        <span
          className={`${styles.badgeValue} ${
            isPremiumTier ? styles.badgePro : styles.badgeDefault
          }`}
        >
          {def.tierRequired !== "free" && (
            <Crown
              style={{
                width: 10,
                height: 10,
                stroke: "currentColor",
                strokeWidth: 2,
                color: "rgb(255, 200, 100)",
              }}
            />
          )}
          {tierLabel}
        </span>
      </header>

      <div className={styles.cardBody}>
        <div className={styles.widgetPreviewWrap}>
          <WidgetPreview
            componentKey={def.componentKey}
            title={translated.name}
          />
        </div>
        <p className={styles.cardDesc}>{translated.description}</p>
      </div>

      <footer className={styles.cardFooter}>
        <button
          type="button"
          disabled={isPending}
          className={`${styles.chooseButton} ${
            isInstalled
              ? styles.chooseButtonRemove
              : canUse
                ? styles.chooseButtonPrimary
                : styles.chooseButtonLocked
          }`}
          onClick={() => onAction(def)}
        >
          <span>{buttonLabel}</span>
        </button>
      </footer>
    </article>
  );
};

export const WidgetGallery = ({ onClose, userTier }: Props) => {
  const { t } = useTranslation(["widgets", "common"]);
  const openModal = useModalStore((s) => s.open);
  const activeWidgets = useDashboardStore((s) => s.activeWidgets);
  const isOnline = useSyncStore((s) => s.isOnline);
  const animations = useUserPreferencesStore((state) => state.animations);
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

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
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
              (translated.description &&
                translated.description.toLowerCase().includes(term))
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
        const tierCounts: Record<string, number> = {
          all: predefined.length,
        };
        for (const item of predefined) {
          if (item.category) {
            categoryCounts[item.category] =
              (categoryCounts[item.category] ?? 0) + 1;
          }
          if (item.tierRequired) {
            tierCounts[item.tierRequired] =
              (tierCounts[item.tierRequired] ?? 0) + 1;
          }
        }

        setCatalogData({
          widgets: paged,
          totalCount,
          currentPage,
          totalPages,
          categoryCounts,
          tierCounts,
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
          : t("widgets:errors.catalog", {
              defaultValue: "No se pudo cargar el catálogo.",
            }),
      );
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedTier, currentPage, t]);

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

  const categories = useMemo(() => {
    const counts = catalogData?.categoryCounts ?? {};
    const keys = Object.keys(counts);
    if (keys.length === 0) {
      const fromWidgets = Array.from(
        new Set(
          (catalogData?.widgets ?? []).map((w) => w.category).filter(Boolean),
        ),
      );
      if (fromWidgets.length > 0) return ["all", ...fromWidgets.sort()];
      return ["all"];
    }
    const others = keys.filter((k) => k !== "all").sort();
    return ["all", ...others];
  }, [catalogData?.categoryCounts, catalogData?.widgets]);

  const tiers = useMemo(() => {
    const counts = catalogData?.tierCounts ?? {};
    const keys = Object.keys(counts);
    if (keys.length === 0) {
      const fromWidgets = Array.from(
        new Set(
          (catalogData?.widgets ?? [])
            .map((w) => w.tierRequired)
            .filter(Boolean),
        ),
      );
      if (fromWidgets.length > 0) return ["all", ...fromWidgets.sort()];
      return ["all", "free", "pro"];
    }
    const order = ["free", "student", "pro", "ultra"];
    const others = keys
      .filter((k) => k !== "all")
      .sort((a, b) => {
        const idxA = order.indexOf(a);
        const idxB = order.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
      });
    return ["all", ...others];
  }, [catalogData?.tierCounts, catalogData?.widgets]);

  const formatCategoryLabel = useCallback(
    (cat: string) => {
      if (cat === "all") {
        return t("widgets:categories.all", { defaultValue: "Todos" });
      }
      return t(`widgets:categories.${cat}`, {
        defaultValue: cat
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      });
    },
    [t],
  );

  const formatTierLabel = useCallback(
    (tier: string) => {
      if (tier === "all") {
        return t("widgets:tiers.all", { defaultValue: "Todos" });
      }
      return t(`widgets:tiers.${tier}`, {
        defaultValue: tier
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      });
    },
    [t],
  );

  const categoryOptions = useMemo<FilterOption[]>(
    () => categories.map((id) => ({ id, label: formatCategoryLabel(id) })),
    [categories, formatCategoryLabel],
  );

  const tierOptions = useMemo<FilterOption[]>(
    () =>
      tiers.map((id) => ({
        id,
        label: formatTierLabel(id),
        premium: id === "pro" || id === "ultra",
      })),
    [tiers, formatTierLabel],
  );

  const handleSelectCategory = useCallback((catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  }, []);

  const handleSelectTier = useCallback((tierId: string) => {
    setSelectedTier(tierId);
    setCurrentPage(1);
  }, []);

  const isThisActionPending = useCallback(
    (widgetId: string) => {
      return (isInstalling || isUninstalling) && targetWidgetId === widgetId;
    },
    [isInstalling, isUninstalling, targetWidgetId],
  );

  const handleWidgetAction = async (def: PredefinedWidget) => {
    const isInstalled = activeWidgets.includes(def.id);
    const canUse = tierSatisfies(userTier, def.tierRequired);

    if (isThisActionPending(def.id)) return;

    if (!isOnline && isWidgetOnlineOnly(def.id)) {
      customToast.error(
        t("widgets:errors.offlineRequired", {
          defaultValue: "Este widget requiere conexión a internet para usarse.",
        }),
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

  const getWidgetButtonLabel = useCallback(
    (
      def: PredefinedWidget,
      isInstalled: boolean,
      canUse: boolean,
      isPending: boolean,
    ) => {
      if (isInstalled) {
        return isPending
          ? t("widgets:uninstalling", { defaultValue: "Desinstalando..." })
          : t("widgets:uninstall", { defaultValue: "Desinstalar" });
      }
      if (isPending) {
        return t("widgets:installing", { defaultValue: "Instalando..." });
      }
      if (!canUse) {
        return t("widgets:requiresTier", {
          tier: formatTierLabel(def.tierRequired),
          defaultValue: `Requiere ${formatTierLabel(def.tierRequired)}`,
        });
      }
      return t("widgets:install", { defaultValue: "Instalar" });
    },
    [t, formatTierLabel],
  );

  const sections = useMemo(
    () => [
      {
        id: "catalog" as const,
        label: t("widgets:catalog", { defaultValue: "Explorar widgets" }),
        icon: (
          <GridPlusIcon
            style={{
              width: 17,
              height: 17,
              stroke: "currentColor",
              strokeWidth: 1.8,
            }}
          />
        ),
      },
      {
        id: "my-widgets" as const,
        label: t("widgets:myWidgets", { defaultValue: "Mis widgets" }),
        icon: (
          <Link
            style={{
              width: 17,
              height: 17,
              stroke: "currentColor",
              strokeWidth: 1.8,
            }}
          />
        ),
      },
    ],
    [t],
  );

  const widgetsList = catalogData?.widgets ?? [];
  const totalCount = catalogData?.totalCount ?? 0;
  const totalPages = catalogData?.totalPages ?? 1;
  const activeCategoryLabel = formatCategoryLabel(selectedCategory);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="980px"
      id="alino-widget-gallery-modal"
      ariaLabel={t("widgets:title", {
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
            {t("widgets:tag", { defaultValue: "WIDGETS" })}
          </span>
        </div>
        <Modal.CloseButton onClick={onClose} />
      </Modal.Header>

      <Modal.Body noPadding={true}>
        <section className={styles.heroBanner}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              {t("widgets:banner.title", {
                defaultValue: "Diseña tu dashboard.",
              })}{" "}
              <br />
              <span className={styles.heroTitleAccent}>
                {t("widgets:banner.accent", {
                  defaultValue: "Tu espacio, a tu manera.",
                })}
              </span>
            </h1>
            <p className={styles.heroSubtitle}>
              {t("widgets:banner.subtitle", {
                defaultValue: "Widgets que se ajustan a tus necesidades.",
              })}
            </p>
          </div>
        </section>

        <section className={styles.tabsContainer}>
          <nav
            className={styles.tabsBar}
            aria-label={t("widgets:navigation", {
              defaultValue: "Secciones de widgets",
            })}
          >
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`${styles.tabButton} ${
                  activeSection === section.id ? styles.tabButtonActive : ""
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.icon}
                <span>{section.label}</span>
                {activeSection === section.id && (
                  <motion.div
                    layoutId="widgetActiveTabIndicator"
                    className={styles.tabIndicator}
                  />
                )}
              </button>
            ))}
          </nav>
        </section>

        <AnimatedSectionContent enabled={animations}>
          <section className={styles.sectionHeader}>
            <div className={styles.sectionHeaderLeft}>
              <h2 className={styles.sectionTitle}>
                {activeSection === "catalog"
                  ? activeCategoryLabel
                  : t("widgets:myWidgetsSection.title", {
                      defaultValue: "Tus widgets personalizados",
                    })}
              </h2>
              <p className={styles.sectionSubtitle}>
                {activeSection === "catalog"
                  ? totalCount === 1
                    ? t("widgets:singleWidget", {
                        defaultValue: "1 widget disponible",
                      })
                    : t("widgets:multipleWidgets", {
                        count: totalCount,
                        defaultValue: `${totalCount} widgets disponibles`,
                      })
                  : t("widgets:myWidgetsSection.subtitle", {
                      defaultValue:
                        "Agrega e interactúa con tus propias integraciones web embebidas.",
                    })}
              </p>
            </div>

            <div className={styles.sectionHeaderRight}>
              <div className={styles.balancePill}>
                <GridPlusIcon
                  style={{
                    width: 15,
                    height: 15,
                    stroke: "currentColor",
                    strokeWidth: 1.8,
                  }}
                />
                <span>
                  {activeWidgets.length}{" "}
                  {activeWidgets.length === 1
                    ? t("widgets:activeWidget", { defaultValue: "instalado" })
                    : t("widgets:activeWidgets", {
                        defaultValue: "instalados",
                      })}
                </span>
              </div>
            </div>
          </section>

          <section className={styles.cardsContainer}>
            <AnimatePresence mode="wait">
              {activeSection === "catalog" ? (
                <motion.div
                  key="catalog"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className={styles.toolbar}>
                    <div className={styles.toolbarTop}>
                      <div className={styles.searchBox}>
                        <SearchIcon className={styles.searchIcon} />
                        <input
                          type="text"
                          className={styles.searchInput}
                          placeholder={t("widgets:search", {
                            defaultValue: "Buscar widgets...",
                          })}
                          aria-label={t("widgets:search", {
                            defaultValue: "Buscar widgets...",
                          })}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            className={styles.searchClearBtn}
                            onClick={() => setSearchQuery("")}
                            aria-label={t("common:clear", {
                              defaultValue: "Limpiar búsqueda",
                            })}
                          >
                            <Cross style={{ width: 11, height: 11 }} />
                          </button>
                        )}
                      </div>

                      {tierOptions.length > 1 && (
                        <div className={styles.filterGroupInline}>
                          <span className={styles.filterSectionLabel}>
                            {t("widgets:tiersLabel", {
                              defaultValue: "Plan",
                            })}
                          </span>
                          <FilterScroller
                            options={tierOptions}
                            value={selectedTier}
                            onChange={handleSelectTier}
                            ariaLabel={t("widgets:tiersLabel", {
                              defaultValue: "Plan",
                            })}
                            variant="segmented"
                            smooth={animations}
                          />
                        </div>
                      )}
                    </div>

                    {categoryOptions.length > 1 && (
                      <div className={styles.filterGroupFill}>
                        <span className={styles.filterSectionLabel}>
                          {t("widgets:categoriesLabel", {
                            defaultValue: "Categoría",
                          })}
                        </span>
                        <FilterScroller
                          options={categoryOptions}
                          value={selectedCategory}
                          onChange={handleSelectCategory}
                          ariaLabel={t("widgets:categoriesLabel", {
                            defaultValue: "Categoría",
                          })}
                          variant="chips"
                          smooth={animations}
                        />
                      </div>
                    )}
                  </div>

                  {isLoading ? (
                    <div className={styles.loadingState}>
                      <AlinoLogoLoader
                        width={100}
                        className={styles.loadingSpinner}
                      />
                    </div>
                  ) : catalogError ? (
                    <div className={styles.emptyState}>
                      <p className={styles.emptyText}>{catalogError}</p>
                      <button
                        type="button"
                        className={styles.retryButton}
                        onClick={fetchCatalog}
                      >
                        {t("common:retry", { defaultValue: "Reintentar" })}
                      </button>
                    </div>
                  ) : widgetsList.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIconWrap}>
                        <GridPlusIcon
                          style={{
                            width: 24,
                            height: 24,
                            stroke: "currentColor",
                            strokeWidth: 1.5,
                          }}
                        />
                      </div>
                      <p className={styles.emptyText}>
                        {t("widgets:empty", {
                          defaultValue:
                            "No se encontraron widgets con los filtros aplicados.",
                        })}
                      </p>
                      <span className={styles.emptySubtext}>
                        {t("widgets:emptySubtext", {
                          defaultValue:
                            "Prueba buscando con otros términos o seleccionando otra categoría.",
                        })}
                      </span>
                    </div>
                  ) : (
                    <div className={styles.cardsGrid}>
                      {widgetsList.map((def: PredefinedWidget) => {
                        const isInstalled = activeWidgets.includes(def.id);
                        const canUse = tierSatisfies(
                          userTier,
                          def.tierRequired,
                        );
                        const isPending = isThisActionPending(def.id);

                        return (
                          <WidgetCard
                            key={def.id}
                            def={def}
                            isInstalled={isInstalled}
                            canUse={canUse}
                            isPending={isPending}
                            buttonLabel={getWidgetButtonLabel(
                              def,
                              isInstalled,
                              canUse,
                              isPending,
                            )}
                            tierLabel={formatTierLabel(def.tierRequired)}
                            onAction={handleWidgetAction}
                          />
                        );
                      })}
                    </div>
                  )}

                  {!isLoading && totalPages > 1 && (
                    <footer className={styles.paginationBar}>
                      <span className={styles.paginationInfo}>
                        {t("widgets:pagination.page", {
                          current: currentPage,
                          total: totalPages,
                          defaultValue: `Página ${currentPage} de ${totalPages}`,
                        })}
                      </span>
                      <div className={styles.paginationButtons}>
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={currentPage <= 1 || isLoading}
                          onClick={() =>
                            setCurrentPage((p: number) => Math.max(p - 1, 1))
                          }
                        >
                          <ArrowLeft style={{ width: 14, height: 14 }} />
                          <span>
                            {t("widgets:pagination.prev", {
                              defaultValue: "Anterior",
                            })}
                          </span>
                        </button>
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={currentPage >= totalPages || isLoading}
                          onClick={() =>
                            setCurrentPage((p: number) =>
                              Math.min(p + 1, totalPages),
                            )
                          }
                        >
                          <span>
                            {t("widgets:pagination.next", {
                              defaultValue: "Siguiente",
                            })}
                          </span>
                          <ArrowLeft
                            style={{
                              width: 14,
                              height: 14,
                              transform: "rotate(180deg)",
                            }}
                          />
                        </button>
                      </div>
                    </footer>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="my-widgets"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <EmbeddedWidgetManager
                    widgets={myEmbeddedWidgets}
                    activeWidgets={activeWidgets}
                    userTier={userTier}
                    onInstall={(id: string) => installWidget(id, id)}
                    onUninstall={(id: string) => uninstallWidget(id)}
                    onChange={fetchMyWidgets}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </AnimatedSectionContent>
      </Modal.Body>

      <Modal.Footer bordered={true}>
        <div className={styles.footerContent}>
          <Information style={{ width: 15, height: 15, flexShrink: 0 }} />
          <span>
            {t("widgets:footer", {
              defaultValue:
                "Los widgets instalados se cargan bajo demanda para mantener tu aplicación rápida.",
            })}
          </span>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
