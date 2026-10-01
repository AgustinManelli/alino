import React from "react";
import { useTranslation } from "react-i18next";
import { LevelBadge } from "@/config/levelBadges";
import { AchievementIllustration } from "@/config/achievementIcons";
import { AlinoCoinIcon } from "@/components/ui/alino-coins-icon";
import styles from "./UpcomingAchievements.module.css";

export const UpcomingAchievementsPreview = (_props?: unknown) => {
  const { t, i18n } = useTranslation(["widgets"]);
  const isEn = (i18n.language || "es").startsWith("en");

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <span className={styles.title}>
            {t("widgets:items.achievements.title", "Logros")}
          </span>
          <span className={styles.unclaimedBadge}>
            {t("widgets:items.achievements.readyBadge_one", {
              count: 1,
              defaultValue: "1 listo",
            })}
          </span>
        </div>
        <LevelBadge level={3} size={22} showLevelNumber={false} />
      </div>

      <div className={`${styles.featuredCard} ${styles.featuredCardReady}`}>
        <div className={styles.featuredIconWrapper}>
          <AchievementIllustration code="streak_3" size={32} />
        </div>
        <div className={styles.featuredInfo}>
          <div className={styles.featuredTitleRow}>
            <span className={styles.featuredTitle}>
              {isEn ? "On the Move" : "En Movimiento"}
            </span>
            <span className={styles.featuredPercent}>100%</span>
          </div>
          <div className={styles.featuredTrack}>
            <div
              className={`${styles.featuredFill} ${styles.featuredFillReady}`}
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <button type="button" className={styles.claimBtnSmall}>
          {t("widgets:items.achievements.claim", "Reclamar")}
        </button>
      </div>

      <div className={styles.compactList}>
        <div className={styles.compactItem}>
          <div className={styles.compactLeft}>
            <AchievementIllustration code="first_task" size={16} />
            <span className={styles.compactTitle}>
              {isEn ? "First Step" : "Primer Paso"}
            </span>
          </div>
          <div className={styles.compactRight}>
            <div className={styles.compactMiniTrack}>
              <div
                className={styles.compactMiniFill}
                style={{ width: "80%" }}
              />
            </div>
            <div className={styles.compactRewardTag}>
              <AlinoCoinIcon amount={20} size={10} />
              <span>+20</span>
            </div>
          </div>
        </div>

        <div className={styles.compactItem}>
          <div className={styles.compactLeft}>
            <AchievementIllustration code="tasks_10" size={16} />
            <span className={styles.compactTitle}>
              {isEn ? "Deep Focus" : "Enfoque Total"}
            </span>
          </div>
          <div className={styles.compactRight}>
            <div className={styles.compactMiniTrack}>
              <div
                className={styles.compactMiniFill}
                style={{ width: "60%" }}
              />
            </div>
            <div className={styles.compactRewardTag}>
              <AlinoCoinIcon amount={40} size={10} />
              <span>+40</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
