"use client";

import React, { useState, useEffect, useCallback } from "react";
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
    const shareText = `¡Únete a Alino con mi código ${effectiveCode} y recibe ${rewardDaysReferred} días de Plan Pro gratis con créditos de IA!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Únete a Alino",
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
      customToast.success(res.data?.message || "¡Código aplicado con éxito!");
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
      customToast.success(res.data?.message || "¡Recompensa reclamada con éxito!");
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
            <h4 className={styles.referralTitle}>Programa de Referidos</h4>
          </div>
          <span className={styles.referralBadge}>
            +{milestoneRewardDays}d Pro cada {milestoneTarget} amigos
          </span>
        </div>
        <p className={styles.referralDesc}>
          Invita a tus amigos con tu enlace único. Ellos recibirán{" "}
          {rewardDaysReferred} días de Plan Pro gratis al unirse, y tú acumulas
          amigos para reclamar {milestoneRewardDays} días de Plan Pro cada{" "}
          {milestoneTarget} invitados.
        </p>
      </div>

      <div className={styles.referralShareBox}>
        {effectiveCode && (
          <div
            className={styles.referralCodeBadge}
            title="Tu código único de referido"
          >
            <span>{effectiveCode}</span>
            <CopyToClipboard
              text={effectiveCode}
              successMessage="Código de referido copiado"
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
          successMessage="Enlace de referido copiado"
          size={36}
          style={{ flexShrink: 0 }}
        />
        <button
          type="button"
          className={styles.referralBtnShare}
          onClick={handleShare}
          title="Compartir"
        >
          <ShareIcon style={{ width: "14px", height: "14px" }} />
        </button>
      </div>

      <div className={styles.referralMilestoneCard}>
        <div className={styles.referralMilestoneHeader}>
          <span className={styles.referralMilestoneTitle}>
            Progreso del hito actual
          </span>
          <span className={styles.referralMilestoneRatio}>
            {currentProgress} / {milestoneTarget} amigos
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
              ? `¡Meta alcanzada! Tienes ${milestoneRewardDays} días de Plan Pro listos para reclamar.`
              : `Te faltan ${Math.max(
                  0,
                  milestoneTarget - currentProgress
                )} amigo(s) para reclamar ${milestoneRewardDays} días de Plan Pro.`}
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
                  ? "Reclamando..."
                  : `Reclamar ${milestoneRewardDays}d Pro`}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.referralMetricsGrid}>
        <div className={styles.referralMetricCard}>
          <span className={styles.referralMetricLabel}>
            Amigos que se unieron
          </span>
          <span className={styles.referralMetricValue}>
            {isLoading ? "..." : stats?.total_referrals ?? 0}
          </span>
        </div>
        <div className={styles.referralMetricCard}>
          <span className={styles.referralMetricLabel}>
            Días Pro reclamados
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
            placeholder="Código único de tu amigo (ej. ALN7K9X)"
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
            {isRedeeming ? "..." : "Canjear código"}
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
          <span>Ya has canjeado tu beneficio de referido</span>
        </div>
      )}
    </motion.div>
  );
}
