"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { WindowComponent } from "@/components/ui/WindowComponent";
import { AlinoCoinIcon } from "@/components/ui/alino-coins-icon";
import { UserAvatar } from "@/components/ui/UserAvatar/UserAvatar";
import { useShopStore } from "@/store/useShopStore";
import { useUserDataStore } from "@/store/useUserDataStore";
import {
  getShopCosmeticsCatalogAction,
  buyCosmeticAction,
} from "@/lib/api/cosmetics/actions";
import { CosmeticItem } from "@/lib/schemas/database.types";
import {
  getCosmeticTranslation,
  getCoinPackTranslation,
  getAICreditPackTranslation,
} from "@/lib/i18n/helpers";
import { customToast } from "@/lib/toasts";
import styles from "./ShopGalleryModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type ShopSectionType = "cosmetics" | "coins" | "ai_credits";

const PAGE_SIZE = 6;

const PaletteIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z" />
  </svg>
);

const SparklesIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

export const ShopGalleryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation(["shop", "common", "cosmetics"]);
  const currentUser = useUserDataStore((state) => state.user);
  const {
    coins,
    extraAICredits,
    coinPacks,
    aiCreditPacks,
    setCoins,
    fetchShopData,
    buyAICreditPack,
  } = useShopStore();

  const [activeSection, setActiveSection] = useState<ShopSectionType>("cosmetics");
  const [cosmetics, setCosmetics] = useState<CosmeticItem[]>([]);
  const [isLoadingCosmetics, setIsLoadingCosmetics] = useState(false);
  const [purchasingCosmeticId, setPurchasingCosmeticId] = useState<string | null>(null);
  const [purchasingAICreditId, setPurchasingAICreditId] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    fetchShopData(true);
  }, [isOpen, fetchShopData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!isOpen || activeSection !== "cosmetics") return;
    setIsLoadingCosmetics(true);
    getShopCosmeticsCatalogAction({
      category: selectedCategory,
      status: "unowned",
      search: debouncedSearch,
      page: currentPage,
      pageSize: PAGE_SIZE,
    })
      .then((res) => {
        if (res.data) {
          setCosmetics((res.data.cosmetics || []).filter((c) => !c.is_unlocked));
          setTotalPages(Math.max(1, res.data.total_pages));
          if (typeof res.data.user_coins === "number") {
            setCoins(res.data.user_coins);
          }
        }
      })
      .finally(() => {
        setIsLoadingCosmetics(false);
      });
  }, [
    isOpen,
    activeSection,
    selectedCategory,
    debouncedSearch,
    currentPage,
    setCoins,
  ]);

  const handleBuyCosmetic = async (item: CosmeticItem) => {
    if (coins < item.coins_price) {
      customToast.error(
        t("shop:errors.INSUFFICIENT_COINS", {
          defaultValue: t("shop:cosmetics.insufficientCoins"),
        })
      );
      return;
    }

    setPurchasingCosmeticId(item.id);
    try {
      const res = await buyCosmeticAction(item.id);
      if (res.success && typeof res.new_balance === "number") {
        setCoins(res.new_balance);
        setCosmetics((prev) => prev.filter((c) => c.id !== item.id));
        const trans = getCosmeticTranslation(item);
        customToast.success(t("shop:cosmetics.purchaseSuccess", { name: trans.name }));
      } else {
        const code = res.errorCode || res.error || "GENERIC_ERROR";
        customToast.error(
          t(`shop:errors.${code}`, {
            defaultValue: t("shop:errors.GENERIC_ERROR"),
          })
        );
      }
    } finally {
      setPurchasingCosmeticId(null);
    }
  };

  const handleBuyAICreditPack = async (packId: string, amount: number, coinsPrice: number) => {
    if (coins < coinsPrice) {
      customToast.error(
        t("shop:errors.INSUFFICIENT_COINS", {
          defaultValue: t("shop:ai_credits.insufficientCoins"),
        })
      );
      return;
    }

    setPurchasingAICreditId(packId);
    try {
      const res = await buyAICreditPack(packId);
      if (res.success) {
        customToast.success(t("shop:ai_credits.purchaseSuccess", { amount }));
      } else {
        const code = res.errorCode || res.error || "GENERIC_ERROR";
        customToast.error(
          t(`shop:errors.${code}`, {
            defaultValue: t("shop:errors.GENERIC_ERROR"),
          })
        );
      }
    } finally {
      setPurchasingAICreditId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <WindowComponent
      windowTitle={t("shop:gallery.windowTitle")}
      id="shop-gallery-window"
      crossAction={onClose}
      adaptative={{ width: "940px", maxWidth: "95vw", height: "660px" }}
    >
      <div className={styles.modalWrapper}>
        <div className={styles.contentWrapper}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarGroup}>
              <span className={styles.sidebarGroupTitle}>
                {t("shop:gallery.sectionsTitle")}
              </span>
              <button
                type="button"
                className={`${styles.sidebarBtn} ${activeSection === "cosmetics" ? styles.sidebarBtnActive : ""
                  }`}
                onClick={() => setActiveSection("cosmetics")}
              >
                <PaletteIcon size={16} />
                <span>{t("shop:gallery.sections.cosmetics")}</span>
              </button>
              <button
                type="button"
                className={`${styles.sidebarBtn} ${activeSection === "coins" ? styles.sidebarBtnActive : ""
                  }`}
                onClick={() => setActiveSection("coins")}
              >
                <AlinoCoinIcon size={16} />
                <span>{t("shop:gallery.sections.coins")}</span>
              </button>
              <button
                type="button"
                className={`${styles.sidebarBtn} ${activeSection === "ai_credits" ? styles.sidebarBtnActive : ""
                  }`}
                onClick={() => setActiveSection("ai_credits")}
              >
                <SparklesIcon size={16} />
                <span>{t("shop:gallery.sections.ai_credits")}</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeSection === "cosmetics" && (
                <motion.div
                  key="cosmetics-filters"
                  initial={{ opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <div className={styles.sidebarGroup}>
                    <span className={styles.sidebarGroupTitle}>
                      {t("shop:gallery.categoriesTitle")}
                    </span>
                    <button
                      type="button"
                      className={`${styles.sidebarBtn} ${selectedCategory === "all" ? styles.sidebarBtnActive : ""
                        }`}
                      onClick={() => {
                        setSelectedCategory("all");
                        setCurrentPage(1);
                      }}
                    >
                      <span>{t("shop:gallery.categories.all")}</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.sidebarBtn} ${selectedCategory === "frame" ? styles.sidebarBtnActive : ""
                        }`}
                      onClick={() => {
                        setSelectedCategory("frame");
                        setCurrentPage(1);
                      }}
                    >
                      <span>{t("shop:gallery.categories.frame")}</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.sidebarBtn} ${selectedCategory === "overlay" ? styles.sidebarBtnActive : ""
                        }`}
                      onClick={() => {
                        setSelectedCategory("overlay");
                        setCurrentPage(1);
                      }}
                    >
                      <span>{t("shop:gallery.categories.overlay")}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>

          <main className={styles.mainArea}>
            <div className={styles.topBar}>
              {activeSection === "cosmetics" ? (
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
                    placeholder={t("shop:gallery.searchPlaceholder")}
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
              ) : (
                <div className={styles.sectionHeaderArea}>
                  <span className={styles.sectionTitle}>
                    {activeSection === "coins"
                      ? t("shop:packs.title")
                      : t("shop:ai_credits.title")}
                  </span>
                  <span className={styles.sectionSubtitle}>
                    {activeSection === "coins"
                      ? t("shop:packs.subtitle")
                      : t("shop:ai_credits.subtitle")}
                  </span>
                </div>
              )}

              <div className={styles.topControls}>
                <div className={styles.balanceBadge} title={t("shop:gallery.balance")}>
                  <AlinoCoinIcon amount={coins} size={16} />
                  <span>{coins}</span>
                </div>
                <div className={styles.aiBalanceBadge} title={t("shop:gallery.aiCreditsBalance")}>
                  <SparklesIcon size={15} />
                  <span>{extraAICredits} {t("shop:ai_credits.creditsUnit")}</span>
                </div>
              </div>
            </div>

            <div className={styles.scrollArea}>
              {activeSection === "cosmetics" && (
                <>
                  {isLoadingCosmetics ? (
                    <div className={styles.emptyState}>
                      <span>{t("common:loading")}</span>
                    </div>
                  ) : cosmetics.length === 0 ? (
                    <div className={styles.emptyState}>
                      <span>
                        {debouncedSearch
                          ? t("shop:gallery.empty")
                          : t("shop:cosmetics.allOwned")}
                      </span>
                    </div>
                  ) : (
                    <div className={styles.grid}>
                      {cosmetics.map((item) => {
                        const trans = getCosmeticTranslation(item);
                        const isBuying = purchasingCosmeticId === item.id;

                        return (
                          <div key={item.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                              <div className={styles.cardPreviewBox}>
                                <UserAvatar
                                  avatarUrl={currentUser?.avatar_url}
                                  username={currentUser?.username}
                                  size={44}
                                  style={{ borderRadius: "11px" }}
                                  equippedFrameId={item.type === "frame" ? item.id : null}
                                  equippedOverlayId={item.type === "overlay" ? item.id : null}
                                />
                              </div>

                              <div className={styles.cardHeaderInfo}>
                                <span className={styles.cardTitle}>{trans.name}</span>
                                <div className={styles.cardBadgesRow}>
                                  <span className={styles.typeBadge}>{trans.typeLabel}</span>
                                  <span
                                    className={`${styles.rarityBadge} ${styles[`rarity_${item.rarity}`] || ""
                                      }`}
                                  >
                                    {t(`shop:gallery.rarity.${item.rarity}`, {
                                      defaultValue: item.rarity,
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <p className={styles.cardDesc}>{trans.description}</p>

                            <div className={styles.cardFooter}>
                              <div className={styles.cardPrice}>
                                <AlinoCoinIcon amount={item.coins_price} size={15} />
                                <span>{item.coins_price}</span>
                              </div>

                              <button
                                type="button"
                                className={styles.buyBtn}
                                disabled={isBuying}
                                onClick={() => handleBuyCosmetic(item)}
                              >
                                {isBuying
                                  ? t("shop:cosmetics.purchasing")
                                  : t("shop:cosmetics.buy")}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {activeSection === "coins" && (
                <div className={styles.grid}>
                  {coinPacks.map((pack) => {
                    const packTrans = getCoinPackTranslation(pack);
                    const priceFormatted = pack.resolved_price?.formatted || "";
                    return (
                      <div key={pack.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                          <div className={`${styles.packPreviewBox} ${styles.packPreviewBoxCoins}`}>
                            <AlinoCoinIcon amount={pack.coins_amount} size={30} />
                          </div>
                          <div className={styles.cardHeaderInfo}>
                            <span className={styles.cardTitle}>{packTrans.name}</span>
                            <div className={styles.cardBadgesRow}>
                              {packTrans.tag && (
                                <span className={styles.packTag}>{packTrans.tag}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className={styles.cardDesc}>
                          {pack.coins_amount} {t("shop:packs.coinsUnit")}
                        </p>

                        <div className={styles.cardFooter}>
                          <div className={styles.cardPrice}>
                            <span>{priceFormatted}</span>
                          </div>
                          <span className={styles.ownedStatus}>{t("common:comingSoon")}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeSection === "ai_credits" && (
                <div className={styles.grid}>
                  {aiCreditPacks.length === 0 ? (
                    <div className={styles.emptyState}>
                      <span>{t("shop:ai_credits.noPacks")}</span>
                    </div>
                  ) : (
                    aiCreditPacks.map((pack) => {
                      const isBuying = purchasingAICreditId === pack.id;
                      const canAfford = coins >= pack.coins_price;
                      const trans = getAICreditPackTranslation(pack);

                      return (
                        <div key={pack.id} className={styles.card}>
                          <div className={styles.cardHeader}>
                            <div className={`${styles.packPreviewBox} ${styles.packPreviewBoxAI}`}>
                              <SparklesIcon size={26} />
                            </div>
                            <div className={styles.cardHeaderInfo}>
                              <span className={styles.cardTitle}>{trans.name}</span>
                              <div className={styles.cardBadgesRow}>
                                {trans.tag && (
                                  <span className={styles.packTag}>{trans.tag}</span>
                                )}
                                {/* <span className={styles.permanentTag}>
                                  {t("shop:ai_credits.extraBadge")}
                                </span> */}
                              </div>
                            </div>
                          </div>

                          <p className={styles.cardDesc}>
                            +{pack.credits_amount} {t("shop:ai_credits.creditsUnit")}
                          </p>

                          <div className={styles.cardFooter}>
                            <div className={styles.cardPrice}>
                              <AlinoCoinIcon amount={pack.coins_price} size={15} />
                              <span>{pack.coins_price}</span>
                            </div>

                            <button
                              type="button"
                              className={styles.buyBtn}
                              disabled={isBuying || !canAfford}
                              onClick={() =>
                                handleBuyAICreditPack(pack.id, pack.credits_amount, pack.coins_price)
                              }
                            >
                              {isBuying
                                ? t("shop:ai_credits.purchasing")
                                : !canAfford
                                  ? t("shop:cosmetics.notEnoughCoins")
                                  : t("shop:ai_credits.buy")}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {activeSection === "cosmetics" && totalPages > 1 && (
              <footer className={styles.paginationBar}>
                <span className={styles.pageInfo}>
                  {t("shop:gallery.pagination.page", {
                    current: currentPage,
                    total: totalPages,
                  })}
                </span>
                <div className={styles.pageButtons}>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1 || isLoadingCosmetics}
                  >
                    {t("shop:gallery.pagination.prev")}
                  </button>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages || isLoadingCosmetics}
                  >
                    {t("shop:gallery.pagination.next")}
                  </button>
                </div>
              </footer>
            )}
          </main>
        </div>
      </div>
    </WindowComponent>
  );
};
