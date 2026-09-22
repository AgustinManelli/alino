"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useShopStore } from "@/store/useShopStore";
import { useUserDataStore } from "@/store/useUserDataStore";
import { ModalBox } from "@/components/ui/modal-options-box";
import { AlinoCoinIcon } from "@/components/ui/alino-coins-icon";
import { UserAvatar } from "@/components/ui/UserAvatar/UserAvatar";
import {
  buyCosmeticAction,
} from "@/lib/api/cosmetics/actions";
import { CosmeticItem } from "@/lib/schemas/database.types";
import { getCosmeticTranslation, getCoinPackTranslation } from "@/lib/i18n/helpers";
import { ShopGalleryModal } from "@/app/alino-app/components/shop-gallery-modal";
import { customToast } from "@/lib/toasts";
import styles from "./ShopSection.module.css";
import { CounterAnimation } from "@/components/ui/CounterAnimation";

export const ShopSection = () => {
  const { t } = useTranslation(["shop", "common"]);
  const [isOpen, setIsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isPurchasingCosmeticId, setIsPurchasingCosmeticId] = useState<string | null>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const currentUser = useUserDataStore((state) => state.user);
  const {
    coins,
    coinPacks,
    cosmetics,
    isLoading,
    isRedeeming,
    fetchShopData,
    redeemPromoCode,
    markCosmeticUnlocked,
    setCoins,
  } = useShopStore();

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        fetchShopData(true);
      }
      return next;
    });
  };

  const handleClose = () => setIsOpen(false);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoCode.trim();
    if (!cleanCode) {
      customToast.error(
        t("shop:errors.CODE_REQUIRED", {
          defaultValue: t("shop:promo.emptyError"),
        })
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
        })
      );
    }
  };

  const handleBuyCosmetic = async (item: CosmeticItem) => {
    if (coins < item.coins_price) {
      customToast.error(
        t("shop:errors.INSUFFICIENT_COINS", {
          defaultValue: t("shop:cosmetics.insufficientCoins"),
        })
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
      setIsPurchasingCosmeticId(null);
    }
  };

  const previewCosmetics = useMemo(() => {
    return cosmetics
      .filter((item) => !item.is_unlocked)
      .sort((a, b) => b.sort_order - a.sort_order)
      .slice(0, 4);
  }, [cosmetics]);

  return (
    <div className={styles.container}>
      <div
        ref={iconRef}
        onClick={handleToggle}
        className={styles.triggerBtn}
        aria-label="Abrir Tienda"
        role="button"
        tabIndex={0}
      >
        <AlinoCoinIcon size={20} />
        <CounterAnimation
          value={coins}
          className={styles.coinsCount}
        />
      </div>

      {isOpen && (
        <ModalBox
          onClose={handleClose}
          iconRef={iconRef}
          headerSlot={
            <div className={styles.headerSlot}>
              <span className={styles.title}>{t("shop:title")}</span>
              <div className={styles.balanceBadge}>
                <AlinoCoinIcon amount={coins} size={22} />
                <span>{coins}</span>
              </div>
            </div>
          }
        >
          <div className={styles.panel}>
            <section className={styles.packsSection}>
              {/* <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>{t("shop:packs.title")}</span>
              </div> */}

              <div className={styles.packsList}>
                {coinPacks.map((pack) => {
                  const packTrans = getCoinPackTranslation(pack);
                  const priceFormatted = pack.resolved_price?.formatted || "";
                  return (
                    <div key={pack.id} className={styles.packCard}>
                      <div className={styles.packLeft}>
                        <AlinoCoinIcon amount={pack.coins_amount} size={22} />
                        <div className={styles.packInfo}>
                          <div className={styles.packNameRow}>
                            <span className={styles.packName}>{packTrans.name}</span>
                            {packTrans.tag && (
                              <span className={styles.packTag}>{packTrans.tag}</span>
                            )}
                          </div>
                          <span className={styles.packCoins}>
                            {pack.coins_amount} {t("shop:packs.coinsUnit")}
                          </span>
                        </div>
                      </div>

                      <div className={styles.packRight}>
                        <span className={styles.packPrice}>
                          {priceFormatted}
                        </span>
                        <span className={styles.soonBadge}>{t("common:comingSoon")}</span>
                      </div>
                    </div>
                  );
                })}

                {coinPacks.length === 0 && !isLoading && (
                  <div className={styles.packCard}>
                    <div className={styles.packLeft}>
                      <AlinoCoinIcon amount={100} size={22} />
                      <div className={styles.packInfo}>
                        <span className={styles.packName}>{t("shop:packs.defaultPackName")}</span>
                        <span className={styles.packCoins}>100 {t("shop:packs.coinsUnit")}</span>
                      </div>
                    </div>
                    <div className={styles.packRight}>
                      <span className={styles.packPrice}>
                        $1.99
                      </span>
                      <span className={styles.soonBadge}>{t("common:comingSoon")}</span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className={styles.promoSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>{t("shop:promo.title")}</span>
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
                  {isRedeeming ? t("shop:promo.redeeming") : t("shop:promo.button")}
                </button>
              </form>
            </section>

            <section className={styles.cosmeticsShopSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>{t("shop:cosmetics.title")}</span>
              </div>

              <div className={styles.cosmeticsShopList}>
                {previewCosmetics.length > 0 ? (
                  previewCosmetics.map((item) => {
                    const cosmeticTrans = getCosmeticTranslation(item);
                    return (
                      <div key={item.id} className={styles.cosmeticShopCard}>
                        <div className={styles.cosmeticShopLeft}>
                          <div className={styles.cosmeticShopPreviewWrap}>
                            <UserAvatar
                              avatarUrl={currentUser?.avatar_url}
                              username={currentUser?.username}
                              size={40}
                              style={{ borderRadius: "11px" }}
                              equippedFrameId={item.type === "frame" ? item.id : null}
                              equippedOverlayId={item.type === "overlay" ? item.id : null}
                            />
                          </div>
                          <div className={styles.cosmeticShopInfo}>
                            <div className={styles.cosmeticShopNameRow}>
                              <span className={styles.cosmeticShopName}>{cosmeticTrans.name}</span>
                              {/* <span className={styles.cosmeticTypeBadge}>
                                {cosmeticTrans.typeLabel}
                              </span> */}
                            </div>
                            <p className={styles.cosmeticShopDesc}>{cosmeticTrans.description}</p>
                          </div>
                        </div>

                        <div className={styles.cosmeticShopRight}>
                          <div className={styles.cosmeticShopPrice}>
                            <AlinoCoinIcon amount={item.coins_price} size={14} />
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

      <ShopGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />
    </div>
  );
};
