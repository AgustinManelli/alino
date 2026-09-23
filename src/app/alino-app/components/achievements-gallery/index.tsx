"use client";

import React, { useState, useMemo } from "react";
import { useAchievementsStore } from "@/store/useAchievementsStore";
import { WindowComponent } from "@/components/ui/WindowComponent";
import { LevelBadge, getLevelInfo } from "@/config/levelBadges";
import { AchievementIllustration } from "@/config/achievementIcons";
import { AlinoCoinIcon } from "@/components/ui/alino-coins-icon";
import { showAchievementToast } from "@/components/ui/toaster/achievement-toaster";
import { AchievementItem } from "@/lib/schemas/database.types";
import {
  IAStars,
  Check,
  SplitIcon,
  ReceiptIcon,
  Crown,
} from "@/components/ui/icons/icons";
import { UserAvatar } from "@/components/ui/UserAvatar/UserAvatar";
import { LEVEL_REWARDS } from "@/config/levelRewards";
import { useUserDataStore } from "@/store/useUserDataStore";
import { getCosmeticTranslation } from "@/lib/i18n/helpers";
import styles from "./AchievementsGallery.module.css";

type FilterStatus = "all" | "unclaimed" | "in_progress" | "completed" | "levels";

const CATEGORY_LABELS: Record<string, string> = {
  productivity: "Productividad",
  streaks: "Rachas",
  organization: "Organización",
  special: "Especial",
  general: "General",
};

export const AchievementsGalleryModal: React.FC = () => {
  const {
    overview,
    levels,
    isGalleryOpen,
    setIsGalleryOpen,
    claimReward,
    isClaimingId,
  } = useAchievementsStore();

  const currentUser = useUserDataStore((state) => state.user);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");

  const currentLevel = overview?.level ?? 1;
  const currentXp = overview?.xp ?? 0;

  const currentLevelData = useMemo(() => {
    const found = (levels || []).find((l) => l.level === currentLevel);
    if (found) return found;
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

  const filteredAchievements = useMemo(() => {
    const list = overview?.achievements || [];
    switch (activeFilter) {
      case "unclaimed":
        return list.filter((a) => a.is_completed && !a.is_claimed);
      case "in_progress":
        return list.filter((a) => !a.is_completed);
      case "completed":
        return list.filter((a) => a.is_claimed);
      case "all":
      default:
        return list;
    }
  }, [overview?.achievements, activeFilter]);

  const handleClaim = async (item: AchievementItem) => {
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

  if (!isGalleryOpen) return null;

  return (
    <WindowComponent
      windowTitle="Galería de logros"
      id="achievements-gallery-window"
      crossAction={() => setIsGalleryOpen(false)}
      sidebar={
        <WindowComponent.Sidebar>
          <WindowComponent.SidebarItem
            label="Todos"
            icon={
              <IAStars
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "currentColor",
                  strokeWidth: "1.8",
                }}
              />
            }
            active={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
            badge={overview?.total_count ?? 0}
          />
          <WindowComponent.SidebarItem
            label="Listos"
            icon={
              <Check
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "currentColor",
                  strokeWidth: "2",
                }}
              />
            }
            active={activeFilter === "unclaimed"}
            onClick={() => setActiveFilter("unclaimed")}
            badge={
              overview?.completed_count && overview.completed_count > 0
                ? overview.completed_count
                : undefined
            }
          />
          <WindowComponent.SidebarItem
            label="En progreso"
            icon={
              <SplitIcon
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "currentColor",
                  strokeWidth: "2",
                }}
              />
            }
            active={activeFilter === "in_progress"}
            onClick={() => setActiveFilter("in_progress")}
          />
          <WindowComponent.SidebarItem
            label="Reclamados"
            icon={
              <ReceiptIcon
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "currentColor",
                  strokeWidth: "1.8",
                }}
              />
            }
            active={activeFilter === "completed"}
            onClick={() => setActiveFilter("completed")}
            badge={overview?.claimed_count ?? 0}
          />
          <WindowComponent.SidebarItem
            label="Niveles"
            icon={
              <Crown
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "currentColor",
                  strokeWidth: "2",
                }}
              />
            }
            active={activeFilter === "levels"}
            onClick={() => setActiveFilter("levels")}
          />
        </WindowComponent.Sidebar>
      }
    >
      <div className={styles.galleryContainer}>
        <div className={styles.overviewBanner}>
          <div className={styles.bannerGlow} />
          <div className={styles.bannerLeft}>
            <span className={styles.bannerTitle}>Progreso General</span>
            <span className={styles.bannerSubtitle}>
              Has completado {overview?.completed_count ?? 0} de{" "}
              {overview?.total_count ?? 0} logros disponibles
            </span>
            <div className={styles.progressWrapper}>
              <div className={styles.overallTrack}>
                <div
                  className={styles.overallFill}
                  style={{
                    width: `${overview?.completion_percentage ?? 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statPill}>
              <LevelBadge
                level={currentLevel}
                size={28}
                badgeColor={currentLevelData.badge_color}
                accentColor={currentLevelData.accent_color}
                title={currentLevelData.title}
              />
              <span>
                Nivel {currentLevel} • {currentLevelData.title}
              </span>
            </div>
            <div className={`${styles.statPill} ${styles.xpPill}`}>
              <span>{currentXp} XP</span>
            </div>
          </div>
        </div>

        {activeFilter === "levels" ? (
          <div className={styles.cardsGrid}>
            {(levels && levels.length > 0
              ? levels.filter(
                  (l) =>
                    (l.reward_cosmetics && l.reward_cosmetics.length > 0) ||
                    l.reward_coins > 0 ||
                    l.level > 1
                )
              : LEVEL_REWARDS.map((r) => ({
                  level: r.level,
                  title: r.name,
                  description: r.description,
                  min_xp: 0,
                  max_xp: 0,
                  badge_color: "",
                  accent_color: "",
                  icon_name: "shield",
                  reward_coins: 0,
                  reward_cosmetics: [
                    {
                      id: r.cosmeticId,
                      code: r.cosmeticId,
                      name: r.name,
                      description: r.description,
                      type: r.type,
                      rarity: "common" as const,
                    },
                  ],
                }))
            ).map((item) => {
              const isUnlocked = currentLevel >= item.level;
              const cosmetics = item.reward_cosmetics || [];
              const frame = cosmetics.find((c) => c.type === "frame");
              const overlay = cosmetics.find((c) => c.type === "overlay");
              const hasCosmetics = cosmetics.length > 0;

              const cardTitle =
                cosmetics.map((c) => getCosmeticTranslation(c).name).join(" + ") ||
                (item.reward_coins > 0
                  ? `+${item.reward_coins} Alino Coins`
                  : item.title);

              let cardCategory = "Rango de maestría";
              if (frame && overlay) {
                cardCategory = "Marco + Accesorio";
              } else if (frame) {
                cardCategory = "Marco de nivel";
              } else if (overlay) {
                cardCategory = "Accesorio de nivel";
              } else if (item.reward_coins > 0) {
                cardCategory = "Recompensa en monedas";
              }

              return (
                <div
                  key={`level_${item.level}`}
                  className={`${styles.card} ${isUnlocked ? styles.cardClaimed : ""}`}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardIconBox}>
                      {hasCosmetics ? (
                        <UserAvatar
                          avatarUrl={currentUser?.avatar_url}
                          username={currentUser?.username}
                          size={48}
                          style={{ borderRadius: "12px" }}
                          equippedFrameId={frame?.id || null}
                          equippedOverlayId={overlay?.id || null}
                        />
                      ) : (
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            backgroundColor: "var(--background-secondary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <AlinoCoinIcon amount={item.reward_coins} size={28} />
                        </div>
                      )}
                    </div>
                    <div className={styles.cardHeaderInfo}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className={styles.cardTitle}>{cardTitle}</span>
                        <LevelBadge
                          level={item.level}
                          size={18}
                          badgeColor={item.badge_color}
                          accentColor={item.accent_color}
                          title={item.title}
                        />
                      </div>
                      <span className={styles.cardCategory}>{cardCategory}</span>
                    </div>
                  </div>

                  <p className={styles.cardDesc}>
                    {cosmetics
                      .map((c) => getCosmeticTranslation(c).description)
                      .filter(Boolean)
                      .join(" ") ||
                      item.description ||
                      `Recompensa al alcanzar el nivel ${item.level}.`}
                  </p>

                  <div className={styles.cardFooter}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 6,
                        backgroundColor: isUnlocked
                          ? "rgba(48, 209, 88, 0.15)"
                          : "var(--background-secondary)",
                        color: isUnlocked ? "#30D158" : "var(--text-not-available)",
                      }}
                    >
                      {isUnlocked ? "Desbloqueado" : `Alcanza Nivel ${item.level}`}
                    </span>
                    {item.reward_coins > 0 && hasCosmetics && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--color-coins)",
                        }}
                      >
                        <AlinoCoinIcon amount={item.reward_coins} size={11} />
                        +{item.reward_coins}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : filteredAchievements.length === 0 ? (
          <div className={styles.emptyState}>
            <span>No hay logros en esta sección por el momento.</span>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {filteredAchievements.map((item) => {
              const isReadyToClaim = item.is_completed && !item.is_claimed;
              const progressPct =
                item.target_value > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (item.current_progress / item.target_value) * 100
                      )
                    )
                  : 0;

              return (
                <div
                  key={item.id}
                  className={`${styles.card} ${
                    isReadyToClaim
                      ? styles.cardReady
                      : item.is_claimed
                      ? styles.cardClaimed
                      : ""
                  }`}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardIconBox}>
                      <AchievementIllustration code={item.code} size={48} />
                    </div>
                    <div className={styles.cardHeaderInfo}>
                      <span className={styles.cardCategory}>
                        {CATEGORY_LABELS[item.category] || item.category}
                      </span>
                      <span className={styles.cardTitle}>{item.title}</span>
                    </div>
                  </div>

                  <p className={styles.cardDesc}>{item.description}</p>

                  <div className={styles.cardProgressSection}>
                    <div className={styles.cardProgressLabels}>
                      <span>Progreso</span>
                      <span>
                        {item.current_progress} / {item.target_value} ({progressPct}%)
                      </span>
                    </div>
                    <div className={styles.cardTrack}>
                      <div
                        className={`${styles.cardFill} ${
                          item.is_completed ? styles.cardFillComplete : ""
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.rewardsList}>
                      {item.reward_coins > 0 && (
                        <span className={styles.rewardItem}>
                          <AlinoCoinIcon amount={item.reward_coins} size={13} />
                          +{item.reward_coins}
                        </span>
                      )}
                      {item.reward_xp > 0 && (
                        <span
                          className={`${styles.rewardItem} ${styles.xpReward}`}
                        >
                          +{item.reward_xp} XP
                        </span>
                      )}
                      {item.cosmetic_reward_id && (
                        <span className={styles.cosmeticBadge}>Cosmético</span>
                      )}
                    </div>

                    {isReadyToClaim ? (
                      <button
                        type="button"
                        className={`${styles.claimBtn} ${
                          isClaimingId === item.id ? styles.claimBtnDisabled : ""
                        }`}
                        onClick={() => handleClaim(item)}
                        disabled={isClaimingId === item.id}
                      >
                        {isClaimingId === item.id
                          ? "Reclamando..."
                          : "¡Reclamar premio!"}
                      </button>
                    ) : item.is_claimed ? (
                      <span className={styles.claimedStatus}>Reclamado ✓</span>
                    ) : (
                      <span className={styles.inProgressStatus}>En curso</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </WindowComponent>
  );
};
