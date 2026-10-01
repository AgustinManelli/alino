"use client";

import { useTranslation } from "react-i18next";
import { IAStars } from "@/components/ui/icons/icons";
import styles from "./AIAssistantWidget.module.css";

export const AIAssistantWidgetPreview = () => {
  const { t } = useTranslation(["widgets"]);
  const prompt = t(
    "widgets:items.ai-planner.previewPrompt",
    "Organiza mi semana de estudio para los finales...",
  );
  const currentLength = prompt.length;
  const maxLength = 2000;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.textareaContainer}>
          <textarea
            className={styles.textarea}
            value={prompt}
            readOnly
          />
          <div className={styles.actions}>
            <span className={styles.charCount}>
              {currentLength}/{maxLength}
            </span>
            <button className={styles.submitBtn} disabled>
              <IAStars style={{ width: 15, height: 15, strokeWidth: 2 }} />
              {t("widgets:items.ai-planner.generate", "Generar")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
