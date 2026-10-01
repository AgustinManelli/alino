"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useShopStore } from "@/store/useShopStore";
import { useUserDataStore } from "@/store/useUserDataStore";
import { ModalBox } from "@/components/ui/modal-options-box";
import { AlinoCoinIcon } from "@/components/ui/alino-coins-icon";
import { UserAvatar } from "@/components/ui/UserAvatar/UserAvatar";
import dynamic from "next/dynamic";
import { buyCosmeticAction } from "@/lib/api/cosmetics/actions";
import { CosmeticItem } from "@/lib/schemas/database.types";
import {
  getCosmeticTranslation,
  getCoinPackTranslation,
} from "@/lib/i18n/helpers";
import { customToast } from "@/lib/toasts";
import styles from "./ShopSection.module.css";
import { CounterAnimation } from "@/components/ui/CounterAnimation";
import { Skeleton } from "@/components/ui/skeleton";

const ShopGalleryModal = dynamic(
  () =>
    import("@/app/alino-app/components/shop-gallery-modal").then(
      (m) => m.ShopGalleryModal,
    ),
  { ssr: false },
);

export const ShopSection = () => {
  const { t } = useTranslation(["shop", "common"]);
  const [isOpen, setIsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isPurchasingCosmeticId, setIsPurchasingCosmeticId] = useState<
    string | null
  >(null);
  const [hasRequestedShopData, setHasRequestedShopData] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  const currentUser = useUserDataStore((state) => state.user);
  const {
    coins: storeCoins,
    coinPacks,
    cosmetics,
    isLoading,
    error: shopError,
    isRedeeming,
    fetchShopData,
    redeemPromoCode,
    markCosmeticUnlocked,
    setCoins,
  } = useShopStore();

  const userCoins = currentUser?.alino_coins ?? 0;
  const coins = isLoading && storeCoins === 0 ? userCoins : storeCoins;
  const isShopContentLoading =
    isLoading ||
    (!hasRequestedShopData && coinPacks.length === 0 && cosmetics.length === 0);

  useEffect(() => {
    const rawUserCoins = currentUser?.alino_coins;
    if (
      typeof rawUserCoins === "number" &&
      useShopStore.getState().coins === 0
    ) {
      setCoins(rawUserCoins);
    }
  }, [currentUser?.alino_coins, setCoins]);

  useEffect(() => {
    if (isOpen) {
      setHasRequestedShopData(true);
      fetchShopData(false, { includeCosmetics: true });
    }
  }, [isOpen, fetchShopData]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => setIsOpen(false);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoCode.trim();
    if (!cleanCode) {
      customToast.error(
        t("shop:errors.CODE_REQUIRED", {
          defaultValue: t("shop:promo.emptyError"),
        }),
      );
      return;
    }

    const res = await redeemPromoCode(cleanCode);
    if (res.success) {
      customToast.success(res.message || t("shop:promo.success"));
      setPromoCode("");
    } else {
      const code = res.errorCode || res.error || "GENERIC_ERROR";
      customToast.error(
        t(`shop:errors.${code}`, {
          defaultValue: t("shop:errors.GENERIC_ERROR"),
        }),
      );
    }
  };

  const handleBuyCosmetic = async (item: CosmeticItem) => {
    if (coins < item.coins_price) {
      customToast.error(
        t("shop:errors.INSUFFICIENT_COINS", {
          defaultValue: t("shop:cosmetics.insufficientCoins"),
        }),
      );
      return;
    }

    setIsPurchasingCosmeticId(item.id);
    try {
      const res = await buyCosmeticAction(item.id);
      if (res.success && typeof res.new_balance === "number") {
        setCoins(res.new_balance);
        markCosmeticUnlocked(item.id);
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
      setIsPurchasingCosmeticId(null);
    }
  };

  const previewCosmetics = useMemo(() => {
    return cosmetics
      .filter((item) => !item.is_unlocked)
      .sort((a, b) => b.sort_order - a.sort_order)
      .slice(0, 3);
  }, [cosmetics]);

  const headerSlot = (
    <div className={styles.headerSlot}>
      <span className={styles.title}>{t("shop:title")}</span>
      <div className={styles.balanceBadge}>
        <AlinoCoinIcon amount={coins} size={14} />
        <span>{coins}</span>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div
        ref={iconRef}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
        className={styles.triggerBtn}
        aria-label={t("shop:openShop", { defaultValue: "Abrir tienda" })}
        aria-expanded={isOpen}
        aria-controls="alino-shop-compact-panel"
        role="button"
        tabIndex={0}
        style={{
          backgroundColor: isOpen
            ? "var(--background-over-container-hover)"
            : "var(--background-over-container)",
        }}
      >
        <AlinoCoinIcon size={20} />
        <CounterAnimation value={coins} className={styles.coinsCount} />
      </div>

      {isOpen && (
        <ModalBox
          onClose={handleClose}
          iconRef={iconRef}
          headerSlot={headerSlot}
        >
          <div
            className={styles.panel}
            id="alino-shop-compact-panel"
            aria-busy={isShopContentLoading}
          >
            <section className={styles.packsSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>
                  {t("shop:packs.title", {
                    defaultValue: "Paquetes de monedas",
                  })}
                </span>
              </div>

              <div className={styles.packsList}>
                {isShopContentLoading ? (
                  <>
                    {[0, 1].map((index) => (
                      <div
                        key={`pack-skeleton-${index}`}
                        className={styles.packCard}
                        aria-hidden="true"
                      >
                        <div className={styles.packLeft}>
                          <Skeleton
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "9px",
                            }}
                            delay={index * 0.12}
                          />
                          <div className={styles.packInfo}>
                            <Skeleton
                              style={{
                                width: index === 0 ? "124px" : "98px",
                                height: "12px",
                                borderRadius: "5px",
                              }}
                              delay={index * 0.12}
                            />
                            <Skeleton
                              style={{
                                width: "76px",
                                height: "10px",
                                borderRadius: "5px",
                              }}
                              delay={index * 0.12}
                            />
                          </div>
                        </div>
                        <div className={styles.packRight}>
                          <Skeleton
                            style={{
                              width: "54px",
                              height: "18px",
                              borderRadius: "6px",
                            }}
                            delay={index * 0.12}
                          />
                          <Skeleton
                            style={{
                              width: "64px",
                              height: "9px",
                              borderRadius: "5px",
                            }}
                            delay={index * 0.12}
                          />
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  coinPacks.map((pack) => {
                    const packTrans = getCoinPackTranslation(pack);
                    const priceFormatted = pack.resolved_price?.formatted || "";
                    return (
                      <div key={pack.id} className={styles.packCard}>
                        <div className={styles.packLeft}>
                          <div className={styles.packIconWrap}>
                            <AlinoCoinIcon
                              amount={pack.coins_amount}
                              size={20}
                            />
                          </div>
                          <div className={styles.packInfo}>
                            <div className={styles.packNameRow}>
                              <span className={styles.packName}>
                                {packTrans.name}
                              </span>
                              {packTrans.tag && (
                                <span className={styles.packTag}>
                                  {packTrans.tag}
                                </span>
                              )}
                            </div>
                            <span className={styles.packCoins}>
                              {pack.coins_amount} {t("shop:packs.coinsUnit")}
                            </span>
                          </div>
                        </div>

                        <div className={styles.packRight}>
                          <div className={styles.packPriceChip}>
                            <span>{priceFormatted}</span>
                          </div>
                          <span className={styles.soonBadge}>
                            {t("common:comingSoon")}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {coinPacks.length === 0 && !isShopContentLoading && (
                  <div className={styles.emptyCosmetics}>
                    {shopError ||
                      t("shop:packs.empty", {
                        defaultValue: "No hay paquetes disponibles.",
                      })}
                  </div>
                )}
              </div>
            </section>

            <section className={styles.promoSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>
                  {t("shop:promo.title")}
                </span>
              </div>
              <form onSubmit={handleRedeem} className={styles.promoForm}>
                <div className={styles.promoInputWrapper}>
                  <input
                    type="text"
                    placeholder={t("shop:promo.placeholder")}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className={styles.promoInput}
                    disabled={isRedeeming}
                  />
                </div>
                <button
                  type="submit"
                  className={styles.redeemBtn}
                  disabled={isRedeeming || !promoCode.trim()}
                >
                  {isRedeeming
                    ? t("shop:promo.redeeming")
                    : t("shop:promo.button")}
                </button>
              </form>
            </section>

            <section className={styles.cosmeticsSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>
                  {t("shop:cosmetics.title")}
                </span>
              </div>

              <div className={styles.cosmeticsList}>
                {isShopContentLoading ? (
                  [0, 1, 2].map((index) => (
                    <div
                      key={`cosmetic-skeleton-${index}`}
                      className={styles.cosmeticCard}
                      aria-hidden="true"
                    >
                      <div className={styles.cosmeticLeft}>
                        <Skeleton
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "10px",
                          }}
                          delay={index * 0.12}
                        />
                        <div className={styles.cosmeticInfo}>
                          <Skeleton
                            style={{
                              width: index === 0 ? "128px" : "96px",
                              height: "12px",
                              borderRadius: "5px",
                            }}
                            delay={index * 0.12}
                          />
                          <Skeleton
                            style={{
                              width: "156px",
                              height: "10px",
                              borderRadius: "5px",
                            }}
                            delay={index * 0.12}
                          />
                        </div>
                      </div>
                      <div className={styles.cosmeticRight}>
                        <Skeleton
                          style={{
                            width: "48px",
                            height: "18px",
                            borderRadius: "6px",
                          }}
                          delay={index * 0.12}
                        />
                        <Skeleton
                          style={{
                            width: "58px",
                            height: "26px",
                            borderRadius: "8px",
                          }}
                          delay={index * 0.12}
                        />
                      </div>
                    </div>
                  ))
                ) : previewCosmetics.length > 0 ? (
                  previewCosmetics.map((item) => {
                    const cosmeticTrans = getCosmeticTranslation(item);
                    return (
                      <div key={item.id} className={styles.cosmeticCard}>
                        <div className={styles.cosmeticLeft}>
                          <div className={styles.cosmeticPreviewWrap}>
                            <UserAvatar
                              avatarUrl={currentUser?.avatar_url}
                              username={currentUser?.username}
                              size={38}
                              style={{ borderRadius: "10px" }}
                              equippedFrameId={
                                item.type === "frame" ? item.id : null
                              }
                              equippedOverlayId={
                                item.type === "overlay" ? item.id : null
                              }
                            />
                          </div>
                          <div className={styles.cosmeticInfo}>
                            <span className={styles.cosmeticName}>
                              {cosmeticTrans.name}
                            </span>
                            <p className={styles.cosmeticDesc}>
                              {cosmeticTrans.description}
                            </p>
                          </div>
                        </div>

                        <div className={styles.cosmeticRight}>
                          <div className={styles.priceChip}>
                            <AlinoCoinIcon
                              amount={item.coins_price}
                              size={12}
                            />
                            <span>{item.coins_price}</span>
                          </div>

                          <button
                            type="button"
                            className={styles.cosmeticBuyBtn}
                            onClick={() => handleBuyCosmetic(item)}
                            disabled={isPurchasingCosmeticId === item.id}
                          >
                            {isPurchasingCosmeticId === item.id
                              ? t("shop:cosmetics.purchasing")
                              : t("shop:cosmetics.buy")}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : shopError ? (
                  <div className={styles.emptyCosmetics} role="alert">
                    {shopError}
                  </div>
                ) : (
                  <div className={styles.emptyCosmetics}>
                    {t("shop:cosmetics.allOwned")}
                  </div>
                )}

                <button
                  type="button"
                  className={styles.viewGalleryBtn}
                  onClick={() => {
                    setIsOpen(false);
                    setIsGalleryOpen(true);
                  }}
                >
                  <span>{t("shop:cosmetics.viewAll")}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </div>
            </section>
          </div>
        </ModalBox>
      )}

      {isGalleryOpen && (
        <ShopGalleryModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}
    </div>
  );
};
