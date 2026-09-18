"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { getCosmeticTranslation } from "@/lib/i18n/helpers";
import { toast } from "sonner";
import styles from "./ShopGalleryModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 6;

export const ShopGalleryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation(["shop", "common", "cosmetics"]);
  const currentUser = useUserDataStore((state) => state.user);
  const { coins, setCoins } = useShopStore();

  const [cosmetics, setCosmetics] = useState<CosmeticItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    getShopCosmeticsCatalogAction()
      .then((res) => {
        if (res.data) {
          setCosmetics(res.data.cosmetics);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim().toLowerCase());
      setCurrentPage(1);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredCosmetics = useMemo(() => {
    let list = [...cosmetics];

    if (selectedCategory !== "all") {
      list = list.filter((item) => item.type === selectedCategory);
    }

    if (selectedStatus === "owned") {
      list = list.filter((item) => item.is_unlocked);
    } else if (selectedStatus === "unowned") {
      list = list.filter((item) => !item.is_unlocked);
    }

    if (debouncedSearch) {
      list = list.filter((item) => {
        const trans = getCosmeticTranslation(item);
        const nameMatch = trans.name.toLowerCase().includes(debouncedSearch);
        const descMatch = trans.description.toLowerCase().includes(debouncedSearch);
        return nameMatch || descMatch;
      });
    }

    list.sort((a, b) => b.sort_order - a.sort_order);

    return list;
  }, [cosmetics, selectedCategory, selectedStatus, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredCosmetics.length / PAGE_SIZE));

  const paginatedCosmetics = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredCosmetics.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredCosmetics, currentPage]);

  const handleBuy = async (item: CosmeticItem) => {
    if (coins < item.coins_price) {
      toast.error(t("shop:cosmetics.insufficientCoins"));
      return;
    }

    setPurchasingId(item.id);
    try {
      const res = await buyCosmeticAction(item.id);
      if (res.success && typeof res.new_balance === "number") {
        setCoins(res.new_balance);
        setCosmetics((prev) =>
          prev.map((c) => (c.id === item.id ? { ...c, is_unlocked: true } : c))
        );
        const trans = getCosmeticTranslation(item);
        toast.success(t("shop:cosmetics.purchaseSuccess", { name: trans.name }));
      } else {
        toast.error(res.error || t("shop:cosmetics.purchaseError"));
      }
    } finally {
      setPurchasingId(null);
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
                {t("shop:gallery.categoriesTitle")}
              </span>
              <button
                type="button"
                className={`${styles.sidebarBtn} ${
                  selectedCategory === "all" ? styles.sidebarBtnActive : ""
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
                className={`${styles.sidebarBtn} ${
                  selectedCategory === "frame" ? styles.sidebarBtnActive : ""
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
                className={`${styles.sidebarBtn} ${
                  selectedCategory === "overlay" ? styles.sidebarBtnActive : ""
                }`}
                onClick={() => {
                  setSelectedCategory("overlay");
                  setCurrentPage(1);
                }}
              >
                <span>{t("shop:gallery.categories.overlay")}</span>
              </button>
            </div>

            <div className={styles.sidebarGroup}>
              <span className={styles.sidebarGroupTitle}>
                {t("shop:gallery.filtersTitle")}
              </span>
              <button
                type="button"
                className={`${styles.sidebarBtn} ${
                  selectedStatus === "all" ? styles.sidebarBtnActive : ""
                }`}
                onClick={() => {
                  setSelectedStatus("all");
                  setCurrentPage(1);
                }}
              >
                <span>{t("shop:gallery.status.all")}</span>
              </button>
              <button
                type="button"
                className={`${styles.sidebarBtn} ${
                  selectedStatus === "unowned" ? styles.sidebarBtnActive : ""
                }`}
                onClick={() => {
                  setSelectedStatus("unowned");
                  setCurrentPage(1);
                }}
              >
                <span>{t("shop:gallery.status.unowned")}</span>
              </button>
              <button
                type="button"
                className={`${styles.sidebarBtn} ${
                  selectedStatus === "owned" ? styles.sidebarBtnActive : ""
                }`}
                onClick={() => {
                  setSelectedStatus("owned");
                  setCurrentPage(1);
                }}
              >
                <span>{t("shop:gallery.status.owned")}</span>
              </button>
            </div>
          </aside>

          <main className={styles.mainArea}>
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

              <div className={styles.topControls}>
                <div className={styles.balanceBadge}>
                  <AlinoCoinIcon amount={coins} size={16} />
                  <span>{coins}</span>
                </div>
              </div>
            </div>

            <div className={styles.scrollArea}>
              {isLoading ? (
                <div className={styles.emptyState}>
                  <span>{t("common:loading")}</span>
                </div>
              ) : paginatedCosmetics.length === 0 ? (
                <div className={styles.emptyState}>
                  <span>{t("shop:gallery.empty")}</span>
                </div>
              ) : (
                <div className={styles.grid}>
                  {paginatedCosmetics.map((item) => {
                    const trans = getCosmeticTranslation(item);
                    const isOwned = Boolean(item.is_unlocked);
                    const isBuying = purchasingId === item.id;
                    const canAfford = coins >= item.coins_price;

                    return (
                      <div
                        key={item.id}
                        className={`${styles.card} ${isOwned ? styles.cardOwned : ""}`}
                      >
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
                                className={`${styles.rarityBadge} ${
                                  styles[`rarity_${item.rarity}`] || ""
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

                          {isOwned ? (
                            <span className={styles.ownedStatus}>
                              {t("shop:cosmetics.owned")} ✓
                            </span>
                          ) : (
                            <button
                              type="button"
                              className={styles.buyBtn}
                              disabled={isBuying || !canAfford}
                              onClick={() => handleBuy(item)}
                            >
                              {isBuying
                                ? t("shop:cosmetics.purchasing")
                                : !canAfford
                                ? t("shop:cosmetics.notEnoughCoins")
                                : t("shop:cosmetics.buy")}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {totalPages > 1 && (
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
                    disabled={currentPage <= 1 || isLoading}
                  >
                    {t("shop:gallery.pagination.prev")}
                  </button>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages || isLoading}
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
