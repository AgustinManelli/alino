"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAchievementsStore } from "@/store/useAchievementsStore";
import { useUserDataStore } from "@/store/useUserDataStore";
import { ModalBox } from "@/components/ui/modal-options-box";
import { LevelBadge, getLevelInfo } from "@/config/levelBadges";
import { AchievementIllustration } from "@/config/achievementIcons";
import { AlinoCoinIcon } from "@/components/ui/alino-coins-icon";
import { UserAvatar } from "@/components/ui/UserAvatar/UserAvatar";
import { getNextLevelReward } from "@/config/levelRewards";
import { showAchievementToast } from "@/components/ui/toaster/achievement-toaster";
import { AchievementItem } from "@/lib/schemas/database.types";
import { getCosmeticTranslation } from "@/lib/i18n/helpers";
import styles from "./AchievementsSection.module.css";

interface RewardItem {
  id: string;
  type: "frame" | "overlay" | "coins";
  name: string;
  description?: string;
  badgeLabel: string;
  amount?: number;
  frameId?: string | null;
  overlayId?: string | null;
}

export const AchievementsSection: React.FC = () => {
  const { t } = useTranslation(["achievements", "common"]);
  const [isOpen, setIsOpen] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  const currentUser = useUserDataStore((state) => state.user);
  const {
    overview,
    levels,
    fetchAchievements,
    claimReward,
    isClaimingId,
    setIsGalleryOpen,
    syncAchievements,
  } = useAchievementsStore();

  useEffect(() => {
    fetchAchievements();
    syncAchievements();
  }, [fetchAchievements, syncAchievements]);

  const currentLevel = currentUser?.level ?? overview?.level ?? 1;
  const currentXp = currentUser?.xp ?? overview?.xp ?? 0;

  const currentLevelData = useMemo(() => {
    const fromList = (levels || []).find((l) => l.level === currentLevel);
    if (fromList) return fromList;
    const fallback = getLevelInfo(currentLevel);
    return {
      level: currentLevel,
      title: fallback.title,
      description: "",
      min_xp: fallback.minXp,
      max_xp: fallback.maxXp,
      badge_color: fallback.color,
      accent_color: fallback.accentColor,
      icon_name: "shield",
      reward_coins: 0,
      reward_cosmetics: [],
    };
  }, [levels, currentLevel]);

  const levelProgress = useMemo(() => {
    const min = currentLevelData.min_xp;
    const max = currentLevelData.max_xp;
    const boundedXp = Math.min(Math.max(currentXp, min), max);
    const range = max - min;
    const currentInRange = boundedXp - min;
    const pct = range > 0 ? Math.round((currentInRange / range) * 100) : 100;
    return {
      currentInRange,
      range,
      pct,
    };
  }, [currentLevelData, currentXp]);

  const nextLevelItem = useMemo(() => {
    const list = levels && levels.length > 0 ? levels : [];
    return (
      list.find(
        (l) =>
          l.level > currentLevel &&
          ((l.reward_cosmetics && l.reward_cosmetics.length > 0) || l.reward_coins > 0)
      ) ?? null
    );
  }, [levels, currentLevel]);

  const nextRewardData = useMemo(() => {
    if (nextLevelItem) {
      const items: RewardItem[] = [];
      const cosmetics = nextLevelItem.reward_cosmetics || [];
      cosmetics.forEach((c) => {
        const trans = getCosmeticTranslation(c);
        items.push({
          id: c.id,
          type: c.type as "frame" | "overlay",
          name: trans.name,
          description: trans.description,
          badgeLabel:
            c.type === "frame"
              ? t("achievements:nextReward.badges.frame")
              : t("achievements:nextReward.badges.overlay"),
          frameId: c.type === "frame" ? c.id : null,
          overlayId: c.type === "overlay" ? c.id : null,
        });
      });

      if (nextLevelItem.reward_coins > 0) {
        items.push({
          id: `coins_${nextLevelItem.level}`,
          type: "coins",
          name: t("achievements:nextReward.coinsReward", { count: nextLevelItem.reward_coins }),
          description: t("achievements:nextReward.coinsDesc"),
          badgeLabel: t("achievements:nextReward.badges.coins"),
          amount: nextLevelItem.reward_coins,
        });
      }

      return {
        level: nextLevelItem.level,
        items,
      };
    }

    const fallback = getNextLevelReward(currentLevel);
    if (!fallback) return null;
    return {
      level: fallback.level,
      items: [
        {
          id: fallback.cosmeticId,
          type: fallback.type,
          name: fallback.name,
          description: fallback.description,
          badgeLabel:
            fallback.type === "frame"
              ? t("achievements:nextReward.badges.frame")
              : t("achievements:nextReward.badges.overlay"),
          frameId: fallback.type === "frame" ? fallback.cosmeticId : null,
          overlayId: fallback.type === "overlay" ? fallback.cosmeticId : null,
        },
      ],
    };
  }, [nextLevelItem, currentLevel, t]);

  const unclaimedList = useMemo(() => {
    return (overview?.achievements || []).filter(
      (a) => a.is_completed && !a.is_claimed
    );
  }, [overview?.achievements]);

  const hasUnclaimed = unclaimedList.length > 0;

  const upcomingAchievements = useMemo(() => {
    const list = [...(overview?.achievements || [])];
    return list
      .sort((a, b) => {
        if (a.is_completed && !a.is_claimed && (!b.is_completed || b.is_claimed)) return -1;
        if (b.is_completed && !b.is_claimed && (!a.is_completed || a.is_claimed)) return 1;
        if (!a.is_completed && b.is_completed) return -1;
        if (!b.is_completed && a.is_completed) return 1;

        const aPct = a.target_value > 0 ? a.current_progress / a.target_value : 0;
        const bPct = b.target_value > 0 ? b.current_progress / b.target_value : 0;
        return bPct - aPct;
      })
      .slice(0, 3);
  }, [overview?.achievements]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        fetchAchievements(true);
      }
      return next;
    });
  };

  const handleClose = () => setIsOpen(false);

  const handleClaim = async (achievement: AchievementItem) => {
    const res = await claimReward(achievement.id);
    if (res.success) {
      showAchievementToast({
        code: achievement.code,
        title: achievement.title,
        description: achievement.description,
        coins: res.coins_reward,
        xp: res.xp_reward,
        leveledUp: res.leveled_up,
        newLevel: res.new_level,
        isClaimedNotice: true,
      });
    }
  };

  const handleOpenGallery = () => {
    setIsOpen(false);
    setIsGalleryOpen(true);
  };

  const headerSlot = (
    <div className={styles.headerSlot}>
      <span className={styles.title}>{t("achievements:header.title")}</span>
      <div className={styles.headerBadge} title={t("achievements:header.tooltip")}>
        <span>
          {overview?.completed_count ?? 0} / {overview?.total_count ?? 0}
        </span>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div
        className={styles.triggerBtn}
        onClick={handleToggle}
        ref={iconRef}
        aria-label={t("achievements:triggerAria")}
        title={t("achievements:triggerTitle", { level: currentLevel })}
        role="button"
        tabIndex={0}
        style={{
          backgroundColor: isOpen
            ? "var(--background-over-container-hover)"
            : "var(--background-over-container)",
        }}
      >
        <LevelBadge
          level={currentLevel}
          size={26}
          badgeColor={currentLevelData.badge_color}
          accentColor={currentLevelData.accent_color}
          title={currentLevelData.title}
        />
        {hasUnclaimed && <div className={styles.unclaimedIndicator} />}
      </div>

      {isOpen && (
        <ModalBox onClose={handleClose} iconRef={iconRef} headerSlot={headerSlot}>
          <div className={styles.panel}>
            <div className={styles.mainInfo}>
              <div className={styles.heroBadgeWrapper}>
                <LevelBadge
                  level={currentLevel}
                  size={40}
                  badgeColor={currentLevelData.badge_color}
                  accentColor={currentLevelData.accent_color}
                  title={currentLevelData.title}
                />
              </div>
              <div className={styles.countWrapper}>
                <span className={styles.levelNumber}>
                  {t("achievements:hero.levelLabel", { level: currentLevel })}
                </span>
                <span className={styles.levelRank}>{currentLevelData.title}</span>
              </div>
              <div className={styles.xpProgressWrapper}>
                <div className={styles.xpBarTrack}>
                  <div
                    className={styles.xpBarFill}
                    style={{ width: `${levelProgress.pct}%` }}
                  />
                </div>
                <div className={styles.xpBarLabels}>
                  <span>
                    {levelProgress.currentInRange} / {levelProgress.range} XP
                  </span>
                  <span>{levelProgress.pct}%</span>
                </div>
              </div>
            </div>

            {nextRewardData && nextRewardData.items.length > 0 && (
              <div className={styles.nextRewardSection}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>
                    {nextRewardData.items.length > 1
                      ? t("achievements:nextReward.titlePlural", { level: nextRewardData.level })
                      : t("achievements:nextReward.title", { level: nextRewardData.level })}
                  </span>
                </div>

                {nextRewardData.items.length >= 2 ? (
                  <div className={styles.rewardsGrid}>
                    {nextRewardData.items.map((item) => (
                      <div key={item.id} className={styles.rewardSquare}>
                        {/* <span
                          className={`${styles.rewardBadge} ${
                            item.type === "coins" ? styles.rewardBadgeGold : ""
                          }`}
                        >
                          {item.badgeLabel}
                        </span> */}
                        <div className={styles.rewardSquareIconWrap}>
                          {item.type === "coins" ? (
                            <div className={styles.rewardCoinWrap}>
                              <AlinoCoinIcon amount={item.amount || 0} size={20} />
                            </div>
                          ) : (
                            <UserAvatar
                              avatarUrl={currentUser?.avatar_url}
                              username={currentUser?.username}
                              size={38}
                              style={{ borderRadius: "10px" }}
                              equippedFrameId={item.frameId}
                              equippedOverlayId={item.overlayId}
                            />
                          )}
                        </div>
                        <span className={styles.rewardSquareName} title={item.name}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.rewardSingleCard}>
                    <div className={styles.rewardSquareIconWrap}>
                      {nextRewardData.items[0].type === "coins" ? (
                        <div className={styles.rewardCoinWrap}>
                          <AlinoCoinIcon amount={nextRewardData.items[0].amount || 0} size={20} />
                        </div>
                      ) : (
                        <UserAvatar
                          avatarUrl={currentUser?.avatar_url}
                          username={currentUser?.username}
                          size={38}
                          style={{ borderRadius: "10px" }}
                          equippedFrameId={nextRewardData.items[0].frameId}
                          equippedOverlayId={nextRewardData.items[0].overlayId}
                        />
                      )}
                    </div>
                    <div className={styles.rewardSingleInfo}>
                      <span className={styles.rewardSingleName}>{nextRewardData.items[0].name}</span>
                      {nextRewardData.items[0].description && (
                        <span className={styles.rewardSingleDesc}>
                          {nextRewardData.items[0].description}
                        </span>
                      )}
                    </div>
                    <span
                      className={`${styles.rewardBadge} ${nextRewardData.items[0].type === "coins" ? styles.rewardBadgeGold : ""
                        }`}
                    >
                      {nextRewardData.items[0].badgeLabel}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className={styles.upcomingSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>{t("achievements:upcoming.title")}</span>
              </div>
              <div className={styles.upcomingList}>
                {upcomingAchievements.map((item) => {
                  const isReadyToClaim = item.is_completed && !item.is_claimed;
                  const progressPct =
                    item.target_value > 0
                      ? Math.min(100, Math.round((item.current_progress / item.target_value) * 100))
                      : 0;

                  return (
                    <div
                      key={item.id}
                      className={`${styles.achievementCard} ${isReadyToClaim ? styles.achievementCardReady : ""
                        }`}
                    >
                      <div className={styles.achievementIconWrapper}>
                        <AchievementIllustration code={item.code} size={32} />
                      </div>
                      <div className={styles.achievementCardDetails}>
                        <div className={styles.achievementNameRow}>
                          <span className={styles.achievementName}>{item.title}</span>
                        </div>
                        <span className={styles.achievementDesc}>{item.description}</span>
                        <div className={styles.progressRow}>
                          <div className={styles.progressBarTrack}>
                            <div
                              className={`${styles.progressBarFill} ${item.is_completed ? styles.progressBarFillComplete : ""
                                }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className={styles.progressText}>
                            {item.current_progress}/{item.target_value}
                          </span>
                        </div>
                        <div className={styles.rewardsRow}>
                          {item.reward_coins > 0 && (
                            <span className={styles.rewardChip}>
                              <AlinoCoinIcon amount={item.reward_coins} size={11} />
                              +{item.reward_coins}
                            </span>
                          )}
                          {item.reward_xp > 0 && (
                            <span className={`${styles.rewardChip} ${styles.xpChip}`}>
                              +{item.reward_xp} XP
                            </span>
                          )}
                        </div>
                      </div>

                      {isReadyToClaim && (
                        <button
                          type="button"
                          className={`${styles.claimButton} ${isClaimingId === item.id ? styles.claimButtonDisabled : ""
                            }`}
                          onClick={() => handleClaim(item)}
                          disabled={isClaimingId === item.id}
                        >
                          {isClaimingId === item.id
                            ? t("achievements:upcoming.claiming")
                            : t("achievements:upcoming.claim")}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className={styles.viewGalleryBtn}
              onClick={handleOpenGallery}
            >
              <span>{t("achievements:viewAll")}</span>
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
        </ModalBox>
      )}
    </div>
  );
};
