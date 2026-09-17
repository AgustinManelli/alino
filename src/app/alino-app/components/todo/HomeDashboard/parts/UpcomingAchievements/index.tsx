"use client";

import React, { useEffect, useMemo } from "react";
import { useAchievementsStore } from "@/store/useAchievementsStore";
import { useUserDataStore } from "@/store/useUserDataStore";
import { useWidgetPreview } from "@/context/WidgetPreviewContext";
import { LevelBadge } from "@/config/levelBadges";
import { AchievementIllustration } from "@/config/achievementIcons";
import { AlinoCoinIcon } from "@/components/ui/alino-coins-icon";
import { showAchievementToast } from "@/components/ui/toaster/achievement-toaster";
import { AchievementItem } from "@/lib/schemas/database.types";
import { WidgetProps } from "@/types/widgetContract";
import { UpcomingAchievementsPreview } from "./UpcomingAchievementsPreview";
import styles from "./UpcomingAchievements.module.css";

export const UpcomingAchievementsWidget: React.FC<WidgetProps> = () => {
  const isPreview = useWidgetPreview();
  const currentUser = useUserDataStore((state) => state.user);

  const {
    overview,
    fetchAchievements,
    claimReward,
    isClaimingId,
    setIsGalleryOpen,
  } = useAchievementsStore();

  useEffect(() => {
    if (!isPreview) {
      fetchAchievements();
    }
  }, [isPreview, fetchAchievements]);

  const currentLevel = currentUser?.level ?? overview?.level ?? 1;

  const sortedUpcoming = useMemo(() => {
    const list = [...(overview?.achievements || [])];
    return list.sort((a, b) => {
      if (a.is_completed && !a.is_claimed && (!b.is_completed || b.is_claimed)) return -1;
      if (b.is_completed && !b.is_claimed && (!a.is_completed || a.is_claimed)) return 1;
      if (!a.is_completed && b.is_completed) return -1;
      if (!b.is_completed && a.is_completed) return 1;

      const aPct = a.target_value > 0 ? a.current_progress / a.target_value : 0;
      const bPct = b.target_value > 0 ? b.current_progress / b.target_value : 0;
      return bPct - aPct;
    });
  }, [overview?.achievements]);

  if (isPreview) {
    return <UpcomingAchievementsPreview />;
  }

  const featured = sortedUpcoming[0] || null;
  const nextTwo = sortedUpcoming.slice(1, 3);
  const unclaimedCount = (overview?.achievements || []).filter(
    (a) => a.is_completed && !a.is_claimed
  ).length;

  const handleClaim = async (e: React.MouseEvent, item: AchievementItem) => {
    e.stopPropagation();
    const res = await claimReward(item.id);
    if (res.success) {
      showAchievementToast({
        code: item.code,
        title: item.title,
        description: item.description,
        coins: res.coins_reward,
        xp: res.xp_reward,
        leveledUp: res.leveled_up,
        newLevel: res.new_level,
        isClaimedNotice: true,
      });
    }
  };

  const handleOpenGallery = () => {
    setIsGalleryOpen(true);
  };

  const featuredPct = featured && featured.target_value > 0
    ? Math.min(100, Math.round((featured.current_progress / featured.target_value) * 100))
    : 0;
  const isFeaturedReady = featured ? featured.is_completed && !featured.is_claimed : false;

  return (
    <div className={styles.container} onClick={handleOpenGallery}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <span className={styles.title}>Logros</span>
          {unclaimedCount > 0 && (
            <span className={styles.unclaimedBadge}>
              {unclaimedCount} {unclaimedCount === 1 ? "listo" : "listos"}
            </span>
          )}
        </div>
        <LevelBadge level={currentLevel} size={22} showLevelNumber={false} />
      </div>

      {featured ? (
        <div
          className={`${styles.featuredCard} ${
            isFeaturedReady ? styles.featuredCardReady : ""
          }`}
        >
          <div className={styles.featuredIconWrapper}>
            <AchievementIllustration code={featured.code} size={30} />
          </div>
          <div className={styles.featuredInfo}>
            <div className={styles.featuredTitleRow}>
              <span className={styles.featuredTitle}>{featured.title}</span>
              <span className={styles.featuredPercent}>
                {isFeaturedReady ? "¡Listo!" : `${featuredPct}%`}
              </span>
            </div>
            <div className={styles.featuredTrack}>
              <div
                className={`${styles.featuredFill} ${
                  isFeaturedReady ? styles.featuredFillReady : ""
                }`}
                style={{ width: `${featuredPct}%` }}
              />
            </div>
          </div>
          {isFeaturedReady && (
            <button
              type="button"
              className={styles.claimBtnSmall}
              disabled={isClaimingId === featured.id}
              onClick={(e) => handleClaim(e, featured)}
            >
              {isClaimingId === featured.id ? "..." : "Reclamar"}
            </button>
          )}
        </div>
      ) : (
        <div className={styles.featuredCard}>
          <span className={styles.featuredTitle}>Completando tareas...</span>
        </div>
      )}

      <div className={styles.compactList}>
        {nextTwo.map((item) => {
          const isReady = item.is_completed && !item.is_claimed;
          const pct =
            item.target_value > 0
              ? Math.min(100, Math.round((item.current_progress / item.target_value) * 100))
              : 0;

          return (
            <div key={item.id} className={styles.compactItem}>
              <div className={styles.compactLeft}>
                <AchievementIllustration code={item.code} size={16} />
                <span className={styles.compactTitle}>{item.title}</span>
              </div>
              <div className={styles.compactRight}>
                <div className={styles.compactMiniTrack}>
                  <div
                    className={`${styles.compactMiniFill} ${
                      isReady ? styles.compactMiniFillReady : ""
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {isReady ? (
                  <button
                    type="button"
                    className={styles.claimBtnSmall}
                    disabled={isClaimingId === item.id}
                    onClick={(e) => handleClaim(e, item)}
                  >
                    {isClaimingId === item.id ? "..." : "Reclamar"}
                  </button>
                ) : (
                  <div className={styles.compactRewardTag}>
                    <AlinoCoinIcon amount={item.reward_coins} size={10} />
                    <span>+{item.reward_coins}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
