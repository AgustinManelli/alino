"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import {
  IAStars,
  Colaborate,
  FolderClosed,
  Crown,
} from "@/components/ui/icons/icons";
import { UserType } from "@/lib/schemas/database.types";
import { FeatureUsage, ActiveSubscription } from "@/lib/schemas/user.types";
import { redeemPromoCodeAction } from "@/lib/api/user/actions";
import { customToast } from "@/lib/toasts";
import styles from "../ConfigUser.module.css";

interface SubscriptionTabProps {
  user: UserType | null;
  aiUsage: FeatureUsage | null;
  activeSub: ActiveSubscription | null;
  loadingSub: boolean;
  loadingCancel: boolean;
  onOpenPremiumModal: () => void;
  onCancelSub: () => void;
}

export function SubscriptionTab({
  user,
  aiUsage,
  activeSub,
  loadingSub,
  loadingCancel,
  onOpenPremiumModal,
  onCancelSub,
}: SubscriptionTabProps) {
  const { t, i18n } = useTranslation(["config", "common"]);
  const isFreeTier = !user?.tier || user.tier === "free";
  const [promoCode, setPromoCode] = useState("");
  const [loadingPromo, setLoadingPromo] = useState(false);

  const isUnlimited = aiUsage ? aiUsage.limit >= 9999999 : false;
  const extraCredits = aiUsage?.extra_remaining ?? 0;
  const planRemaining = aiUsage?.remaining ?? 0;
  const planLimit = aiUsage?.limit ?? 0;
  const totalAvailable = isUnlimited ? Infinity : planRemaining + extraCredits;
  const totalCapacity = planLimit + extraCredits;

  const extraPct =
    !isUnlimited && totalCapacity > 0 ? (extraCredits / totalCapacity) * 100 : 0;
  const planRemainingPct =
    !isUnlimited && totalCapacity > 0 ? (planRemaining / totalCapacity) * 100 : 0;

  const isExhausted = aiUsage ? totalAvailable === 0 && !isUnlimited : false;
  const isUsingExtraCredits = !isUnlimited && planRemaining === 0 && extraCredits > 0;
  const isNearLimit =
    !isUnlimited &&
    !isExhausted &&
    totalAvailable <= (planLimit > 0 ? Math.max(5, Math.round(totalCapacity * 0.15)) : 5);

  const renewDate = aiUsage?.period_end
    ? new Date(aiUsage.period_end).toLocaleDateString(
        i18n.language === "en" ? "en-US" : "es-AR",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : null;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (!clean) return;

    setLoadingPromo(true);
    const { data, error } = await redeemPromoCodeAction(clean);
    setLoadingPromo(false);

    if (error) {
      customToast.error(error);
    } else {
      customToast.success(data?.message || t("config:account.subscription.promo.success"));
      setPromoCode("");
    }
  };

  const PRO_BENEFITS = [
    {
      title: t("config:account.subscription.benefits.ai.title"),
      desc: t("config:account.subscription.benefits.ai.desc"),
      icon: <IAStars style={{ width: 15, height: 15, stroke: "currentColor" }} />,
    },
    {
      title: t("config:account.subscription.benefits.widgets.title"),
      desc: t("config:account.subscription.benefits.widgets.desc"),
      icon: <Crown style={{ width: 15, height: 15, stroke: "currentColor" }} />,
    },
    {
      title: t("config:account.subscription.benefits.collaboration.title"),
      desc: t("config:account.subscription.benefits.collaboration.desc"),
      icon: <Colaborate style={{ width: 15, height: 15, stroke: "currentColor" }} />,
    },
    {
      title: t("config:account.subscription.benefits.folders.title"),
      desc: t("config:account.subscription.benefits.folders.desc"),
      icon: <FolderClosed style={{ width: 15, height: 15, stroke: "currentColor" }} />,
    },
  ];

  return (
    <motion.div
      className={styles.tabContainer}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.tabHeaderBlock}>
        <h3 className={styles.tabSectionTitle}>{t("config:account.subscription.title")}</h3>
        <p className={styles.tabSectionSubtitle}>
          {t("config:account.subscription.subtitle")}
        </p>
      </div>

      {isFreeTier ? (
        <div className={styles.upgradeBanner}>
          <div className={styles.upgradeBannerContent}>
            <span className={styles.upgradeEmoji}>✦</span>
            <div>
              <p className={styles.upgradeBannerTitle}>
                {t("config:account.subscription.freeBanner.title")}
              </p>
              <p className={styles.upgradeBannerDesc}>
                {t("config:account.subscription.freeBanner.desc")}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenPremiumModal}
            className={styles.upgradeBannerBtn}
            type="button"
          >
            {t("config:account.subscription.freeBanner.button")}
          </button>
        </div>
      ) : (
        <div
          className={styles.upgradeBanner}
          style={{ background: "var(--background-over-container)" }}
        >
          <div className={styles.upgradeBannerContent}>
            <span className={styles.upgradeEmoji}>✦</span>
            <div>
              <p className={styles.upgradeBannerTitle}>
                {t("config:account.subscription.activeBanner.title", {
                  tier: user?.tier?.toUpperCase(),
                })}
              </p>
              <p
                className={styles.upgradeBannerDesc}
                style={{
                  color: "var(--text-not-available)",
                  fontSize: "13px",
                  marginTop: "2px",
                }}
              >
                {loadingSub
                  ? t("config:account.subscription.activeBanner.loading")
                  : activeSub?.gateway === "promo" ||
                    activeSub?.gateway === "manual" ||
                    activeSub?.gateway === "referral"
                    ? t("config:account.subscription.activeBanner.endsOn", {
                        date: activeSub?.current_period_end
                          ? new Date(activeSub.current_period_end).toLocaleDateString(
                              i18n.language === "en" ? "en-US" : "es-AR"
                            )
                          : "",
                      })
                    : activeSub?.cancel_at_period_end ||
                      activeSub?.status === "canceled" ||
                      activeSub?.status === "free"
                      ? t("config:account.subscription.activeBanner.cancelsOn", {
                          date: activeSub?.current_period_end
                            ? new Date(activeSub.current_period_end).toLocaleDateString(
                                i18n.language === "en" ? "en-US" : "es-AR"
                              )
                            : "",
                        })
                      : activeSub?.current_period_end
                        ? t("config:account.subscription.activeBanner.renewsOn", {
                            date: new Date(activeSub.current_period_end).toLocaleDateString(
                              i18n.language === "en" ? "en-US" : "es-AR"
                            ),
                          })
                        : user?.tier === "ultra"
                          ? t("config:account.subscription.activeBanner.ultraDesc")
                          : t("config:account.subscription.activeBanner.proDesc")}
              </p>
            </div>
          </div>
          {user?.tier === "pro" && (
            <button
              onClick={onOpenPremiumModal}
              className={styles.upgradeBannerBtn}
              type="button"
            >
              {t("config:account.subscription.activeBanner.upgradeToUltra")}
            </button>
          )}
          {user?.tier === "student" && (
            <button
              onClick={onOpenPremiumModal}
              className={styles.upgradeBannerBtn}
              type="button"
            >
              {t("config:account.subscription.activeBanner.upgradePlan")}
            </button>
          )}
          {activeSub &&
            (activeSub.gateway === "referral" ||
              activeSub.gateway === "promo" ||
              activeSub.gateway === "manual") &&
            user?.tier !== "ultra" &&
            user?.tier !== "pro" && (
              <button
                onClick={onOpenPremiumModal}
                className={styles.upgradeBannerBtn}
                type="button"
              >
                {t("config:account.subscription.subscribe")}
              </button>
            )}
          {activeSub &&
            !activeSub.cancel_at_period_end &&
            activeSub.status !== "canceled" &&
            activeSub.status !== "free" &&
            activeSub.gateway === "mercadopago" && (
              <button
                onClick={onCancelSub}
                className={styles.upgradeBannerBtn}
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
                disabled={loadingCancel}
                type="button"
              >
                {loadingCancel
                  ? t("config:account.subscription.cancel.loading")
                  : t("config:account.subscription.cancel.button")}
              </button>
            )}
        </div>
      )}

      <section className={styles.aiCreditsSection}>
        <div className={styles.aiCreditsSectionHeader}>
          <IAStars
            style={{
              width: "14px",
              height: "14px",
              stroke: "var(--icon-colorv2)",
              opacity: 0.8,
            }}
          />
          <h4 className={styles.aiCreditsSectionTitle}>
            {t("config:account.subscription.aiCredits.sectionTitle")}
          </h4>
        </div>

        <div className={styles.aiCreditsCard}>
          <div className={styles.aiCreditsRow}>
            <div className={styles.aiCreditsInfo}>
              <span className={styles.aiCreditsLabel}>
                {t("config:account.subscription.aiCredits.availableLabel")}
              </span>
              {aiUsage ? (
                <span className={styles.aiCreditsCount}>
                  {isUnlimited ? (
                    <span className={styles.aiCreditsUnlimited}>
                      {t("config:account.subscription.aiCredits.unlimited")}
                    </span>
                  ) : (
                    <>
                      <span
                        className={styles.aiCreditsUsed}
                        style={{
                          color: isExhausted
                            ? "#ef4444"
                            : isNearLimit
                              ? "#f59e0b"
                              : "var(--text)",
                        }}
                      >
                        {totalAvailable}
                      </span>
                      <span className={styles.aiCreditsTotal}>
                        {" "}
                        / {totalCapacity}
                      </span>
                    </>
                  )}
                </span>
              ) : (
                <span className={styles.aiCreditsLoading}>
                  {t("config:account.subscription.aiCredits.loading")}
                </span>
              )}
            </div>

            {renewDate && !isUnlimited && (
              <span className={styles.aiCreditsRenew}>
                {t("config:account.subscription.aiCredits.renewsOn", { date: renewDate })}
              </span>
            )}
          </div>

          {!isUnlimited && aiUsage && (
            <>
              <div className={styles.aiCreditsBarTrack}>
                {extraPct > 0 && (
                  <motion.div
                    className={`${styles.aiCreditsBarFillExtra} ${
                      planRemainingPct > 0
                        ? styles.aiCreditsBarFillExtraDivider
                        : styles.aiCreditsBarFillExtraStandalone
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${extraPct}%` }}
                    transition={{
                      duration: 0.6,
                      ease: "easeOut",
                      delay: 0.1,
                    }}
                    title={t("config:account.subscription.aiCredits.purchasedTooltip", {
                      count: extraCredits,
                    })}
                  />
                )}
                {planRemainingPct > 0 && (
                  <motion.div
                    className={`${styles.aiCreditsBarFillPlan} ${
                      extraPct === 0 ? styles.aiCreditsBarFillPlanStandalone : ""
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${planRemainingPct}%` }}
                    transition={{
                      duration: 0.6,
                      ease: "easeOut",
                      delay: 0.15,
                    }}
                    title={t("config:account.subscription.aiCredits.planTooltip", {
                      count: planRemaining,
                    })}
                    style={{
                      background: isExhausted
                        ? "rgba(239, 68, 68, 0.7)"
                        : isNearLimit && extraCredits === 0
                          ? "linear-gradient(90deg, rgba(245, 158, 11, 0.8), rgba(239, 68, 68, 0.6))"
                          : "linear-gradient(90deg, rgba(139, 92, 246, 0.8), rgba(168, 85, 247, 0.6))",
                    }}
                  />
                )}
              </div>

              {extraCredits > 0 && (
                <div className={styles.aiCreditsLegend}>
                  <div className={styles.aiCreditsLegendItem}>
                    <span className={styles.legendDotExtra} />
                    <span>
                      {t("config:account.subscription.aiCredits.purchasedLabel", {
                        count: extraCredits,
                      })}
                    </span>
                  </div>
                  <div className={styles.aiCreditsLegendItem}>
                    <span className={styles.legendDotPlan} />
                    <span>
                      {t("config:account.subscription.aiCredits.planLabel", {
                        count: planRemaining,
                      })}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {isExhausted && (
            <p className={styles.aiCreditsWarning}>
              {t("config:account.subscription.aiCredits.exhaustedWarning")}
            </p>
          )}
          {isUsingExtraCredits && (
            <p className={styles.aiCreditsNotice}>
              {isNearLimit
                ? t("config:account.subscription.aiCredits.usingExtraNearLimitNotice", {
                    count: extraCredits,
                  })
                : t("config:account.subscription.aiCredits.usingExtraNotice")}
            </p>
          )}
          {isNearLimit && !isUsingExtraCredits && !isExhausted && (
            <p className={styles.aiCreditsWarning} style={{ color: "#f59e0b" }}>
              {t("config:account.subscription.aiCredits.nearLimitWarning")}
            </p>
          )}
        </div>
      </section>

      <div className={styles.sectionDivider} />

      <section className={styles.featuresSection}>
        <h4 className={styles.tabSectionTitle} style={{ fontSize: "14px" }}>
          {t("config:account.subscription.benefits.sectionTitle")}
        </h4>
        <div className={styles.featuresGrid}>
          {PRO_BENEFITS.map((b, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureIconBox}>{b.icon}</div>
              <div className={styles.featureContent}>
                <p className={styles.featureTitle}>{b.title}</p>
                <p className={styles.featureDesc}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.promoSection}>
        <div className={styles.promoHeader}>
          <Crown style={{ width: "15px", height: "15px", stroke: "var(--alino-primary-color)" }} />
          <h4 className={styles.promoTitle}>{t("config:account.subscription.promo.title")}</h4>
        </div>
        <form onSubmit={handleApplyPromo} className={styles.promoForm}>
          <input
            type="text"
            className={styles.promoInput}
            placeholder={t("config:account.subscription.promo.placeholder")}
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            disabled={loadingPromo}
            maxLength={20}
          />
          <button
            type="submit"
            className={styles.promoBtn}
            disabled={loadingPromo || !promoCode.trim()}
          >
            {loadingPromo
              ? t("config:account.subscription.promo.loading")
              : t("config:account.subscription.promo.button")}
          </button>
        </form>
      </section>

      <div className={styles.sectionDivider} />

      <section className={styles.faqSection}>
        <h4 className={styles.tabSectionTitle} style={{ fontSize: "14px" }}>
          {t("config:account.subscription.faq.title")}
        </h4>
        <div className={styles.faqItem}>
          <p className={styles.faqQuestion}>{t("config:account.subscription.faq.cancelQuestion")}</p>
          <p className={styles.faqAnswer}>
            {t("config:account.subscription.faq.cancelAnswer")}
          </p>
        </div>
        <div className={styles.faqItem}>
          <p className={styles.faqQuestion}>{t("config:account.subscription.faq.paymentQuestion")}</p>
          <p className={styles.faqAnswer}>
            {t("config:account.subscription.faq.paymentAnswer")}
          </p>
        </div>
        <div className={styles.faqItem}>
          <p className={styles.faqQuestion}>{t("config:account.subscription.faq.dataQuestion")}</p>
          <p className={styles.faqAnswer}>
            {t("config:account.subscription.faq.dataAnswer")}
          </p>
        </div>
      </section>
    </motion.div>
  );
}
