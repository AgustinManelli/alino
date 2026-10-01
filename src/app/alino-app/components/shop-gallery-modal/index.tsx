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
type CategoryType = "all" | "frame" | "overlay";

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
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
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

  const handleCategoryChange = (cat: CategoryType) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const rarityClass = (rarity: string): string => {
    const map: Record<string, string> = {
      common: styles.rarity_common,
      rare: styles.rarity_rare,
      epic: styles.rarity_epic,
      legendary: styles.rarity_legendary,
    };
    return map[rarity] ?? styles.rarity_common;
  };

  const getCosmeticActionLabel = (item: CosmeticItem, isBuying: boolean) => {
    if (item.is_unlocked) {
      return t("shop:cosmetics.owned", { defaultValue: "En inventario" });
    }
    if (isBuying) {
      return t("shop:cosmetics.purchasing", { defaultValue: "Comprando..." });
    }
    return t("shop:cosmetics.buy", { defaultValue: "Comprar" });
  };

  const getCosmeticMobileActionLabel = (
    item: CosmeticItem,
    isBuying: boolean,
  ) => {
    if (item.is_unlocked) {
      return t("shop:cosmetics.owned", { defaultValue: "En inventario" });
    }
    if (isBuying) {
      return t("shop:cosmetics.purchasing", { defaultValue: "Comprando..." });
    }
    return t("shop:cosmetics.buy", { defaultValue: "Comprar" });
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
          role={isBannerClickable ? "button" : undefined}
          tabIndex={isBannerClickable ? 0 : undefined}
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
                alt="Banner promocional"
                width={180}
                height={95}
                className={styles.bannerImage}
              />
            </div>
          )}
        </section>

        <section className={styles.tabsContainer}>
          <nav className={styles.tabsBar}>
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
                  <div className={styles.cosmeticsContainer}>
                    <div className={styles.cosmeticsToolbar}>
                      <div className={styles.categoryFilters}>
                        {(["all", "frame", "overlay"] as CategoryType[]).map(
                          (cat) => (
                            <button
                              key={cat}
                              type="button"
                              className={`${styles.categoryFilterBtn} ${
                                selectedCategory === cat
                                  ? styles.categoryFilterBtnActive
                                  : ""
                              }`}
                              onClick={() => handleCategoryChange(cat)}
                            >
                              {t(`shop:gallery.categories.${cat}`, {
                                defaultValue:
                                  cat === "all"
                                    ? "Todos"
                                    : cat === "frame"
                                      ? "Marcos"
                                      : "Accesorios",
                              })}
                            </button>
                          ),
                        )}
                      </div>

                      <div className={styles.searchBox}>
                        <SearchIcon className={styles.searchIcon} />
                        <input
                          type="text"
                          className={styles.searchInput}
                          placeholder={t("shop:gallery.searchPlaceholder", {
                            defaultValue: "Buscar por nombre o descripción...",
                          })}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            className={styles.searchClearBtn}
                            onClick={() => setSearchQuery("")}
                            aria-label="Limpiar búsqueda"
                          >
                            <Cross style={{ width: 11, height: 11 }} />
                          </button>
                        )}
                      </div>
                    </div>

                    {isLoadingCosmetics ? (
                      <div className={styles.loadingState}>
                        <AlinoLogoLoader
                          width={100}
                          className={styles.loadingSpinner}
                        />
                      </div>
                    ) : cosmeticsError ? (
                      <div className={styles.cosmeticsEmptyState}>
                        <p className={styles.cosmeticsEmptyText}>
                          {cosmeticsError}
                        </p>
                      </div>
                    ) : cosmetics.length === 0 ? (
                      <div className={styles.cosmeticsEmptyState}>
                        <div className={styles.cosmeticsEmptyIconWrap}>
                          <Shirt01Icon
                            style={{
                              width: 24,
                              height: 24,
                              stroke: "currentColor",
                              strokeWidth: 1.5,
                            }}
                          />
                        </div>
                        <p className={styles.cosmeticsEmptyText}>
                          {t("shop:gallery.empty", {
                            defaultValue:
                              "No se encontraron cosméticos con los filtros actuales.",
                          })}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className={styles.cardsGridDesktop}>
                          {cosmetics.map((item) => {
                            const trans = getCosmeticTranslation(item);
                            const isBuying = purchasingCosmeticId === item.id;
                            const isOwned = item.is_unlocked === true;
                            const canAfford = coins >= item.coins_price;

                            return (
                              <div key={item.id} className={styles.cardDesktop}>
                                <div className={styles.cardDesktopHeader}>
                                  <span className={styles.tierLabel}>
                                    {trans.name}
                                  </span>
                                  <span
                                    className={`${styles.badgeValue} ${rarityClass(
                                      item.rarity,
                                    )}`}
                                  >
                                    {t(`shop:gallery.rarity.${item.rarity}`, {
                                      defaultValue: item.rarity,
                                    })}
                                  </span>
                                </div>

                                <div className={styles.cardDesktopCenter}>
                                  <div className={styles.cosmeticAvatarPreview}>
                                    <UserAvatar
                                      avatarUrl={currentUser?.avatar_url}
                                      username={currentUser?.username}
                                      size={56}
                                      animate="hover"
                                      equippedFrameId={
                                        item.type === "frame" ? item.code : null
                                      }
                                      equippedOverlayId={
                                        item.type === "overlay"
                                          ? item.code
                                          : null
                                      }
                                    />
                                  </div>
                                  <p className={styles.cosmeticDescription}>
                                    {trans.description}
                                  </p>
                                </div>

                                <div className={styles.cardDesktopFooter}>
                                  <div className={styles.cardPrice}>
                                    <AlinoCoinIcon
                                      amount={item.coins_price}
                                      size={18}
                                    />
                                    <span>{item.coins_price}</span>
                                  </div>

                                  <button
                                    type="button"
                                    disabled={isOwned || isBuying || !canAfford}
                                    className={styles.chooseButton}
                                    onClick={() => handleBuyCosmetic(item)}
                                  >
                                    <span>
                                      {getCosmeticActionLabel(item, isBuying)}
                                    </span>
                                    {!isOwned && (
                                      <ArrowLeft
                                        className={styles.arrowRightIcon}
                                      />
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className={styles.cardsStackMobile}>
                          {cosmetics.map((item) => {
                            const trans = getCosmeticTranslation(item);
                            const isBuying = purchasingCosmeticId === item.id;
                            const isOwned = item.is_unlocked === true;
                            const canAfford = coins >= item.coins_price;

                            return (
                              <div key={item.id} className={styles.cardMobile}>
                                <div className={styles.cardMobileLeft}>
                                  <div
                                    className={
                                      styles.cosmeticAvatarPreviewSmall
                                    }
                                  >
                                    <UserAvatar
                                      avatarUrl={currentUser?.avatar_url}
                                      username={currentUser?.username}
                                      size={36}
                                      animate="hover"
                                      equippedFrameId={
                                        item.type === "frame" ? item.code : null
                                      }
                                      equippedOverlayId={
                                        item.type === "overlay"
                                          ? item.code
                                          : null
                                      }
                                    />
                                  </div>
                                </div>

                                <div className={styles.cardMobileCenter}>
                                  <div className={styles.cardMobileTierRow}>
                                    <span className={styles.tierLabel}>
                                      {trans.name}
                                    </span>
                                    <span
                                      className={`${styles.badgeValue} ${rarityClass(
                                        item.rarity,
                                      )}`}
                                    >
                                      {t(`shop:gallery.rarity.${item.rarity}`, {
                                        defaultValue: item.rarity,
                                      })}
                                    </span>
                                  </div>
                                  <p className={styles.cosmeticMobileDesc}>
                                    {trans.description}
                                  </p>
                                </div>

                                <div className={styles.cardMobileRight}>
                                  <div className={styles.cardPrice}>
                                    <AlinoCoinIcon
                                      amount={item.coins_price}
                                      size={15}
                                    />
                                    <span>{item.coins_price}</span>
                                  </div>

                                  <button
                                    type="button"
                                    disabled={isOwned || isBuying || !canAfford}
                                    className={styles.cardMobileChooseBtn}
                                    onClick={() => handleBuyCosmetic(item)}
                                  >
                                    <span>
                                      {getCosmeticMobileActionLabel(
                                        item,
                                        isBuying,
                                      )}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {!isLoadingCosmetics && totalPages > 1 && (
                      <div className={styles.cosmeticsPagination}>
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
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
                          >
                            <ArrowLeft style={{ width: 14, height: 14 }} />
                            <span>
                              {t("shop:gallery.pagination.prev", {
                                defaultValue: "Anterior",
                              })}
                            </span>
                          </button>
                          <button
                            type="button"
                            className={styles.paginationBtn}
                            disabled={currentPage >= totalPages}
                            onClick={() =>
                              setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                          >
                            <span>
                              {t("shop:gallery.pagination.next", {
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
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className={styles.cardsGridDesktop}>
                    {isLoading ? (
                      <div className={styles.loadingStateDesktop}>
                        <AlinoLogoLoader
                          width={100}
                          className={styles.loadingSpinner}
                        />
                      </div>
                    ) : shopError && currentPacks.length === 0 ? (
                      <div className={styles.emptyState}>
                        <p className={styles.emptyText}>{shopError}</p>
                      </div>
                    ) : currentPacks.length === 0 ? (
                      <div className={styles.emptyState}>
                        <p className={styles.emptyText}>
                          {t("shop:ai_credits.noPacks", {
                            defaultValue:
                              "No hay paquetes disponibles en este momento.",
                          })}
                        </p>
                      </div>
                    ) : (
                      currentPacks.map((pack) => {
                        const isBuying = purchasingId === pack.id;

                        return (
                          <div
                            key={pack.id}
                            className={`${styles.cardDesktop} ${
                              pack.isPopular ? styles.cardDesktopPopular : ""
                            }`}
                          >
                            <div className={styles.cardDesktopHeader}>
                              <span className={styles.tierLabel}>
                                {pack.name}
                              </span>
                              {pack.tag && (
                                <span
                                  className={
                                    pack.isPopular
                                      ? styles.badgePopular
                                      : styles.badgeValue
                                  }
                                >
                                  {pack.tag}
                                </span>
                              )}
                            </div>

                            <div className={styles.cardDesktopCenter}>
                              <div className={styles.iconWrapper}>
                                {activeTab === "coins" ? (
                                  <AlinoCoinIcon
                                    amount={pack.amount}
                                    size={64}
                                    animated={false}
                                  />
                                ) : (
                                  <div
                                    className={styles.aiTokenVisual}
                                    style={{
                                      position: "static",
                                      width: 62,
                                      height: 62,
                                    }}
                                  >
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

                              <span className={styles.amountNumber}>
                                {pack.amount}
                              </span>
                              <span className={styles.unitLabel}>
                                {activeTab === "coins"
                                  ? t("shop:cards.coinsUnit", {
                                      defaultValue: "monedas",
                                    })
                                  : t("shop:cards.tokensUnit", {
                                      defaultValue: "tokens IA",
                                    })}
                              </span>

                              {pack.bonusAmount && (
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
                              )}
                            </div>

                            <div className={styles.cardDesktopFooter}>
                              <div className={styles.cardPrice}>
                                {activeTab === "coins" ? (
                                  pack.priceFormatted
                                ) : (
                                  <>
                                    <AlinoCoinIcon
                                      amount={pack.coinsPrice ?? 0}
                                      size={18}
                                    />
                                    <span>{pack.coinsPrice}</span>
                                  </>
                                )}
                              </div>

                              <button
                                type="button"
                                disabled={isBuying || !pack.isAvailable}
                                className={`${styles.chooseButton} ${
                                  pack.isPopular
                                    ? styles.chooseButtonPopular
                                    : ""
                                }`}
                                onClick={() =>
                                  activeTab === "coins"
                                    ? handleSelectCoinPack(pack)
                                    : handleSelectAIPack(pack)
                                }
                              >
                                <span>
                                  {isBuying
                                    ? t("common:loading", {
                                        defaultValue: "Cargando...",
                                      })
                                    : !pack.isAvailable
                                      ? t("common:comingSoon", {
                                          defaultValue: "Próximamente",
                                        })
                                      : t("shop:cards.selectPack", {
                                          defaultValue: "Elegir pack",
                                        })}
                                </span>
                                <ArrowLeft className={styles.arrowRightIcon} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className={styles.cardsStackMobile}>
                    {isLoading ? (
                      <div className={styles.loadingState}>
                        <AlinoLogoLoader
                          width={100}
                          className={styles.loadingSpinner}
                        />
                      </div>
                    ) : shopError && currentPacks.length === 0 ? (
                      <div className={styles.emptyState}>
                        <p className={styles.emptyText}>{shopError}</p>
                      </div>
                    ) : currentPacks.length === 0 ? (
                      <div className={styles.emptyState}>
                        <p className={styles.emptyText}>
                          {t("shop:ai_credits.noPacks", {
                            defaultValue:
                              "No hay paquetes disponibles en este momento.",
                          })}
                        </p>
                      </div>
                    ) : (
                      currentPacks.map((pack) => {
                        const isBuying = purchasingId === pack.id;

                        return (
                          <div
                            key={pack.id}
                            className={`${styles.cardMobile} ${
                              pack.isPopular ? styles.cardMobilePopular : ""
                            }`}
                          >
                            <div className={styles.cardMobileLeft}>
                              {activeTab === "coins" ? (
                                <AlinoCoinIcon
                                  amount={pack.amount}
                                  size={50}
                                  animated={false}
                                />
                              ) : (
                                <div
                                  className={styles.aiTokenVisual}
                                  style={{
                                    position: "static",
                                    width: 48,
                                    height: 48,
                                  }}
                                >
                                  <IAStars
                                    style={{
                                      width: 22,
                                      height: 22,
                                      stroke: "rgb(106, 195, 255)",
                                      strokeWidth: 2,
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            <div className={styles.cardMobileCenter}>
                              <div className={styles.cardMobileTierRow}>
                                <span className={styles.tierLabel}>
                                  {pack.name}
                                </span>
                                {pack.tag && (
                                  <span
                                    className={
                                      pack.isPopular
                                        ? styles.badgePopular
                                        : styles.badgeValue
                                    }
                                  >
                                    {pack.tag}
                                  </span>
                                )}
                              </div>

                              <span className={styles.amountNumber}>
                                {pack.amount}
                              </span>
                              <span className={styles.unitLabel}>
                                {activeTab === "coins"
                                  ? t("shop:cards.coinsUnit", {
                                      defaultValue: "monedas",
                                    })
                                  : t("shop:cards.tokensUnit", {
                                      defaultValue: "tokens IA",
                                    })}
                              </span>

                              {pack.bonusAmount && (
                                <div className={styles.bonusTag}>
                                  <IAStars
                                    style={{
                                      width: 11,
                                      height: 11,
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
                              )}
                            </div>

                            <div className={styles.cardMobileRight}>
                              <div className={styles.cardPrice}>
                                {activeTab === "coins" ? (
                                  pack.priceFormatted
                                ) : (
                                  <>
                                    <AlinoCoinIcon
                                      amount={pack.coinsPrice ?? 0}
                                      size={15}
                                    />
                                    <span>{pack.coinsPrice}</span>
                                  </>
                                )}
                              </div>

                              <button
                                type="button"
                                disabled={isBuying || !pack.isAvailable}
                                className={`${styles.cardMobileChooseBtn} ${
                                  pack.isPopular
                                    ? styles.cardMobileChooseBtnPopular
                                    : ""
                                }`}
                                onClick={() =>
                                  activeTab === "coins"
                                    ? handleSelectCoinPack(pack)
                                    : handleSelectAIPack(pack)
                                }
                              >
                                <span>
                                  {isBuying
                                    ? t("common:loading", {
                                        defaultValue: "...",
                                      })
                                    : !pack.isAvailable
                                      ? t("common:comingSoon", {
                                          defaultValue: "Próximamente",
                                        })
                                      : t("shop:cards.selectPack", {
                                          defaultValue: "Elegir pack",
                                        })}
                                </span>
                                <ArrowLeft className={styles.arrowRightIcon} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
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
          <span className={styles.footerDivider}>|</span>
          <span>
            {t("shop:footer.disclaimer", {
              defaultValue: "",
            })}
          </span>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
