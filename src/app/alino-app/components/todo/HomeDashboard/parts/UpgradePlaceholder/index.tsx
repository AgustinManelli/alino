"use client";

import { Crown } from "@/components/ui/icons/icons";
import styles from "./UpgradePlaceholder.module.css";
import { useModalStore } from "@/store/useModalStore";

interface Props {
  widgetName: string;
}

export const UpgradePlaceholder = ({ widgetName }: Props) => {
  const openModal = useModalStore((s) => s.open);

  const handleOpenPremiumModal = () => {
    openModal({ type: "premium" });
  };
  return (
    <div className={styles.placeholder}>
      <div className={styles.iconWrapper}>
        <Crown
          style={{
            stroke: "#ffb400",
            width: "20px",
            height: "auto",
            strokeWidth: 2,
          }}
        />
      </div>
      <h3 className={styles.title}>{widgetName} Bloqueado</h3>
      <p className={styles.text}>
        Este widget requiere una suscripción <strong>Pro</strong>.
      </p>
      <button className={styles.upgradeBtn} onClick={handleOpenPremiumModal}>
        Actualizar a Pro
      </button>
    </div>
  );
};
