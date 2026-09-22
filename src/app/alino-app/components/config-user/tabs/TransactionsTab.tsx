"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Crown,
  IAStars,
  ReceiptIcon,
  Check,
  Alert,
  Clock,
} from "@/components/ui/icons/icons";
import { AlinoCoinIcon } from "@/components/ui/alino-coins-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { UserType } from "@/lib/schemas/database.types";
import {
  getUserTransactionsHistoryAction,
  BillingTransaction,
  CoinMovement,
  TransactionsHistoryResult,
} from "@/lib/api/transactions/actions";
import configStyles from "../ConfigUser.module.css";
import styles from "./TransactionsTab.module.css";

interface TransactionsTabProps {
  user: UserType | null;
}

type FilterType = "all" | "subscriptions" | "coin_packs" | "coin_movements";

type UnifiedItem =
  | { kind: "billing"; item: BillingTransaction; date: Date }
  | { kind: "coin"; item: CoinMovement; date: Date };

export function TransactionsTab({ user }: TransactionsTabProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [data, setData] = useState<TransactionsHistoryResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getUserTransactionsHistoryAction(filter)
      .then((res) => {
        if (isMounted && res.data) {
          setData(res.data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filter]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount: number, currency: string = "ARS") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency || "ARS",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getBillingStatusBadge = (tx: BillingTransaction) => {
    if (tx.status === "approved") {
      return <span className={styles.badgeSuccess}>Aprobado</span>;
    }
    if (tx.status === "rejected" || tx.status === "failed") {
      return <span className={styles.badgeFailed}>Fallido</span>;
    }
    if (tx.status === "pending") {
      return <span className={styles.badgePending}>Pendiente</span>;
    }
    return <span className={styles.badgeType}>{tx.status}</span>;
  };

  const getCoinTypeLabel = (type: string) => {
    switch (type) {
      case "cosmetic_purchase":
        return "Cosmético";
      case "streak_protection_purchase":
        return "Protectores de racha";
      case "ai_credits_purchase":
        return "Créditos IA";
      case "coin_pack_purchase":
        return "Compra de monedas";
      case "achievement_reward":
        return "Premio por logro";
      case "level_up_reward":
        return "Subida de nivel";
      case "promo_code":
        return "Código promocional";
      default:
        return "Monedas";
    }
  };

  const unifiedList: UnifiedItem[] = React.useMemo(() => {
    if (!data) return [];
    const list: UnifiedItem[] = [];

    if (filter === "all" || filter === "subscriptions" || filter === "coin_packs") {
      (data.billing || []).forEach((b) => {
        if (filter === "subscriptions" && b.transaction_type !== "subscription") return;
        if (filter === "coin_packs" && b.transaction_type !== "coin_pack") return;
        list.push({ kind: "billing", item: b, date: new Date(b.created_at) });
      });
    }

    if (filter === "all" || filter === "coin_movements") {
      (data.coin_movements || []).forEach((c) => {
        list.push({ kind: "coin", item: c, date: new Date(c.created_at) });
      });
    }

    list.sort((a, b) => b.date.getTime() - a.date.getTime());
    return list;
  }, [data, filter]);

  const currentTier = user?.tier && user.tier !== "free" ? user.tier.toUpperCase() : "FREE";

  return (
    <motion.div
      className={configStyles.tabContainer}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <div className={configStyles.tabHeaderBlock}>
        <h3 className={configStyles.tabSectionTitle}>Historial de transacciones</h3>
        <p className={configStyles.tabSectionSubtitle}>
          Consulta tus compras de suscripciones, cobros mensuales, adquisición y uso de monedas.
        </p>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIconWrap}>
            <AlinoCoinIcon amount={data?.summary?.current_coins ?? 100} size={22} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>
              {data?.summary?.current_coins ?? 0}
            </span>
            <span className={styles.metricLabel}>Saldo actual de monedas</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconWrap}>
            <Crown style={{ width: 18, height: 18, stroke: "currentColor", color: "#eab308" }} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>{currentTier}</span>
            <span className={styles.metricLabel}>Plan de cuenta actual</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconWrap}>
            <ReceiptIcon style={{ width: 18, height: 18, stroke: "currentColor", color: "#38bdf8" }} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>
              {data?.summary?.total_coins_spent ?? 0}
            </span>
            <span className={styles.metricLabel}>Total monedas gastadas</span>
          </div>
        </div>
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.filterTabs}>
          <button
            type="button"
            className={`${styles.filterBtn} ${filter === "all" ? styles.filterBtnActive : ""}`}
            onClick={() => setFilter("all")}
          >
            Todas
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${filter === "subscriptions" ? styles.filterBtnActive : ""}`}
            onClick={() => setFilter("subscriptions")}
          >
            Membresías
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${filter === "coin_packs" ? styles.filterBtnActive : ""}`}
            onClick={() => setFilter("coin_packs")}
          >
            Compra de monedas
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${filter === "coin_movements" ? styles.filterBtnActive : ""}`}
            onClick={() => setFilter("coin_movements")}
          >
            Uso de monedas
          </button>
        </div>
      </div>

      <div className={styles.transactionsList}>
        {isLoading ? (
          <>
            <Skeleton style={{ width: "100%", height: "64px", borderRadius: "12px" }} delay={0} />
            <Skeleton style={{ width: "100%", height: "64px", borderRadius: "12px" }} delay={0.15} />
            <Skeleton style={{ width: "100%", height: "64px", borderRadius: "12px" }} delay={0.3} />
            <Skeleton style={{ width: "100%", height: "64px", borderRadius: "12px" }} delay={0.45} />
          </>
        ) : unifiedList.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <ReceiptIcon style={{ width: 22, height: 22, stroke: "currentColor" }} />
            </div>
            <span className={styles.emptyTitle}>Sin transacciones registradas</span>
            <span className={styles.emptyDesc}>
              {filter === "subscriptions"
                ? "Aún no posees pagos o cobros de membresías registrados."
                : filter === "coin_packs"
                ? "Aún no has adquirido paquetes de monedas."
                : filter === "coin_movements"
                ? "No tienes movimientos ni gastos de monedas por el momento."
                : "Tus pagos, compras y movimientos de monedas aparecerán detallados aquí."}
            </span>
          </div>
        ) : (
          unifiedList.map((entry) => {
            if (entry.kind === "billing") {
              const b = entry.item;
              const isSub = b.transaction_type === "subscription";

              return (
                <div key={`billing-${b.id}`} className={styles.txCard}>
                  <div className={styles.txLeft}>
                    <div
                      className={`${styles.txIconWrap} ${
                        isSub ? styles.txIconSub : styles.txIconCoinPack
                      }`}
                    >
                      {isSub ? (
                        <Crown style={{ width: 17, height: 17, stroke: "currentColor" }} />
                      ) : (
                        <AlinoCoinIcon amount={100} size={18} />
                      )}
                    </div>
                    <div className={styles.txMeta}>
                      <div className={styles.txTitleRow}>
                        <span className={styles.txTitle}>{b.title}</span>
                        {b.is_recurring && (
                          <span className={styles.badgeRecurring}>Cobro automático</span>
                        )}
                        <span className={styles.badgeType}>
                          {isSub ? "Membresía" : "Monedas"}
                        </span>
                      </div>
                      <div className={styles.txSubline}>
                        <span>{formatDate(b.created_at)}</span>
                        <span className={styles.txDot} />
                        <span>
                          {b.gateway === "mercadopago" ? "Mercado Pago" : b.gateway}
                        </span>
                        {b.error_message && (
                          <>
                            <span className={styles.txDot} />
                            <span style={{ color: "#ef4444" }}>{b.error_message}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.txRight}>
                    <span className={styles.txAmount}>
                      {formatCurrency(b.amount, b.currency)}
                    </span>
                    {getBillingStatusBadge(b)}
                  </div>
                </div>
              );
            }

            const c = entry.item;
            const isPositive = c.amount > 0;

            return (
              <div key={`coin-${c.id}`} className={styles.txCard}>
                <div className={styles.txLeft}>
                  <div
                    className={`${styles.txIconWrap} ${
                      isPositive ? styles.txIconCoinGained : styles.txIconCoinSpent
                    }`}
                  >
                    <AlinoCoinIcon amount={Math.abs(c.amount)} size={18} />
                  </div>
                  <div className={styles.txMeta}>
                    <div className={styles.txTitleRow}>
                      <span className={styles.txTitle}>{c.description}</span>
                      <span className={styles.badgeType}>
                        {getCoinTypeLabel(c.transaction_type)}
                      </span>
                    </div>
                    <div className={styles.txSubline}>
                      <span>{formatDate(c.created_at)}</span>
                      <span className={styles.txDot} />
                      <span>Saldo posterior: {c.balance_after}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.txRight}>
                  <span
                    className={`${styles.txAmount} ${
                      isPositive ? styles.txAmountPositive : styles.txAmountNegative
                    }`}
                  >
                    {isPositive ? `+${c.amount}` : c.amount}
                    <AlinoCoinIcon amount={Math.abs(c.amount)} size={13} />
                  </span>
                  <span className={styles.badgeSuccess}>Completado</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
