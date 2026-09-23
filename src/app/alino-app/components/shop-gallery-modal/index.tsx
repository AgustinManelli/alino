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
import { PaintBoard, IAStars } from "@/components/ui/icons/icons";
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
    markCosmeticUnlocked,
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
        markCosmeticUnlocked(item.id);
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
      sidebar={
        <WindowComponent.Sidebar>
          <WindowComponent.SidebarItem
            label={t("shop:gallery.sections.cosmetics")}
            icon={
              <PaintBoard
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "currentColor",
                  strokeWidth: "2",
                }}
              />
            }
            active={activeSection === "cosmetics"}
            onClick={() => setActiveSection("cosmetics")}
          />
          <WindowComponent.SidebarItem
            label={t("shop:gallery.sections.coins")}
            icon={<AlinoCoinIcon size={16} />}
            active={activeSection === "coins"}
            onClick={() => setActiveSection("coins")}
          />
          <WindowComponent.SidebarItem
            label={t("shop:gallery.sections.ai_credits")}
            icon={
              <IAStars
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "currentColor",
                  strokeWidth: "1.8",
                }}
              />
            }
            active={activeSection === "ai_credits"}
            onClick={() => setActiveSection("ai_credits")}
          />
        </WindowComponent.Sidebar>
      }
    >
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
                  <IAStars style={{ width: 14, height: 14, stroke: "currentColor", strokeWidth: 1.8 }} />
                  <span>{extraAICredits} {t("shop:ai_credits.creditsUnit")}</span>
                </div>
              </div>
            </div>

            {activeSection === "cosmetics" && (
              <div className={styles.categoryFilterRow}>
                <button
                  type="button"
                  className={`${styles.categoryBtn} ${
                    selectedCategory === "all" ? styles.categoryBtnActive : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory("all");
                    setCurrentPage(1);
                  }}
                >
                  {t("shop:gallery.categories.all")}
                </button>
                <button
                  type="button"
                  className={`${styles.categoryBtn} ${
                    selectedCategory === "frame" ? styles.categoryBtnActive : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory("frame");
                    setCurrentPage(1);
                  }}
                >
                  {t("shop:gallery.categories.frame")}
                </button>
                <button
                  type="button"
                  className={`${styles.categoryBtn} ${
                    selectedCategory === "overlay" ? styles.categoryBtnActive : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory("overlay");
                    setCurrentPage(1);
                  }}
                >
                  {t("shop:gallery.categories.overlay")}
                </button>
              </div>
            )}

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
                              <IAStars style={{ width: 24, height: 24, stroke: "currentColor", strokeWidth: 1.8 }} />
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
    </WindowComponent>
  );
};
