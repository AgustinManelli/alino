"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
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

export const AchievementsSection: React.FC = () => {
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

  const nextReward = useMemo(() => {
    if (nextLevelItem) {
      const cosmetics = nextLevelItem.reward_cosmetics || [];
      const frame = cosmetics.find((c) => c.type === "frame");
      const overlay = cosmetics.find((c) => c.type === "overlay");
      const cosmeticNames = cosmetics.map((c) => getCosmeticTranslation(c).name).join(" + ");

      let badgeLabel = "Monedas";
      if (frame && overlay) {
        badgeLabel = "Marco + Accesorio";
      } else if (frame) {
        badgeLabel = "Marco";
      } else if (overlay) {
        badgeLabel = "Accesorio";
      }

      const displayName =
        cosmeticNames ||
        (nextLevelItem.reward_coins > 0
          ? `${nextLevelItem.reward_coins} Alino Coins`
          : nextLevelItem.title);

      const description =
        cosmetics.map((c) => getCosmeticTranslation(c).description).filter(Boolean).join(" ") ||
        nextLevelItem.description ||
        `Recompensa por alcanzar el nivel ${nextLevelItem.level}.`;

      return {
        level: nextLevelItem.level,
        name: displayName,
        badgeLabel,
        description,
        rewardCoins: nextLevelItem.reward_coins,
        equippedFrameId: frame?.id || null,
        equippedOverlayId: overlay?.id || null,
        rewardCosmetics: cosmetics,
      };
    }
    const fallback = getNextLevelReward(currentLevel);
    if (!fallback) return null;
    return {
      level: fallback.level,
      name: fallback.name,
      badgeLabel: fallback.type === "frame" ? "Marco" : "Accesorio",
      description: fallback.description,
      rewardCoins: 0,
      equippedFrameId: fallback.type === "frame" ? fallback.cosmeticId : null,
      equippedOverlayId: fallback.type === "overlay" ? fallback.cosmeticId : null,
      rewardCosmetics: [
        {
          id: fallback.cosmeticId,
          code: fallback.cosmeticId,
          name: fallback.name,
          description: fallback.description,
          type: fallback.type,
          rarity: "common" as const,
        },
      ],
    };
  }, [nextLevelItem, currentLevel]);

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
      <span className={styles.headerTitle}>Tus logros</span>
      <div className={styles.headerBadge} title="Logros completados">
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
        title={`Nivel ${currentLevel} • Logros e Incentivos`}
        style={{
          backgroundColor: isOpen
            ? "var(--background-over-container-hover)"
            : "var(--background-over-container)",
        }}
      >
        <LevelBadge
          level={currentLevel}
          size={22}
          showLevelNumber={false}
          badgeColor={currentLevelData.badge_color}
          accentColor={currentLevelData.accent_color}
          title={currentLevelData.title}
        />
        <span className={styles.levelLabel}>{currentLevel}</span>
        {hasUnclaimed && <div className={styles.unclaimedIndicator} />}
      </div>

      {isOpen && (
        <ModalBox onClose={handleClose} iconRef={iconRef} headerSlot={headerSlot}>
          <div className={styles.panel}>
            <div className={styles.levelHero}>
              <div className={styles.levelHeroGlow} />
              <LevelBadge
                level={currentLevel}
                size={48}
                badgeColor={currentLevelData.badge_color}
                accentColor={currentLevelData.accent_color}
                title={currentLevelData.title}
              />
              <div className={styles.levelHeroInfo}>
                <div className={styles.levelHeroTitleRow}>
                  <span className={styles.levelHeroTitle}>
                    {currentUser?.display_name || "Tu Perfil"}
                  </span>
                  <span className={styles.levelHeroRank}>{currentLevelData.title}</span>
                </div>
                <div className={styles.xpBarContainer}>
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
            </div>

            {nextReward && (
              <div className={styles.nextRewardSection}>
                <div className={styles.nextRewardHeader}>
                  <span className={styles.nextRewardTitle}>
                    Recompensa de Nivel {nextReward.level}
                  </span>
                  <span className={styles.nextRewardBadge}>
                    {nextReward.badgeLabel}
                  </span>
                </div>
                <div className={styles.nextRewardCard}>
                  <div className={styles.nextRewardAvatarWrap}>
                    {nextReward.equippedFrameId || nextReward.equippedOverlayId ? (
                      <UserAvatar
                        avatarUrl={currentUser?.avatar_url}
                        username={currentUser?.username}
                        size={40}
                        style={{ borderRadius: "11px" }}
                        equippedFrameId={nextReward.equippedFrameId}
                        equippedOverlayId={nextReward.equippedOverlayId}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 11,
                          backgroundColor: "var(--background-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <AlinoCoinIcon amount={nextReward.rewardCoins} size={22} />
                      </div>
                    )}
                  </div>
                  <div className={styles.nextRewardInfo}>
                    <span className={styles.nextRewardName}>{nextReward.name}</span>
                    <span className={styles.nextRewardDesc}>{nextReward.description}</span>
                  </div>
                  {nextReward.rewardCoins > 0 &&
                    (nextReward.equippedFrameId || nextReward.equippedOverlayId) && (
                      <span className={styles.rewardBadge}>
                        <AlinoCoinIcon amount={nextReward.rewardCoins} size={11} />
                        +{nextReward.rewardCoins}
                      </span>
                    )}
                </div>
              </div>
            )}

            <div className={styles.upcomingSection}>
              <div className={styles.upcomingHeader}>
                <span className={styles.upcomingTitle}>Próximos a completar</span>
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
                      className={`${styles.achievementCard} ${
                        isReadyToClaim ? styles.achievementCardReady : ""
                      }`}
                    >
                      <div className={styles.achievementIconWrapper}>
                        <AchievementIllustration code={item.code} size={36} />
                      </div>
                      <div className={styles.achievementCardDetails}>
                        <div className={styles.achievementNameRow}>
                          <span className={styles.achievementName}>{item.title}</span>
                        </div>
                        <span className={styles.achievementDesc}>{item.description}</span>
                        <div className={styles.progressRow}>
                          <div className={styles.progressBarTrack}>
                            <div
                              className={`${styles.progressBarFill} ${
                                item.is_completed ? styles.progressBarFillComplete : ""
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
                            <span className={styles.rewardBadge}>
                              <AlinoCoinIcon amount={item.reward_coins} size={11} />
                              +{item.reward_coins}
                            </span>
                          )}
                          {item.reward_xp > 0 && (
                            <span className={`${styles.rewardBadge} ${styles.xpBadge}`}>
                              +{item.reward_xp} XP
                            </span>
                          )}
                        </div>
                      </div>

                      {isReadyToClaim && (
                        <button
                          type="button"
                          className={`${styles.claimButton} ${
                            isClaimingId === item.id ? styles.claimButtonDisabled : ""
                          }`}
                          onClick={() => handleClaim(item)}
                          disabled={isClaimingId === item.id}
                        >
                          {isClaimingId === item.id ? "Reclamando..." : "Reclamar"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className={styles.galleryTriggerButton}
              onClick={handleOpenGallery}
            >
              Ver todos los logros
            </button>
          </div>
        </ModalBox>
      )}
    </div>
  );
};
