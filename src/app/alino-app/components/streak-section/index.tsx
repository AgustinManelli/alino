"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useStreak } from "@/hooks/dashboard/useStreak";
import { useShopStore } from "@/store/useShopStore";
import { StreakPackage } from "@/lib/api/shop/actions";
import { getStreakPackageTranslation } from "@/lib/i18n/helpers";
import { ModalBox } from "@/components/ui/modal-options-box";
import { LoadingIcon, StreakProtectorIcon } from "@/components/ui/icons/icons";
import { AlinoCoinIcon } from "@/components/ui/alino-coins-icon";
import { motion } from "motion/react";
import {
  AnimatedStreakFlame,
  FlameStatus,
} from "@/components/ui/animated-streak-flame";
import { customToast } from "@/lib/toasts";
import styles from "./StreakSection.module.css";
import { CounterAnimation } from "@/components/ui/CounterAnimation";
import { WeekHistory } from "./WeekHistory";

export const StreakSection = () => {
  const { t } = useTranslation(["streak", "common"]);
  const [isOpen, setIsOpen] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const { streak, fetchStreak } = useStreak();
  const {
    coins,
    buyStreakPackage,
    isPurchasing,
  } = useShopStore();

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  const streakCount = streak?.current_streak ?? 0;
  const maxStreak = streak?.max_streak ?? 0;
  const freeUsed = streak?.free_protectors_used ?? 0;
  const freeLimit = streak?.free_protectors_limit ?? 0;
  const freeLeft = Math.max(0, freeLimit - freeUsed);
  const purchasedCount = streak?.purchased_protectors ?? 0;
  const protectorsCount = freeLeft + purchasedCount;
  const isActiveToday = streak?.is_active_today ?? false;
  const weekDays = streak?.last_7_days ?? [];
  const packages = streak?.packages ?? [];

  const status: FlameStatus = useMemo(() => {
    if (isActiveToday) {
      return "active";
    }
    if (streakCount > 0 && streak?.last_completion_date) {
      const yesterday =
        weekDays.length >= 2 ? weekDays[weekDays.length - 2] : null;
      const wasYesterdayProtected = Boolean(
        yesterday?.event_type.startsWith("protected_"),
      );

      const lastDate = new Date(streak.last_completion_date + "T12:00:00");
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const diffDays = Math.round(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (wasYesterdayProtected || (diffDays > 1 && protectorsCount > 0)) {
        return "frozen";
      }
      return "off";
    }
    return "off";
  }, [isActiveToday, streakCount, streak?.last_completion_date, weekDays, protectorsCount]);

  const now = new Date();
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  const hoursLeft = Math.max(
    0,
    (endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60),
  );
  const isEndingSoon = hoursLeft <= 4;
  const showWarning = streakCount > 0 && status === "off" && isEndingSoon;

  const statusMessage = useMemo(() => {
    if (isActiveToday) {
      return t("streak:status.completedToday");
    }
    if (status === "frozen") {
      return t("streak:status.frozen");
    }
    if (streakCount > 0) {
      return isEndingSoon
        ? t("streak:status.endingSoon", { hours: Math.ceil(hoursLeft) })
        : t("streak:status.keepStreak");
    }
    return t("streak:status.startStreak");
  }, [isActiveToday, status, streakCount, isEndingSoon, hoursLeft, t]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        fetchStreak();
      }
      return next;
    });
  };

  const handleClose = () => setIsOpen(false);

  const handleBuyPackage = async (pkg: StreakPackage) => {
    if (coins < pkg.coins_price) {
      customToast.error(
        t("streak:errors.INSUFFICIENT_COINS", {
          required: pkg.coins_price,
          balance: coins,
        }),
      );
      return;
    }
    const res = await buyStreakPackage(pkg.id);
    if (res.success) {
      customToast.success(
        t("streak:shop.purchaseSuccess", {
          count: res.protectors_added ?? pkg.protectors_count,
        }),
      );
    } else {
      const code = res.errorCode || res.error || "GENERIC_ERROR";
      customToast.error(
        t(`streak:errors.${code}`, {
          defaultValue: t("streak:errors.GENERIC_ERROR"),
        }),
      );
    }
  };


  const protectorsSubtitle = useMemo(() => {
    if (protectorsCount > 0) {
      return t("streak:protectors.subtitleCount", {
        free: freeLeft,
        freeSuffix: freeLeft !== 1 ? "s" : "",
        purchased: purchasedCount,
        purchasedSuffix: purchasedCount !== 1 ? "s" : "",
      });
    }
    return t("streak:protectors.subtitleEmpty");
  }, [protectorsCount, freeLeft, purchasedCount, t]);

  const headerSlot = (
    <div className={styles.headerSlot}>
      <span className={styles.title}>{t("streak:header.title")}</span>
      {maxStreak > 0 && (
        <span className={styles.maxStreakBadge}>
          {maxStreak === 1
            ? t("streak:header.recordOne", { count: maxStreak })
            : t("streak:header.recordOther", { count: maxStreak })}
        </span>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      <div
        className={styles.triggerBtn}
        onClick={handleToggle}
        ref={iconRef}
        aria-label={t("streak:triggerAria")}
        role="button"
        tabIndex={0}
        style={{
          backgroundColor: isOpen
            ? "var(--background-over-container-hover)"
            : "var(--background-over-container)",
        }}
      >
        <AnimatedStreakFlame
          status={status}
          size={20}
          showWarning={showWarning}
        />
        <CounterAnimation
          value={streakCount}
          className={styles.streakCount}
        />
      </div>

      {isOpen && (
        <ModalBox
          onClose={handleClose}
          iconRef={iconRef}
          headerSlot={headerSlot}
        >
          <div className={styles.panel}>
            <div className={styles.mainInfo}>
              <AnimatedStreakFlame
                status={status}
                size={96}
                showWarning={showWarning}
              />
              <div className={styles.countWrapper}>
                <span className={styles.currentStreak}>{streakCount}</span>
                <span className={styles.streakLabel}>
                  {streakCount === 1 ? t("streak:dayUnitOne") : t("streak:dayUnitOther")}
                </span>
              </div>
              <p className={styles.streakStatusMessage}>{statusMessage}</p>
            </div>

            <div className={styles.historySection}>
              <span className={styles.historyTitle}>{t("streak:history.title")}</span>
              <WeekHistory days={weekDays} isLoading={true} />
            </div>

            <div className={styles.protectorsSection}>
              <div className={styles.protectorRow}>
                <div className={styles.protectorInfo}>
                  <StreakProtectorIcon className={styles.protectorIcon} />
                  <span className={styles.protectorsTitle}>
                    {t("streak:protectors.title")}
                  </span>
                </div>
                <span className={styles.protectorCount}>
                  {protectorsCount}
                </span>
              </div>
              <span className={styles.protectorsSubtitle}>
                {protectorsSubtitle}
              </span>
            </div>

            <div className={styles.purchaseSection}>
              <div className={styles.purchaseHeader}>
                <span className={styles.purchaseTitle}>{t("streak:shop.title")}</span>
              </div>
              {packages.length === 0 ? (
                <div className={styles.packagesLoader}>
                  <LoadingIcon
                    style={{
                      width: "20px",
                      height: "20px",
                      stroke: "var(--text-not-available)",
                      strokeWidth: "2.5",
                    }}
                  />
                </div>
              ) : (
                <div className={styles.purchaseGrid}>
                  {packages.map((pkg) => {
                    const pkgTrans = getStreakPackageTranslation(pkg);
                    const protectorsCountText =
                      pkg.protectors_count === 1
                        ? t("streak:shop.protectorsCountOne", { count: pkg.protectors_count })
                        : t("streak:shop.protectorsCountOther", { count: pkg.protectors_count });
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        className={styles.packageCard}
                        onClick={() => handleBuyPackage(pkg)}
                        disabled={isPurchasing}
                        title={t("streak:shop.buyTitle", {
                          name: pkgTrans.name,
                          price: pkg.coins_price,
                        })}
                      >
                        <div className={styles.cardHeader}>
                          <StreakProtectorIcon className={styles.cardIcon} />
                          {pkgTrans.badge && (
                            <span className={styles.cardBadgeHeader}>
                              {pkgTrans.badge}
                            </span>
                          )}
                        </div>
                        <div className={styles.cardBody}>
                          <div className={styles.cardTitleRow}>
                            <span className={styles.cardTitle}>{pkgTrans.name}</span>
                            {pkgTrans.badge && (
                              <span className={styles.cardBadgeInline}>
                                {pkgTrans.badge}
                              </span>
                            )}
                          </div>
                          <span className={styles.cardSubtitle}>
                            {protectorsCountText}
                          </span>
                        </div>
                        <div className={styles.cardFooter}>
                          <div className={styles.priceChip}>
                            <AlinoCoinIcon amount={pkg.coins_price} size={13} />
                            <span>{pkg.coins_price}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ModalBox>
      )}
    </div>
  );
};
