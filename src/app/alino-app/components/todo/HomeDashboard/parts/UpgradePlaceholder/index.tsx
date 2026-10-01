"use client";

import { useTranslation } from "react-i18next";
import { Crown } from "@/components/ui/icons/icons";
import styles from "./UpgradePlaceholder.module.css";
import { useModalStore } from "@/store/useModalStore";

interface Props {
  widgetName: string;
}

export const UpgradePlaceholder = ({ widgetName }: Props) => {
  const { t } = useTranslation(["widgets"]);
  const openModal = useModalStore((s) => s.open);

  const handleOpenPremiumModal = () => {
    openModal({ type: "premium" });
  };
  return (
    <div className={styles.placeholder}>
      <div className={styles.iconWrapper}>
        <Crown className={styles.icon} />
      </div>
      <h3 className={styles.title}>
        {t("widgets:upgradePlaceholder.title", "{{name}} Bloqueado", {
          name: widgetName,
        })}
      </h3>
      <p className={styles.text}>
        {t(
          "widgets:upgradePlaceholder.description",
          "Este widget requiere una suscripción Pro.",
        )}
      </p>
      <button className={styles.upgradeBtn} onClick={handleOpenPremiumModal}>
        {t("widgets:upgradePlaceholder.upgradeBtn", "Actualizar a Pro")}
      </button>
    </div>
  );
};
