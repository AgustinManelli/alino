"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { useStreak } from "@/hooks/dashboard/useStreak";
import { useShopStore } from "@/store/useShopStore";
import { StreakPackage } from "@/lib/api/shop/actions";
import { ModalBox } from "@/components/ui/modal-options-box";
import { FreezeDayIcon, ProtectorIcon } from "@/components/ui/icons/icons";
import { AlinoCoinIcon } from "@/components/ui/alino-coins-icon";
import { motion } from "motion/react";
import {
  AnimatedStreakFlame,
  FlameStatus,
} from "@/components/ui/animated-streak-flame";
import { toast } from "sonner";
import styles from "./StreakSection.module.css";
import {
  getDayAbbrev,
  getDayCircleClass,
  getDayCircleContent,
  getTooltip,
} from "./streakUtils";

const DEFAULT_PACKAGES: StreakPackage[] = [
  {
    id: "streak_3_days",
    code: "streak_3_days",
    name: "3 protectores",
    protectors_count: 3,
    coins_price: 50,
    format_type: "square",
    badge: null,
    is_active: true,
    sort_order: 1,
  },
  {
    id: "streak_7_days",
    code: "streak_7_days",
    name: "1 semana",
    protectors_count: 7,
    coins_price: 100,
    format_type: "wide",
    badge: "Recomendado",
    is_active: true,
    sort_order: 2,
  },
];

export const StreakSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const { streak, fetchStreak } = useStreak();
  const {
    streakPackages,
    coins,
    buyStreakPackage,
    isPurchasing,
    fetchShopData,
  } = useShopStore();

  useEffect(() => {
    fetchStreak();
    fetchShopData();
  }, [fetchStreak, fetchShopData]);

  const streakCount = streak?.current_streak ?? 0;
  const maxStreak = streak?.max_streak ?? 0;
  const freeUsed = streak?.free_protectors_used ?? 0;
  const freeLimit = streak?.free_protectors_limit ?? 0;
  const freeLeft = Math.max(0, freeLimit - freeUsed);
  const purchasedCount = streak?.purchased_protectors ?? 0;
  const protectorsCount = freeLeft + purchasedCount;
  const isActiveToday = streak?.is_active_today ?? false;
  const weekDays = streak?.last_7_days ?? [];

  const packages = useMemo(() => {
    return streakPackages.length > 0 ? streakPackages : DEFAULT_PACKAGES;
  }, [streakPackages]);

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
      return "¡Objetivo cumplido hoy! Mantuviste tu racha encendida.";
    }
    if (status === "frozen") {
      return "Racha protegida con un congelador. Completá una tarea hoy para reactivarla.";
    }
    if (streakCount > 0) {
      return isEndingSoon
        ? `¡Quedan ${Math.ceil(hoursLeft)} horas! Completá una tarea para no perder tu racha.`
        : "Completá una tarea hoy para mantener tu racha.";
    }
    return "Completá una tarea hoy para comenzar tu racha.";
  }, [isActiveToday, status, streakCount, isEndingSoon, hoursLeft]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        fetchStreak();
        fetchShopData();
      }
      return next;
    });
  };

  const handleClose = () => setIsOpen(false);

  const handleBuyPackage = async (pkg: StreakPackage) => {
    if (coins < pkg.coins_price) {
      toast.error(
        `Necesitas ${pkg.coins_price} monedas. Tu saldo es de ${coins} monedas.`,
      );
      return;
    }
    const res = await buyStreakPackage(pkg.id);
    if (res.success) {
      toast.success(res.message || "¡Protectores comprados con éxito!");
    } else {
      toast.error(res.error || "No se pudo realizar la compra.");
    }
  };

  const streakGroups = useMemo(() => {
    const groups: { start: number; end: number }[] = [];
    let current: { start: number; end: number } | null = null;

    weekDays.forEach((day, i) => {
      const isStreak =
        day.event_type === "extended" || day.event_type === "started";
      if (isStreak) {
        if (!current) {
          current = { start: i, end: i };
        } else {
          current.end = i;
        }
      } else {
        if (current) {
          groups.push(current);
          current = null;
        }
      }
    });

    if (current) {
      groups.push(current);
    }
    return groups;
  }, [weekDays]);

  const headerSlot = (
    <div className={styles.headerSlot}>
      <span className={styles.title}>Tu racha</span>
      {maxStreak > 0 && (
        <span className={styles.maxStreakBadge}>
          Récord: {maxStreak} {maxStreak === 1 ? "día" : "días"}
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
        <span className={styles.streakCount}>{streakCount}</span>
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
                  {streakCount === 1 ? "DÍA" : "DÍAS"}
                </span>
              </div>
              <p className={styles.streakStatusMessage}>{statusMessage}</p>
            </div>

            <div className={styles.historySection}>
              <span className={styles.historyTitle}>Últimos 7 días</span>
              <div className={styles.weekHistory}>
                <div className={styles.barsContainer}>
                  {streakGroups.map((g) => {
                    const startPercent = ((g.start + 0.5) / 7) * 100;
                    const endPercent = ((g.end + 0.5) / 7) * 100;
                    const left = `calc(${startPercent}% - 14px)`;
                    const width = `calc(${endPercent - startPercent}% + 28px)`;
                    return (
                      <motion.div
                        key={g.start}
                        initial={{ width: "28px" }}
                        animate={{ width }}
                        transition={{ type: "spring", stiffness: 140, damping: 18 }}
                        className={styles.animatedBar}
                        style={{ left }}
                      />
                    );
                  })}
                </div>
                {weekDays.map((day, i) => {
                  const isProtected = day.event_type.startsWith("protected_");
                  return (
                    <div
                      key={i}
                      className={styles.dayItem}
                      title={getTooltip(day)}
                    >
                      {isProtected ? (
                        <div className={styles.dayCircle}>
                          <FreezeDayIcon
                            style={{
                              width: 24,
                              height: 24,
                              zIndex: 2,
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          className={`${styles.dayCircle} ${getDayCircleClass(day.event_type, styles)}`}
                        >
                          <span className={styles.dayCircleContent}>
                            {getDayCircleContent(day.event_type)}
                          </span>
                        </div>
                      )}
                      <span
                        className={`${styles.dayLabel} ${day.event_type === "today" ? styles.dayLabelToday : ""}`}
                      >
                        {getDayAbbrev(day.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.protectorsSection}>
              <div className={styles.protectorRow}>
                <div className={styles.protectorInfo}>
                  <ProtectorIcon className={styles.protectorIcon} />
                  <span className={styles.protectorsTitle}>
                    Protectores disponibles
                  </span>
                </div>
                <span className={styles.protectorCount}>
                  {protectorsCount}
                </span>
              </div>
              <span className={styles.protectorsSubtitle}>
                {protectorsCount > 0
                  ? `${freeLeft} gratuito${freeLeft !== 1 ? "s" : ""} este mes · ${purchasedCount} extra${purchasedCount !== 1 ? "s" : ""}`
                  : "Protegen tu racha automáticamente si no completás tareas un día"}
              </span>
            </div>

            <div className={styles.purchaseSection}>
              <div className={styles.purchaseHeader}>
                <span className={styles.purchaseTitle}>Comprar protectores</span>
              </div>
              <div className={styles.purchaseGrid}>
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    className={styles.packageCard}
                    onClick={() => handleBuyPackage(pkg)}
                    disabled={isPurchasing}
                    title={`Comprar ${pkg.name} por ${pkg.coins_price} monedas`}
                  >
                    <div className={styles.cardHeader}>
                      <ProtectorIcon className={styles.cardIcon} />
                      {pkg.badge && (
                        <span className={styles.cardBadgeHeader}>
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardTitleRow}>
                        <span className={styles.cardTitle}>{pkg.name}</span>
                        {pkg.badge && (
                          <span className={styles.cardBadgeInline}>
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                      <span className={styles.cardSubtitle}>
                        +{pkg.protectors_count}{" "}
                        {pkg.protectors_count === 1
                          ? "protector"
                          : "protectores"}
                      </span>
                    </div>
                    <div className={styles.cardFooter}>
                      <div className={styles.priceChip}>
                        <AlinoCoinIcon amount={pkg.coins_price} size={13} />
                        <span>{pkg.coins_price}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ModalBox>
      )}
    </div>
  );
};
