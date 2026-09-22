"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import {
  TeamCollaborationIcon,
  IAStars,
  ShareIcon,
  Check,
} from "@/components/ui/icons/icons";
import {
  getUserReferralStatsAction,
  applyReferralCodeAction,
  claimReferralMilestoneAction,
  UserReferralStats,
} from "@/lib/api/user/actions";
import { customToast } from "@/lib/toasts";
import { UserType } from "@/lib/schemas/database.types";
import { useUserDataStore, globalUserStore } from "@/store/useUserDataStore";
import styles from "../ConfigUser.module.css";

interface ReferralsTabProps {
  user: UserType | null;
  updateUser: (partial: Partial<UserType>) => void;
  fetchAIUsage: () => void;
}

export function ReferralsTab({
  user,
  updateUser,
  fetchAIUsage,
}: ReferralsTabProps) {
  const { t } = useTranslation(["config", "common"]);
  const cachedStats = useUserDataStore((s) => s.referralStats);
  const setReferralStats = useUserDataStore((s) => s.setReferralStats);

  const [stats, setStats] = useState<UserReferralStats | null>(cachedStats);
  const [isLoading, setIsLoading] = useState(!cachedStats);
  const [codeToRedeem, setCodeToRedeem] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const loadStats = useCallback(async () => {
    const currentCached = globalUserStore?.getState().referralStats;
    if (!currentCached) setIsLoading(true);
    try {
      const res = await getUserReferralStatsAction();
      if (res.data) {
        setStats(res.data);
        setReferralStats(res.data);
      }
    } catch {
      // Ignorar errores de red temporales
    } finally {
      setIsLoading(false);
    }
  }, [setReferralStats]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const effectiveCode =
    stats?.referral_code ||
    (user as { referral_code?: string | null })?.referral_code ||
    "";
  const referralUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${effectiveCode}`
      : `https://alino.app/?ref=${effectiveCode}`;

  const milestoneTarget = stats?.milestone_target ?? 10;
  const milestoneRewardDays = stats?.milestone_reward_days ?? 30;
  const rewardDaysReferred = stats?.reward_days_referred ?? 7;
  const currentProgress = stats?.current_progress ?? 0;
  const progressPercent = Math.min(
    100,
    Math.round((currentProgress / (milestoneTarget || 1)) * 100)
  );

  const handleShare = async () => {
    const shareText = t("config:account.referrals.shareText", {
      code: effectiveCode,
      days: rewardDaysReferred,
    });
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("config:account.referrals.shareTitle"),
          text: shareText,
          url: referralUrl,
        });
      } catch {
        return;
      }
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${shareText} ${referralUrl}`
      )}`;
      window.open(waUrl, "_blank");
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = codeToRedeem.trim().toUpperCase().replace(/^@/, "");
    if (!clean) return;
    setIsRedeeming(true);
    const res = await applyReferralCodeAction(clean);
    setIsRedeeming(false);
    if (res.error) {
      customToast.error(res.error);
    } else {
      customToast.success(res.data?.message || t("config:account.referrals.redeem.success"));
      setCodeToRedeem("");
      updateUser({ tier: "pro" });
      fetchAIUsage();
      loadStats();
    }
  };

  const handleClaimMilestone = async () => {
    setIsClaiming(true);
    const res = await claimReferralMilestoneAction();
    setIsClaiming(false);
    if (res.error) {
      customToast.error(res.error);
    } else {
      customToast.success(res.data?.message || t("config:account.referrals.claimSuccess"));
      updateUser({ tier: "pro" });
      fetchAIUsage();
      loadStats();
    }
  };

  return (
    <motion.div
      className={styles.tabContainer}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.tabHeaderBlock}>
        <div className={styles.referralHeader}>
          <div className={styles.referralHeaderLeft}>
            <TeamCollaborationIcon
              style={{
                width: "16px",
                height: "16px",
                color: "var(--alino-secondary-color)",
              }}
            />
            <h4 className={styles.referralTitle}>{t("config:account.referrals.title")}</h4>
          </div>
          <span className={styles.referralBadge}>
            {t("config:account.referrals.badge", {
              days: milestoneRewardDays,
              target: milestoneTarget,
            })}
          </span>
        </div>
        <p className={styles.referralDesc}>
          {t("config:account.referrals.desc", {
            referredDays: rewardDaysReferred,
            rewardDays: milestoneRewardDays,
            target: milestoneTarget,
          })}
        </p>
      </div>

      <div className={styles.referralShareBox}>
        {effectiveCode && (
          <div
            className={styles.referralCodeBadge}
            title={t("config:account.referrals.codeBadgeTitle")}
          >
            <span>{effectiveCode}</span>
            <CopyToClipboard
              text={effectiveCode}
              successMessage={t("config:account.referrals.codeCopied")}
              size={22}
            />
          </div>
        )}
        <input
          type="text"
          readOnly
          value={referralUrl}
          className={styles.referralLinkInput}
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <CopyToClipboard
          text={referralUrl}
          successMessage={t("config:account.referrals.linkCopied")}
          size={36}
          style={{ flexShrink: 0 }}
        />
        <button
          type="button"
          className={styles.referralBtnShare}
          onClick={handleShare}
          title={t("config:account.referrals.shareBtn")}
        >
          <ShareIcon style={{ width: "14px", height: "14px" }} />
        </button>
      </div>

      <div className={styles.referralMilestoneCard}>
        <div className={styles.referralMilestoneHeader}>
          <span className={styles.referralMilestoneTitle}>
            {t("config:account.referrals.milestoneTitle")}
          </span>
          <span className={styles.referralMilestoneRatio}>
            {t("config:account.referrals.milestoneRatio", {
              current: currentProgress,
              target: milestoneTarget,
            })}
          </span>
        </div>
        <div className={styles.referralProgressBarTrack}>
          <div
            className={styles.referralProgressBarFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className={styles.referralMilestoneFooter}>
          <span className={styles.referralMilestoneHint}>
            {stats?.can_claim
              ? t("config:account.referrals.milestoneReached", {
                  days: milestoneRewardDays,
                })
              : t("config:account.referrals.milestoneRemaining", {
                  count: Math.max(0, milestoneTarget - currentProgress),
                  days: milestoneRewardDays,
                })}
          </span>
          {stats?.can_claim && (
            <button
              type="button"
              className={styles.referralClaimBtn}
              onClick={handleClaimMilestone}
              disabled={isClaiming}
            >
              <IAStars style={{ width: "13px", height: "13px" }} />
              <span>
                {isClaiming
                  ? t("config:account.referrals.claiming")
                  : t("config:account.referrals.claimBtn", {
                      days: milestoneRewardDays,
                    })}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.referralMetricsGrid}>
        <div className={styles.referralMetricCard}>
          <span className={styles.referralMetricLabel}>
            {t("config:account.referrals.metrics.joinedFriends")}
          </span>
          <span className={styles.referralMetricValue}>
            {isLoading ? "..." : stats?.total_referrals ?? 0}
          </span>
        </div>
        <div className={styles.referralMetricCard}>
          <span className={styles.referralMetricLabel}>
            {t("config:account.referrals.metrics.earnedDays")}
          </span>
          <span className={styles.referralMetricValue}>
            {isLoading ? "..." : `${stats?.total_days_earned ?? 0}d`}
          </span>
        </div>
      </div>

      {!stats?.has_been_referred ? (
        <form onSubmit={handleRedeem} className={styles.referralRedeemForm}>
          <input
            type="text"
            className={styles.referralRedeemInput}
            placeholder={t("config:account.referrals.redeem.placeholder")}
            value={codeToRedeem}
            onChange={(e) => {
              const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
              setCodeToRedeem(raw);
            }}
            disabled={isRedeeming}
            maxLength={12}
          />
          <button
            type="submit"
            className={styles.referralRedeemBtn}
            disabled={isRedeeming || !codeToRedeem.trim()}
          >
            {isRedeeming
              ? t("config:account.referrals.redeem.loading")
              : t("config:account.referrals.redeem.button")}
          </button>
        </form>
      ) : (
        <div className={styles.referralAlreadyReferredBadge}>
          <Check
            style={{
              width: "14px",
              height: "14px",
              color: "var(--alino-secondary-color)",
            }}
          />
          <span>{t("config:account.referrals.redeem.alreadyReferred")}</span>
        </div>
      )}
    </motion.div>
  );
}
