"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { AlinoCoinIcon } from "@/components/ui/alino-coins-icon";
import {
  AlinoLogo,
  IAStars,
  ArrowLeft,
  CoinsDollarIcon,
  LockKeyholeIcon,
  Shirt01Icon,
  Cross,
  SearchIcon,
} from "@/components/ui/icons/icons";
import { UserAvatar } from "@/components/ui/UserAvatar/UserAvatar";
import { useShopStore } from "@/store/useShopStore";
import { useUserDataStore } from "@/store/useUserDataStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { CoinPack } from "@/lib/api/shop/actions";
import { AICreditPack, CosmeticItem } from "@/lib/schemas/database.types";
import {
  getCoinPackTranslation,
  getAICreditPackTranslation,
  getBannerTranslation,
  resolveLocalizedField,
  getCosmeticTranslation,
} from "@/lib/i18n/helpers";
import {
  getShopCosmeticsCatalogAction,
  buyCosmeticAction,
} from "@/lib/api/cosmetics/actions";
import { customToast } from "@/lib/toasts";
import styles from "./ShopGalleryModal.module.css";
import { AlinoLogoLoader } from "@/components/ui/icons/AlinoLogoLoader";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "coins" | "ai_credits" | "cosmetics";

interface ShopSection {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  balance: "coins" | "ai_credits";
}

interface DisplayPack {
  id: string;
  name: string;
  amount: number;
  bonusAmount?: number;
  priceFormatted: string;
  coinsPrice?: number;
  isAvailable: boolean;
  isPopular?: boolean;
  tag?: string | null;
  rawCoinPack?: CoinPack;
  rawAIPack?: AICreditPack;
}

interface FilterOption {
  id: string;
  label: string;
}

const RARITY_CLASS: Record<string, string> = {
  common: styles.rarity_common,
  rare: styles.rarity_rare,
  epic: styles.rarity_epic,
  legendary: styles.rarity_legendary,
};

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

interface FilterScrollerProps {
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  smooth: boolean;
}

const FilterScroller: React.FC<FilterScrollerProps> = ({
  options,
  value,
  onChange,
  ariaLabel,
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
          className={styles.chipsTrack}
        >
          {options.map((option) => {
            const isActive = value === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isActive}
                className={`${styles.filterChip} ${
                  isActive ? styles.filterChipActive : ""
                }`}
                onClick={(event) => handleSelect(event, option.id)}
              >
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface PackCardProps {
  pack: DisplayPack;
  kind: "coins" | "ai_credits";
  isBuying: boolean;
  onSelect: (pack: DisplayPack) => void;
}

const PackCard: React.FC<PackCardProps> = ({
  pack,
  kind,
  isBuying,
  onSelect,
}) => {
  const { t } = useTranslation(["shop", "common"]);
  const isCoins = kind === "coins";

  const buttonLabel = isBuying
    ? t("common:loading", { defaultValue: "Cargando..." })
    : !pack.isAvailable
      ? t("common:comingSoon", { defaultValue: "Próximamente" })
      : t("shop:cards.selectPack", { defaultValue: "Elegir pack" });

  return (
    <article
      className={`${styles.card} ${pack.isPopular ? styles.cardPopular : ""}`}
    >
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{pack.name}</h3>
        {pack.tag && (
          <span
            className={pack.isPopular ? styles.badgePopular : styles.badgeValue}
          >
            {pack.tag}
          </span>
        )}
      </header>

      <div className={styles.cardBody}>
        <div className={styles.iconWrapper}>
          {isCoins ? (
            <AlinoCoinIcon amount={pack.amount} size={64} animated={false} />
          ) : (
            <div className={styles.aiTokenVisual}>
              <IAStars
                style={{
                  width: 28,
                  height: 28,
                  stroke: "rgb(106, 195, 255)",
                  strokeWidth: 2,
                }}
              />
            </div>
          )}
        </div>

        <span className={styles.amountNumber}>{pack.amount}</span>
        <span className={styles.unitLabel}>
          {isCoins
            ? t("shop:cards.coinsUnit", { defaultValue: "monedas" })
            : t("shop:cards.tokensUnit", { defaultValue: "tokens IA" })}
        </span>

        {pack.bonusAmount ? (
          <div className={styles.bonusTag}>
            <IAStars
              style={{
                width: 12,
                height: 12,
                stroke: "currentColor",
                strokeWidth: 2,
              }}
            />
            <span>
              {t("shop:cards.giftBonus", {
                amount: pack.bonusAmount,
                defaultValue: `+${pack.bonusAmount} de regalo`,
              })}
            </span>
          </div>
        ) : null}
      </div>

      <footer className={styles.cardFooter}>
        <div className={styles.cardPrice}>
          {isCoins ? (
            pack.priceFormatted
          ) : (
            <>
              <AlinoCoinIcon amount={pack.coinsPrice ?? 0} size={18} />
              <span>{pack.coinsPrice}</span>
            </>
          )}
        </div>

        <button
          type="button"
          disabled={isBuying || !pack.isAvailable}
          className={`${styles.chooseButton} ${
            pack.isPopular ? styles.chooseButtonPopular : ""
          }`}
          onClick={() => onSelect(pack)}
        >
          <span>{buttonLabel}</span>
          <ArrowLeft className={styles.arrowRightIcon} />
        </button>
      </footer>
    </article>
  );
};

interface CosmeticCardProps {
  item: CosmeticItem;
  isBuying: boolean;
  canAfford: boolean;
  avatarUrl?: string | null;
  username?: string | undefined;
  onBuy: (item: CosmeticItem) => void;
}

const CosmeticCard: React.FC<CosmeticCardProps> = ({
  item,
  isBuying,
  canAfford,
  avatarUrl,
  username,
  onBuy,
}) => {
  const { t } = useTranslation(["shop", "common"]);
  const trans = getCosmeticTranslation(item);
  const isOwned = item.is_unlocked === true;
  const isUnavailable =
    item.status === "coming_soon" ||
    item.status === "paused" ||
    item.status === "retired";

  let label: string;
  if (item.status === "coming_soon") {
    label = t("shop:cosmetics.comingSoon", { defaultValue: "Próximamente" });
  } else if (item.status === "paused" || item.status === "retired") {
    label = t("shop:cosmetics.unavailable", { defaultValue: "No disponible" });
  } else if (isOwned) {
    label = t("shop:cosmetics.owned", { defaultValue: "En inventario" });
  } else if (isBuying) {
    label = t("shop:cosmetics.purchasing", { defaultValue: "Comprando..." });
  } else {
    label = t("shop:cosmetics.buy", { defaultValue: "Comprar" });
  }

  const isLocked = !isOwned && !isUnavailable && !canAfford;

  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{trans.name}</h3>
        <span
          className={`${styles.badgeValue} ${
            RARITY_CLASS[item.rarity] ?? styles.rarity_common
          }`}
        >
          {t(`shop:gallery.rarity.${item.rarity}`, {
            defaultValue: item.rarity,
          })}
        </span>
      </header>

      <div className={styles.cardBody}>
        <div className={styles.cosmeticPreview}>
          <UserAvatar
            avatarUrl={avatarUrl}
            username={username}
            size={56}
            animate="hover"
            equippedFrameId={item.type === "frame" ? item.code : null}
            equippedFrame={item.type === "frame" ? item : null}
            equippedOverlayId={item.type === "overlay" ? item.code : null}
            equippedOverlay={item.type === "overlay" ? item : null}
          />
        </div>
        <p className={styles.cardDesc}>{trans.description}</p>
      </div>

      <footer className={styles.cardFooter}>
        <div className={styles.cardPrice}>
          <AlinoCoinIcon amount={item.coins_price} size={18} />
          <span>{item.coins_price}</span>
        </div>

        <button
          type="button"
          disabled={isOwned || isBuying || isUnavailable}
          className={`${styles.chooseButton} ${
            isLocked ? styles.chooseButtonLocked : ""
          }`}
          onClick={() => onBuy(item)}
        >
          <span>{label}</span>
          {!isOwned && !isUnavailable && (
            <ArrowLeft className={styles.arrowRightIcon} />
          )}
        </button>
      </footer>
    </article>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onChange,
}) => {
  const { t } = useTranslation(["shop"]);

  return (
    <footer className={styles.paginationBar}>
      <span className={styles.paginationInfo}>
        {t("shop:gallery.pagination.page", {
          current: currentPage,
          total: totalPages,
          defaultValue: `Página ${currentPage} de ${totalPages}`,
        })}
      </span>
      <div className={styles.paginationButtons}>
        <button
          type="button"
          className={styles.paginationBtn}
          disabled={currentPage <= 1}
          onClick={() => onChange(Math.max(1, currentPage - 1))}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          <span>
            {t("shop:gallery.pagination.prev", { defaultValue: "Anterior" })}
          </span>
        </button>
        <button
          type="button"
          className={styles.paginationBtn}
          disabled={currentPage >= totalPages}
          onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
        >
          <span>
            {t("shop:gallery.pagination.next", { defaultValue: "Siguiente" })}
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
  );
};

export const ShopGalleryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation(["shop", "common"]);
  const {
    coins,
    extraAICredits,
    coinPacks,
    aiCreditPacks,
    activeBanner,
    isLoading,
    error: shopError,
    fetchShopData,
    buyAICreditPack,
    setCoins,
    markCosmeticUnlocked,
  } = useShopStore();

  const currentUser = useUserDataStore((state) => state.user);
  const animations = useUserPreferencesStore((state) => state.animations);

  const [activeTab, setActiveTab] = useState<TabType>("coins");
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const [cosmetics, setCosmetics] = useState<CosmeticItem[]>([]);
  const [isLoadingCosmetics, setIsLoadingCosmetics] = useState(false);
  const [cosmeticsError, setCosmeticsError] = useState<string | null>(null);
  const [purchasingCosmeticId, setPurchasingCosmeticId] = useState<
    string | null
  >(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {},
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cosmeticsRequestRef = useRef(0);

  const sections = useMemo<ShopSection[]>(
    () => [
      {
        id: "coins",
        label: t("shop:tabs.coins", { defaultValue: "Monedas" }),
        icon: (
          <CoinsDollarIcon
            style={{
              width: 17,
              height: 17,
              stroke: "currentColor",
              strokeWidth: 1.8,
            }}
          />
        ),
        title: t("shop:coinsSection.title", {
          defaultValue: "Monedas para todo lo que imaginas.",
        }),
        subtitle: t("shop:coinsSection.subtitle", {
          defaultValue: "Desbloquea más posibilidades en cada momento.",
        }),
        balance: "coins",
      },
      {
        id: "ai_credits",
        label: t("shop:tabs.aiTokens", { defaultValue: "Tokens IA" }),
        icon: (
          <IAStars
            style={{
              width: 17,
              height: 17,
              stroke: "currentColor",
              strokeWidth: 1.8,
            }}
          />
        ),
        title: t("shop:aiSection.title", {
          defaultValue: "Tokens IA para potenciar tu flujo.",
        }),
        subtitle: t("shop:aiSection.subtitle", {
          defaultValue: "Desbloquea más posibilidades en cada momento.",
        }),
        balance: "ai_credits",
      },
      {
        id: "cosmetics",
        label: t("shop:tabs.cosmetics", { defaultValue: "Cosméticos" }),
        icon: (
          <Shirt01Icon
            style={{
              width: 17,
              height: 17,
              stroke: "currentColor",
              strokeWidth: 1.8,
            }}
          />
        ),
        title: t("shop:cosmeticsSection.title", {
          defaultValue: "Personaliza tu avatar y destaca tu perfil.",
        }),
        subtitle: t("shop:cosmeticsSection.subtitle", {
          defaultValue:
            "Marcos, accesorios y efectos visuales exclusivos para tu estilo.",
        }),
        balance: "coins",
      },
    ],
    [t, i18n.language],
  );

  const activeSection =
    sections.find((section) => section.id === activeTab) ?? sections[0];

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

  useEffect(() => {
    if (!isOpen) return;
    fetchShopData();
  }, [isOpen, fetchShopData]);

  const fetchCosmetics = useCallback(async () => {
    const requestId = ++cosmeticsRequestRef.current;
    setIsLoadingCosmetics(true);
    setCosmeticsError(null);
    try {
      const res = await getShopCosmeticsCatalogAction({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        search: debouncedSearch || undefined,
        page: currentPage,
        pageSize: 9,
      });
      if (requestId !== cosmeticsRequestRef.current) return;
      if (res.data) {
        setCosmetics(res.data.cosmetics);
        setTotalPages(res.data.total_pages);
        if (res.data.category_counts) {
          setCategoryCounts(res.data.category_counts);
        }
      } else {
        setCosmeticsError(
          res.error ??
            t("shop:errors.GENERIC_ERROR", {
              defaultValue: "No se pudo cargar el catálogo.",
            }),
        );
      }
    } finally {
      if (requestId === cosmeticsRequestRef.current) {
        setIsLoadingCosmetics(false);
      }
    }
  }, [selectedCategory, debouncedSearch, currentPage, t]);

  useEffect(() => {
    if (!isOpen || activeTab !== "cosmetics") return;
    fetchCosmetics();
  }, [isOpen, activeTab, fetchCosmetics]);

  const bannerData = useMemo(() => {
    if (!activeBanner) return null;
    return getBannerTranslation(activeBanner);
  }, [activeBanner, i18n.language]);

  const handleBannerClick = () => {
    if (!activeBanner) return;
    if (activeBanner.action_type === "tab_coins") {
      setActiveTab("coins");
    } else if (activeBanner.action_type === "tab_ai") {
      setActiveTab("ai_credits");
    } else if (activeBanner.link_url) {
      window.open(activeBanner.link_url, "_blank", "noopener,noreferrer");
    }
  };

  const resolvedCoinPacks: DisplayPack[] = useMemo(() => {
    return coinPacks.map((pack) => {
      const trans = getCoinPackTranslation(pack);
      const enTag = trans.tagEn || resolveLocalizedField(pack.tag, "", "en");
      const isPopular = enTag.toLowerCase().includes("popular");

      return {
        id: pack.id,
        name: trans.name,
        amount: pack.coins_amount,
        bonusAmount: pack.bonus_amount || undefined,
        priceFormatted:
          pack.resolved_price?.formatted ||
          `${pack.coins_amount} ${t("shop:packs.coinsUnit", {
            defaultValue: "monedas",
          })}`,
        isPopular,
        tag: trans.tag || null,
        isAvailable: pack.is_available,
        rawCoinPack: pack,
      };
    });
  }, [coinPacks, t, i18n.language]);

  const resolvedAIPacks: DisplayPack[] = useMemo(() => {
    return aiCreditPacks.map((pack) => {
      const trans = getAICreditPackTranslation(pack);
      const enTag = trans.tagEn || resolveLocalizedField(pack.tag, "", "en");
      const isPopular = enTag.toLowerCase().includes("popular");

      return {
        id: pack.id,
        name: trans.name,
        amount: pack.credits_amount,
        bonusAmount: pack.bonus_amount || undefined,
        priceFormatted: String(pack.coins_price),
        coinsPrice: pack.coins_price,
        isPopular,
        tag: trans.tag || null,
        isAvailable: pack.is_available,
        rawAIPack: pack,
      };
    });
  }, [aiCreditPacks, i18n.language]);

  const handleSelectCoinPack = (_pack: DisplayPack) => {
    customToast.info(
      t("common:comingSoon", { defaultValue: "Próximamente" }),
      t("shop:packs.coinsUnit", { defaultValue: "Monedas" }),
    );
  };

  const handleSelectAIPack = async (pack: DisplayPack) => {
    if (!pack.isAvailable) {
      customToast.info(
        t("common:comingSoon", { defaultValue: "Próximamente" }),
        t("shop:tabs.aiTokens", { defaultValue: "Tokens IA" }),
      );
      return;
    }

    const requiredCoins = pack.coinsPrice ?? 0;
    if (coins < requiredCoins) {
      customToast.error(
        t("shop:errors.INSUFFICIENT_COINS", {
          defaultValue: t("shop:ai_credits.insufficientCoins"),
        }),
      );
      return;
    }

    if (!pack.rawAIPack) {
      customToast.info(
        t("common:comingSoon", { defaultValue: "Próximamente" }),
      );
      return;
    }

    setPurchasingId(pack.id);
    try {
      const res = await buyAICreditPack(pack.rawAIPack.id);
      if (res.success) {
        const totalAdded = pack.amount + (pack.bonusAmount || 0);
        customToast.success(
          t("shop:ai_credits.purchaseSuccess", { amount: totalAdded }),
        );
      } else {
        const code = res.errorCode || res.error || "GENERIC_ERROR";
        if (code === "AI_PACK_NOT_AVAILABLE") {
          customToast.info(
            t("common:comingSoon", { defaultValue: "Próximamente" }),
            t("shop:tabs.aiTokens", { defaultValue: "Tokens IA" }),
          );
          return;
        }
        customToast.error(
          t(`shop:errors.${code}`, {
            defaultValue: t("shop:errors.GENERIC_ERROR"),
          }),
        );
      }
    } finally {
      setPurchasingId(null);
    }
  };

  const handleBuyCosmetic = async (item: CosmeticItem) => {
    if (item.is_unlocked) return;

    if (coins < item.coins_price) {
      customToast.error(
        t("shop:errors.INSUFFICIENT_COINS", {
          defaultValue: t("shop:cosmetics.insufficientCoins"),
        }),
      );
      return;
    }

    setPurchasingCosmeticId(item.id);
    try {
      const res = await buyCosmeticAction(item.id);
      if (res.success && typeof res.new_balance === "number") {
        setCoins(res.new_balance);
        markCosmeticUnlocked(item.id);
        setCosmetics((prev) =>
          prev.map((c) => (c.id === item.id ? { ...c, is_unlocked: true } : c)),
        );
        const trans = getCosmeticTranslation(item);
        customToast.success(
          t("shop:cosmetics.purchaseSuccess", { name: trans.name }),
        );
      } else {
        const code = res.errorCode || res.error || "GENERIC_ERROR";
        customToast.error(
          t(`shop:errors.${code}`, {
            defaultValue: t("shop:errors.GENERIC_ERROR"),
          }),
        );
      }
    } finally {
      setPurchasingCosmeticId(null);
    }
  };

  const currentPacks =
    activeTab === "coins" ? resolvedCoinPacks : resolvedAIPacks;
  const isBannerClickable = Boolean(
    activeBanner &&
      (activeBanner.link_url || activeBanner.action_type !== "none"),
  );

  const handleCategoryChange = useCallback((cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  }, []);

  const dynamicCategories = useMemo(() => {
    const keys = Object.keys(categoryCounts);
    if (keys.length === 0) {
      const fromItems = Array.from(
        new Set(cosmetics.map((c) => c.type).filter(Boolean)),
      );
      if (fromItems.length > 0) return ["all", ...fromItems.sort()];
      return ["all"];
    }
    const others = keys.filter((k) => k !== "all").sort();
    return ["all", ...others];
  }, [categoryCounts, cosmetics]);

  const formatCategoryLabel = useCallback(
    (cat: string) => {
      if (cat === "all") {
        return t("shop:gallery.categories.all", { defaultValue: "Todos" });
      }
      return t(`shop:gallery.categories.${cat}`, {
        defaultValue: cat
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      });
    },
    [t],
  );

  const categoryOptions = useMemo<FilterOption[]>(
    () =>
      dynamicCategories.map((id) => ({ id, label: formatCategoryLabel(id) })),
    [dynamicCategories, formatCategoryLabel],
  );

  const searchPlaceholder = t("shop:gallery.searchPlaceholder", {
    defaultValue: "Buscar por nombre o descripción...",
  });

  const footerDisclaimer = t("shop:footer.disclaimer", { defaultValue: "" });

  const renderPacksContent = () => {
    if (isLoading) {
      return (
        <div className={styles.loadingState}>
          <AlinoLogoLoader width={100} className={styles.loadingSpinner} />
        </div>
      );
    }
    if (shopError && currentPacks.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>{shopError}</p>
        </div>
      );
    }
    if (currentPacks.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>
            {t("shop:ai_credits.noPacks", {
              defaultValue: "No hay paquetes disponibles en este momento.",
            })}
          </p>
        </div>
      );
    }
    return (
      <div className={styles.cardsGrid}>
        {currentPacks.map((pack) => (
          <PackCard
            key={pack.id}
            pack={pack}
            kind={activeTab === "coins" ? "coins" : "ai_credits"}
            isBuying={purchasingId === pack.id}
            onSelect={
              activeTab === "coins" ? handleSelectCoinPack : handleSelectAIPack
            }
          />
        ))}
      </div>
    );
  };

  const renderCosmeticsContent = () => {
    if (isLoadingCosmetics) {
      return (
        <div className={styles.loadingState}>
          <AlinoLogoLoader width={100} className={styles.loadingSpinner} />
        </div>
      );
    }
    if (cosmeticsError) {
      return (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>{cosmeticsError}</p>
        </div>
      );
    }
    if (cosmetics.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <Shirt01Icon
              style={{
                width: 24,
                height: 24,
                stroke: "currentColor",
                strokeWidth: 1.5,
              }}
            />
          </div>
          <p className={styles.emptyText}>
            {t("shop:gallery.empty", {
              defaultValue:
                "No se encontraron cosméticos con los filtros actuales.",
            })}
          </p>
        </div>
      );
    }
    return (
      <div className={styles.cardsGrid}>
        {cosmetics.map((item) => (
          <CosmeticCard
            key={item.id}
            item={item}
            isBuying={purchasingCosmeticId === item.id}
            canAfford={coins >= item.coins_price}
            avatarUrl={currentUser?.avatar_url}
            username={currentUser?.username}
            onBuy={handleBuyCosmetic}
          />
        ))}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="880px"
      id="alino-shop-gallery-modal"
      ariaLabel={t("shop:title", { defaultValue: "Alino Shop" })}
    >
      <Modal.Header bordered={true}>
        <div className={styles.headerBrand}>
          <div className={styles.brandLogo}>
            <AlinoLogo style={{ height: 26, width: "auto" }} />
          </div>
          <div className={styles.brandSeparator} />
          <span className={styles.brandShopTag}>
            {t("shop:gallery.shopTag", { defaultValue: "TIENDA" })}
          </span>
        </div>
        <Modal.CloseButton onClick={onClose} />
      </Modal.Header>

      <Modal.Body noPadding={true}>
        <section
          className={`${styles.heroBanner} ${
            isBannerClickable ? styles.heroBannerClickable : ""
          }`}
          onClick={isBannerClickable ? handleBannerClick : undefined}
          onKeyDown={
            isBannerClickable
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleBannerClick();
                  }
                }
              : undefined
          }
          role={isBannerClickable ? "button" : undefined}
          tabIndex={isBannerClickable ? 0 : undefined}
          aria-label={
            isBannerClickable
              ? t("shop:banner.openAction", {
                  defaultValue: "Abrir promoción",
                })
              : undefined
          }
        >
          <div className={styles.heroContent}>
            {bannerData?.eyebrow && (
              <span className={styles.heroEyebrow}>— {bannerData.eyebrow}</span>
            )}
            <h1 className={styles.heroTitle}>
              {bannerData ? (
                bannerData.title
              ) : (
                <>
                  {t("shop:banner.title1", {
                    defaultValue: "Tu próxima gran idea",
                  })}{" "}
                  <br />
                  <span className={styles.heroTitleAccent}>
                    {t("shop:banner.title2", {
                      defaultValue: "empieza aquí.",
                    })}
                  </span>
                </>
              )}
            </h1>
            <p className={styles.heroSubtitle}>
              {bannerData
                ? bannerData.subtitle
                : t("shop:banner.subtitle", {
                    defaultValue:
                      "Elige lo que necesitas para seguir creando sin límites.",
                  })}
            </p>
          </div>

          {activeBanner?.image_url && (
            <div className={styles.bannerImageWrapper}>
              <Image
                src={activeBanner.image_url}
                alt={t("shop:banner.imageAlt", {
                  defaultValue: "Banner promocional",
                })}
                width={180}
                height={95}
                className={styles.bannerImage}
              />
            </div>
          )}
        </section>

        <section className={styles.tabsContainer}>
          <nav
            className={styles.tabsBar}
            aria-label={t("shop:navigation", {
              defaultValue: "Secciones de la tienda",
            })}
          >
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`${styles.tabButton} ${
                  activeTab === section.id ? styles.tabButtonActive : ""
                }`}
                onClick={() => setActiveTab(section.id)}
              >
                {section.icon}
                <span>{section.label}</span>
                {activeTab === section.id && (
                  <motion.div
                    layoutId="shopActiveTabIndicator"
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
              <h2 className={styles.sectionTitle}>{activeSection.title}</h2>
              <p className={styles.sectionSubtitle}>{activeSection.subtitle}</p>
            </div>

            <div className={styles.sectionHeaderRight}>
              <div className={styles.balancePill}>
                {activeSection.balance === "ai_credits" ? (
                  <>
                    <IAStars
                      style={{
                        width: 15,
                        height: 15,
                        stroke: "currentColor",
                        strokeWidth: 1.8,
                      }}
                    />
                    <span>
                      {extraAICredits}{" "}
                      {t("shop:cards.tokensUnit", {
                        defaultValue: "tokens IA",
                      })}
                    </span>
                  </>
                ) : (
                  <>
                    <AlinoCoinIcon amount={coins} size={16} />
                    <span>{coins}</span>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className={styles.cardsContainer}>
            <AnimatePresence mode="wait">
              {activeTab === "cosmetics" ? (
                <motion.div
                  key="cosmetics"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                      <SearchIcon className={styles.searchIcon} />
                      <input
                        type="text"
                        className={styles.searchInput}
                        placeholder={searchPlaceholder}
                        aria-label={searchPlaceholder}
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

                    {categoryOptions.length > 1 && (
                      <div className={styles.categoryGroup}>
                        <FilterScroller
                          options={categoryOptions}
                          value={selectedCategory}
                          onChange={handleCategoryChange}
                          ariaLabel={t("shop:gallery.categoriesLabel", {
                            defaultValue: "Categoría",
                          })}
                          smooth={animations}
                        />
                      </div>
                    )}
                  </div>

                  {renderCosmeticsContent()}

                  {!isLoadingCosmetics && totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onChange={setCurrentPage}
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  {renderPacksContent()}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </AnimatedSectionContent>
      </Modal.Body>

      <Modal.Footer bordered={true}>
        <div className={styles.footerContent}>
          <LockKeyholeIcon className={styles.footerLockIcon} />
          <span>
            {t("shop:footer.securePurchase", { defaultValue: "Compra segura" })}
          </span>
          {footerDisclaimer && (
            <>
              <span className={styles.footerDivider}>|</span>
              <span>{footerDisclaimer}</span>
            </>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};
