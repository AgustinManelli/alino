"use client";

import React from "react";
import { toast } from "sonner";
import { AchievementIllustration } from "@/config/achievementIcons";
import { AlinoCoinIcon } from "@/components/ui/alino-coins-icon";
import styles from "./AchievementToaster.module.css";

interface AchievementToasterProps {
  code: string;
  title: string;
  description: string;
  coins?: number;
  xp?: number;
  leveledUp?: boolean;
  newLevel?: number;
  isClaimedNotice?: boolean;
}

export const AchievementToaster: React.FC<AchievementToasterProps> = ({
  code,
  title,
  description,
  coins = 0,
  xp = 0,
  leveledUp = false,
  newLevel = 1,
  isClaimedNotice = false,
}) => {
  return (
    <div className={styles.toasterContainer}>
      <div className={styles.glowBorder} />
      <div className={styles.iconWrapper}>
        <AchievementIllustration code={code} size={46} />
      </div>
      <div className={styles.textSection}>
        <div className={styles.badgeHeader}>
          <span className={styles.typeLabel}>
            {isClaimedNotice ? "¡Premio Reclamado!" : "¡Logro Desbloqueado!"}
          </span>
          {leveledUp && (
            <span className={styles.levelUpPill}>
              ¡Nivel {newLevel}!
            </span>
          )}
        </div>
        <span className={styles.title}>{title}</span>
        <span className={styles.description}>{description}</span>
        {(coins > 0 || xp > 0) && (
          <div className={styles.rewardsRow}>
            {coins > 0 && (
              <span className={styles.rewardBadge}>
                <AlinoCoinIcon amount={coins} size={14} />
                +{coins}
              </span>
            )}
            {xp > 0 && (
              <span className={`${styles.rewardBadge} ${styles.xpBadge}`}>
                +{xp} XP
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const showAchievementToast = (props: AchievementToasterProps) => {
  toast.custom(() => <AchievementToaster {...props} />, {
    duration: 5000,
  });
};
